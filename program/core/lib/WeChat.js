/**
 * 描述: 微信小程序注入的全局对象
 * 版权: Copyright (c) 2016
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/3/24 16:11
 */
import regeneratorRuntime from "../plugins/runtime";
import Utils from './Utils';
import Config from './Config';
// 小程序全局对象
const WeChat = {};

// 微信注入的App方法
WeChat.App = App;
// 微信注入的getApp方法
WeChat.getApp = getApp;
// 微信注入的Page方法
WeChat.Page = Page;
// 微信注入的Component方法
WeChat.Component = Component;
// 微信注入的API
WeChat.wx = {};
Object.assign(WeChat.wx, wx);
// 获取当前所有页面
WeChat.getCurrentPages = getCurrentPages;
// 获取当前页面
WeChat.getCurrentPage = function () {
    // 路由里的页面
    let routes = WeChat.getCurrentPages();
    // 目标页面
    return routes[routes.length - 1];
};

if (!WeChat.wx['setKeepScreenOn']) {
    WeChat.wx['setKeepScreenOn'] = function () {

    };
}

/**
 * 注册页面
 * @param PageClass 页面脚本类
 */
WeChat.register = function (PageClass) {
    let page = Utils.newInstance(PageClass);
    if (!page.onShareAppMessage) {
        page.onShareAppMessage = function () {
            return {
                title: '网商天下',
                path: `pages/index?openToken=${Config.CURRENT_USER_OPEN_TOKEN}`
            }
        }
    }

    if (page['events']) {
        let events = page['events'];
        for (let key in events) {
            if (events.hasOwnProperty(key)) {
                page['events.' + key] = events[key];
            }
        }
    }
    WeChat.Page(page);
};

/**
 * 初始化组件
 * @param ComponentClass
 */
WeChat.initComponent = function (ComponentClass) {
    let component = Utils.newInstance(ComponentClass);
    WeChat.Component(component);
};

// 重写
WeChat.wx.chooseImage = async function () {
    return new Promise((resolve) => {
        wx.chooseImage({
            success(res) {
                resolve(res);
            },
            fail() {
                resolve(null);
            }
        });
    });
};

export default WeChat;
