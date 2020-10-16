<template>
    <div class="basic-management-wrap">
        <div class="navigation-tabs" v-if="currentTab >= 0">
            <tabs :tabs="navTabs" :active="currentTab" @handleItemClick="switchTab"></tabs>
        </div>
        <router-view class="router-area"></router-view>
    </div>
</template>
<script>
    import Tabs from '@components/cusUI/selectBar';
    
    export default {
        name: 'basic-index',
        components: {Tabs},
        data() {
            return {
                currentTab: -1,
                navTabs: [
                    {
                        type: 'document',
                        key: 'document',
                        name: '文档管理'
                    },
                    {
                        type: 'notice',
                        key: 'notice',
                        name: '公告管理'
                    },
                    {
                        type: 'company',
                        key: 'basic_company',
                        name: '公司管理'
                    },
                    {
                        type: 'node',
                        key: 'basic_standard',
                        name: '制作类型'
                    },
                    {
                        type: 'work',
                        key: 'basic_category',
                        name: '工作类型'
                    }
                ]
            };
        },
        created() {
            const pageAuthConfig = sessionStorage.pageAuthConfig ? JSON.parse(sessionStorage.pageAuthConfig) : {};
            this.navTabs = this.navTabs.filter(item => {
                return pageAuthConfig[item.key];
            });
            this.$router.push(this.$route.path);
        },
        mounted() {
            this.listenRoute();
        },
        methods: {
            listenRoute() {
                const route = this.$route.path;
                this.navTabs.forEach((item, index) => {
                    if (route.indexOf(item.type) > -1) {
                        this.currentTab = index;
                    }
                });
            },
            switchTab(tab) {
                this.$router.push(`/basic/${tab.type}`);
            }
        },
        watch: {
            $route: {
                handler() {
                    this.listenRoute();
                },
                deep: true
            }
        }
    };
</script>
<style lang="less" scoped>
    .basic-management-wrap {
        position: relative;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        padding: 0 0 12px;
        .navigation-tabs {
            width: 100%;
            // margin: 0 0 20px;
        }
        .router-area {
            position: relative;
            height: calc(~'100% - 60px');
            width: 100%;
        }
    }
</style>
