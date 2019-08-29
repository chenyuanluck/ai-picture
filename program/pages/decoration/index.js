/**
 * 描述: 人脸变妆
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
            temUrl: null,
            fileID: null,
            // 生成后的图片文件ID
            imageId: null,
            isUploaded: false
        });
    }

    static onShareAppMessage() {
        return {
            title: ``,
            path: `/pages/decoration/index`
        }
    }

    events = {
        // 变装
        'decoration'({currentTarget}) {
            (async () => {
                let {decoration} = currentTarget.dataset || {};
                WeChat.wx.showLoading({title: '图片生成中...'});
                // 选择图片
                const result = await Service.faceDecoration({imgUrl: this.data.fileID, decoration: decoration});
                if (result.code === 0) {
                    const {imgUrl, fileID} = result.data || {};
                    this.setData({temUrl: imgUrl, imageId: fileID, isUploaded: true});
                } else if (result.code === -31) {
                    return WeChat.wx.showToast({title: `生成图片超时，请重试~`, icon: 'none'});
                } else {
                    return WeChat.wx.showToast({title: result.msg, icon: 'none'});
                }
                WeChat.wx.hideLoading();
            })();
        },
        // 保存图片到相册
        'save'() {
            (async () => {
                WeChat.wx.showLoading({title: '正在保存...'});
                // 选择图片
                const result = await Service.pictureSave({imageId: this.data.imageId});
                WeChat.wx.hideLoading();
                if (result.code === 0) {
                    WeChat.wx.showModal({
                        content: '制作成功~',
                        cancelText: '返回首页',
                        confirmText: '查看相册',
                        success({confirm}) {
                            if(confirm) {
                                WeChat.wx.switchTab({url: '/pages/pictures/index'});
                            } else {
                                WeChat.wx.switchTab({url: '/pages/upload/index'});
                            }
                        }
                    });
                } else {
                    return WeChat.wx.showToast({title: result.msg, icon: 'none'});
                }
            })();
        }
    };

    onPullDownRefresh() {
        this.load();
    }

    onReachBottom() {

    }

    onPageLoad(o) {
        this.refresh();
    }

    refresh() {
        const {fileID, temUrl} = Service.getCurrentImgInfo();
        this.setData({fileID, temUrl});
    }
}

WeChat.register(Index);
