/**
 * 描述: 语音播放工具
 * 版权: Copyright (c) 2016
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/3/23 15:35
 */
import WeChat from './WeChat';
import StringUtils from './StringUtils';
import BaseError from './BaseError';

export default class VoiceUtils {
    constructor(instance, bgmInfo = {}) {
        // 页面实例(小程序Page对象)
        this.instance = instance;
        this.instance.data['XM_VOICE'] = {
            // 是否正在播放语音
            isPlaying: false,
            // 正在播放中的语音ID号
            playingId: '',
            // 当前播放位置
            currentTime: 0,
            // 语音列表
            voices: {}
        };

        for (let key in this.events) {
            if (this.events.hasOwnProperty(key)) {
                instance['XM_VOICE_' + key] = this.events[key];
            }
        }

        let voiceIds = WeChat.wx['getStorageSync']('XM_IS_READ_VOICE_LIST');

        // 获取本地已读语音列表
        this.IS_READ_VOICE_LIST = StringUtils(voiceIds).isNotEmpty() ? JSON.parse(voiceIds) : [];

        // 语音Id列表
        this.VOICE_ID_LIST = [];

        // 背景音乐信息
        this.bgmInfo = bgmInfo;
    }

    events = {
        // 播放、暂停播放语音
        play: ({currentTarget}) => {
            let {dataset} = currentTarget;
            let {id, path, time} = dataset;
            // 播放语音
            this.play(id, path, time);
        }
    };

    /**
     * 添加一个语音
     * @param voiceId
     * @param path
     * @param time
     * @param sequence
     */
    addVoice(voiceId, path, time, sequence) {
        let voiceMap = this.getVoiceMap();
        voiceMap[voiceId] = {
            id: voiceId,
            path: path,
            time: time,
            tempPath: '',
            isPlaying: false,
            sequence: sequence || '',
            isRead: this.inReadList(voiceId)
        };

        this.VOICE_ID_LIST.push(voiceId);
    }

    /**
     * 向前添加一个语音
     * @param voiceId
     * @param path
     * @param time
     * @param sequence
     */
    unShiftVoice(voiceId, path, time, sequence) {
        let voiceMap = this.getVoiceMap();
        voiceMap[voiceId] = {
            id: voiceId,
            path: path,
            time: time,
            tempPath: '',
            isPlaying: false,
            sequence: sequence || '',
            isRead: this.inReadList(voiceId)
        };

        this.VOICE_ID_LIST.unshift(voiceId);
    }

    /**
     * 销毁当前语音实例
     */
    destroy() {
        this.stop();
        this.instance.data['XM_VOICE'] = {
            // 是否正在播放语音
            isPlaying: false,
            // 正在播放中的语音ID号
            playingId: '',
            // 当前播放位置
            currentTime: 0,
            // 语音列表
            voices: {}
        };
        this.VOICE_ID_LIST = [];
    }

    // 从语音列表中获取指定ID的语音的索引
    getIndexById(id) {
        let voiceIds = this.VOICE_ID_LIST;
        for (let i = 0; i < voiceIds.length; i++) {
            if (voiceIds[i] + '' === id + '') {
                return i;
            }
        }
    }

    // 获取下一个语音对象
    getNextVoiceById(id) {
        let voices = this.VOICE_ID_LIST;
        let index = this.getIndexById(id);
        if (index + 1 <= voices.length - 1) {
            return this.getVoiceMap()[voices[index + 1]];
        }
    }

    // 获取语音对象
    getVoice() {
        return this.instance.data['XM_VOICE'];
    }

    // 获取语音Map
    getVoiceMap() {
        return this.instance.data['XM_VOICE']['voices'];
    }

    /**
     * 设置语音map
     * @param id
     * @param params
     */
    setVoiceMap(id, params) {
        let val = this.getVoiceMap()[id] || {};
        Object.assign(val, params);
        this.instance.data['XM_VOICE']['voices'][id] = val;
    }

    /**
     * 更新界面数据
     */
    setData(data) {
        Object.assign(this.instance.data['XM_VOICE'], data);
        // this.instance.setData(this.instance.data);
        this.instance.setData({XM_VOICE: this.instance.data['XM_VOICE']});
    }

    /**
     * 监听播放事件
     * @param callback
     */
    onPlay(callback) {
        this.onPlayCallback = callback;
    }

    // 播放、暂停播放语音
    play(id, path, time) {
        if (StringUtils(id).isEmpty() && StringUtils(path).isEmpty() && StringUtils(time).isEmpty()) {
            // 语音对象
            let voice = this.getVoice();
            if (StringUtils(voice.playingId).isEmpty()) {
                return;
            }
            return this.playVoice(voice.playingId, voice.currentTime);
        }
        id = id + '';
        // 语音对象
        let voice = this.getVoice();
        // 语音列表
        let voiceMap = this.getVoiceMap();
        if (StringUtils(path).isEmpty()) {
            return this.instance.showSimpleMsg('语音地址不存在');
        }
        // 如果是一个新的语音，将其放入语音列表
        if (!voiceMap[id]) {
            this.addVoice(id, path, time)
        }
        if (voice.isPlaying) {
            if (voice.playingId === id) {
                // 播放中, 停止播放
                this.stop();
                return;
            }
            this.stop();
        }
        if (this.onPlayCallback) {
            this.onPlayCallback(id, voiceMap[id]['sequence']);
        }
        this.setVoiceMap(id, {isRead: true});
        if (!this.inReadList(id)) {
            this.setRead(id);
        }

        if (voiceMap[id]['tempPath']) {
            return this.playVoiceById(id);
        }

        // 非微信专有语音格式不用下载
        if (!voiceMap[id]['path'].match(new RegExp('.silk$'))) {
            return this.playVoiceById(id);
        }

        this.down(path, (tempPath) => {
            this.setVoiceMap(id, {tempPath: tempPath});
            this.playVoiceById(id);
        });
    }

    // 播放指定ID的语音
    playVoiceById(id) {
        this.playVoice(id, 0);
    }

    // 删除指定ID的语音
    delVoiceById(id) {
        if (id && (id === this.getCurrentInfo().playingId)) {
            this.stop();
        }
        let list = this.VOICE_ID_LIST;
        list.splice(list.indexOf(id), 1);
        delete this.getVoiceMap()[id];
    }

    // 播放指定ID的语音
    playVoice(id, startTime = 0) {
        // 语音列表
        let voiceMap = this.getVoiceMap();
        voiceMap[id]['isPlaying'] = true;
        this.setData({isPlaying: true, playingId: id});
        this.getAudio().play(voiceMap[id]['tempPath'], voiceMap[id]['path'], startTime);
        let time = parseInt(voiceMap[id]['time']) || 0;
        // 设置自动关闭
        this.autoClose(id, time - startTime);
    }

    // 获取当前信息
    getCurrentInfo() {
        let currentInfo = this.instance.data['XM_VOICE'];

        return {
            // 是否正在播放语音
            isPlaying: currentInfo.isPlaying,
            // 正在播放中的语音ID号
            playingId: currentInfo.playingId,
            // 当前播放位置
            currentTime: currentInfo.currentTime
        };
    }

    getAudio() {
        let audio = WeChat.wx['getBackgroundAudioManager']();

        audio.onError = (err) => {
            console.log(err);
        };

        audio['onTimeUpdate'](() => {
            // 设置当前播放进度
            this.instance.data['XM_VOICE']['currentTime'] = audio.currentTime;

        });

        return {
            play: (tempSrc, src, startTime = 0) => {
                src = decodeURIComponent(src);
                if (tempSrc.match(new RegExp('\.silk$'))) {
                    this.isSilkFormat = true;
                    WeChat.wx['playVoice']({filePath: tempSrc});
                } else {
                    this.isSilkFormat = false;
                    audio.title = this.bgmInfo.title;
                    audio.epname = '    ';
                    audio.singer = this.bgmInfo.singer;
                    audio.startTime = startTime;
                    // audio.coverImgUrl = 'http://www.xiameikeji.com/resource/course/image/share/agency.png';
                    audio.src = src;
                    audio.play();
                }
            },
            pause: () => {
                if (this.isSilkFormat === true) {
                    WeChat.wx['pauseVoice']();
                } else {
                    audio.pause();
                }
            },
            stop: () => {
                if (this.isSilkFormat === true) {
                    WeChat.wx['stopVoice']();
                } else {
                    audio.stop();
                }
            }
        };
    }

    // 下载资源
    down(url, callback) {
        WeChat.wx['downloadFile']({
            url: url,
            success: (result) => {
                try {
                    callback(result['tempFilePath']);
                } catch (err) {
                    throw new BaseError(err, 'VoiceUtils.js[320]');
                }
            },
            fail: (e) => {
                console.log(e);
            }
        });
    }

    /**
     * 自动关闭
     */
    autoClose(id, currentTime) {
        // 语音列表
        let voiceMap = this.getVoiceMap();
        let time = parseInt(voiceMap[id]['time']) || 0;
        if (StringUtils(currentTime).isNotEmpty()) {
            time = currentTime;
        }
        this.interval = setInterval(() => {
            --time;
            if (time <= 0) {
                this.stop();
                let next = this.getNextVoiceById(id);
                if (next) {
                    this.play(next.id, next.path, next.time);
                }
            }
        }, 1000);
    }

    // 暂停播放
    pause() {
        // 语音对象
        let voice = this.getVoice();
        if (StringUtils(voice.playingId).isEmpty()) {
            return;
        }
        // 更新播放状态
        this.setVoiceMap(voice.playingId, {isPlaying: false});
        this.setData({isPlaying: false});
        this.getAudio().pause();
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * 停止播放
     */
    stop() {
        // 语音对象
        let voice = this.getVoice();
        if (StringUtils(voice.playingId).isEmpty()) {
            return;
        }
        // 更新播放状态
        this.setVoiceMap(voice.playingId, {isPlaying: false});
        this.setData({isPlaying: false, playingId: ''});
        this.getAudio().stop();
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * 判断指定语音ID是否在本地已读语音列表
     * @param voiceId
     * @returns {boolean}
     */
    inReadList(voiceId) {
        for (let i = 0; i < this.IS_READ_VOICE_LIST.length; i++) {
            if (this.IS_READ_VOICE_LIST[i] + '' === voiceId + '') {
                return true;
            }
        }
        return false;
    }

    /**
     * 记录已读语音ID
     * @param id
     */
    setRead(id) {
        this.IS_READ_VOICE_LIST.push(id);
        // 存储标识
        WeChat.wx['setStorage']({
            key: 'XM_IS_READ_VOICE_LIST',
            data: JSON.stringify(this.IS_READ_VOICE_LIST)
        });
    }
}