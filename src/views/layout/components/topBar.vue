<template>
    <div class="top-bar-item">
        <div class="left-info-item">
            <div class="logo-item">
                <img src="@assets/images/nav-logo.png">
            </div>
            <div class="sys-menu">
                <ul>
                    <li v-for="(item, index) in sysMenuList" :key="index" :class="{'item-active': item.active}"
                        @click="chooseMenu(item)">{{item.name}}
                    </li>
                </ul>
            </div>
        </div>
        <!--<h3 style="position: absolute;top: 72px;left: 28px;z-index: 1;">Code: {{loginCode}}</h3>-->
        <div class="right-info-item">
            <div class="top-options">
                <a class="documentation" :class="{'is-active': documentActivity}" @click="toDocument()">
                    <i class="el-icon-document"></i>
                    <span>说明文档</span>
                </a>
                <a class="documentation" :class="{'is-active': messageActivity}" @click="toMessage()">
                    <i class="el-icon-bell"></i>
                    <span>消息</span>
                </a>
            </div>
            <el-dropdown @command="logoutSys" size="medium">
                <div class="el-dropdown-link">
                    <div class="user-avatar">
                        <img :src="getUserAvatar"/>
                    </div>
                    <span>{{userName}}</span>
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
    import {SystemLoginRequest} from "../../login/service/http";
    
    export default {
        name: 'topBar',
        data() {
            return {
                loginCode: null,
                avatar: '',
                userName: '',
                sysMenuList: this.$Constant.sysMenuList,
                documentActivity: false,
                messageActivity: false
            };
        },
        computed: {
            getUserAvatar() {
                return this.$store.state.avatar || this.avatar;
            }
        },
        mounted() {
            this.avatar = sessionStorage.userData ? JSON.parse(sessionStorage.userData).avatar : '';
            this.userName = sessionStorage.userData ? JSON.parse(sessionStorage.userData).name : '';
            this.loginCode = localStorage.code;
            this.init();
            this.filterMenuActive();
        },
        methods: {
            init() {
                const menuList = sessionStorage.userData ? JSON.parse(sessionStorage.userData).menu_list || [] : [];
                const sysMenuList = [];
                this.sysMenuList.forEach(item => {
                    menuList.forEach(opt => {
                        if (opt.action_key === item.key) {
                            item.id = opt.id;
                            sysMenuList.push(item);
                        }
                    });
                });
                this.sysMenuList = sysMenuList;
            },
            chooseMenu(menu) {
                this.documentActivity = false;
                this.messageActivity = false;
                this.$router.push(menu.path);
            },
            async logoutSys(item) {
                if (item === 'logout') {
                    const data = await SystemLoginRequest.logoutSystem();
                    if (data.err_code === 0) {
                        window.socket && window.socket.close();
                        this.$router.push('/');
                    }
                }
            },
            filterMenuActive() {
                this.sysMenuList.forEach(item => {
                    this.$set(item, 'active', false);
                    if (this.$route.path.indexOf(item.path) !== -1) {
                        this.$set(item, 'active', true);
                    }
                });
                if (this.$route.path.indexOf('document/index') !== -1) {
                    this.documentActivity = true;
                    this.messageActivity = false;
                }
                if (this.$route.path.indexOf('message/index') !== -1) {
                    this.documentActivity = false;
                    this.messageActivity = true;
                }
            },
            toDocument() {
                this.documentActivity = true;
                this.messageActivity = false;
                this.$router.push('/document');
            },
            toMessage() {
                this.documentActivity = false;
                this.messageActivity = true;
                this.$router.push('/message');
            }
        },
        watch: {
            $route: {
                handler() {
                    this.filterMenuActive();
                },
                deep: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .top-bar-item {
        position: relative;
        width: 100%;
        height: 70px;
        padding: 12px 45px;
        background: @backGroundLight;
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        z-index: 99;
        .left-info-item {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            .logo-item {
                min-width: 142px;
                width: 142px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 0 45px 0 0;
                img {
                    width: 100%;
                }
            }
            .sys-menu {
                height: 40px;
                display: flex;
                align-items: center;
                padding: 0 0 0 35px;
                ul {
                    > li {
                        position: relative;
                        float: left;
                        padding: 10px 0;
                        margin: 0 30px 0 0;
                        font-size: 18px;
                        color: @textLight;
                        -webkit-transition: coloe 0.3s ease-in-out;
                        -moz-transition: coloe 0.3s ease-in-out;
                        -ms-transition: coloe 0.3s ease-in-out;
                        -o-transition: coloe 0.3s ease-in-out;
                        transition: coloe 0.3s ease-in-out;
                        &::after {
                            content: '';
                            position: absolute;
                            top: 100%;
                            left: 0;
                            width: 100%;
                            height: 4px;
                            background: @baseColor;
                            opacity: 0;
                            -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
                            -moz-transition: opacity 0.3s, -moz-transform 0.3s;
                            transition: opacity 0.3s, transform 0.3s;
                            -webkit-transform: translateY(20px);
                            -moz-transform: translateY(20px);
                            transform: translateY(20px);
                        }
                        &:hover, &.item-active {
                            cursor: pointer;
                            color: @white;
                            &::after {
                                opacity: 1;
                                -webkit-transform: translateY(0px);
                                -moz-transform: translateY(0px);
                                transform: translateY(0px);
                            }
                        }
                    }
                }
            }
        }
        .right-info-item {
            height: 44px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            .top-options {
                height: 30px;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                border-right: 1px solid @borderColorLight;
                margin: 0 30px 0 0;
                .documentation {
                    display: flex;
                    align-items: center;
                    margin: 0 30px 0 0;
                    -webkit-transition: all 0.2s;
                    -moz-transition: all 0.2s;
                    -ms-transition: all 0.2s;
                    -o-transition: all 0.2s;
                    transition: all 0.2s;
                    color: @textLight;
                    i {
                        font-size: 18px;
                        margin-right: 5px;
                    }
                    &:hover, &.is-active {
                        color: @baseColor;
                    }
                }
            }
            .el-dropdown-link {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: @textLight;
                .user-avatar {
                    min-width: 36px;
                    max-width: 36px;
                    height: 36px;
                    display: inline-block;
                    -webkit-border-radius: 50%;
                    -moz-border-radius: 50%;
                    border-radius: 50%;
                    border: 1px solid @textLight;
                    overflow: hidden;
                    margin: 0 10px 0 0;
                }
                img {
                    width: 100%;
                    height: 100%;
                }
                &:hover {
                    cursor: pointer;
                }
            }
        }
    }
</style>
