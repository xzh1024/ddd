<template>
    <div class="auth-bcc">
        <div class="auth-table-header">
            <div v-if="showDelete" class="delete-warp">
                <i v-if="configEdit" @click="openDialog" class="el-icon-edit-outline">编辑</i>
                <i v-if="configDelete && (groupLength === 0)" @click="deleteAuthClick" class="el-icon-delete" slot="reference">删除</i>
            </div>
        </div>
        <div class="table-body">
            <el-scrollbar class="option-wrap-scroll">
            <div class="body_warp">
                <loading v-show="isLoading"></loading>
                <div class="auth-pro" v-for="(item,index) in auths" :key="index">
                    <CusBox class="father-box" :checked="item.is_check" :lable="item.name"
                        :disabled='!configCheck' @boxClick="authClick({id:item.id})">
                    </CusBox>
                    <div v-if="item.children && item.children.length" class="auth-row">
                        <CusBox class="children-box" v-for="(citem,cindex) in item.children" :key="cindex" :checked="citem.is_check"
                            :lable="citem.name"
                            :disabled='!configCheck' @boxClick="authClick({father_id:item.id,id:citem.id})">
                        </CusBox>
                    </div>
                </div>
            </div>
            </el-scrollbar>
        </div>
        <el-dialog title="编辑权限组" :visible.sync="showRoleDialog" :close-on-click-modal="false" width="400px">
            <el-form :model="newRole" label-width="80px">
                <el-form-item label="权限名称">
                    <el-input ref="auth_input" v-model.trim="newname" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button round size="medium" @click="showRoleDialog = false">取消</el-button>
                <el-button round size="medium" type="primary" @click="editAuth">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import CusBar from '@components/cusUI/selectBar'
    import CusBox from '@components/cusUI/cusCheckbox'
    import {Request} from '../service/http'
    import {mapState, mapMutations,mapActions} from 'vuex';
    import {Debounce} from '@libs/js/utils';
    export default {
        name: "authManagement",
        data() {
            let pageAuthConfig = sessionStorage.getItem("pageAuthConfig") ? JSON.parse(sessionStorage.getItem("pageAuthConfig")) : {};
            return {
                auths: [],
                checkBoxdisabled: false,
                isLoading: false,
                auth_id:'',
                showDelete:false,
                showRoleDialog:false,
                newname:'',
                newRole:{},
                configCheck:pageAuthConfig.auth_s,
                configEdit:pageAuthConfig.auth_u,
                configDelete:pageAuthConfig.auth_d
            }
        },
        computed:{
            ...mapState('auths',['roleListIndex','roleList']),
            groupLength(){
                return this.roleList[this.roleListIndex].count
            }
        },
        watch:{
            roleListIndex:{
                handler(val,oldval){
                    if(this.roleList && this.roleList.length){
                        this.auth_id = this.roleList[this.roleListIndex].auth_id;
                        this.getList();
                        if(this.roleList[this.roleListIndex].default_type == 1){
                            this.showDelete = true
                        }else{
                            this.showDelete =false
                        }
                    }else{
                        this.isLoading = true
                    }
                },
                immediate:true
            },
            'roleList.length':{
                handler(val,oldval){
                    if(val){
                        this.auth_id = this.roleList[this.roleListIndex].auth_id;
                        this.getList();
                        if(this.roleList[this.roleListIndex].default_type == 1){
                            this.showDelete = true
                        }else{
                            this.showDelete =false
                        }
                    }else{
                        this.isLoading = true
                    }
                },
                immediate:true
            },
        },
        components: {
            CusBar,
            CusBox
        },
        methods: {
            ...mapActions('auths',['loadRoleList']),
            ...mapMutations('auths', ['updateRoleIndex']),
            getList(){
                this.isLoading = true;
                Request.getAuthList({
                    auth_id:this.auth_id
                })
                    .then(res => {
                        this.isLoading = false;
                        if (res.err_code === 0) {
                            this.auths = res.data;
                        } else {
                            console.log('出错了', res.err_message)
                        }
                    }).catch(err => {
                    this.isLoading = false;
                    console.log('出错了', err)
                });
            },
            authClick:Debounce(function(ids){
                this.isLoading = true;
                Request.authChange({
                    id:this.auth_id,
                    auth_id:ids.id
                })
                .then(res=>{
                    if(res.err_code === 0){
                        this.$message.success('修改成功');
                        this.getList()
                    }else{
                        this.$message.error('出错了，请重试');
                        this.getList()
                    }
                    this.isLoading = false
                }).catch(err => {
                    this.$message.error('出错了，请重试');
                    this.getList();
                    this.isLoading = false
                })
            },500),
            deleteAuthClick(){
                const _this = this;
                this.$Tools.deleteConfirm(_this, {text: '确定删除权限组？', title: '提示'}, async () => {
                    _this.isLoading = true;
                    let res = await Request.deleteAuthGroup({
                        id:this.auth_id,
                    })
                    _this.isLoading = false
                    _this.loadRoleList();
                    _this.updateRoleIndex(1);
                    _this.$bus.emit('authGrouplistTop')
                    return res;
                    
                });
            },
            editAuth(){
                if(!this.newname){
                    this.$message.error('权限名称不能为空！');
                    return
                }
                this.isLoading = true;
                Request.editAuthGroup({
                    id:this.auth_id,
                    auth_name:this.newname
                })
                .then(res=>{
                    if(res.err_code === 0){
                        this.$message.success('修改成功');
                        this.loadRoleList();
                        this.showRoleDialog=false
                    }else{
                        this.$message.error('出错了，请重试')
                    }
                    this.isLoading = false
                }).catch(err => {
                    this.$message.error('出错了，请重试');
                    this.isLoading = false
                })
            },
            openDialog(){
                this.showRoleDialog = true;
                this.newname = this.roleList[this.roleListIndex].auth_name || '';
                this.$nextTick(function(){
                    this.$refs.auth_input.focus()
                })
            }
        },
        mounted() {
        },
        beforeDestroy() {
        }
    };
</script>

<style lang="less" scoped>
    .auth-bcc {
        position: relative;
        width: 100%;
        height: 100%;
        .auth-table-header {
            position: relative;
            width: 100%;
            height: 56px;
            .delete-warp{
                font-size: 14px;
                float: right;
                line-height: 57px;
                margin-right: 10px;
                i:first-child{
                    margin-right: 10px;
                     &:hover {
                        cursor: pointer;
                        color:@baseColor;
                    }
                }
                i:last-child{
                    margin-right: 10px;
                     &:hover {
                        cursor: pointer;
                        color:@baseColor;
                    }
                }
            }
        }
        
        .table-body {
            border-left: 1px solid @borderColor;
            border-top: 1px solid @borderColor;
            position: relative;
            width: 100%;
            height: calc(~'100% - 56px');
            overflow: hidden;
            .option-wrap-scroll {
                width: 100%;
                height: 100%;
            }
            .body_warp{
                width: 100%;
                height: 100%;
                overflow: visible;
                .body_header{
                    position: relative;
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    padding: 20px;
                    border-bottom: 1px solid @borderColor;
                }
                .auth-pro {
                    position: relative;
                    border-bottom: 1px solid @borderColor;
                    padding: 20px 30px;
                    .father-box{
                        font-weight: bold;
                        width: 100px;
                        color: @text;
                    }
                    .auth-row {
                        position: relative;
                        margin: 15px 0 0 20px;
                        width: 100%;
                        display: flex;
                        flex-direction: row;
                        flex-wrap: wrap;
                        
                    }
                    .children-box{
                        margin-right: 20px;
                        color: @textLight;
                    }
                }
            }
        }
    }
</style>
