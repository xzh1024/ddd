import 'babel-polyfill';
import Es6Promise from 'es6-promise';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import axios from 'service';
import Bus from './libs/js/bus';
import '@assets/css/theme/index.css';

// 字体图标
import '@assets/css/iconfont/iconfont.css';

// import tools bind vue
import Tools from '@libs/js/tools';
import Constant from '@libs/js/constant';
import GlobalComponents from '@libs/js/global-components';

// Babel-polyfill
Es6Promise.polyfill();

// 引入全局指令
require('@libs/directive/directives');

Vue.prototype.$Tools = Tools;
Vue.$Tools = Tools;
Vue.prototype.$Constant = Constant;
Vue.$Constant = Constant;
Vue.prototype.$axios = axios;
Vue.$axios = axios;
Vue.config.productionTip = false;

axios.defaults.headers.common.token = localStorage.token;
// 统一设置 dialog 属性
ElementUI.Dialog.props.lockScroll.default = false;
ElementUI.Dialog.props.closeOnPressEscape.default = false;

Vue.use(Bus);
// 引入element-ui
Vue.use(ElementUI);
Vue.use(GlobalComponents);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
