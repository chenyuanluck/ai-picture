/**
 * 描述: 全局配置工具
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/4/17 14:05
 */
import WebIMHandler from './WebIMHandler';
import BaseError from './BaseError';

const WebIM = {
    // 待发送消息列表
    waitMsgs: [],
    // 历史消息回调列表
    historyMsgParams: [],
    // 是否登陆成功
    isLogin: false,
    config: {
        // SDK ID
        sdkAppID: 1400039217,
        // 帐号类型
        accountType: 13852,
        // 帐号模式(0: 表示独立模式; 1: 表示托管模式)
        accountMode: 1
    }
};

/**
 * 初始化聊天室
 * @param userInfo
 * @param callback
 */
WebIM.login = function (userInfo, callback) {
    this.waitMsgs = [];
    this.historyMsgParams = [];
    this.isLogin = false;
    this.info = this.config;
    Object.assign(this.info, userInfo);
    // 获取IM助手实例
    this.IM = WebIMHandler.getInstance({
        accountMode: this.config.accountMode,
        accountType: this.config.accountType,
        sdkAppID: this.config.sdkAppID,
        groupId: userInfo.groupId,
        selToID: userInfo.groupId
    });
    // 设置登陆选项
    this.IM.setLoginOptions({isLogOn: false});

    try {
        this.IM.login({
            // 当前用户ID,必须是否字符串类型，选填
            'identifier': userInfo.Identifier,
            // 当前用户昵称，选填
            'identifierNick': userInfo.nickName,
            // 当前用户身份凭证，必须是字符串类型，选填
            'userSig': userInfo.UserSig,
        }, (result) => {
            callback && callback(result);
            this.isLogin = true;
            for (let i = 0; i < this.waitMsgs.length; i++) {
                this.IM.sendMsg(this.waitMsgs[i]);
            }
            for (let i = 0; i < this.historyMsgParams.length; i++) {
                this.IM.getHistoryMsgs(this.historyMsgParams[i][0], this.historyMsgParams[i][1], this.historyMsgParams[i][2]);
            }
        });
    } catch (err) {
        throw new BaseError(err, '调用WebIMHandler.js=>login方法异常');
    }
};

/**
 * 加入指定群组
 * @param groupId
 * @param listen
 * @param callback
 */
WebIM.joinGroup = function (groupId, listen, callback) {
    this.IM.joinGroup(groupId, (msg) => {
        // 消息内容
        let content = msg.content || '{}';
        content = content.replace(new RegExp('&quot;', 'g'), '"');
        content = content.replace("#DATE#", msg.time);
        content = content.replace("#ID#", msg.seq);
        if (!isJSON(content)) return;
        content = JSON.parse(content);
        content['sequence'] = msg.seq;
        try {
            content['msg'] = decodeURIComponent(content['msg']);
        } catch (e) {

        }
        if (listen) listen(content);
    }, callback);
};

/**
 * 发送消息
 * @param content
 */
WebIM.sendMsg = function (content) {
    if (this.isLogin !== true) {
        this.waitMsgs.push(content);
    } else {
        this.IM.sendMsg(content);
    }
};

/**
 * 登出
 */
WebIM.logout = function () {
    if (this.isLogin !== true) {
        return;
    }
    this.isLogin = false;
    this.IM.getGroupList((list) => {
        for (let i = 0; i < list.length; i++) {
            this.IM.quitGroup(list[i]['GroupId']);
        }
        this.IM.logout();
    });
};

/**
 * 监听消息
 * @param cb 回调方法
 */
WebIM.listen = function (cb) {
    this.IM.listenMsg(cb);
};

/**
 * 获取历史消息
 * @param seq
 * @param size
 * @param cb
 */
WebIM.getHistoryMsg = function (seq, size, cb) {
    if (this.isLogin !== true) {
        this.historyMsgParams.push([seq, size, cb]);
    } else {
        this.IM.getHistoryMsgs(seq, size, cb);
    }
};

/**
 * 获取历史消息(简化)
 * @param seq
 * @param size
 * @param cb
 */
WebIM.getSimpleHistoryMsg = function (seq, size, cb) {
    if (this.isLogin !== true) {
        this.historyMsgParams.push([seq, size, cb]);
    } else {
        this.IM.getHistoryMsgs(seq, size, cb);
    }
};

/**
 * 判断一个字串是否为json
 * @param str
 * @returns {boolean}
 */
function isJSON(str) {
    if (typeof str === 'string') {
        try {
            JSON.parse(str);
            return str.indexOf('{') > -1
        } catch (e) {
            return false
        }
    }
    return false
}

export default WebIM;