/**
 * 描述: 富文本工具
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/5/12 16:04
 */
const RichTextUtils = {};

RichTextUtils.parse = function (content) {
    if ((typeof content) === 'object') {
        content = JSON.stringify(content)
    }
    content = content.replace(new RegExp('"alt":\\[[^\\]]+\\],'), '');
    let reg0 = /{"node":"text","text":\[(\d)\],"type":"text"}/;
    let rep0 = '{"node":"text","text":[0$1],"type":"text"}';
    content = content.replace(reg0, rep0);
    let reg1 = /{"node":"text","text":"\[(\d)\]","type":"text"}/;
    let rep1 = '{"node":"text","text":"[0$1]","type":"text"}';
    content = content.replace(reg1, rep1);
    let regexp = /{"node":"text","text":\[(\d+)\],"type":"text"}/g;
    let regexp1 = /{"node":"text","text":"\[(\d+)\]","type":"text"}/g;
    let rep = '{"type":"node","name":"img","attrs":{"src":"http://fwb.xiameikeji.com/emojis/$1.gif"}}';
    content = content.replace(regexp, rep);
    content = content.replace(regexp1, rep);
    return JSON.parse(content);
};

export default RichTextUtils
