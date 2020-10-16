import Vue from 'vue';
import Vuex from 'vuex';
import auths from './modules/authManage'
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        avatar: '',
        todoRouteParams:{
            projectID: null,
            status: null,
            type: null
        }
    },
    mutations: {
        setAvatarPath(state, path) {
            state.avatar = path;
        },
        setTodoRouteParams(state,params){
            state.todoRouteParams = params;
        }
    },
    actions: {},
    modules: {
        auths
    }
});
