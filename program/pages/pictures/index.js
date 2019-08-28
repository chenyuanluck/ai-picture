/**
 * 描述: 查看相册
 * 版权: Copyright (c) 2018
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2019/8/25 15:01
 */
import {WeChat, BasePage, Service, regeneratorRuntime} from '../../core/main';

class Index extends BasePage {
    constructor() {
        super();
        this.setDefaultData({
            list: []
        });
    }

    static onShareAppMessage() {
        return {
            title: ``,
            path: `/pages/upload/index`
        }
    }

    events = {};

    onPullDownRefresh() {
        this.load();
    }

    onReachBottom() {

    }

    onPageLoad() {
        this.refresh();
    }

    refresh() {
        (async () => {
            WeChat.wx.showLoading({title: '加载中...'});
            const result = await Service.picturePage({});
            WeChat.wx.hideLoading();
            if (result.code === 0) {
                let {list} = result.data || {};
                this.setData({list: list});
                if (list.length === 0) {
                    WeChat.wx.showModal({
                        content: '你还没有制作美颜相册呢，快去制作吧~',
                        showCancel: false,
                        success() {
                            WeChat.wx.redirectTo({url: '/pages/upload/index'});
                        }
                    });
                }
            } else {
                return WeChat.wx.showToast({title: result.msg, icon: 'none'});
            }

        })();
    }
}

WeChat.register(Index);
