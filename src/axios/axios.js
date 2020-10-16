'use strict';

import md5 from 'md5';
import axios from 'axios';
import router from '../router';
import {Message} from 'element-ui';
import Tools from '@libs/js/tools';
import Constant from '@libs/js/constant';
import {Env} from '@libs/js/utils';

const env = Env();
const qs = require('querystring');
const service = axios.create({
    baseURL: env.url,
    timeout: 30000,
    withCredentials: false
});

service.interceptors.request.use(config => {
    const random = Tools.getRangeRandom(12, 16);
    const secretStr = Constant.secretStr;
    if (config.method !== 'get') {
        config.data = config.data || {};
        config.data.a_ran = random;
        config.data.a_str = md5(secretStr + random);
        config.data = qs.stringify(config.data);
    } else {
        config.params = config.params || {};
        config.params.a_ran = random;
        config.params.a_str = md5(secretStr + random);
    }
    return config;
}, error => {
    Message.error('Http request error:', error);
    return Promise.reject(error);
});

service.interceptors.response.use(response => {
    if (response.data.err_code !== 0) {
        if (response.data.err_code === 1) {
            if (router.currentRoute.path !== 'login') {
                router.push('/');
                Message.warning('登录失效，请重新登录！');
            }
        } else {
            if (response.data.err_code !== 102) {
                Message.warning(response.data.err_message);
            }
        }
    }
    return response.data;
}, error => {
    let message = '';
    if (error && error.response) {
        switch (error.response.status) {
            case 404:
                message = '请求未找到资源';
                break;
            case 403:
                message = '请求无权限被拒绝';
                break;
            case 500:
                message = '服务器响应错误';
                break;
            case 502:
                message = 'Bad Gateway';
                break;
            case 504:
                message = '网络响应超时';
                break;
            case 600:
                message = '登录失效，请重新登录';
                break;
        }
    } else {
        if (JSON.stringify(error).includes('timeout')) {
            message = '服务器响应超时，请刷新页面';
        } else {
            message = '服务器连接失败';
        }
    }
    Message.error(message);
    return Promise.reject(error.response);
});

export default service;
