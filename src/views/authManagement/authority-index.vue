<template>
    <div class="auth-bc">
        <div class="cusbar-area" v-if="currentTab >= 0">
            <CusBar :tabs='navTabs' :active="currentTab" @handleItemClick='itemClicked'></CusBar>
        </div>
        <div class="bord-bc">
            <div class="left-div">
                <div class="column-tab" ref="column" >
                    <el-scrollbar class="option-wrap-scroll">
                    <div class="nomal-column" v-heightChange v-if="roleList.length">
                            <loading v-if="isLoading"></loading>
                            <div  v-for="(item, index) in roleList" :key="index" :title="item.cusTitle ? '' :showAddRole ? item.auth_name : item.auth_name+'('+item.count+')'"
                                :class="`${
                                    showAddRole ?  (item.auth_name === '其他' || item.status == 2) ?  'no_class' : item.cusTitle ? 'cus_title' :  index === roleListIndex ? 'ctab item-active' : 'ctab'        //权限
                                       : item.cusTitle ? 'cus_title' :  index === roleListIndex ? 'ctab item-active' : 'ctab'
                                       }`"
                                @click="columnItemClicked(item,index)"
                                >
                                {{showAddRole || item.cusTitle ? item.auth_name : item.auth_name+'('+item.count+')'}}
                            </div>
                           
                    </div>
                    </el-scrollbar>
                    <div v-if="showAddRole && addAuthOption" class="last-ctab" @click.stop="dialogOpen">
                        <p>+添加权限组</p>
                    </div>
                </div>
            </div>
            <router-view class="router-area"></router-view>
        </div>
        <AddAuth ref="addAuth" v-if="showRoleDialog" @dialogClose="showRoleDialog = false"></AddAuth>
    </div>
</template>
<script>
    import CusBar from '@components/cusUI/selectBar';
    import AddAuth from './components/addAuth'
    import {Request} from './service/http';
    import {mapState, mapMutations,mapActions} from 'vuex';
    export default {
        data() {
            let pageAuthConfig = sessionStorage.getItem("pageAuthConfig") ? JSON.parse(sessionStorage.getItem("pageAuthConfig")) : {};
            let tabs=[];
            if (pageAuthConfig.user_list){
                tabs.push
                    ({
                        name: '成员管理',
                        type: 'staffManagement'
                    })
            }
            if(pageAuthConfig.auth_page){
                tabs.push
                    ({
                        name: '权限设置',
                        type: 'authManagement'
                    })
            }
            return {
                currentTab: -1,
                navTabs: tabs,
                showAddRole: false, //显示添加权限组按钮
                showRoleDialog: false,
                isLoading: false,
                
                showStaffOption:pageAuthConfig.user_list || false,
                showAuthOption:pageAuthConfig.auth_page || false,
                addAuthOption:pageAuthConfig.auth_u || false,
            };
        },
        directives:{
            heightChange:{
                update: function(el,binding,vnode){
                    // let childHeight = document.getElementsByClassName('nomal-column').clientHeight
                    let fatherHeight = document.querySelector('.left-div').clientHeight
                    let childHeight = el.clientHeight
                    // let fatherHeight = el.parentNode.clientHeight
                    
                    console.log(childHeight,fatherHeight)
                    let di = document.querySelector('.column-tab')
                    if(vnode.context.showAddRole && vnode.context.addAuthOption){  //是在权限界面并且有添加权限组的权限 
                        if(fatherHeight < childHeight){
                            di.style.height = `calc(100% - 56px)`
                        }else{
                            di.style.height = "auto"
                        }
                    }else {
                        di.style.height = "100%"
                    }
                },

            }
        },
        computed: {
            ...mapState('auths', ['roleList', 'roleListIndex']),
        },
        watch: {
            $route: {
                handler() {
                    this.listenRoute();
                },
                deep: true
            },
        },
        components: {
            CusBar,AddAuth
        },
        methods: {
            ...mapMutations('auths', ['updateRoleIndex']),
            ...mapActions('auths',['loadRoleList']),
            dialogOpen(){
                this.showRoleDialog=true;
                this.$nextTick(function(){this.$refs.addAuth.open()})
            },
            getList: function () {
                this.loadRoleList()
            },
            itemClicked(item, index) {
                console.log('item', item, 'index', index);
                if (item.type == 'authManagement') {
                    if(this.roleList[this.roleListIndex].company_type === 3){
                        this.updateRoleIndex(1);
                        this.toTop()
                    }
                    this.$router.push('/authority/authManagement');
                    this.showAddRole = true
                } else if (item.type == 'staffManagement') {
                    this.$router.push('/authority/staffManagement');
                    this.showAddRole = false
                }
            },
            columnItemClicked(item, index) {
                if(item.cusTitle) return
                if (index == this.selectIndex) return;
                this.updateRoleIndex(index);
                // this.$bus.emit('roleIndexChange', index, item)
            },
            listenRoute() {
                const route = this.$route.path;
                this.navTabs.forEach((item, index) => {
                    if (route.indexOf(item.type) > -1) {
                        this.currentTab = index;
                        this.showAddRole = index === 1;
                    }
                });
            },
            toTop(){
                this.$refs.column.scrollTo(0,0)
            },
        },
        mounted() {
            this.listenRoute();
            this.showAuthOption && this.getList();
            this.$bus.on('authGrouplistTop',this.toTop)
        },
        beforeDestroy(){
            this.$bus.off('authGrouplistTop')
        },
    };
</script>
<style lang="less" scoped>
    .auth-bc {
        position: relative;
        height: 100%;
        width: 100%;
        .cusbar-area {
            width: 100%;
            position: relative;
        }
        .bord-bc{
            position: relative;
            height: calc(100% - 60px);
            width: 100%;
            display: flex;
            justify-content: space-between;
            .left-div {
                width: 240px;
                position: relative;
                height:  100%;
                .auto-height{
                    height:auto!important;
                }
                .column-tab {
                    position: relative;
                    align-items: center;
                    width: 240px;
                    height: calc(100% - 56px);
                    .option-wrap-scroll{
                        height: 100%;
                        width: 100%;
                        /deep/.el-scrollbar__wrap{
                            margin-bottom: 0!important;
                        }
                    }
                    .mixtab{
                        width: 240px;
                        height: 56px;
                        text-align: left;
                        padding: 0 50px 0 50px;
                        color:@textLight;
                        line-height: 56px;
                        font-size: 14px;
                        overflow: hidden;
                        white-space:nowrap;
                        text-overflow: ellipsis;
                        &:hover {
                            cursor: pointer;
                            background: @backGroundHover;
                        }
                    }
                    .nomal-column{
                        position: relative;
                        height:  100%;
                        .ctab {
                            .mixtab();
                        }
                    }
                    .cus_title{
                        width: 240px;
                        height: 56px;
                        padding: 0 30px 0 20px;
                        line-height: 56px;
                        color: @text;
                    }
                    .last-ctab {
                        .mixtab();
                        color: @baseColor;
                    }
                    .item-active {
                        color: @baseColor;
                        border-left: 3px solid @baseColor;
                        background: @backGroundHover;
                        padding: 0 20px 0 47px !important;
                        color: @text!important;
                        &:hover {
                            cursor: pointer;
                        }
                    }
                    .no_class{
                        display: none;
                    }
                }
                
            }
            .router-area {
                position: relative;
                height: 100%;
                width: calc(100% - 240px);
            }
        }
        
        
    }


</style>
