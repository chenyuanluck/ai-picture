/**
 * 描述: 基础页面类，实现一些页面基本方法
 * 版权: Copyright (c) 2016
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/3/23 15:35
 */
import WeChat from './WeChat';
import Service from './Service';
import Config from './Config';
import Pagination from './Pagination';
import RecordUtils from './RecordUtils';
import VoiceUtils from './VoiceUtils';
import ShareQrCode from './ShareQrCode';
import StringUtils from './StringUtils';

// 实现所有小程序页面监听方法，改写方法名。例如：onLoad => onPageLoad
// 为实现所有事件可统一处理。
// 如果直接使用小程序定义的方法，公用方法将被重写

export default class BasePage {
    constructor() {

    }

    // 生命周期函数--监听页面加载
    onLoad(o) {
        // 设置组件容器
        if (!this.$coms) {
            this.$coms = {};
        }
        // 设置分享token
        Service.SHARE_TOKEN = o['shareToken'] || '';
        if (o['scene']) {
            Service.SHARE_TOKEN = decodeURIComponent(o['scene'] || '') || '';
        }
        if (this['onPageLoad']) {
            return this['onPageLoad'](o);
        }
    }

    // 生命周期函数--监听页面初次渲染完成
    onReady(o) {
        if (this['onPageReady']) {
            return this['onPageReady'](o);
        }
    }

    // 生命周期函数--监听页面显示
    onShow(o) {
        if (this['onPageShow']) {
            return this['onPageShow'](o);
        }
    }

    // 生命周期函数--监听页面隐藏
    onHide(o) {
        if (this['onPageHide']) {
            return this['onPageHide'](o);
        }
    }

    // 生命周期函数--监听页面卸载
    onUnload(o) {
        if (this['onPageUnload']) {
            return this['onPageUnload'](o);
        }
    }

    // 页面相关事件处理函数--监听用户下拉动作
    onPullDownRefresh(o) {
        if (this['onPagePullDownRefresh']) {
            return this['onPagePullDownRefresh'](o);
        }
    }

    // 页面相关事件处理函数--页面上拉触底事件的处理函数
    onReachBottom(o) {
        if (this['onPageReachBottom']) {
            return this['onPageReachBottom'](o);
        }
    }

    /**
     * 事件-预览图片
     * @param currentTarget
     */
    'events.preview'({currentTarget}) {
        let {dataset} = currentTarget;
        let urls = dataset['urls'];
        let current = dataset['current'] || null;
        if ((typeof urls) !== 'object') {
            urls = [urls];
        }
        WeChat.wx['previewImage']({urls: urls, current: current});
    }

    /**
     * 跳转到一指定页面
     * @param e 页面相对路径 或者 事件对象
     */
    go(e) {
        if (typeof (e) !== 'object') {
            WeChat.wx['navigateTo']({
                url: e
            });
            return;
        }
        // 阻止双击跳转
        if (this.GO_CHECK) {
            return;
        }
        this.GO_CHECK = true;
        setTimeout(() => {
            this.GO_CHECK = false;
        }, 800);
        // 元素绑定go事件
        let currentTarget = e.currentTarget;
        let dataSet = currentTarget.dataset;
        // 跳转方式
        let openType = dataSet.openType || 'navigate';
        // 跳转地址
        let url = dataSet.url || '';
        switch (openType) {
            case 'navigate':
                return WeChat.wx['navigateTo']({
                    url: url
                });
            case 'redirect':
                return WeChat.wx['redirectTo']({
                    url: url
                });
            case 'switchTab':
                return WeChat.wx['switchTab']({
                    url: url
                });
            case 'reLaunch':
                return WeChat.wx['reLaunch']({
                    url: url
                });
            case 'navigateBack':
                return WeChat.wx['navigateBack']({
                    url: url
                });
        }
    }

    /**
     * 返回前几页
     * @param num
     */
    goBack(num) {
        WeChat.wx['navigateBack']({delta: num ? num : 1});
    }

    /**
     *
     * 返回前几页刷新(被刷新的页面需要实现refresh方法)
     * @param params
     * @param num
     */
    goBackRefresh(params, num) {
        num = num || 1;
        // 路由里的页面
        let routes = WeChat.getCurrentPages();
        // 目标页面索引
        let targetIndex = (routes.length - num - 1) >= 0 ? (routes.length - num - 1) : 0;
        // 目标页面
        let target = routes[targetIndex];
        WeChat.wx['navigateBack']({delta: num});
        // 执行目标页面刷新方法
        if (target['refresh']) target['refresh'](params);
    }

    /**
     * 设置默认页面数据对象
     * @param data
     */
    setDefaultData(data = {}) {
        let _data = {
            base_page: {
                isShowSimpleMessage: false,
                simpleMessage: '',
                // 是否显示百分比进度
                isShowPercentProgress: false,
                // 百分比进度
                percentProgress: 0,
                // 百分比进度框左半圆角度
                percentProgressLeftRotate: 45,
                // 百分比进度框右半圆角度
                percentProgressRightRotate: 45
            }
        };

        for (let key of Object.keys(data)) {
            _data[key] = data[key];
        }

        this.data = _data;
    }

    /**
     * 显示一条短消息
     * @param msg 消息内容
     * @param time 过期时间
     * @param callback 回调方法
     */
    showSimpleMsg(msg, time = 1500, callback) {
        let base_page = this.data.base_page;
        base_page.isShowSimpleMessage = true;
        base_page.simpleMessage = msg;
        this.setData({base_page: base_page});

        setTimeout(() => {
            let base_page = this.data.base_page;
            base_page.isShowSimpleMessage = false;
            this.setData({base_page: base_page});
            if (callback) callback();
        }, time);
    }

    /**
     * 显示一条错误提示消息
     * @param title
     */
    showErrorMsg(title) {
        return Service.showErrorMsg(title);
    }

    /**
     * 显示一条成功提示消息
     * @param title
     */
    showSuccessMsg(title) {
        return Service.showSuccessMsg(title);
    }

    /**
     * 从路径中格式化参数
     * @param path
     * @returns {{}}
     */
    formatParamsByPath(path) {
        let params = {};
        if (StringUtils(path).isEmpty()) {
            return params;
        }
        // 解析路径内容
        path = decodeURIComponent(path);
        // 解码地址
        path = decodeURIComponent(path);
        let arr = path.match(new RegExp('[^=\?\&]+=[^=\?\&]+', 'g'));
        if (arr.length <= 0) {
            return params;
        }
        for (let i = 0; i < arr.length; i++) {
            let paramArr = arr[i].split('=');
            params[paramArr[0]] = paramArr[1];
        }
        return params;
    }

    /**
     * 创建分页器
     * @param name
     * @returns {Pagination}
     */
    createPagination(name = 'pagination') {
        return new Pagination(this, name);
    }

    /**
     * 创建录音工具
     * @param ableAutoSend 是否开房自动发送
     * @returns {RecordUtils}
     */
    createRecordUtils(ableAutoSend = false) {
        return new RecordUtils(this, ableAutoSend);
    }

    /**
     * 加载语音播放工具
     * @returns {VoiceUtils}
     */
    loadVoiceUtils(title = '虾美优课', singer = '老师') {
        return new VoiceUtils(this, {
            title: title,
            singer: singer
        });
    }

    /**
     * 获取语音播放工具管理器
     * @returns {*}
     */
    getVoiceManager() {
        // 语音播放工具实例列表
        Service.VOICE_UTILS_INSTANCES = Service.VOICE_UTILS_INSTANCES || {};
        // for (let i = 0; i < Service.VOICE_UTILS_INSTANCES.length; i++) {
        //     let voice = Service.VOICE_UTILS_INSTANCES[i];
        //     console.log(voice);
        // }

        return {
            /**
             * 创建语音播放工具
             * @param title
             * @param singer
             * @returns {VoiceUtils}
             */
            create: (title = '虾美优课', singer = '老师') => {
                return new VoiceUtils(this, {
                    title: title,
                    singer: singer
                });
            },
            /**
             * 添加一个语音管理器到控制器
             * @param managerId 管理器ID
             * @param manager
             */
            addManagerToList: (managerId, manager) => {
                Service.VOICE_UTILS_INSTANCES[managerId + ''] = manager;
            },
            /**
             * 加载语音播放工具
             * @param managerId 管理器ID
             * @param title
             * @param singer
             * @returns {VoiceUtils}
             */
            load: (managerId, title = '虾美优课', singer = '老师') => {
                let voice = new VoiceUtils(this, {
                    title: title,
                    singer: singer
                });
                Service.VOICE_UTILS_INSTANCES[managerId + ''] = voice;
                return voice;
            },
            /**
             * 通过ID获取已经存在的语音
             * @param voiceId
             */
            getVoiceManagerById: (voiceId) => {
                return Service.VOICE_UTILS_INSTANCES[voiceId + ''];
            },
            // 销毁管理列表
            destroyManagers() {
                let managers = Service.VOICE_UTILS_INSTANCES;
                for (let key in managers) {
                    if (managers.hasOwnProperty(key)) {
                        managers[key].destroy();
                        delete managers[key];
                    }
                }
            },
            /**
             * 通过语音ID获取指定语音管理工具的当前信息
             * @param voiceId
             * @returns {*}
             */
            getVoiceCurrentInfoById(voiceId) {
                let manager = this.getVoiceManagerById(voiceId);
                if (manager) {
                    return manager.getCurrentInfo();
                }
                return {};
            }
        };
    }

    /**
     * 编辑文本
     * @param options
     * @param cb
     */
    editText(options, cb) {
        // 设置编辑文本回调方法
        BasePage.XM_EDIT_TEXT_CALLBACK = cb || null;
        options = options || {};
        let title = encodeURIComponent(options.title || '编辑文本');
        let content = encodeURIComponent(options.content || '');
        let buttonText = encodeURIComponent(options.buttonText || '确定');
        let placeholder = encodeURIComponent(options.placeholder || '请输入文本');
        let checks = 'BASE_PAGE_EDIT_CHECK_' + `${(new Date()).valueOf()}`.substr(6, 7);
        Service[checks] = options.checks || [];
        let maxLength = options.maxLength || 1000;
        this.go(`/pages/common/edit_text?title=${title}&content=${content}&buttonText=${buttonText}&maxLength=${maxLength}&placeholder=${placeholder}&checks=${checks}`);
    }

    // 加载课程朋友圈分享图
    loadQrCodeImg(options, callback) {
        new ShareQrCode().loadQrCodeImg(options, callback);
    }

    // 加载团队朋友圈分享图
    loadTeamQrCodeImg(options, callback) {
        new ShareQrCode().loadTeamQrCodeImg(options, callback);
    }

    /**
     * 播放指定地址的声音
     * @param src 声音地址
     */
    playVoice(src) {
        if (!this.myInnerAudioContext) {
            this.myInnerAudioContext = WeChat.wx['createInnerAudioContext']();
            this.myInnerAudioContext.autoplay = true;
        } else {
            this.myInnerAudioContext.stop();
        }
        this.myInnerAudioContext.src = src;
        this.myInnerAudioContext.play();
    }

    /**
     * 获取进度控制实例
     */
    getProgressInstance() {
        let base_page = Object.assign({}, this.data.base_page);
        // 是否显示进度框
        base_page.isShowPercentProgress = true;
        // 百分比进度
        base_page.percentProgress = 0;
        // 百分比进度框左半圆角度
        base_page.percentProgressLeftRotate = -135;
        // 百分比进度框右半圆角度
        base_page.percentProgressRightRotate = -135;
        this.setData({base_page: base_page});
        return {
            /**
             * 设置进度
             * @param percent 进度百分比
             */
            set: (percent) => {
                let base_page = Object.assign({}, this.data.base_page);
                // 百分比进度
                base_page.percentProgress = percent;
                if (percent >= 0 && percent <= 50) {
                    base_page.percentProgressLeftRotate = -135;
                    base_page.percentProgressRightRotate = 180 / 50 * percent - 135;
                } else if (percent >= 50 <= 100) {
                    base_page.percentProgressLeftRotate = 180 / 50 * (percent - 50) - 135;
                    base_page.percentProgressRightRotate = 45;
                }
                this.setData({base_page: base_page});
            },
            /**
             * 关闭进度弹窗
             */
            close: () => {
                let base_page = Object.assign({}, this.data.base_page);
                // 是否显示进度框
                base_page.isShowPercentProgress = false;
                // 百分比进度
                base_page.percentProgress = 0;
                // 百分比进度框左半圆角度
                base_page.percentProgressLeftRotate = 45;
                // 百分比进度框右半圆角度
                base_page.percentProgressRightRotate = 45;
                this.setData({base_page: base_page});
            }
        }
    }
}
