/**
 * 描述: 全局配置工具
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/4/17 14:05
 */
import Config from '../../config';

// 分享参数中的分销token
Config.SHARE_PARAMS_OPEN_TOKEN = '';
// 当前用户的分销token
Config.CURRENT_USER_OPEN_TOKEN = '';

// 获取接口地址
Config.getApiPath = function () {
    if (this.API_TYPE === 'prod') {
        return this.API_PATH;
    }
    return this.API_PATH_DEV;
};

// 获取小程序实例ID
Config.getMiniProgramId = function () {
    return this.MINI_PROGRAM_ID;
};

export default Config;