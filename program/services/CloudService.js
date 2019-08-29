/**
 * 描述: 云开发服务
 * 版权: Copyright (c) 2018
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2018/9/6 14:03
 */
import {Service, Config, regeneratorRuntime} from '../core/main';
// 请求入参对象
const RequestParams = Service.RequestParams;

// 用户信息
Service.USER_INFO = null;
// 是否初始化云开发环境
Service.IS_INIT_CLOUD_ENV = false;

// 获取云开发工具对象
Service.getCloud = function () {
    if (Service.IS_INIT_CLOUD_ENV === false) {
        Service.IS_INIT_CLOUD_ENV = true;
        wx['cloud']['init']({env: Config.CLOUD_ENV_ID});
    }
    return wx['cloud'];
};

// 获取数据库操作工具
Service.getDatabase = function () {
    return this.getCloud().database();
};

// 获取指定集合操作工具
Service.getCollection = function (collection) {
    return this.getDatabase().collection(collection);
};

// 上传文件
Service.uploadFile = async function (cloudPath, filePath) {
    return new Promise((resolve) => {
        this.getCloud().uploadFile({
            cloudPath,
            filePath,
            success: res => {
                resolve(res);
            },
            fail: () => {
                resolve(false);
            }
        });
    });
};

/**
 * 执行云函数
 * @param name 云函数名
 * @param data 参数
 * @returns {Promise<*>}
 */
Service.callFunction = async function (name, data) {
    return await this.getCloud().callFunction({name: name, data: data || {}});
};

/**
 * 上传图片
 * @param filePath 本地缓存文件路径
 * @param cloudDir 上传目录
 * @returns {Promise<boolean|Promise<any>>}
 */
Service.uploadImage = async function (filePath, cloudDir) {
    cloudDir = cloudDir || 'source';
    // 从链接提取文件扩展名
    const extension = filePath.substring(filePath.lastIndexOf('.'), filePath.length);
    // 生成图片路径
    const cloudPath = `${cloudDir}/${(new Date()).valueOf()}${Math.floor(Math.random() * 100)}${extension}`;
    // 文件上传结果
    const result = await this.uploadFile(cloudPath, filePath);
    if (!result) {
        return false;
    }
    return result;
};

// 保存照片到相册
Service.pictureSave = async function (params) {
    // 请求入参
    let request = new RequestParams();
    // 图片云存储ID
    request.put('imageId', params['imageId']);
    return await this.getCloudService(`picture/save`, request);
};

// 分页获取我的相片列表
Service.picturePage = async function (params) {
    // 请求入参
    let request = new RequestParams();
    // 当前页码
    request.put('page', params['page'], 1);
    // 每页记录数
    request.put('pageSize', params['pageSize'], 1000);
    return await this.getCloudService(`picture/page`, request);
};

// 人脸检测与分析
Service.faceDetect = async function (params) {
    // 请求入参
    let request = new RequestParams();
    // 图片地址
    request.put('imgUrl', params['imgUrl']);
    return await this.getCloudService(`face/detect`, request);
};

// 人脸变妆
Service.faceDecoration = async function (params) {
    // 请求入参
    let request = new RequestParams();
    // 图片地址
    request.put('imgUrl', params['imgUrl']);
    // 1	埃及妆            	2	巴西土著妆
    // 3	灰姑娘妆	          	4	恶魔妆
    // 5	武媚娘妆	          	6	星光薰衣草
    // 7	花千骨	            8	僵尸妆
    // 9	爱国妆	            10	小胡子妆
    // 11	美羊羊妆	          	12	火影鸣人妆
    // 13	刀马旦妆	          	14	泡泡妆
    // 15	桃花妆	            16	女皇妆
    // 17	权志龙	            18	撩妹妆
    // 19	印第安妆	          	20	印度妆
    // 21	萌兔妆	            22	大圣妆
    // 变妆编码
    request.put('decoration', params['decoration']);
    return await this.getCloudService(`face/decoration`, request);
};

// 当前编辑的图片信息
Service.CURRENT_EDIT_IMG_INFO = {
    fileID: "cloud://t333344.7433-t333344-1258439748/1566800453468-6585.jpeg",
    temUrl: "http://tmp/wxf15fad5b7d3f3b20.o6zAJsyvfC0vTn-a_DmTQDf7T6iY.tiOW2Ow0Cs3S5ac251f0f183c588806a096904c825d7.jpeg"
};

// 设置当前编辑的图片信息
Service.setCurrentImgInfo = function (info = {}) {
    Service.CURRENT_EDIT_IMG_INFO = info;
};

// 获取当前编辑的图片信息
Service.getCurrentImgInfo = function (info = {}) {
    return Service.CURRENT_EDIT_IMG_INFO;
};
