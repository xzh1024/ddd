<template>
    <div class="main-menu-item">
        <a @click="navigator('order')">订单</a>
        <a @click="navigator('user')">用户</a>
    </div>
</template>

<script>
    export default {
        name: 'mainMenu',
        methods: {
            navigator(type) {
                if (type === 'order') {
                    this.$router.push({
                        path: '/xxx'
                    });
                } else {
                    this.$router.push({
                        path: '/xxxx',
                        query: {
                            name: 'Steven Jobs'
                        }
                    });
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .main-menu-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 200px;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        padding: 20px 10px;
        a {
            display: block;
            color: #fff;
            padding: 10px 0;
            &:hover {
                cursor: pointer;
                color: #409EFF;
            }
        }
    }
</style>
