/**
 * 获取不同登录环境参数
 * @returns {{appId: string, agentId: string, url: string}}
 * @constructor
 */
export const Env = () => {
    const location = window.location.origin;
    let appId, url, ws;
    if (location.includes('gzsdt')) {
        appId = 'wx074efef6c76d41bf';
        url = 'http://gzsdt.banbooyun.com';
        ws = 'ws://118.24.255.170:15679/';
    } else if (location.includes('gzsdw')) {
        appId = 'wx074efef6c76d41bf';
        url = 'http://gzsdw.banbooyun.com';
        ws = 'ws://118.24.255.170:15689/';
    } else {
        appId = 'wx1440f21262d3eefe';
        url = 'http://gzsd.banbooyun.com';
        ws = 'ws://118.24.255.170:15689/';
    }
    return {
        appId: appId,
        url: url,
        ws: ws
    };
};

/**
 * 防抖函数
 * @param fn => function
 * @param t => delay time
 * @returns {Function}
 * @constructor
 */
export const Debounce = (fn, t) => {
    const delay = t || 500;
    let timer;
    return function () {
        const args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        const callNow = !timer;
        timer = setTimeout(() => {
            timer = null;
        }, delay);
        if (callNow) fn.apply(this, args);
    };
};

/**
 * 时间戳转换方法
 * @param value => date
 * @returns {String}
 */
export const formatDate = (value) => {
    const date = new Date(value);
    const YY = date.getFullYear() + "-";
    const MM =
        (date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1) + "-";
    const DD = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return YY + MM + DD;
};
