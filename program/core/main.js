/**
 * 描述: 小程序工具包
 * 版权: Copyright (c) 2016
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/3/23 15:09
 */
// 微信小程序注入的全局对象
export const regeneratorRuntime = require('./plugins/runtime');
// 微信小程序注入的全局对象
export const WeChat = require('./lib/WeChat')['default'];
// 基础页面类
export const BasePage = require('./lib/BasePage')['default'];
// 基础组件类
export const BaseComponent = require('./lib/BaseComponent')['default'];
// 通用工具
export const Utils = require('./lib/Utils')['default'];
// 接口服务
export const Service = require('./lib/Service')['default'];
// 全局配置
export const Config = require('./lib/Config')['default'];
// 全局配置
export const StringUtils = require('./lib/StringUtils')['default'];
// 富文本工具
export const RichTextUtils = require('./lib/RichTextUtils')['default'];
// 聊天室
export const WebIM= require('./lib/WebIM')['default'];
// 自定义错误
export const BaseError= require('./lib/BaseError')['default'];
