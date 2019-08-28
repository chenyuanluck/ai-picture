/**
 * 描述: IM助手
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/4/17 14:05
 */
import sdk from '../plugins/im/webim';
let WebIMHandler = {};

class IM {
    /**
     * 构造方法
     * @param accountMode
     * @param accountType
     * @param sdkAppID
     * @param groupId
     * @param selType
     * @param selToID
     */
    constructor({accountMode, accountType, sdkAppID, groupId, selType = sdk.SESSION_TYPE.GROUP, selToID}) {
        this.getJoinedGroupListOptions = {};
        this.accountMode = accountMode;
        this.accountType = accountType;
        this.sdkAppID = sdkAppID;
        this.groupId = groupId;
        this.selType = selType;
        this.selToID = selToID;
        this.selSess = null;
        this.selSessHeadUrl = null;
        // 设置默认登陆选项
        this.LOGIN_OPTIONS = {
            // 是否访问正式环境，默认访问正式，选填
            isAccessFormalEnv: true,
            // 是否开启控制台打印日志,默认开启，选填
            isLogOn: true
        };
        // 设置默认登陆监听
        this.LOGIN_LISTENERS = {
            // 监听连接状态(选填)
            onConnNotify: IM.onConnNotify,
            // 监听新消息(大群)事件(必填)
            onBigGroupMsgNotify: (msgs) => this.onBigGroupMsgNotify(msgs),
            // 监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
            onMsgNotify: (msgs) => this.onMsgNotify(msgs),
            // 监听（多终端同步）群系统消息事件(必填)
            onGroupSystemNotifys: {
                "5": function () {
                    sdk.Log.warn('群被解散(全员接收)');
                },
                "11": function () {
                    sdk.Log.warn('群已被回收(全员接收)');
                },
                "255": function () {
                    sdk.Log.warn('用户自定义通知(默认全员接收)');
                }
            },
            //监听群资料变化事件(选填)
            onGroupInfoChangeNotify: IM.onGroupInfoChangeNotify
        };

        // 消息监听列表
        this.listenCallBacks = {};
    }

    /**
     * 设置登陆选项
     * @param options
     */
    setLoginOptions(options) {
        Object.assign(this.LOGIN_OPTIONS, options);
    }

    /**
     * SDK登陆
     * @param userInfo 用户信息
     * @param callback 回调方法
     */
    login(userInfo, callback) {
        // 设置用户信息参数(用户所属应用ID,必填)
        userInfo['appIDAt3rd'] = userInfo['sdkAppID'] = this.sdkAppID;
        // 用户所属应用帐号类型，必填
        userInfo['accountType'] = this.accountType;
        // 设置用户信息
        this.userInfo = userInfo;
        // 查询已加入群组请求入参
        this.getJoinedGroupListOptions = {
            Member_Account: userInfo.identifier,
            Limit: 1000,
            Offset: 0,
            GroupBaseInfoFilter: ['NextMsgSeq']
        };
        // 登陆成功回调方法
        let success = (o) => {
            callback(o);
        };

        // 登陆失败回调方法
        let error = (err) => {
            console.error(err);
        };

        // SDK登陆
        sdk.login(userInfo, this.LOGIN_LISTENERS, this.LOGIN_OPTIONS, success, error);
    }

    // 加入群组
    joinGroup(groupId, listen, callback) {
        if (listen) {
            this.listenCallBacks[groupId] = listen;
        }
        // 查询已加入的群列表
        sdk.getJoinedGroupListHigh(this.getJoinedGroupListOptions, ({GroupIdList}) => {
            // for (let i = 0; i < GroupIdList.length; i++) {
            //     // let group = GroupIdList[i];
            //     // console.log(group);
            //     // sdk.quitBigGroup({'GroupId': group.GroupId}, (o)=>{
            //     //     console.log(o);
            //     // }, (e)=>{
            //     //     console.error(e);
            //     // });
            // }
            for (let i = 0; i < GroupIdList.length; i++) {
                let group = GroupIdList[i];
                if (group.GroupId === groupId) {
                    if (callback) callback({seq: group['NextMsgSeq']});
                    return;
                }
            }
            // 加入群组
            sdk.applyJoinGroup({GroupId: groupId},
                function (resp) {
                    if (resp['JoinedStatus'] && resp['JoinedStatus'] === 'JoinedSuccess') {
                        if (callback) callback({seq: 0});
                        sdk.Log.info('进群成功');
                    } else {
                        sdk.Log.info('进群失败');
                    }
                },
                function ({ErrorInfo}) {
                    sdk.Log.error(ErrorInfo);
                }
            );
        }, () => sdk.Log.error('查询群组列表失败'));
    }

    /**
     * 监听消息
     * @param listenCallBack
     */
    listenMsg(listenCallBack) {
        this.listenCallBack = listenCallBack;
    }

    /**
     * 获取历史消息
     * @param seq
     * @param size
     * @param cb
     */
    getHistoryMsgs(seq = 20, size = 20, cb) {
        sdk.syncGroupMsgs({
            GroupId: this.groupId,
            ReqMsgSeq: seq,
            ReqMsgNumber: size
        }, (msgs) => {
            let list = [];
            // 遍历消息，按照时间从后往前
            for (let i = 0; i < msgs.length; i++) {
                list.push(IM.formatMsg(msgs[i]));
            }
            cb(list);
        }, function () {
            sdk.Log.warn('历史消息获取失败');
        });
    }

    // 监听连接状态
    static onConnNotify(resp) {
        switch (resp.ErrorCode) {
            case sdk.CONNECTION_STATUS.ON:
                sdk.Log.warn('连接状态正常...');
                break;
            case sdk.CONNECTION_STATUS.OFF:
                sdk.Log.warn('连接已断开，无法收到新消息，请检查下你的网络是否正常');
                break;
            default:
                sdk.Log.error('未知连接状态,status=' + resp.ErrorCode);
                break;
        }
    }

    // 监听群资料变化事件
    static onGroupInfoChangeNotify(groupInfo) {
        sdk.Log.warn("执行 群资料变化 回调： " + JSON.stringify(groupInfo));
    }

    // 监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件
    onMsgNotify(msgs) {
        // 遍历消息，按照时间从后往前
        for (let i = msgs.length - 1; i >= 0; i--) {
            let msg = msgs[i];
            // 监听收到的消息
            if (this.listenCallBack) this.listenCallBack(IM.formatMsg(msg));
            let groupId = msg.getSession().id();
            if (this.listenCallBacks[groupId]) {
                this.listenCallBacks[groupId](IM.formatMsg(msg));
            }
        }
    }

    // 监听大群消息
    onBigGroupMsgNotify(msgs) {
        // 遍历消息，按照时间从后往前
        for (let i = msgs.length - 1; i >= 0; i--) {
            let msg = msgs[i];
            // 监听收到的消息
            if (this.listenCallBack) this.listenCallBack(IM.formatMsg(msg));
            let groupId = msg.getSession().id();
            if (this.listenCallBacks[groupId]) {
                this.listenCallBacks[groupId](msg);
            }
        }
    }

    // 格式化消息
    static formatMsg(msg) {
        // 获取消息包含的元素数组
        let els = msg.getElems();
        let text = '';
        for (let i = 0; i < els.length; i++) {
            let el = els[i];
            //获取元素对象
            let content = el.getContent();
            switch (el.getType()) {
                case sdk.MSG_ELEMENT_TYPE.TEXT:
                    text += IM.formatTextMsg(content);
                    break;
            }
        }

        return {
            content: text,
            fromAccount: msg.getFromAccount(),
            fromAccountNick: msg.getFromAccountNick(),
            subType: msg.getSubType(),
            seq: msg.getSeq(),
            time: msg.getTime(),
            groupId: msg.getSession().id(),
            groupName: msg.getSession().name(),
            groupType: msg.getSession().type()
        };
    }

    // 格式化文本消息
    static formatTextMsg(msg) {
        return msg.getText();
    }

    // 发送消息
    sendMsg(content, callback) {
        let msgLen = sdk.Tool.getStrBytes(content);

        if (content.length < 1) {
            console.error("发送的消息不能为空!");
            return;
        }

        let maxLen, errInfo;
        if (this.selType === sdk.SESSION_TYPE.GROUP) {
            maxLen = sdk.MSG_MAX_LENGTH.GROUP;
            errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
        } else {
            maxLen = sdk.MSG_MAX_LENGTH.C2C;
            errInfo = "消息长度超出限制(最多" + Math.round(maxLen / 3) + "汉字)";
        }
        if (msgLen > maxLen) {
            console.error(errInfo);
            return;
        }

        if (!this.selSess) {
            this.selSess = new sdk.Session(this.selType, this.selToID, this.selToID, this.selSessHeadUrl, Math.round(new Date().getTime() / 1000));
        }
        let isSend = true;//是否为自己发送
        let seq = -1;//消息序列，-1表示sdk自动生成，用于去重
        let random = Math.round(Math.random() * 4294967296);//消息随机数，用于去重
        let msgTime = Math.round(new Date().getTime() / 1000);//消息时间戳
        let subType;//消息子类型
        if (this.selType === sdk.SESSION_TYPE.GROUP) {
            subType = sdk.GROUP_MSG_SUB_TYPE.COMMON;

        } else {
            subType = sdk.C2C_MSG_SUB_TYPE.COMMON;
        }
        let msg = new sdk.Msg(this.selSess, isSend, seq, random, msgTime, this.userInfo.identifier, subType, this.userInfo.identifierNick);
        //解析文本和表情
        let expr = /\[[^[\]]{1,3}\]/mg;
        let emotions = content.match(expr);
        let text_obj;
        if (!emotions || emotions.length < 1) {
            text_obj = new sdk.Msg.Elem.Text(content);
            msg.addText(text_obj);
        }
        sdk.sendMsg(msg, () => {
            // 私聊时，在聊天窗口手动添加一条发的消息，群聊时，长轮询接口会返回自己发的消息
            if (this.selType === sdk.SESSION_TYPE.C2C) {
                sdk.Log.info(msg);
            }
            sdk.Log.info("发消息成功");
            callback && callback();
        }, (err) => {
            sdk.Log.error("发消息失败:" + err.ErrorInfo);
            console.error("发消息失败:" + err.ErrorInfo);
        });
    }

    logout(callback) {
        sdk.logout(callback);
    }

    // 获取已加入群列表
    getGroupList(callback) {
        // 查询已加入的群列表
        sdk.getJoinedGroupListHigh(
            this.getJoinedGroupListOptions,
            ({GroupIdList}) => callback(GroupIdList),
            () => sdk.Log.error('查询群组列表失败')
        );
    }

    // 退群
    quitGroup(groupId) {
        sdk.quitBigGroup({'GroupId': groupId},
            (resp) => {
                sdk.Log.info(resp);
            },
            (err) => {
                sdk.Log.error(err.ErrorInfo);
            }
        );
    }
}

/**
 * 获取IM工具实例
 * @returns {IM}
 */
WebIMHandler.getInstance = function ({accountMode, accountType, sdkAppID, groupId, selType, selToID}) {
    return new IM({accountMode, accountType, sdkAppID, groupId, selType, selToID});
};

export default WebIMHandler;