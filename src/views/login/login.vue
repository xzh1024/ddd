<template>
    <el-scrollbar class="login-page">
        <div class="login-wrap" id="loginWrapper">
            <div class="section-blur" v-if="showBgImage"></div>
            <div class="section">
                <img ref="image" src="https://front-static-1301661509.cos.ap-chongqing.myqcloud.com/images/login-bg2.png"/>
            </div>
            <div class="login-container">
                <div class="company-logo">
                    <img src="https://front-static-1301661509.cos.ap-chongqing.myqcloud.com/images/login-logo.png" />
                </div>
                <div class="login-box">
                    <div class="login-title">重庆创新研发基地管理系统</div>
                    <div class="qr-code-container">
                        <div id="qrCode"></div>
                    </div>
                </div>
            </div>
            <div class="footer"></div>
        </div>
        <el-button style="margin: 0 auto;width: 180px;position: absolute;right: 40px;top: 78px;" type="primary" @click="loginSystem" v-if="showLoginBtn">登录</el-button>
    </el-scrollbar>
</template>

<script>
    import CanvasNest from 'canvas-nest.js';
    import '@libs/js/wx-login';
    import {Debounce, Env} from '@libs/js/utils';
    
    const config = {
        color: '180, 180, 180',
        pointColor: '198, 198, 198',
        opacity: 0.5,
        count: 268,
        zIndex: 1
    };
    export default {
        name: 'login',
        data() {
            return {
                showLoginBtn: process.env.NODE_ENV !== 'production',
                showBgImage: true,
                cn: null
            };
        },
        mounted() {
            this.loadingBgImage();
            this.init();
            this.$nextTick(() => {
                this.cn = new CanvasNest(document.getElementById('loginWrapper'), config);
            });
        },
        methods: {
            async init() {
                const _this = this;
                const env = Env();
                this.$nextTick(() => {
                    _this.wxLoginSystem(env);
                });
            },
            loadingBgImage() {
                const _this = this;
                const img = this.$refs.image;
                img.onload = function() {
                    img.style.opacity = '1';
                    _this.showBgImage = false;
                };
            },
            wxLoginSystem(env) {
                document.WxLogin({
                    id: 'qrCode',
                    appid: env.appId,
                    response_type: 'code',
                    scope: 'snsapi_login',
                    redirect_uri: `${env.url}/permission`,
                    href: 'https://front-static-1301661509.cos.ap-chongqing.myqcloud.com/css/qr-code-style.css'
                });
            },
            loginSystem: Debounce(function() {
                this.$router.push({name: 'permission', params: {key: 'test'}});
            }, 3000)
        },
        destroyed() {
            this.cn.destroy();
            this.cn = null;
        }
    };
</script>

<style lang="less" scoped>
    .login-page {
        position: relative;
        width: 100%;
        height: 100%;
        /deep/ .el-scrollbar__view {
            position: relative;
        }
        .login-wrap {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            min-height: 969px;
            background: #2C3133 url("https://front-static-1301661509.cos.ap-chongqing.myqcloud.com/images/login-bg.jpg") no-repeat center center / cover;
        }
        .section-blur {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            filter: blur(12px);
            transform: scale(1);
            background: url("https://front-static-1301661509.cos.ap-chongqing.myqcloud.com/images/login-bg2-blur.png") no-repeat bottom center / cover;
        }
        .section {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            img {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                transition: opacity .5s linear;
                opacity: 0;
            }
        }
        .login-container {
            position: absolute;
            top: 6vh;
            right: 0;
            left: 0;
            margin: auto;
            width: 430px;
            height: 689px;
            text-align: center;
            .company-logo {
                width: 360px;
                height: 107px;
                overflow: hidden;
                margin: 0 auto 42px;
            }
        }
        .login-box {
            position: relative;
            margin: 0 auto;
            width: 100%;
            height: 540px;
            padding: 39px 0;
            text-align: center;
            -webkit-border-radius: 16px;
            -moz-border-radius: 16px;
            border-radius: 16px;
            background: rgba(9, 14, 26, 0.6);
            box-shadow: 0 10px 40px 0 rgba(9, 14, 26, 0.5);
            z-index: 99;
            .login-title {
                width: 100%;
                font-size: 24px;
                font-weight: bold;
                color: @text;
                margin: 0 0 24px;
            }
            .qr-code-container {
                position: relative;
                width: 320px;
                height: 428px;
                margin: 0 auto;
                -webkit-border-radius: @radius;
                -moz-border-radius: @radius;
                border-radius: @radius;
                overflow: hidden;
                &.has-code {
                    width: 100%;
                    height: 418px;
                }
                /deep/ .global-loading {
                    .loading-item {
                        width: 178px;
                        span {
                            color: @text;
                        }
                    }
                }
            }
        }
        .footer {
            position: absolute;
            bottom: 60px;
            left: 0;
            right: 0;
            margin: auto;
            width: 280px;
            height: 75px;
            background: url("https://front-static-1301661509.cos.ap-chongqing.myqcloud.com/images/footer.png") no-repeat center / contain;
        }
    }
</style>
