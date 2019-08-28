/**
 * 描述: 保存图片到相册
 * 版权: Copyright (c) 2018
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2019/8/26 14:38
 */
const {BaseService} = require('../../utils');

class MainService extends BaseService {
    constructor(...args) {
        super(...args);
    }

    async init() {
        const params = this.getRequestParams();
        if (this.isEmpty(params['imageId'])) {
            return this.getResult({}, -10002, `[图片ID]不能为空~`);
        }
        const {OPENID} = this.getCloud().getWXContext();
        // 调用云数据库入参
        const requestParams = this.initParamsInstance();
        // 图片ID
        requestParams.put('openId', OPENID);
        requestParams.put('imageId', params['imageId']);
        requestParams.put('createTime', `${(new Date()).valueOf()}`);

        const result = await this.getCollection(`pictures`)['add']({data: requestParams});
        return this.getResult(result);
    }
}

module.exports = (...args) => new MainService(...args);
