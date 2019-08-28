/**
 * 描述: 常用工具
 * 版权: Copyright (c) 2016
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/3/24 15:55
 */
import Config from './Config';
const Utils = {};

/**
 * 通过Class类型创建一个对象(把所有继承来的属性方法设置到这个对象的普通属性中)
 * @param classObject 类
 * @returns {{}}
 */
Utils.newInstance = function (classObject) {
    let o = new classObject();
    let result = {};

    let array = [];

    (function f(o) {
        if (o.constructor.name === 'Object') {
            return;
        }
        let _o = {};
        for (let key of Object.getOwnPropertyNames(o)) {
            if (key !== 'constructor') _o[key] = o[key];
        }
        array.push(_o);
        f(Object.getPrototypeOf(o));
    })(o);
    for (let i = array.length - 1; i >= 0; i--) {
        for (let key of Object.keys(array[i])) {
            result[key] = array[i][key];
        }
    }
    if (classObject.onShareAppMessage) {
        result.onShareAppMessage = function (o) {
            if (o && o.length && o.length > 0) {
                o = o[0];
            }
            // 分享信息
            let info = classObject.onShareAppMessage.call(this, o);
            if (info.path.indexOf('?') === -1) {
                info.path = `${info.path}?openToken=${Config.CURRENT_USER_OPEN_TOKEN}`;
            } else if (info.path.indexOf('openToken=') === -1) {
                info.path = `${info.path}&openToken=${Config.CURRENT_USER_OPEN_TOKEN}`;
            }
            return info;
        }
    }
    return result;
};

export default Utils;