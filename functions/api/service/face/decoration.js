/**
 * 描述: 人脸变妆
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
        if (this.isEmpty(params['imgUrl'])) {
            return this.getResult({}, -10001, `[图片地址]不能为空~`);
        }
        if (this.isEmpty(params['decoration'])) {
            params['decoration'] = 1;
        }
        if (params['imgUrl'].indexOf('cloud://') > -1) {
            params['imgUrl'] = await this.getFilePathById(params['imgUrl']);
        }
        params['imgUrl'] = params['imgUrl'].replace('https://', 'http://');
        // base64图片
        const imgBase64 = await this.getBase64ImgByUrl(params['imgUrl']);

        let result = await this.postTcAi(`https://api.ai.qq.com/fcgi-bin/ptu/ptu_facedecoration`, {
            image: imgBase64,
            decoration: params['decoration']
        });
        if (result.code === 0) {
            const up = await this.cloudUpload(`demo/${(new Date()).valueOf()}.png`, new Buffer(result.data.image, 'base64'));
            //
            up.imgUrl = await this.getFilePathById(up.fileID);
            return this.getResult(up);
        } else {
            return this.getResult({}, result.code, result.msg);
        }
    }
}

module.exports = (...args) => new MainService(...args);
