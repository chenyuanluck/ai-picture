/**
 * 描述: 上传图片
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
            isUploaded: false
        });
    }

    static onShareAppMessage() {
        return {
            title: ``,
            path: `/pages/upload/index`
        }
    }

    events = {
        // 上传图片
        'upload'() {
            (async () => {
                // 选择图片
                const images = await WeChat.wx.chooseImage();
                if (!images) {
                    return;
                }
                const {tempFilePaths} = images;
                WeChat.wx.showLoading({title: '上传中...'});
                const result = await Service.uploadImage(tempFilePaths[0]);
                WeChat.wx.hideLoading();
                if (!result) {
                    return;
                }
                this.setData({fileID: result['fileID'] || '', temUrl: tempFilePaths[0], isUploaded: true});
            })();
        },
        // 下一步
        'next'() {
            (async () => {
                WeChat.wx.showLoading({title: '识别中...'});
                // 选择图片
                const result = await Service.faceDetect({imgUrl: this.data.fileID});
                if (result.code === 0) {
                    Service.setCurrentImgInfo({
                        fileID: this.data.fileID,
                        temUrl: this.data.temUrl
                    });
                    WeChat.wx.navigateTo({url: `/pages/decoration/index`});
                } else if (result.code === 16404) {
                    return WeChat.wx.showToast({title: `人脸检测失败`, icon: 'none'});
                } else {
                    return WeChat.wx.showToast({title: result.msg, icon: 'none'});
                }
                WeChat.wx.hideLoading();
            })();
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
