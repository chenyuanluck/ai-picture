/**
 * 描述: 自定义错误
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2018/1/22 09:45
 */
import StringUtils from './StringUtils';
import WeChat from './WeChat';
export  default  class BaseError extends Error {
    constructor(err, desc = '') {
        err.name = `自定义错误[${StringUtils(new Date()).getFormatDate()}][${err.name}]==========v2.0.3`;
        let message = err.message;
        err.message = `\n系统信息: ${JSON.stringify(WeChat.wx['getSystemInfoSync']())}`;
        if (StringUtils(desc).isNotEmpty()) {
            err.message += `\n错误描述: ${desc}`;
        }
        err.message += `\n错误详情: ${message}`;
        super(err);
    }
}