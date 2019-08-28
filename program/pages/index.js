/**
 * 描述: 首页
 * 版权: Copyright (c) 2018
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2018/9/3 15:01
 */
import {WeChat, BasePage, Service, regeneratorRuntime} from '../core/main';

class Index extends BasePage {
    constructor() {
        super();
        this.setDefaultData({
            canvas: {
                width: 750,
                height: 750
            },
            imgUrl: null
        });
    }

    static onShareAppMessage() {
        return {
            title: ``,
            path: `/pages/index`
        }
    }

    events = {
        'stop'() {

        }
    };

    onPullDownRefresh() {
        this.load();
    }

    onReachBottom() {

    }

    onPageLoad() {
        this.refresh();
    }

    refresh() {

    }
}

WeChat.register(Index);
