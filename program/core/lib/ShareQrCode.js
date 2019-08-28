/**
 * 描述: 分享二维码
 * 版权: Copyright (c) 2016
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/3/23 15:35
 */
import WeChat from './WeChat';
import StringUtils from './StringUtils';

export default class ShareQrCode {
    constructor() {

    }

    // 加载课程朋友圈分享图
    loadQrCodeImg(options, callback) {
        options = options || {};
        options['name'] = options['name'] || '';
        options['percent'] = options['percent'] || '';
        options['picture'] = options['picture'] || '';
        options['qrCode'] = options['qrCode'] || '';
        options['ranking'] = options['ranking'] || '';
        options['score'] = options['score'] || '';
        options['bg'] = options['bg'] || 'https://g.wxplayer.com/resources/games/common/share_image.png?v=1';
        let canvasId = options.canvasId || 'xm-share-qt-code-canvas';
        let ctx = WeChat.wx['createCanvasContext'](canvasId);
        /**
         * 补充增加粗体字方法
         * @param text
         * @param left
         * @param top
         */
        ctx.fillWeightText = function (text, left, top) {
            this['fillText'](text, left, top - 0.5);
            this['fillText'](text, left - 0.5, top);
            this['fillText'](text, left, top);
            this['fillText'](text, left, top + 0.5);
            this['fillText'](text, left + 0.5, top);
        };
        ShareQrCode.downOptionsImg(options, (params) => {
            // 背景
            ctx['fillRect'](0, 0, 375, 667);
            // 头像
            // ctx['drawImage'](params['picture'] || '', 61.5, 20, 60, 60);
            ctx['drawImage'](params['picture'] || '', 61, 18.5, 60, 60);
            // 二维码图片
            ctx['drawImage'](params['qrCode'] || '', 33, 488, 135, 135);
            // 背景图片
            ctx['drawImage'](params['bg'], 0, 0, 375, 667);
            // 昵称
            ctx['setFillStyle']('#ffffff');
            ctx['setTextAlign'] && ctx['setTextAlign']('left');
            ctx['setTextBaseline'] && ctx['setTextBaseline']('middle');
            ctx['setFontSize'](15);
            ctx['fillText'](params['name'], 130, 29);
            // 比例
            ctx['setFillStyle']('#ffffff');
            ctx['setTextAlign'] && ctx['setTextAlign']('left');
            ctx['setTextBaseline'] && ctx['setTextBaseline']('middle');
            ctx['setFontSize'](15);
            ctx['fillText'](`打败了全世界 ${params['percent']}% 的玩家`, 130, 48);
            // 总分
            ctx['setFillStyle']('#fe6f5f');
            ctx['setTextAlign'] && ctx['setTextAlign']('center');
            ctx['setTextBaseline'] && ctx['setTextBaseline']('middle');
            ctx['setFontSize'](16);
            ctx['fillText'](`总分： ${params['score']} 分`, 187.5, 373);
            // 名次
            ctx['setFillStyle']('#ffffff');
            ctx['setTextAlign'] && ctx['setTextAlign']('center');
            ctx['setTextBaseline'] && ctx['setTextBaseline']('middle');
            ctx['setFontSize'](34);
            ctx['fillText'](`第 ${params['ranking']} 名`, 187.5, 408);
            // 标题
            ctx['setFillStyle']('#333333');
            ctx['setTextAlign'] && ctx['setTextAlign']('left');
            ctx['setFontSize'](19);


            let arr = ShareQrCode.splitStr(params['title'] || '', 26);
            if (arr.length > 0) {
                ctx['fillText'](arr[0], 70.5, 368.5);
            }
            if (arr.length > 1) {
                ctx['fillText'](arr[1], 70.5, 392.5);
            }
            ctx['draw']();
            setTimeout(() => {
                WeChat.wx['canvasToTempFilePath']({
                    canvasId: canvasId,
                    success: ({tempFilePath}) => {
                        if (callback) callback(tempFilePath);
                    }
                });
            }, 200);
        });
    }

    // 下载课程朋友圈分享图素材
    static downOptionsImg(options, callback) {
        // 绘制材料参数
        let params = {
            bg: '',
            picture: '',
            name: options['name'],
            qrCode: '',
            score: options['score'],
            ranking: options['ranking'],
            percent: options['percent']
        };
        WeChat.wx['downloadFile']({
            url: options['bg'],
            complete: ({tempFilePath}) => {
                params['bg'] = tempFilePath;
                WeChat.wx['downloadFile']({
                    url: options['qrCode'],
                    complete: ({tempFilePath}) => {
                        params['qrCode'] = tempFilePath;
                        WeChat.wx['downloadFile']({
                            url: options['picture'],
                            complete: ({tempFilePath}) => {
                                params['picture'] = tempFilePath;
                                if (callback) callback(params);
                            }
                        });
                    }
                });
            }
        });
    }

    // 加载团队朋友圈分享图
    loadTeamQrCodeImg(options, callback) {
        options = options || {};
        options['bg'] = 'https://www.xiameikeji.com/resource/classroom201801/image/user/group_share_canvas_bg1.png';
        let canvasId = options.canvasId || 'xm-share-qt-code-canvas';
        let ctx = WeChat.wx['createCanvasContext'](canvasId);
        ShareQrCode.downTeamOptionsImg(options, (params) => {
            // 背景
            ctx['fillRect'](0, 0, 375, 667);
            // 头像
            ctx['drawImage'](params['headImg'] || '', 22.5, 22, 60, 60);
            // 背景图片
            ctx['drawImage'](params['bg'], 0, 0, 375, 667);
            // 二维码图片
            ctx['drawImage'](params['qrCode'] || '', 246, 509, 90, 90);
            // 昵称
            ctx['setFillStyle']('#333333');
            ctx['setTextAlign'] && ctx['setTextAlign']('left');
            ctx['setTextBaseline'] && ctx['setTextBaseline']('middle');
            ctx['setFontSize'](14);
            let arr = ShareQrCode.splitStr(params['nickname'] || '', 20);
            if (arr.length > 0) {
                ctx['fillText'](arr[0] + (arr.length > 1 ? '...' : ''), 123, 41);
            }
            ctx['draw']();
            setTimeout(() => {
                WeChat.wx['canvasToTempFilePath']({
                    canvasId: canvasId,
                    x: 0,
                    y: 0,
                    width: 375,
                    height: 667,
                    success: ({tempFilePath}) => {
                        if (callback) callback(tempFilePath);
                    }
                });
            }, 200);
        });
    }

    // 下载团队朋友圈分享图素材
    static downTeamOptionsImg(options, callback) {
        // 绘制材料参数
        let params = {
            bg: '',
            qrCode: '',
            headImg: '',
            nickname: options.nickname || '',
            levelName: options.levelName || ''
        };
        options['headImg'] = options['headImg'].replace('http://', 'https://');
        WeChat.wx['downloadFile']({
            url: options['bg'],
            complete: ({tempFilePath}) => {
                params['bg'] = tempFilePath;
                WeChat.wx['downloadFile']({
                    url: options['qrCode'],
                    complete: ({tempFilePath}) => {
                        params['qrCode'] = tempFilePath;
                        WeChat.wx['downloadFile']({
                            url: options['headImg'],
                            complete: ({tempFilePath}) => {
                                params['headImg'] = tempFilePath;
                                if (callback) callback(params);
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * 将str按每len个长度切割为数组
     * @param str
     * @param len
     * @returns {Array}
     */
    static splitStr(str, len) {
        let index = 0;
        // 上次保存长度
        let oldLen = 0;
        // 当前长度
        let currentLen = 0;
        // 切割后字符串数组
        let arr = [];
        if (StringUtils(str).isEmpty()) {
            return arr;
        }
        for (let i = 0; i < str.length; i++) {
            let s = str[i];
            currentLen += s.charCodeAt(0) <= 255 ? 1 : 2;
            if (currentLen >= oldLen + len) {
                arr.push(str.substring(index, i + 1));
                oldLen = currentLen;
                index = i + 1;
            }
        }
        if (currentLen > oldLen) {
            arr.push(str.substring(index, str.length));
        }
        if (arr.length <= 0) {
            arr.push(str);
        }
        return arr;
    }
}