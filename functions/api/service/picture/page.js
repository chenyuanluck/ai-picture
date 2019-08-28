/**
 * 描述: 获取我的相片列表
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
        // 当前页码
        const page = parseInt(params['page']) || 1;
        // 每页记录数
        const pageSize = parseInt(params['pageSize']) || 20;

        const {OPENID} = this.getCloud().getWXContext();
        // 图片集合
        let collection = this.getCollection(`pictures`);
        // 获取数据列表
        let result = await collection.where({
            openId: OPENID
        })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .orderBy('createTime', 'desc').get();
        const ids = [];
        const list = result.data || [];
        if (list.length === 0) {
            return this.getResult({
                list: [],
                count: 0
            });
        }
        for (let i = 0; i < list.length; i++) {
            ids.push(list[i]['imageId']);
        }
        // 图片地址列表
        const imgList = await this.getFilePathsByIds(ids);
        // 返回数据列表
        const resultList = [];
        for (let i = 0; i < list.length; i++) {
            resultList.push({
                id: list[i]['_id'],
                createTime: list[i]['createTime'],
                imageId: list[i]['imageId'],
                imgUrl: imgList[i]
            });
            resultList[i]['imgUrl'] = imgList[i];
        }
        const {total} = await collection.count();
        return this.getResult({
            list: resultList,
            count: total
        });
    }
}

module.exports = (...args) => new MainService(...args);
