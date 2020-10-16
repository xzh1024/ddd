<template>
    <div class="permission-page">
        <div class="permission-wrap" v-if="!hasPermission">
            <div class="diff-icon-types">
                <img v-if="isBindStatus" src="@assets/images/unbound-icon.png"/>
                <img v-else src="@assets/images/permission-icon.png"/>
            </div>
            <p class="status" v-if="isBindStatus">暂未绑定账号，请点击&nbsp;<a class="bind-account" @click="bindAccountHandler">绑定</a></p>
            <p class="status" v-else>暂未分配权限组，请联系管理员</p>
            <p class="back-to-login" v-if="!isBindStatus"><span>{{seconds}}s</span>&nbsp;&nbsp;后将返回登录页，或点击&nbsp;&nbsp;<a
                class="back-login" @click="backToLogin">返回</a></p>
        </div>
        <div class="loading-login" v-else>
            <i class="el-icon-loading"></i>
            <p>正在获取访问权限，请稍后...</p>
        </div>
        <template>
            <div class="bind-wx-account-dialog">
                <el-dialog title="绑定账号"
                           :visible.sync="bindAccountDialog"
                           :close-on-click-modal="false"
                           width="500px">
                    <div class="dialog-account-form">
                        <el-form label-width="80px" :model="bindParams" ref="projectForm">
                            <el-form-item label="绑定码：" required>
                                <el-input v-model="bindParams.bindCode" placeholder="请输入绑定码" @input="focusEnter"></el-input>
                                <div class="err-code" v-if="codeIsEmpty">绑定码不能为空</div>
                            </el-form-item>
                        </el-form>
                    </div>
                    <div slot="footer" class="dialog-footer">
                        <el-button size="medium" round @click="bindAccountDialog = false">取消</el-button>
                        <el-button size="medium" round type="primary" @click="bindAccount()">绑定</el-button>
                    </div>
                </el-dialog>
            </div>
        </template>
    </div>
</template>

<script>
    import axios from 'service';
    import {SystemLoginRequest} from "./service/http";
    
    export default {
        name: "no-permission",
        data() {
            return {
                bindAccountDialog: false,
                hasPermission: true,
                params: this.$route.query,
                seconds: 5,
                interval: null,
                isBindStatus: false,
                codeIsEmpty: false,
                bindParams: {
                    bindCode: ''
                }
            };
        },
        mounted() {
            this.init();
        },
        methods: {
            judgeAccountIsBind(params) {
                if (params.errCode === 102) {
                    this.isBindStatus = true;
                } else {
                    this.$router.push('/');
                }
            },
            async init() {
                const _this = this;
                clearInterval(this.interval);
                if (this.params.code) {
                    localStorage.code = this.params.code;
                    const data = await SystemLoginRequest.loginSystem({code: this.params.code});
                    if (data.err_code === 0) {
                        const result = data.data || {};
                        if (Number(result.userData.auth_status) === 2 || result.userData.menu_list.length <= 0) {
                            this.hasPermission = false;
                            this.timeCountdown();
                            return;
                        }
                        localStorage.token = result.token;
                        sessionStorage.userData = JSON.stringify(result.userData);
                        axios.defaults.headers.common.token = result.token;
                        this.$store.commit('setAvatarPath', result.userData ? result.userData.avatar : '');
                        const firstMenu = result.userData.menu_list[0];
                        this.$router.push(this.matchFirstMenuRoute(firstMenu));
                    } else {
                        const params = {errCode: data.err_code};
                        this.judgeAccountIsBind(params);
                        this.hasPermission = false;
                    }
                } else {
                    const menuList = sessionStorage.userData ? JSON.parse(sessionStorage.userData).menu_list || [] : [];
                    if (localStorage.token && (menuList && menuList.length > 0)) {
                        this.$router.push(this.matchFirstMenuRoute(menuList[0]));
                    }
                    // Test Code
                    if (this.$route.params.key === 'test') {
                        SystemLoginRequest.testLoginSystem({open_id: 'oEQlO6KDawTkMoBuZyGFmvin1h-jiafang'})// oEQlO6KpKP50IYQ9wtGQJ0JTtcQU  oEQlO6M4Wjz2ftATg4ej6BCjwDd0  oEQlO6IAK4dEkTuJ7We-TM4pRKxsyifang oEQlO6KDawTkMoBuZyGFmvin1h-yifang
                            .then(({data, err_code}) => {
                                if (err_code === 0) {
                                    if (Number(data.userData.auth_status) === 2 || data.userData.menu_list.length <= 0) {
                                        _this.hasPermission = false;
                                        _this.timeCountdown();
                                        return;
                                    }
                                    localStorage.token = data.token;
                                    sessionStorage.userData = JSON.stringify(data.userData);
                                    axios.defaults.headers.common.token = data.token;
                                    _this.$store.commit('setAvatarPath', data.userData ? data.userData.avatar : '');
                                    const firstMenu = data.userData.menu_list[0];
                                    _this.$router.push(this.matchFirstMenuRoute(firstMenu));
                                } else {
                                    const params = {errCode: err_code};
                                    _this.judgeAccountIsBind(params);
                                    _this.hasPermission = false;
                                }
                            });
                    } else {
                        this.$router.push('/');
                    }
                }
            },
            bindAccountHandler() {
                this.bindAccountDialog = true;
            },
            focusEnter(value) {
                this.codeIsEmpty = !value || (!!value && value.trim().length <= 0);
            },
            async bindAccount() {
                if (!this.bindParams.bindCode || this.bindParams.bindCode.trim().length <= 0) {
                    this.codeIsEmpty = true;
                    return;
                }
                const data = await SystemLoginRequest.bindWxAccount({bind_code: this.bindParams.bindCode});
                if (data.err_code === 0) {
                    this.$message.success('账号绑定成功，请重新扫码登录');
                    this.$router.push('/');
                }
            },
            matchFirstMenuRoute(firstMenu) {
                let routePath = '/project';
                this.$Constant.sysMenuList.forEach(item => {
                    if (item.key === firstMenu.action_key) {
                        routePath = item.path;
                    }
                });
                return routePath;
            },
            timeCountdown() {
                const _this = this;
                _this.interval = setInterval(() => {
                    _this.seconds--;
                    if (_this.seconds === 0) {
                        clearInterval(_this.interval);
                        _this.interval = null;
                        _this.$router.push('/');
                    }
                }, 1000);
            },
            backToLogin() {
                clearInterval(this.interval);
                this.interval = null;
                this.$router.push('/');
            }
        }
    };
</script>

<style lang="less" scoped>
    .permission-page {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 20px;
        background: @backGround;
        -webkit-border-radius: @radius;
        -moz-border-radius: @radius;
        border-radius: @radius;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        .permission-wrap {
            .diff-icon-types {
                height: 220px;
            }
            p {
                margin-top: 20px;
                font-size: 14px;
                color: @textLight;
                &.status {
                    margin-top: 25px;
                }
                .bind-account {
                    font-size: 16px;
                    color: @baseColor;
                    &:hover {
                        text-decoration: underline;
                    }
                }
                &.back-to-login {
                    span {
                        color: @error;
                    }
                    a {
                        font-size: 16px;
                        color: @baseColor;
                        &:hover {
                            text-decoration: underline;
                        }
                    }
                }
            }
        }
        .loading-login {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            width: 250px;
            height: 90px;
            padding: 10px;
            -webkit-border-radius: 4px;
            -moz-border-radius: 4px;
            border-radius: 4px;
            color: @textLight;
            text-align: center;
            > i {
                font-size: 50px;
            }
            > p {
                margin-top: 20px;
                font-size: 14px;
            }
        }
        .bind-wx-account-dialog {
            .dialog-account-form {
                padding: 20px 20px 0;
            }
            .err-code {
                position: absolute;
                top: 100%;
                left: 0;
                line-height: 1;
                padding-top: 4px;
                color: @error;
                font-size: 12px;
            }
        }
    }
</style>
