/**
 * 描述: 接口服务
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/4/14 18:23
 */
import WeChat from './WeChat';
import Config from './Config';
import StringUtils from './StringUtils';
// 微信小程序注入的全局对象
import regeneratorRuntime from '../plugins/runtime';

const Service = {};

class RequestParams {
    constructor() {

    }

    put(key, value, defaultVale) {
        if (StringUtils(value).isEmpty() && StringUtils(defaultVale).isNotEmpty()) {
            value = defaultVale;
        }
        this[key] = StringUtils(value).formatEmpty();
    }
}

Service.RequestParams = RequestParams;

// 跳转登陆的源页面
Service.GO_LOGIN_SOURCE = null;
// 等待token回调列表
Service.WAIT_TOKEN_CALLBACK_LIST = [];
// 链接中来自别的用户的分享token
Service.SHARE_TOKEN = '';

/**
 * 显示一条短消息
 * @param msg
 * @param time
 * @param callback
 */
Service.showSimpleMsg = function (msg, time = 2000, callback) {
    let pages = WeChat.getCurrentPages();
    let page = pages[pages.length - 1];
    page.showSimpleMsg(msg, time, callback);
};

/**
 * 显示一条错误提示消息
 * @param title 消息内容
 * @param duration 延迟关闭时间
 */
Service.showErrorMsg = function (title, duration = 1000) {
    setTimeout(() => {
        WeChat.wx['showToast']({
            title: title,
            image: '/core/resources/images/icon/error.png',
            duration: duration
        });
    }, 200);
};

/**
 * 显示一条成功提示消息
 * @param title 消息内容
 * @param duration 延迟关闭时间
 */
Service.showSuccessMsg = function (title, duration = 1000) {
    setTimeout(() => {
        WeChat.wx['showToast']({
            title: title,
            image: '/core/resources/images/icon/success.png',
            duration: duration
        });
    }, 200);
};

/**
 * 打开系统消息弹窗
 * @param content 消息内容
 */
Service.showSystemMsg = function (content) {

};

/**
 * 处理公共错误
 * @param cb
 * @returns {function(*=)}
 */
Service.handleCommonError = function (cb) {
    return (data) => {
        if (cb) cb(data);
        if (data.error === 1) {
            this.showSystemMsg(`系统异常,请稍候再试~`);
        } else if (data.error === 2) {
            // 清空本地token
            Service.TOKEN = null;
            this.showSystemMsg(`登陆失效,请重试~`);
        } else {

        }
    }
};

/**
 * 处理错误
 */
Service.handleError = function (callBack) {
    return (data) => {
        if (data.code === -8) {
            // 清空本地token
            Service.TOKEN = null;
            WeChat.wx['showModal']({
                title: '提示',
                content: '登陆超时，请刷新页面重新登陆~'
            });
        } else {
            if (callBack) callBack(data);
        }
    }
};

// 请求状态记录数组，每加一个请求，初始值为false,完成请求修改为true
let requestStatus = [];

/**
 * 调用一个服务器地址
 * @param url 请求路径
 * @param params 参数对象
 * @param callBack 回调方法
 * @param method 请求方式
 * @param isShowLoading 是否显示加载框
 */
Service.request = function (url, params, callBack, method = Config['API_METHOD'], isShowLoading = true) {
    // 当前请求的索引
    let currentIndex = 0;

    if (isShowLoading !== false) {
        currentIndex = requestStatus.length;
        requestStatus.push(false);
        setTimeout(() => {
            if (requestStatus.length > 0 && requestStatus[currentIndex] === false) {
                WeChat.wx['showLoading'] && WeChat.wx['showLoading']({title: '加载中...'});
            }
        }, 300);
    }
    WeChat.wx.request({
        url: url,
        data: params || {},
        header: {
            'content-type': 'application/x-www-form-urlencoded',
            'version': params['version'] || ''
        }, method: method,
        success: function ({data}) {
            if (data && data.error) {
                data.error = parseInt(data.error);
            }
            if (callBack) callBack(data);
        }, fail() {
            Service.showErrorMsg('网络错误', 2000);
            // 加载token失败，重置token请求状态
            Service.isLoadingToken = false;
        }, 'complete': function () {
            if (isShowLoading !== false) {
                if (requestStatus.length > 0) {
                    requestStatus[currentIndex] = true;
                }
                for (let i = 0; i < requestStatus.length; i++) {
                    if (requestStatus[i] !== true) {
                        return;
                    }
                }

                WeChat.wx['hideLoading'] && WeChat.wx['hideLoading']();
                requestStatus.length = 0;
            }
        }
    });
};

/**
 * 调用一个服务器地址
 * @param apiPath 接口地址
 * @param params 参数对象
 * @param callBack 回调方法
 * @param method 请求方式
 * @param isShowLoading 是否显示加载框
 */
Service.getService = function (apiPath, params, callBack, method = Config['API_METHOD'], isShowLoading) {
    if (!method) method = Config['API_METHOD'];
    // 设置请求小程序实例ID
    params['i'] = Config.getMiniProgramId();
    this.request(Config.getApiPath() + apiPath, params, callBack, method, isShowLoading);
};

// 正在加载的Api
Service.isLoadingApi = {};

/**
 * 请求一个不可重复的服务接口
 * @param apiPath 接口地址
 * @param params 参数对象
 * @param callBack 回调方法
 * @param method 请求方式
 * @param isShowLoading 是否显示加载框
 */
Service.getNotRepeatService = function (apiPath, params, callBack, method = Config['API_METHOD'], isShowLoading) {
    if (Service.isLoadingApi[apiPath] === true) {
        return;
    }
    Service.isLoadingApi[apiPath] = true;
    Service.getService(apiPath, params, (data) => {
        callBack(data);
        setTimeout(() => {
            Service.isLoadingApi[apiPath] = false;
        }, 1000);
    }, method, isShowLoading);
};

/**
 * 获取用户信息
 * @param callback 回调方法
 * @param isRefresh 是否强制刷新
 */
Service.getUserInfo = function (callback, isRefresh = false) {
    if (Service['CURRENT_USER_INFO'] && isRefresh !== true) {
        return callback(Service['CURRENT_USER_INFO']);
    }
    this.getToken((token) => {
        // 请求入参
        let request = {};
        // token
        request['token'] = token;
        this.getService('/api/user/getUserInfo', request, this.handleCommonError((result) => {
            if (result) {
                let {data} = result;
                Service['CURRENT_USER_INFO'] = data;
                callback(data);
            }
        }));
    });
};

// 小程序登陆
Service.loginByWeChat = function (callback) {
    WeChat.wx.login({
        success: ({code}) => {
            callback(code);
        }, fail() {
            Service.showErrorMsg('登陆微信小程序失败');
        }
    });
};

/**
 * 用户登陆
 * @param cb
 */
Service.login = function (cb) {
    Service.loginByWeChat((code) => {
        // 请求入参
        let request = {};
        // 微信code
        request['code'] = code;
        // 分享token
        request['shareToken'] = Service.SHARE_TOKEN;
        //
        this.getService('/api/user/auth', request, Service.handleCommonError((result) => {
            Service.isLoadingToken = false;
            if (result.error === 0) {
                let {data} = result;
                Service.TOKEN = data.token;
            } else if (result.error === 101) {
                let {data} = result;
                // 注册专用token
                Service.REGISTER_TOKEN = data.token;
            }
            if (cb) cb(result);
        }));
    });
};

// 注册
Service.register = function (params, callback) {
    if (StringUtils(params['encryptedData']).isEmpty()) {
        this.showSimpleMsg('[加密值]不能为空');
        return;
    }
    if (StringUtils(params['iv']).isEmpty()) {
        this.showSimpleMsg('[偏移值]不能为空');
        return;
    }
    // 请求入参
    let request = {};
    // token
    request['token'] = Service.REGISTER_TOKEN;
    // 加密值
    request['encryptedData'] = params['encryptedData'];
    // 偏移值
    request['iv'] = params['iv'];
    // 用户数据
    request['rawData'] = params['rawData'];
    // 签名信息
    request['signature'] = params['signature'];
    this.getNotRepeatService('/api/user/login', request, this.handleCommonError((result) => {
        if (result.error === 0) {
            // 标记用户已注册
            Service.USER_IS_REGISTER = true;
            // 重置token信息
            Service.TOKEN = null;
            if (callback) callback(result);
        }
    }));
};

/**
 * 获取token
 * @param callBack
 * @returns {*}
 */
Service.getToken = function (callBack) {
    if (Service.TOKEN) {
        // 已获取token直接调用返回
        return callBack(Service.TOKEN);
    } else {
        // 内存没有token,则将回调方法记录到数组
        Service.WAIT_TOKEN_CALLBACK_LIST = Service.WAIT_TOKEN_CALLBACK_LIST || [];
        Service.WAIT_TOKEN_CALLBACK_LIST.push(callBack);
        // token正在加载,则暂不向下执行
        if (Service.isLoadingToken === true) {
            return;
        }
        // 正在加载token
        Service.isLoadingToken = true;
        Service.login(() => {
            // 遍历执行等待获取token的回调方法
            for (let i = 0; i < Service.WAIT_TOKEN_CALLBACK_LIST.length; i++) {
                Service.WAIT_TOKEN_CALLBACK_LIST[i](Service.TOKEN);
            }
            // 清空获取token等待回调方法
            Service.WAIT_TOKEN_CALLBACK_LIST = [];
        });
    }
};

/**
 * 文件上传(临时)
 * @param file 文件流
 * @param callback 回调方法
 * @param isShowLoading 是否显示加载弹窗
 */
Service.upload = function (file, callback, isShowLoading = true) {
    Service.getToken((token) => {
        if (isShowLoading === true) {
            WeChat.wx['showLoading'] && WeChat.wx['showLoading']({title: '加载中...'})
        }
        WeChat.wx['uploadFile']({
            url: Config.getApiPath() + '/api/upload.json',
            filePath: file,
            name: 'file',
            formData: {token: token},
            success: (result) => {
                console.log(result);
                if (result['statusCode'] !== 200) {
                    this.showErrorMsg('上传失败: ' + result['statusCode']);
                    callback();
                    return null
                }
                result = JSON.parse(result['data']);
                if (!result || result.code !== 1000) {
                    this.showErrorMsg(result.message);
                    callback();
                    return null
                }
                callback(result);
            },
            complete: () => {
                if (isShowLoading === true) {
                    WeChat.wx['hideLoading'] && WeChat.wx['hideLoading']();
                }
            }
        });
    });
};

/**
 * 上传文件到OSS
 * @param files 文件路径
 * @param options 上传选项
 */
Service.uploadOSS = function (files, options = {}) {
    if (files.length < 2) {
        let file = files[0];
        let matches = file.match(new RegExp('\\.[^\\.]+$'));
        if (!matches) {
            options['complete'] && options['complete'](false);
            this.showSimpleMsg('文件格式异常');
            return;
        }
        // 文件格式
        let extension = matches[0];
        this.uploadSingleOSS(file, extension, options);
    } else {
        let extensions = [];
        for (let i = 0; i < files.length; i++) {
            let matches = files[i].match(new RegExp('\\.[^\\.]+$'));
            if (!matches) {
                options['complete'] && options['complete'](false);
                this.showSimpleMsg('文件格式异常');
                return;
            }
            extensions.push(matches[0]);
        }
        this.uploadMultipleOSS(files, extensions, options);
    }
};

/**
 * 上传单个文件到OSS
 * @param file 文件路径
 * @param extension 文件扩展名
 * @param options 上传选项
 */
Service.uploadSingleOSS = function (file, extension, options = {}) {
    Service.getToken((token) => {
        this.getService('/mem/oss/sign.json', {token: token}, this.handleCommonError((result) => {
            if (result) {
                let {data} = result;
                // 文件名
                let fileName = data['rname'] + extension;

                let pages = WeChat.getCurrentPages();
                // 当前页面实例
                let page = pages[pages.length - 1];
                // 进度实例
                let progress = null;
                // 打开进度显示
                if (options['isShowProgress']) {
                    progress = page.getProgressInstance();
                    WeChat.wx['showLoading'] && WeChat.wx['showLoading']({});
                }
                let uploadTask = WeChat.wx['uploadFile']({
                    url: data['host'].replace('http://', 'https://'),
                    filePath: file,
                    name: 'file',
                    formData: {
                        name: `${fileName}`,
                        key: `${data['dir']}/${fileName}`,
                        policy: data['policy'],
                        OSSAccessKeyId: data['accessid'],
                        success_action_status: 200,
                        signature: data['signature']
                    },
                    success: ({statusCode}) => {
                        options['complete'] && options['complete'](statusCode === 200 ? {name: fileName} : false);
                    },
                    fail: () => {
                        this.showSimpleMsg('上传失败');
                        options['complete'] && options['complete'](false);
                    }, complete: () => {
                        // 关闭进度显示
                        if (options['isShowProgress']) {
                            progress.close();
                        } else {
                            WeChat.wx['hideLoading'] && WeChat.wx['hideLoading']({});
                        }
                    }
                });

                uploadTask['onProgressUpdate']((result) => {
                    // 更新进度显示
                    if (options['isShowProgress']) {
                        progress.set(result['progress']);
                    }
                    options['update'] && options['update'](result);
                });
            } else {
                options['complete'] && options['complete'](false);
            }
        }));
    });
};

/**
 * 上传多个文件到OSS
 * @param files 文件路径
 * @param extensions 文件扩展名
 * @param options 上传选项
 */
Service.uploadMultipleOSS = function (files, extensions, options = {}) {
    files = [].concat(files);
    extensions = [].concat(extensions);
    // 已上传文件名列表
    let fileNames = [];
    // 文件总数
    let total = files.length;
    // 当前已上传文件数
    let size = 0;

    let pages = WeChat.getCurrentPages();
    // 当前页面实例
    let page = pages[pages.length - 1];
    // 进度实例
    let progress = null;
    // 打开进度显示
    if (options['isShowProgress']) {
        progress = page.getProgressInstance();
    }
    // 递归单个上传文件
    uploadSingle();


    // 递归单个上传文件
    function uploadSingle() {
        let extension = extensions.shift();
        let file = files.shift();

        Service.getToken((token) => {
            Service.getService('/mem/oss/sign.json', {token: token}, Service.handleCommonError((result) => {
                if (result) {
                    let {data} = result;
                    // 文件名
                    let fileName = `${data['rname']}${extension}`;

                    let uploadTask = WeChat.wx['uploadFile']({
                        url: data['host'].replace('http://', 'https://'),
                        filePath: file,
                        name: 'file',
                        formData: {
                            name: `${fileName}`,
                            key: `${data['dir']}/${fileName}`,
                            policy: data['policy'],
                            OSSAccessKeyId: data['accessid'],
                            success_action_status: 200,
                            signature: data['signature']
                        },
                        success: ({statusCode}) => {
                            size++;
                            fileNames.push(fileName);
                            // 更新进度显示
                            if (options['isShowProgress']) {
                                progress.set(Math.ceil(size / total * 100));
                            }
                            options['update'] && options['update']({
                                totalFileCount: total,
                                progress: Math.ceil(size / total * 100),
                                currentFileCount: size
                            });
                            if (size >= total) {
                                // 关闭进度显示
                                if (options['isShowProgress']) {
                                    setTimeout(() => {
                                        progress.close();
                                        options['complete'] && options['complete'](statusCode === 200 ? {names: fileNames} : false);
                                    }, 400);
                                }
                            } else {
                                uploadSingle();
                            }
                        },
                        fail: () => {
                            Service.showSimpleMsg('上传失败');
                            options['complete'] && options['complete'](false);
                            // 关闭进度显示
                            if (options['isShowProgress']) {
                                progress.close();
                            }
                        }
                    });
                } else {
                    options['complete'] && options['complete'](false);
                }
            }), 'POST', size === 0);
        });
    }
};

// 对比两个数据对象
Service.contrastData = function (data1, data2) {
    data1 = data1 || {};
    data2 = data2 || {};
    var arr = [];
    for (var key in data1) {
        if (data1.hasOwnProperty(key)) {
            if (data2[key] === undefined) {
                console.log('=================');
                console.log(key);
                console.log(data1[key]);
            } else {
                // arr.push(key + '[' + data1[key] + ',' + data2[key] + ']');
            }
        }
    }
    console.log(arr.join('\n'));
};

/**
 * 获取结果集
 * @param data
 * @param code
 * @param msg
 * @returns {*}
 */
Service.getCloudResult = function (data, code, msg) {
    data = data || {};
    return {
        cookies: [{"name": "PHPSESSID", "value": "92960a56c6ba33e781b9a2846e58ebaa", "path": "/"}],
        data: {
            data: data,
            errno: code || 0,
            message: msg || '返回消息'
        },
        errMsg: 'request:ok',
        header: {
            "Server": "NWSs",
            "Date": "Thu, 10 Jan 2019 06:17:47 GMT",
            "Content-Type": "text/html; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "Connection": "keep-alive",
            "Cache-Control": "must-revalidate, no-store",
            "Content-Encoding": "gzip",
            "X-NWS-UUID-VERIFY": "a94131f530e70d7a2b495ee0bf1fc68f",
            "Vary": "Accept-Encoding",
            "X-Powered-By": "PHP/7.2.4",
            "Set-Cookie": "PHPSESSID=92960a56c6ba33e781b9a2846e58ebaa; path=/",
            "Pragma": "no-cache",
            "X-NWS-LOG-UUID": "a8d99e33-1269-40df-9556-ddf0a1e3d30d",
            "X-Daa-Tunnel": "hop_count=2"
        },
        statusCode: 200
    };
};

// 是否初始化云开发环境
Service.IS_INIT_CLOUD_ENV = false;

// 获取云开发服务
Service.getCloudService = function (apiCode, params) {
    return new Promise((resolve) => {
        if (Service.IS_INIT_CLOUD_ENV === false) {
            Service.IS_INIT_CLOUD_ENV = true;
            if (!!Config.CLOUD_ENV_ID) {
                WeChat.wx['cloud']['init']({env: Config.CLOUD_ENV_ID});
            } else {
                WeChat.wx['cloud']['init']();
            }
        }
        params = params || {};
        params['apiCode'] = apiCode;
        // 调用云函数
        WeChat.wx['cloud']['callFunction']({
            name: 'api',
            data: {
                params: params
            },
            'success': (_result) => {
                let result = _result.result || '{}';
                result = JSON.parse(result);
                resolve(result);
            },
            'fail': (err) => {
                resolve(null);
                console.log(err);
            }
        });
    });
};

export default Service;
