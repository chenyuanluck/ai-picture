/**
 * 描述: 查看相册
 * 版权: Copyright (c) 2018
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2019/8/25 15:01
 */
import {WeChat, BasePage, Service, regeneratorRuntime, StringUtils} from '../../core/main';

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
                this.setData({list: this.formatPictureList(list)});
                if (list.length === 0) {
                    WeChat.wx.showModal({
                        content: '你还没有制作美颜相册呢，快去制作吧~',
                        showCancel: false,
                        success() {
                            WeChat.wx.switchTab({url: '/pages/upload/index'});
                        }
                    });
                }
            } else {
                return WeChat.wx.showToast({title: result.msg, icon: 'none'});
            }

        })();
    }

    // 格式化图片列表
    formatPictureList(list = []) {
        // 结果
        const result = [];
        // 数据存储
        let map = {};
        // 日期存储
        let arr = [];
        for (let i = 0; i < list.length; i++) {
            const item = Object.assign({}, list[i]);
            // 上传日期
            const date = StringUtils().formatTimestamp(list[i]['createTime']).substr(0, 13);
            // 日期
            item['date'] = date;
            if (arr.indexOf(date) < 0) {
                arr.push(date);
            }
            if (!!map[date]) {
                map[date].push(item);
            } else {
                map[date] = [item];
            }
        }
        arr.sort(function (x, y) {
            return x - y;
        });
        for (let i = 0; i < arr.length; i++) {
            let date = arr[i];
            result.push({
                date: date,
                dateArr: date.match(new RegExp('\\d+', 'g')),
                list: map[date]
            });
        }
        console.log(result);
        return result;
    }
}

WeChat.register(Index);
