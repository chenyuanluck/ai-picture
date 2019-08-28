/**
 * 描述: 基础组件类
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/6/6 14:27
 */
import WeChat from './WeChat';
import ShareQrCode from './ShareQrCode';

export default class BaseComponent {
    constructor() {

    }

    created(o) {
        if (this['onCreated']) {
            return this['onCreated'](o);
        }
    }

    attached(o) {
        if (!this.data.comId) {
            return console.log(`错误:未获取到组件ID~[${this['is']}]`);
        }
        this.$parent = WeChat.getCurrentPage();
        this.$parent.$coms = this.$parent.$coms || {};
        this.$parent.$coms[this.data.comId] = this;
        WeChat.wx['getSystemInfo']({
            success: ({windowWidth, windowHeight}) => {
                // 实现将px转为rpx
                this.getRpxValByPx = (pxVal) => {
                    return Math.round(pxVal * 750 / windowWidth);
                };
                // 页面高度
                this.pageHeight = this.getRpxValByPx(windowHeight);
            }
        });
        // 设置游戏基础组件
        if (this['onAttached']) {
            setTimeout(() => {
                // 游戏基础组件
                this.$game = this.getGameBaseCom();
                this['onAttached'](o);
            }, 100);
        }
    }

    ready(o) {
        if (this['onReady']) {
            return this['onReady'](o);
        }
    }

    moved(o) {
        if (this['onMoved']) {
            return this['onMoved'](o);
        }
    }

    detached(o) {
        if (this['onDetached']) {
            return this['onDetached'](o);
        }
    }

    // 将当前实例转为小程序组件实例
    format() {
        this.events = this.events || {};
        this.methods = this.methods || {};
        for (let key in this.events) {
            if (this.events.hasOwnProperty(key)) {
                this.methods[`events.${key}`] = this.events[key];
            }
        }
        delete this.events;
        for (let key of Object.getOwnPropertyNames(this.__proto__)) {
            if (key !== 'constructor') {
                this.methods[key] = this.__proto__[key];
            }
        }
        for (let key of Object.getOwnPropertyNames(this.__proto__.__proto__)) {
            if (key !== 'constructor') {
                this.methods[key] = this.__proto__.__proto__[key];
            }
        }
    }

    /**
     * 设置默认数据对象
     * @param data
     */
    setDefaultData(data = {}) {
        this.data = data;
        this.format();
    };

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

    // 加载课程朋友圈分享图
    loadQrCodeImg(options, callback) {
        new ShareQrCode().loadQrCodeImg(options, callback);
    }

    /**
     * 通过组件Id获取组件
     * @param comId 组件ID
     * @returns {*|{}}
     */
    getComponent(comId) {
        let $com = this.$parent.$coms[comId] || {};
        if($com.getPublic) {
            return $com.getPublic();
        }
        return {};
    }

    /**
     * 实现将px转为rpx
     * @param pxVal 像素值
     * @returns {number} 小程序像素单位值
     */
    getRpxValByPx(pxVal) {
        return pxVal;
    }

    /**
     * 获取游戏基础组件
     */
    getGameBaseCom() {
        return this.getComponent('gameBaseCom');
    }
}