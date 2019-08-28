/**
 * 描述: 服务配置
 * 版权: Copyright (c) 2018
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2019/1/10 17:37
 */
const services = {
    // 人脸检测与分析
    'face/detect': require('./service/face/detect'),
    // 人脸变妆
    'face/decoration': require('./service/face/decoration'),

    // 保存图片到相册
    'picture/save': require('./service/picture/save'),
    // 分页获取我的相片列表
    'picture/page': require('./service/picture/page')
};
module.exports = services;
