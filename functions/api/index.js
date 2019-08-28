// 云函数入口文件
const cloud = require('wx-server-sdk');
const services = require('./services');
cloud['init']();

// 云函数入口函数
exports.main = async (event, context) => {
    const {ENV} = cloud.getWXContext();
    // 更新默认配置，将默认访问环境设为当前云函数所在环境
    cloud.updateConfig({
        env: ENV
    });
    // 请求入参
    const params = event['params'] || {};
    if (services[params['apiCode']]) {
        try {
            return await services[params['apiCode']](event, context).init();
        } catch (e) {
            console.log(e);
            return JSON.stringify({
                code: -1009,
                msg: '系统异常~',
                data: e,
                e: e.toString(),
                time: (new Date()).valueOf()
            });
        }
    }
    return JSON.stringify({
        code: -1008,
        msg: '接口不存在~',
        data: {},
        time: (new Date()).valueOf()
    });
};
