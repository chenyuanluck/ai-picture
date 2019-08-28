/**
 * 描述: 分页器
 * 版权: Copyright (c) 2016
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/3/23 15:35
 */
import WeChat from './WeChat'

export default class Pagination {
    constructor(instance, name) {
        // 页面实例(小程序Page对象)
        this.instance = instance;
        this.name = name;
        this.options = Pagination.getDefaultOptions();
        // 初始化默认数据
        this.initDefaultData();
    }

    /**
     * 获取默认分页选项
     * @returns {{notDataTexts: [string]}}
     */
    static getDefaultOptions() {
        return {
            notDataTexts: ['暂无数据'],
            notDataBoxHeight: 900
        };
    }

    /**
     * 初始化默认数据
     */
    initDefaultData() {
        this.instance.data[this.name] = this.data = {
            // 是否加载所有数据
            isEnd: false,
            // 列表数据
            list: [],
            // 是否加载完成
            isLoad: false,
            // 当前页码
            page: 0,
            // 是否没有数据
            hasNotData: false,
            // 是否正在加载中
            isLoading: false,
            // 设置无数据时显示内容
            notDataTexts: this.options.notDataTexts || [],
            // 设置无数据时显示内容
            notDataBoxHeight: this.options.notDataBoxHeight || 900
        };
    }

    /**
     * 设置数据
     * @param data
     */
    setData(data) {
        this.data.list = [].concat(this.data.list);
        Object.assign(this.data, data);
        let newDate = {};
        newDate[this.name] = this.data;
        this.instance.setData(newDate);
    }

    next() {
        if (this.data.isLoading === true) return;
        this.data.isLoading = true;
        if (this.data.isEnd === true) return;
        let index = this.data.page + 1;
        this.func(index, (result) => {
            if (result && (result.code === 1000)) {
                let {data} = result;
                let list = data['list'];

                list = this.data.list.concat(list);

                this.setData({
                    // 列表数据
                    list: list,
                    //  只获取第一组数据
                    isEnd: list.length >= data['total'],
                    // 是否加载完成
                    isLoad: true,
                    // 当前分页数
                    page: index,
                    hasNotData: list.length === 0,
                    isLoading: false
                });
                WeChat.wx['stopPullDownRefresh']();
            }
        });
    }

    /**
     * 第一次加载数据或刷新数据列表用
     */
    reload() {
        this.initDefaultData();
        // 加载数据
        this.next()
    }

    /**
     * 初始化回调方法
     * @param options 分页器设置
     * @param func
     */
    init(options, func) {
        if (!options) {
            options = Pagination.getDefaultOptions();
        }
        this.options = options;
        this.func = func;
    }
}