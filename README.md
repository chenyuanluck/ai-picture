# 小程序云开发入门实战-美颜相册
我们用传统模式开发一个互联网应用，需要掌握多个技术栈并且需要部署各种服务器相关软件，相对比较麻烦。本项目将向大家介绍如何用小程序&云开发开发一个完整的项目。以及云开发相关api的简单使用。

## <a name="前置资料">前置资料</a>
* [小程序简介](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/#%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%AE%80%E4%BB%8B)

* [小程序注册](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/getstart.html#%E7%94%B3%E8%AF%B7%E5%B8%90%E5%8F%B7)

* [小程序开发工具](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/getstart.html#%E5%AE%89%E8%A3%85%E5%BC%80%E5%8F%91%E5%B7%A5%E5%85%B7)

* [小程序云开发简介](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

* [腾讯AI人脸识别地址](https://ai.qq.com/product/face.shtml#detect)

## <a name="项目简介">项目简介</a>
使用小程序&云开发实现一个美颜相册小程序。数据存储、第三方api调用用云开发技术栈实现。

## <a name="运行本项目">运行本项目</a>
1. 下载项目文件，解压到本地目录

2. 将本地目录引入到小程序开发者工具
![avatar](https://wx.wegouer.com/static/github/ai-picture/import/step1.png)

3. 修改小程序appId
![avatar](https://wx.wegouer.com/static/github/ai-picture/import/step2.png)

4. 将/program/config.js里的'CLOUD_ENV_ID'配置项改为自己的小程序云环境ID

5. 部署云函数:api
![avatar](https://wx.wegouer.com/static/github/ai-picture/import/step3.png)

6. 将云函数api的超时时间改为不小于10秒(因为第三方AI接口的调用比较耗时)
![avatar](https://wx.wegouer.com/static/github/ai-picture/import/step4.png)

7. 在开发者工具->云开发->数据库 中新建名为'pictures'的集合

8. 项目引入完成，开始预览项目吧~

## <a name="目录结构">目录结构</a>
```$xslt
|README.md                     项目说明文件
|project.config.json           小程序配置
|program/                      小程序代码目录
|  |core/                      项目工具包目录
|  |pages/                     小程序界面目录
|  |  |index.js                首页
|  |  |decoration/             人脸变妆界面
|  |  |pictures/               相册界面
|  |  |upload/                 图片止传界面
|  |resources/                 静态资源目录
|  |services/                  数据服务文件目录
|  |  |main.js                 服务文件配置列表
|  |  |CloudService.js         云开发数据服务
|  |app.js                     小程序内置入口
|  |app.json                   小程序内置全局配置
|  |app.wxss                   小程序内置全局样式
|  |config.js                  自定义全局配置
|functions/                    云函数目录
|  |api/                       云函数:api
|  |  |service/                数据服务目录
|  |  |  |face/                人脸识别模块
|  |  |  |  |decoration.js     人脸变妆接口
|  |  |  |  |detect.js         人脸检测与分析接口
|  |  |  |picture/             相册模块
|  |  |  |  |page.js           分页获取相册列表接口
|  |  |  |  |save.js           保存图片到相册接口
|  |  |index.js                云函数入口
|  |  |package.json            node包配置
|  |  |services.js             服务映射
|  |  |utils.js                简单工具文件
|  |  |config.js               云函数全局配置文件
```

## <a name="项目架构">项目架构</a>

![avatar](https://wx.wegouer.com/static/github/ai-picture/framework.jpg)

## <a name="腾讯AI开放平台注册">腾讯AI开放平台注册</a>
1. 打开[腾讯AI开放平台](https://ai.qq.com/product/face.shtml#detect)，点击控制台
![avatar](https://wx.wegouer.com/static/github/ai-picture/ai/step1.png)

2. 扫描二维码授权登录
![avatar](https://wx.wegouer.com/static/github/ai-picture/ai/step2.png)

3. 完善信息完成注册
![avatar](https://wx.wegouer.com/static/github/ai-picture/ai/step3.png)

4. 进入[我的应用](https://ai.qq.com/console/home)界面，点击新建应用
![avatar](https://wx.wegouer.com/static/github/ai-picture/ai/step4.png)

5. 填写应用信息，完成应用创建
![avatar](https://wx.wegouer.com/static/github/ai-picture/ai/step5.png)

6. 进入[人脸变妆](https://ai.qq.com/console/capability/detail/26)能力界面，点击接入能力按钮，选择上一步创建的应用，接入对应能力。
![avatar](https://wx.wegouer.com/static/github/ai-picture/ai/step6.png)

7. 点击'应用管理'，进入对应的应用，获取AI能力接入需要用到的appId、appKey
![avatar](https://wx.wegouer.com/static/github/ai-picture/ai/step7.png)

8. 收功






