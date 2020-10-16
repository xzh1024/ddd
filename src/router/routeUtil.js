import Constant from '@libs/js/constant';
import routers from './router';
import {SystemGlobalRequest} from "commonHttp";
import {Message} from 'element-ui';

export class RouteInterception {
    constructor(isExist) {
        this.isExist = isExist;
    }
    
    static judgeMenuTypeAndGetAuthMenu(to, from, next) {
        this.isExist = false;
        this.judgeRouterIsExist(routers, to, from);
        if (!this.isExist) {
            next({
                replace: true,
                name: 'root'
            });
            return;
        }
        if (to.name === 'permission') {
            next();
        } else {
            this.accordingToMenuLoadAuthDetails(routers, to, from, next);
        }
    }
    
    // 判断该路由是否存在于路由列表中
    static judgeRouterIsExist(routers, to, from) {
        routers && routers.forEach(item => {
            if (item.path === to.path) {
                this.isExist = true;
            } else {
                if (item.children) {
                    this.judgeRouterIsExist(item.children, to, from);
                }
            }
        });
    }
    
    // 根据左侧菜单路由加载二级菜单
    static async accordingToMenuLoadAuthDetails(routers, to, from, next) {
        const params = {};
        const systemMenuList = Constant.sysMenuList || [];
        const menuList = sessionStorage.userData ? JSON.parse(sessionStorage.userData).menu_list || [] : [];
        const sysMenuList = [];
        if (menuList.length <= 0) {
            next('/permission');
            return;
        }
        systemMenuList.forEach(item => {
            menuList.forEach(opt => {
                if (opt.action_key === item.key) {
                    item.id = opt.id;
                    sysMenuList.push(item);
                }
            });
        });
        sysMenuList.forEach(item => {
            if (to.path.includes(item.path)) {
                params.auth_id = item.id;
            }
        });
        if (to.name === 'documentIndex') {
            params.id = 'd';
        }
        if (to.name === 'messageIndex') {
            params.id = 'm';
        }
        if (to.name === 'uiDemo') {
            params.id = 'u';
        }
        if (params && JSON.stringify(params) !== '{}') {
            const data = await SystemGlobalRequest.getAuthorityDetails(params);
            if (data.err_code === 0) {
                const pageAuth = data.data || [];
                const pageAuthConfig = {};
                pageAuth.forEach(item => {
                    if (item.action_key) {
                        pageAuthConfig[item.action_key] = item.has_auth;
                    }
                });
                sessionStorage.pageAuthConfig = JSON.stringify(pageAuthConfig);
                next();
            }
            if (data.err_code === 1) {
                next({name: 'root'});
            }
        } else {
            Message.error('无权限访问，请联系管理员！');
        }
    }
}
