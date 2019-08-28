/**
 * 描述: 自定义图片
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2018/1/3 14:30
 */
import {WeChat, BaseComponent} from '../main';

class WsImageComponent extends BaseComponent {
    constructor() {
        super();

        this.data = {
            // 图片是否加载
            imageIsLoad: false
        };
    }

    options = {
        multipleSlots: false
    };

    properties = {
        src: {
            type: String,
            value: null
        },
        mode: {
            type: String,
            value: 'aspectFill'
        }
    };

    methods = {
        // 阻止冒泡
        'events.stop'() {

        },
        // 图片加载完成
        'events.load'() {
            this.setData({imageIsLoad: true});
        },
        // 图片预览
        'events.preview'({currentTarget}) {
            let {dataset} = currentTarget;
            let urls = dataset['urls'];
            let current = dataset['current'] || null;
            if ((typeof urls) !== 'object') {
                urls = [urls];
            }
            WeChat.wx['previewImage']({urls: urls, current: current});
        }
    };

    created() {
        this.tt = (new Date()).valueOf();
    }
}

WeChat.initComponent(WsImageComponent);
