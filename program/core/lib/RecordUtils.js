/**
 * 描述: 录音工具
 * 版权: Copyright (c) 2016
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/3/23 15:35
 */
import WeChat from './WeChat';
import StringUtils from './StringUtils';
import Service from './Service';

export default class RecordUtils {
    constructor(instance, ableAutoSend = false) {
        // 页面实例(小程序Page对象)
        this.instance = instance;
        this.instance.data['XM_RECORD'] = {
            // 录音弹窗样式
            recordBoxClass: '',
            // 录音状态(0: 未开始; 1: 录音中; 2: 录音完成; 3: 播放中)
            recordStatus: 0,
            // 录制时间
            time: '00',
            // 最大时间
            maxTime: '60',
            // 播放时间
            playTime: '00',
            // 秒
            secondsTemp: 0,
            ableAutoSend: ableAutoSend
        };

        for (let key in this.events) {
            if (this.events.hasOwnProperty(key)) {
                instance['XM_RECORD_' + key] = this.events[key];
            }
        }

        // 是否为自动发送
        this.isAutoSend = false;
        // 是否允许自动发送
        this.ableAutoSend = ableAutoSend;
    }

    events = {
        empty(){

        },
        // 关闭录音框
        closeRecordBox: () => {
            this.closeRecordBox();
        },
        // 开始录音
        startRecord: () => {
            this.getRecorder().start();
        },
        // 重录
        resetRecord: () => {
            this.events.stop();
            this.setData({
                // 录制时间
                time: '00',
                // 录制时间
                maxTime: '60',
                // 秒
                secondsTemp: 0,
                recordStatus: 0
            });
        },
        // 结束录音
        stopRecord: () => {
            this.setData({recordStatus: 2});
            this.getRecorder().stop(null, false);
        },
        // 播放录音
        play: () => {
            if (this.tempFilePath) {
                this.innerAudioContext = this.innerAudioContext || WeChat.wx['createInnerAudioContext']();
                this.innerAudioContext.src = this.tempFilePath;
                this.innerAudioContext.play();
                this.setData({recordStatus: 3});
                // 设置自动关闭
                this.autoClose();
            }
        },
        stop: () => {
            this.innerAudioContext && this.innerAudioContext.stop();
            this.setData({recordStatus: 2});
            this.stopAutoClose()
        },
        // 完成录音
        finish: () => {
            Service.upload(this.tempFilePath, (result) => {
                if (result && this.finishCallback) {
                    result.data['time'] = this.instance.data['XM_RECORD']['secondsTemp'];
                    this.finishCallback(result.data);
                }
                // 关闭录音框
                this.events.closeRecordBox()
            });
        }
    };

    /**
     * 关闭录音框
     */
    closeRecordBox() {
        if (this.instance.data['XM_RECORD'].recordStatus > 0) {
            // 停止语音播放，停止语音录制状态
            this.events.stop();
            // 停止录音
            this.getRecorder().stop(null, false);
        }
        // 重置录制状态
        this.setData({
            // 录制时间
            time: '00',
            // 录制时间
            maxTime: '60',
            // 秒
            secondsTemp: 0,
            recordStatus: 0,
            recordBoxClass: 'hide'
        });
    }

    /**
     * 监听录制完成事件
     * @param cb
     */
    onFinish(cb) {
        this.finishCallback = cb;
    }

    /**
     * 更新界面数据
     */
    setData(data) {
        Object.assign(this.instance.data['XM_RECORD'], data);
        // this.instance.setData(this.instance.data);
        this.instance.setData({XM_RECORD: this.instance.data['XM_RECORD']});
    }

    // 事件-打开录音框
    openRecordBox() {
        this.setData({
            // 录音弹窗样式
            recordBoxClass: 'show',
            // 录制时间
            time: '00',
            // 录制最大时间
            maxTime: '60',
            // 播放时间
            playTime: '00',
            // 秒
            secondsTemp: 0,
            // 录音弹窗样式
            recordStatus: 0
        });
    }

    // 开始计时
    startTime() {
        let data = this.instance.data['XM_RECORD'];
        data.secondsTemp = 0;
        data.time = '00';
        this.timeing = setInterval(() => {
            ++data.secondsTemp;
            data.time = StringUtils(data.secondsTemp).formatSeconds4();
            // 更新界面时间
            this.setData({time: data.time, secondsTemp: data.secondsTemp});
            if (data.secondsTemp >= 60) {
                this.stopTime();

                this.getRecorder().stop(() => {
                    this.getRecorder().start();
                }, true);
                // if (this.ableAutoSend) {
                //     this.getRecorder().stop(() => {
                //         this.getRecorder().start();
                //     }, true);
                // } else {
                //     this.setData({recordStatus: 2});
                //     this.getRecorder().stop(null, false);
                // }
            }
        }, 1000);
    }

    // 停止计时
    stopTime() {
        if (this.timeing) {
            clearInterval(this.timeing);
            this.timeing = null
        }
    }

    // 自动关闭
    autoClose() {
        let time = 0;
        this.interval = setInterval(() => {
            ++time;
            if (time >= this.instance.data['XM_RECORD'].secondsTemp) {
                this.setData({
                    recordStatus: 2,
                    playTime: StringUtils(0).formatSeconds4()
                });
                clearInterval(this.interval);
                this.interval = null;
                return
            }
            this.setData({
                playTime: StringUtils(time).formatSeconds4()
            });
        }, 1000);
    }

    // 停止自动播放
    stopAutoClose() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null
        }
        WeChat.wx['stopVoice']();
        this.setData({
            playTime: StringUtils(0).formatSeconds4(),
            recordStatus: 2
        });
    }

    /**
     * 获取录音工具
     */
    getRecorder() {
        let recorder = this.recorderManager;
        if (!recorder) {
            recorder = this.recorderManager = WeChat.wx['getRecorderManager']();
        }
        return {
            // 开始录音
            start: () => {
                // 开始计时
                this.startTime();
                // 设置为录音状态-录音中
                this.setData({recordStatus: 1});
                // 开始录音
                recorder.start({
                    // 指定录音的时长
                    duration: 70000,
                    // 采样率
                    sampleRate: 16000,
                    // 录音通道数
                    numberOfChannels: 2,
                    // 编码码率
                    encodeBitRate: 24000,
                    format: 'mp3'
                });

                // 监听停止录音事件
                recorder['onStop'](({tempFilePath, duration}) => {
                    // 停止计时
                    this.stopTime();
                    // 音频缓存文件地址
                    this.tempFilePath = tempFilePath;
                    let recorderTime = this.instance.data['XM_RECORD']['secondsTemp'] = Math.floor(duration / 1000);
                    if (this.isAutoSend === true) {
                        // 完成录音
                        Service.upload(this.tempFilePath, (result) => {
                            if (result && this.finishCallback) {
                                result.data['time'] = recorderTime;
                                this.finishCallback(result.data);
                            }
                        });
                    }
                    // 结束录音回调
                    if (this.stopRecordCallback) {
                        this.stopRecordCallback();
                    }
                });

                // 监听录音失败事件
                recorder['onError'](({errMsg}) => {
                    // 设置为录音状态-未开始
                    this.setData({recordStatus: 0});
                    // 停止计时
                    this.stopTime();
                    if (errMsg === 'operateRecorder:fail auth deny') {
                        WeChat.wx['showModal']({
                            title: '提示',
                            content: '本操作需要使用到录音，请授权后再试!',
                            success: ({confirm}) => {
                                if (confirm) {
                                    WeChat.wx['openSetting']();
                                }
                            }
                        });
                    }
                });
            },
            // 停止录音
            stop: (callback, isAuthSend = false) => {
                // 是否为自动发送
                this.isAutoSend = isAuthSend;
                this.stopRecordCallback = callback;
                // 结束录音;
                recorder.stop();
            }
        }
    }
}