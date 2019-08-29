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
        // 获取请求参数
        const params = this.getRequestParams();
        let imgUrl = params['imgUrl'] || null;
        if (this.isEmpty(imgUrl)) {
            return this.getResult({}, -10001, `[图片地址]不能为空~`);
        }
        // 设置默认'变妆编码'
        if (this.isEmpty(params['decoration'])) {
            params['decoration'] = 1;
        }
        // 如果远程图片地址的协议为云开发图片ID格式，则通过图片ID获取真实地址
        if (imgUrl.indexOf('cloud://') > -1) {
            imgUrl = await this.getFilePathById(imgUrl);
        }
        // 由于第三方服务不支持https协议的图片，对远程图片路径做一次转换
        imgUrl = imgUrl.replace('https://', 'http://');
        // 从链接提取文件扩展名
        const extension = imgUrl.substring(imgUrl.lastIndexOf('.'), imgUrl.length);
        // base64图片
        const imgBase64 = await this.getBase64ImgByUrl(imgUrl);
        // 调用'人脸变妆'服务
        let result = await this.postTcAi(`https://api.ai.qq.com/fcgi-bin/ptu/ptu_facedecoration`, {
            // 图片base64文本
            image: imgBase64,
            // 变妆编码
            decoration: params['decoration']
        });
        if (result.code === 0) {
            const filePath = `pictures/${(new Date()).valueOf()}${Math.floor(Math.random() * 100)}${extension}`;
            // 文件上传结果
            const file = await this.cloudUpload(filePath, new Buffer(result.data.image, 'base64'));
            // 文件外网地址
            file.imgUrl = await this.getFilePathById(file.fileID);
            return this.getResult(file);
        } else {
            return this.getResult({}, result.code, result.msg);
        }
    }
}

module.exports = (...args) => new MainService(...args);
