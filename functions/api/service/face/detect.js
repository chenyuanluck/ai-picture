/**
 * 描述: 人脸检测与分析
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
        if (params['imgUrl'].indexOf('cloud://') > -1) {
            params['imgUrl'] = await this.getFilePathById(params['imgUrl']);
        }
        params['imgUrl'] = params['imgUrl'].replace('https://', 'http://');
        // base64图片
        const imgBase64 = await this.getBase64ImgByUrl(params['imgUrl']);
        let result = await this.postTcAi(`https://api.ai.qq.com/fcgi-bin/face/face_detectface`, {
            image: imgBase64,
            mode: '1'
        });
        if (result.code === 0) {
            return this.getResult(result.data);
        } else {
            return this.getResult({}, result.code, result.msg);
        }
    }
}

module.exports = (...args) => new MainService(...args);
