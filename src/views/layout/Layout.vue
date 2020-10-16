<template>
    <div class="entry-main-layout">
        <div class="top-bar">
            <top-bar name="top"></top-bar>
        </div>
        <div class="center-content">
            <router-view-container name="center"></router-view-container>
        </div>
        <upcoming-task v-if="showUpcomingTask"></upcoming-task>
    </div>
</template>

<script>
    import TopBar from "./components/topBar";
    import RouterViewContainer from "./components/routerViewContainer";
    import webSocket from '@libs/js/websocket';
    import UpcomingTask from "../../components/todo/upcoming-task";

    export default {
        name: "Layout",
        components: {
            UpcomingTask,
            RouterViewContainer,
            TopBar
        },
        mounted() {
            this.connectWs();
        },
        computed: {
            showUpcomingTask() {
                let menuList = sessionStorage.userData ? JSON.parse(sessionStorage.userData).menu_list : null;
                let flag = false;
                if (menuList && menuList.length > 0) {
                    let hasActionKey = menuList.filter((item, index, arr) => {
                        return item.action_key === 'task_general' || item.action_key === 'task_import' || item.action_key === 'task_cp_a' || item.action_key === 'task_cp_b';
                    });
                    if (hasActionKey && hasActionKey.length > 0) {
                        flag = true;
                    } else {
                        flag = false;
                    }
                }else {
                    flag = false;
                }
                return flag;
            }
        },
        methods: {
            connectWs() {
                webSocket.createWebSocket(this);
            }
        }
    };
</script>

<style lang="less" scoped>
    .entry-main-layout {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.05);

        .top-bar {
            position: relative;
            width: 100%;
        }

        .center-content {
            position: relative;
            width: 100%;
            height: calc(~'100% - 70px');
        }
    }
</style>
