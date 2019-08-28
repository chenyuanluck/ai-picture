/**
 * 描述: 工具类
 * 版权: Copyright (c) 2018
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2019/1/7 11:46
 */
const cloud = require('wx-server-sdk');
const http = require('http');
// const querystring = require('querystring');
// cloud['init']();
const request = require('request');
const crypto = require('crypto');

class BaseService {
    constructor(event, context) {
        // 请求入参
        const params = event['params'] || {};
        this.apiCode = params['apiCode'];
        delete params['apiCode'];
        this.requestParams = params;
        // 请求用户信息
        this.requestUserInfo = event['userInfo'] || {};
        // 请求正文
        this.requestContext = context || {};
        this.result = {
            code: 0,
            msg: '请求成功~',
            data: {},
            time: (new Date()).valueOf()
        };
        this._ = this.getDatabase()['.command'];
    }

    // 获取请求参数
    getRequestParams() {
        return this.requestParams;
    }

    // 获取请求用户信息
    getRequestUserInfo() {
        return this.requestUserInfo;
    }

    // 获取请求正文
    getRequestContext() {
        return this.requestContext;
    }

    /**
     * 设置返回结果集
     * @param errorCode
     * @param errorMsg
     * @param result
     */
    getResult(result = {}, errorCode = 0, errorMsg = `请求成功~`) {
        this.setErrorCode(errorCode);
        this.setErrorMsg(errorMsg);
        this.setResultData(result);
        this.result.time = (new Date()).valueOf();
        // 接口号
        // this.result.apiCode = this.getRequestParams();
        // this.result.apiCode = this.apiCode;
        return JSON.stringify(this.result);
    }

    setErrorCode(code) {
        this.result.code = code;
    }

    setErrorMsg(msg) {
        this.result.msg = msg;
    }

    setResultData(data) {
        this.result.data = data;
    }

    /**
     * 获取腾讯云开发组件
     */
    getCloud() {
        return cloud;
    }

    /**
     * 获取数据库
     */
    getDatabase() {
        return this.getCloud()['database']();
    }

    // 上传云存储
    async cloudUpload(name, file) {
        return await cloud.uploadFile({
            cloudPath: name,
            fileContent: file,
        })
    }

    /**
     * 获取指定集合
     */
    getCollection(colName) {
        return this.getDatabase()['collection'](colName);
    }

    // 非空检验
    isEmpty(str) {
        return str === '' || str === null || str === undefined;
    }

    // 非空检验
    isNotEmpty(str) {
        return !this.isEmpty(str);
    }

    getUploadFile() {
        return this.request.files.file || null;
    }

    /**
     * 获取资源 ID 获取图片地址
     * @param id
     * @returns {Promise.<*|string>}
     */
    async getFilePathById(id = '') {
        const paths = await this.getFilePathsByIds([id]);
        return paths[0];
    }

    async getFilePathsByIds(ids = []) {
        const {fileList} = await cloud['getTempFileURL']({fileList: ids});
        const paths = fileList || [];
        const arr = [];
        for (let i = 0; i < paths.length; i++) {
            arr.push(paths[i]['tempFileURL'] || '');
        }
        return arr;
    }

    /**
     * 获取集合里的第一条数据
     * @param result
     * @returns {*}
     */
    getFirstDataByCollection(result) {
        let {data} = result;
        if (!data) {
            return {};
        }
        if (data.length <= 0) {
            return {};
        }
        return data[0] || {};
    }

    /**
     * 获取集合里的数据列表
     * @param result
     * @returns {*}
     */
    getListByCollection(result) {
        let {data} = result;
        return data || [];
    }

    /**
     * 获取集合内指定 ID 的数据
     * @param name 集合名
     * @param id 记录 ID
     * @returns {Promise.<{}>}
     */
    async getDataFromCollectionById(name, id) {
        // 指定的内容记录
        const record = this.getCollection(name)['doc'](id);
        const {data} = await record.get();
        return data || {};
    }

    /**
     * 获取集合里的第一条数据
     * @param name 集合名
     * @returns {Promise.<{}>}
     */
    async getFirstDataFromCollection(name) {
        const result = await this.getCollection(name).get();
        let {data} = result;
        if (!data) {
            return {};
        }
        if (data.length <= 0) {
            return {};
        }
        return data[0] || {};
    }

    /**
     * 初始化一个参数实例
     * @param params
     * @returns {RequestParams}
     */
    initParamsInstance(params = {}) {
        return new RequestParams(params);
    }

    // 对比两个值是否相同
    equals(str1, str2) {
        return `${str1}` === `${str2}`;
    }

    /**
     *  从时间戳中获取时间信息
     * @param timestamp
     * @returns {{y: string, m: string, d: string, h: string, minute: string, second: string}}
     */
    getTimeInfoByTimestamp(timestamp) {
        timestamp = parseInt(timestamp);
        const date = new Date(timestamp);
        const y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let minute = date.getMinutes();
        let second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return {y: `${y}`, m: `${m}`, d: `${d}`, h: `${h}`, minute: `${minute}`, second: `${second}`};
    }

    async log(msg) {
        try {
            let {y, m, d, h, minute, second} = this.getTimeInfoByTimestamp((new Date()).valueOf());
            let time = `${y}-${m}-${d} ${h}:${minute}:${second}`;
            await this.getCollection(`system_log`).add({data: {message: msg, time: time, level: 'info'}});
        } catch (e) {

        }
    }

    post(url = '', params = {}, cbType = 'text') {
        return new Promise((resolve) => {
            request['post']({url: url, form: params}, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    if (cbType === 'json') {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            console.log(e);
                            resolve(null);
                        }
                    } else {
                        resolve(body);
                    }
                } else {
                    console.log(error);
                    resolve(null);
                }
            });
        });
    }

    getBase64ImgByUrl(url) {
        return new Promise((resolve) => {
            http.get(url, function (res) {
                var chunks = []; //用于保存网络请求不断加载传输的缓冲数据
                var size = 0;　　 //保存缓冲数据的总长度

                res.on('data', function (chunk) {
                    chunks.push(chunk);
                    size += chunk.length;　　//累加缓冲数据的长度
                });
                res.on('end', function (err) {
                    var data = Buffer.concat(chunks, size);
                    var base64Img = data.toString('base64');　　//将Buffer对象转换为字符串并以base64编码格式显示　　　
                    resolve(base64Img);
                });

            });
        });
    }

    // ============================= 腾讯AI工具
    async postTcAi(url, params = {}) {
        const timestamp = Math.floor((new Date()).valueOf() / 1000);
        // 人脸识别请求参数
        let _params = Object.assign({
            app_id: 2121104975,
            nonce_str: this.md5(timestamp),
            time_stamp: timestamp
        }, params);
        _params = this.sign(_params);
        let result = await this.post(url, _params, 'json');
        let _result = {};
        _result.code = result['ret'];
        _result.data = result['data'];
        _result.msg = result['msg'];
        return _result;
    }

    sign(_params = {}) {
        // 参数按key排序
        const params = this.sortObjByKey(_params);
        let arr = [];
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                arr.push(`${key}=${encodeURIComponent(params[key])}`);
            }
        }
        arr.push(`app_key=BaYl1JQKBJB1QdXr`);
        let str = arr.join('&');
        params['sign'] = this.md5(str).toUpperCase();
        return params;
    }

    md5(str) {
        const hash = crypto.createHash('md5');
        hash.update(str + '');
        return hash.digest('hex');
    }

    // 通过key排序对象
    sortObjByKey(o = {}) {
        let n = {};
        let keys = [];
        for (let key in o) {
            if (o.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys.sort();
        for (let i = 0; i < keys.length; i++) {
            n[keys[i]] = o[keys[i]];
        }
        return n;
    }

    // ============================= 腾讯AI工具
}

// 请求参数类
class RequestParams {
    constructor(params = {}) {
        // 参数校验是否通过
        // this.IS_PARAMS_CHECK_PASS = true;
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                this[key] = params[key];
            }
        }
    }

    /**
     * 设置参数
     * @param key 参数名
     * @param value 参数值
     * @param def 默认值
     * @returns {{checkEmpty: (function(*=): *)}}
     */
    put(key, value = '', def = null) {
        if (this.isEmpty(value)) {
            if (def !== null) {
                this[key] = def;
            }
        } else {
            this[key] = value;
        }
        return {
            checkEmpty: (name) => this.checkEmpty(name, key)
        }
    }

    // 检验空值
    checkEmpty(name, key) {
        if (this.isValEmpty(key) && this.IS_PARAMS_CHECK_PASS) {
            this.IS_PARAMS_CHECK_PASS = false;
            // Message({
            //     message: `[${name}]不能为空!`,
            //     type: 'error',
            //     duration: 3 * 1000
            // });
        }
    }

    isEmpty(str) {
        return str === null || str === '' || str === undefined;
    }

    isValEmpty(key) {
        const str = this[key];
        return this.isEmpty(str);
    }
}

const utils = {
    BaseService
};

module.exports = utils;
