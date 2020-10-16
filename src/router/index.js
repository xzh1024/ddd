import Vue from 'vue';
import VueRouter from 'vue-router';
import routers from './router';
import {RouteInterception} from "./routeUtil";

Vue.use(VueRouter);

// push
const VueRouterPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(to) {
    return VueRouterPush.call(this, to).catch(err => err);
};

// replace
const VueRouterReplace = VueRouter.prototype.replace;
VueRouter.prototype.replace = function replace(to) {
    return VueRouterReplace.call(this, to).catch(err => err);
};

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: routers
});

router.beforeEach((to, from, next) => {
    window.document.title = to.meta.title ? `${to.meta.title} - 光子基地管理系统` : '光子基地管理系统';
    if (to.name === 'login') {
        localStorage.clear();
        sessionStorage.clear();
        window.socket && window.socket.close();
        next();
        return;
    }
    if (!localStorage.token && to.name !== 'permission') {
        next({
            name: 'root'
        });
    } else {
        RouteInterception.judgeMenuTypeAndGetAuthMenu(to, from, next);
    }
});

router.afterEach(to => {
    window.scrollTo(0, 0);
});

export default router;
