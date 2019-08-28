/**
 * 描述: 字符串处理工具
 * 版权: Copyright (c) 2017
 * 公司: 深圳市网商天下科技开发有限公司
 * 作者: 陈元
 * 版本: 1.0.0
 * 创建时间: 2017/4/17 17:55
 */
class StringUtilsClass {
    constructor(str) {
        this.string = str;
    }

    /**
     * 校验字串是否为空
     * @returns {boolean}
     */
    isEmpty() {
        return this.string === null || this.string === undefined || (this.string + '').length === 0;
    }

    /**
     * 校验字串是否不为空
     * @returns {boolean}
     */
    isNotEmpty() {
        return !this.isEmpty();
    }

    /**
     * 格式化秒
     * @returns {string}
     */
    formatSeconds() {
        let s = parseInt(this.string);              // 秒数
        let hour = null;                            // 时
        let minute = null;                          // 分
        let seconds = s % 60 > 9 ? s % 60 : '0' + s % 60;   // 秒
        if (s >= 60) {
            let m = Math.floor(s / 60);
            minute = m % 60 > 9 ? m % 60 : '0' + m % 60;
        }
        if (s >= 3600) {
            hour = Math.floor(s / 3600);
        }

        if (s < 60) return '00:' + seconds;

        if (s < 3600) return minute + ':' + seconds;

        return hour + ':' + minute + ':' + seconds;
    };

    /**
     * 格式化秒
     * @returns {string}
     */
    formatSeconds1() {
        let s = parseInt(this.string);              // 秒
        let hour = null;                            // 时
        let minute = null;                          // 分
        let seconds = s % 60 > 9 ? s % 60 : '0' + s % 60;   // 秒
        if (s < 60) {
            return seconds + '秒';
        }
        let m = Math.floor(s / 60);
        minute = m % 60 > 9 ? m % 60 : '0' + m % 60;
        if (s >= 60 && s < 3600) {
            return minute + '分' + seconds + '秒';
        }
        if (s >= 3600) {
            hour = Math.floor(s / 3600);
            return hour + '时' + minute + '分';
        }
    };

    /**
     * 格式化秒
     * @returns {string}
     */
    formatSeconds5(defaultValue) {
        let s = parseInt(this.string);

        if (s < 60) {
            return '刚刚';
        }
        if (s < 3600) {
            return Math.floor(s / 60) + '分钟前';
        }
        if (s < 86400) {
            return Math.floor(s / 3600) + '小时前';
        }
        if (s < 864000) {
            return Math.floor(s / 86400) + '天前';
        }
        return defaultValue;
    }

    /**
     * 格式化秒
     * @returns {Array}
     */
    getFormatTime() {
        let t = parseInt(this.string, 10);
        let day = Math.floor(t / 86400000);
        if (day < 10) {
            day = `0${day}`;
        }
        t = t % 86400000;
        let hour = Math.floor(t / 3600000);
        if (hour < 10) {
            hour = `0${hour}`;
        }
        t = t % 3600000;
        let minute = Math.floor(t / 60000);
        if (minute < 10) {
            minute = `0${minute}`;
        }
        t = t % 60000;
        let second = Math.floor(t / 1000);
        return [`${day}`, `${hour}`, `${minute}`, `${second}`];
    }

    /**
     * 格式化时间(精确到毫秒)
     * @returns {Array}
     */
    getFormatTimeToMillisecond() {
        let t = parseInt(this.string, 10);
        let day = Math.floor(t / 86400000);
        if (day < 10) {
            day = `0${day}`;
        }
        t = t % 86400000;
        let hour = Math.floor(t / 3600000);
        if (hour < 10) {
            hour = `0${hour}`;
        }
        t = t % 3600000;
        let minute = Math.floor(t / 60000);
        if (minute < 10) {
            minute = `0${minute}`;
        }
        t = t % 60000;
        let second = Math.floor(t / 1000);
        t = t % 1000;
        let millisecond = Math.floor(t / 100);
        return [`${day}`, `${hour}`, `${minute}`, `${second}`, `${millisecond}`];
    }

    /**
     * 格式化秒
     * @returns {string}
     */
    formatSeconds4() {
        let s = parseInt(this.string);
        return s < 10 ? '0' + s : s;
    }

    /**
     * 格式化时间戳
     * @returns {string}
     */
    formatTime() {
        let timestamp = parseInt(this.string);
        // 今天00:00的时间戳
        let today = (new Date(this.formatTimestamp((new Date()).valueOf()).substr(0, 10))).valueOf();
        // 本周第一天00:00的时间戳
        let week = (new Date(this.formatTimestamp((new Date()).valueOf() - new Date().getDay() * 86400000).substr(0, 10))).valueOf();
        // 当时间与今天00:00相差小于24小时，则为今天
        if (timestamp > today) {
            return this.formatTimestamp(timestamp).substr(11, 5);
        }
        // 当时间大于本周第一天00:00则为本周
        if (timestamp > week) {
            let weekTime;
            switch (new Date(timestamp).getDay()) {
                case 0:
                    weekTime = '星期天';
                    break;
                case 1:
                    weekTime = '星期一';
                    break;
                case 2:
                    weekTime = '星期二';
                    break;
                case 3:
                    weekTime = '星期三';
                    break;
                case 4:
                    weekTime = '星期四';
                    break;
                case 5:
                    weekTime = '星期五';
                    break;
                case 6:
                    weekTime = '星期六';
                    break;
            }
            return weekTime + ' ' + this.formatTimestamp(timestamp).substr(11, 5);
        }

        return this.formatTimestamp(timestamp).substr(0, 16);
    }


    /**
     * 格式化时间戳
     * @param timestamp
     * @returns {string}
     */
    formatTimestamp(timestamp) {
        timestamp = parseInt(timestamp);
        let date = new Date(timestamp);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let minute = date.getMinutes();
        let second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    }

    // 获取格式化时间
    getFormatDate() {
        let date = this.string;
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let minute = date.getMinutes();
        let second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    }

    /**
     * 对比两个值是否相等(是否为相同字符串)
     * @param str
     * @returns {boolean}
     */
    equals(str) {
        return this.string + '' === str + ''
    }

    /**
     * 格式化空字符
     * @returns {string}
     */
    formatEmpty() {
        return this.isNotEmpty() ? this.string : '';
    }

    /**
     * 格式化时间(精确到秒)
     * @returns {Array}
     */
    getFormatTimeBySecond() {
        let t = parseInt(this.string, 10);
        t = Math.abs(t);
        let day = Math.floor(t / 86400000);
        if (day < 10) {
            day = `0${day}`;
        }
        t = t % 86400000;
        let hour = Math.floor(t / 3600000);
        if (hour < 10) {
            hour = `0${hour}`;
        }
        t = t % 3600000;
        let minute = Math.floor(t / 60000);
        if (minute < 10) {
            minute = `0${minute}`;
        }
        t = t % 60000;
        let second = Math.floor(t / 1000);
        if (second < 10) {
            second = `0${second}`;
        }
        return [`${day}`, `${hour}`, `${minute}`, `${second}`];
    }

    /**
     * 格式化时间(精确到毫秒)
     * @returns {Array}
     */
    getFormatTimeToMillisecond() {
        let t = parseInt(this.string, 10);
        t = Math.abs(t);
        let day = Math.floor(t / 86400000);
        if (day < 10) {
            day = `0${day}`;
        }
        t = t % 86400000;
        let hour = Math.floor(t / 3600000);
        if (hour < 10) {
            hour = `0${hour}`;
        }
        t = t % 3600000;
        let minute = Math.floor(t / 60000);
        if (minute < 10) {
            minute = `0${minute}`;
        }
        t = t % 60000;
        let second = Math.floor(t / 1000);
        if (second < 10) {
            second = `0${second}`;
        }
        t = t % 1000;
        let millisecond = Math.floor(t / 100);
        return [`${day}`, `${hour}`, `${minute}`, `${second}`, `${millisecond}`];
    }

    /***
     * 获取造假值
     * @returns {*}
     */
    getForgeCode() {
        let v = 42524;
        if (this.string && this.string.length > 0) {
            let v1 = 0;
            for (let i = 0; i < this.string.length; i++) {
                v1 += this.string[i].charCodeAt(0);
            }
            v = v1;
        }
        if (v > 777) {
            v = v % 1000;
        }
        return Math.round(v * Math.PI * 10);
    }

    /**
     * 阿拉伯数字转汉字
     * @returns {string}
     * @constructor
     */
    sectionToChinese() {
        let section = this.string;
        let chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        let chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
        let chnUnitChar = ["", "十", "百", "千"];
        let strIns = '', chnStr = '';
        let unitPos = 0;
        let zero = true;
        while (section > 0) {
            let v = section % 10;
            if (v === 0) {
                if (!zero) {
                    zero = true;
                    chnStr = chnNumChar[v] + chnStr;
                }
            } else {
                zero = false;
                strIns = chnNumChar[v];
                strIns += chnUnitChar[unitPos];
                chnStr = strIns + chnStr;
            }
            unitPos++;
            section = Math.floor(section / 10);
        }
        return chnStr;
    }

    /**
     * 获取目标时间的类型(-1:今天以前;0:今天;1:明天;2:后天;3:后天之后)
     * @param dest 目标时间
     */
    getDateType(dest) {
        // 当前时间
        let current = this.string;
        current = current.replace(new RegExp('-', 'g'), '/');
        // 目标时间
        dest = dest.replace(new RegExp('-', 'g'), '/');
        // 今天零点
        let date = (new Date(current.substr(0, 10))).valueOf();
        // 明天零点
        let date1 = date + 86400000;
        // 后天零点
        let date2 = date + 86400000 * 2;
        // 大后天零点
        let date3 = date + 86400000 * 3;
        dest = (new Date(dest)).valueOf();
        if (dest < date) {
            return -1;
        }
        if (dest < date1) {
            return 0;
        }
        if (dest < date2) {
            return 1;
        }
        if (dest < date3) {
            return 2;
        }
        return 3;
    }

    /**
     * 获取指定区间的随机整数
     * @param n 最小值
     * @param m 最大值
     * @returns {number}
     */
    getRandom(n, m) {
        return Math.floor(Math.random() * (m - n + 1) + n);
    }
}

export default function (str) {
    return new StringUtilsClass(str);
}