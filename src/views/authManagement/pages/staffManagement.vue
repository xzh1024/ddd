<template>
    <div class="staff-bc">
        <div class="table-header">
            <el-button v-if="configEditable" size="small" type="primary" round
                       @click="addClick()">新增成员
            </el-button>
            <el-input
                class="search_tag"
                placeholder="搜索用户名\手机号"
                ref="search_input"
                @input="searchInputChange"
                @clear="searchInputChange"
                size="medium"
                v-model.trim="searchValue">
                <el-button slot="append" icon="el-icon-search" size="medium" ></el-button>
            </el-input>
        </div>
        <div class="body-wrap">
            <div :class="showPagination ? 'table-wrap cumput-height' : 'table-wrap'">
                <loading v-if="isLoading"></loading>
                <el-table
                    v-else :data="tableData"
                    :style="{'width': '100%','border-left':'0!important'}" ref="cusTable"
                    border v-scroll:table
                >
                    <template v-for="(col, index) in columnData" :resizable="false">
                        <!-- 操作列/自定义列 -->
                        <el-table-column v-if="col.slot" :key="index" label="制作人" width="200" align="left">
                            <template slot-scope="scope">
                                <div class="slot-temp">
                                    <i v-if="configEditable" title="编辑账号" @click="editStaff(scope)" class="el-icon-edit-outline"></i>
                                    <i v-if="configDeleteable && scope.row.mobile != selfmobile" title="删除账号" @click="deleteStaffClick(scope)" class="icon-user-forbidden red-i"  slot="reference"></i>
                                </div>
                            </template>
                        </el-table-column>
                        <!-- 普通列 -->
                        <el-table-column
                            v-else
                            :key="index"
                            :prop="col.prop"
                            :label="col.label"
                            show-overflow-tooltip
                            :resizable="false"
                            align="left"
                        ></el-table-column>
                    </template>
                    <div slot="empty">
                        <no-data type='member'></no-data>
                    </div>
                </el-table>
            </div>
            <pagination  v-if="showPagination" :params='paginationParams' class="pagin-div"
                            @handleCurrentChange='handleCurrentChange'></pagination>
        </div>
        <StaffDialog v-if="staffDialogShow" key = 'dialog' ref="dialog" @handLoading="handLoading" @reloadList="reloadList" @dialogClose="staffDialogShow = false"></StaffDialog>
        <BatchStaffDialog ref="batchDialog"></BatchStaffDialog>
        <AddAcount v-if="addStaffDialogShow" key = 'addDialog' ref="addDialog" @reloadList="reloadList" @dialogClose="addStaffDialogShow = false"></AddAcount>
        <DeleteAccount v-if="deleteDialogVisible" key = 'deleteDialog' ref="deleteDialog" @reloadList="reloadList" @dialogClose="deleteDialogVisible = false"></DeleteAccount>
    </div>
</template>

<script>
import Table from '@components/eleUI/table'
import CusBar from '@components/cusUI/selectBar'
import StaffDialog from '../components/staffDialog'
import BatchStaffDialog from '../components/batchStaffDialog'
import AddAcount from '../components/addStaff'
import DeleteAccount from '../components/deleteAccount'
import {Debounce} from '@libs/js/utils';
import {Request} from '../service/http'
import {mapState, mapMutations,mapActions} from 'vuex';
import _ from 'lodash'
    export default {
        name: "staffManagement",
        data() {
            let pageAuthConfig = sessionStorage.getItem("pageAuthConfig") ? JSON.parse(sessionStorage.getItem("pageAuthConfig")) : {};
            let selfData = sessionStorage.getItem("userData") ? JSON.parse(sessionStorage.getItem("userData")) : {};
            return {
                columnData: [
                    {
                        label: '用户名',
                        prop: 'name',
                    },
                    {
                        label: '绑定码',
                        prop: 'bind_code',
                    },
                    {
                        label: '手机',
                        prop: 'mobile',
                    },
                    {slot: 'operate'}
                ],
                tableData: [
                    {}
                ],
                page: 1,
                page_size: 20,
                count: 0,
                searchValue: '',
                isLoading: false,
                auth_id:'',
                staffDialogShow:false,
                addStaffDialogShow:false,

                
                deleteDialogVisible:false,
                

                configEditable:pageAuthConfig.account_add || false,
                configDeleteable:pageAuthConfig.account_jy || false,
                selfmobile:selfData.mobile || ''
            };
        },
        computed: {
            ...mapState('auths',['roleListIndex','roleList']),
            paginationParams(){
                return  {pageSize:this.page_size,page:this.page,total:this.count}
            },
            showPagination(){
                return  this.count / this.page_size > 1
            }
        },
        watch:{
            roleListIndex:{
                handler(val,oldval){
                    if(this.roleList && this.roleList.length){
                        this.auth_id = this.roleList[this.roleListIndex].auth_id;
                        this.getList()
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
                        this.getList()
                    }else{
                        this.isLoading = true
                    }
                },
                immediate:true
            },
        },
        components: {
            Table,
            CusBar,
            StaffDialog,
            BatchStaffDialog,
            AddAcount,
            DeleteAccount
        },
        methods: {
            ...mapActions('auths',['loadRoleList']),
            getList(data={}) {
                let params={
                    page:data.page || this.page,
                    page_size: data.size || this.page_size,
                    auth_id:data.auth_id || this.auth_id
                };
                if(this.searchValue.length){
                    params.search = this.searchValue
                }
                this.isLoading=true;
                Request.getUserList(params)
                .then(res=>{
                    this.isLoading=false;
                    if(res.err_code === 0){
                        this.tableData = res.data;
                        this.count = res.page.count
                    }else{
                        // console.log('出错了',res.err_message)
                    }
                }).catch(err => {
                    this.isLoading=false;
                    console.log('出错了',err)
                });
            },
            reloadList(){
                this.page = 1;
                this.getList()
            },
            handleCurrentChange(page) {
                this.page = page;
                this.getList({page:page})
            },
            addClick(){
                this.addStaffDialogShow = true;
                this.$nextTick(function(){this.$refs.addDialog.open()})
            },
            editStaff(item) {
                let rowdata = _.cloneDeep(item.row);
                this.staffDialogShow = true;
                this.$nextTick(function(){this.$refs.dialog.open(rowdata)})
            },
            
            deleteStaffClick(item){
                this.deleteDialogVisible = true;
                this.$nextTick(function(){this.$refs.deleteDialog.open(item)})
            },
            batchEdit() {
                this.$refs.batchDialog.open()
            },
            searchInputChange: _.throttle(function() {
                this.page = 1;
                this.getList({page:1})
            }, 500),
            handLoading(statu){
                this.isLoading=statu
            }
        },
        mounted() {
            // this.getList();
        },
        beforeDestroy() {
        }
    };
</script>

<style lang="less" scoped>
    .staff-bc {
        width:  100%;
        height: 100%;
        position: relative;
        .table-header {
            position: relative;
            width: 100%;
            height: 56px;
            display: flex;
            flex-direction: row-reverse;
            align-items: center;
            padding-right:20px;
            >button{
                margin-left:20px ;
            }
            .input_suffix{
                width: 34px;
                height: 34px;
                background: rgba(29, 32, 33, 0.3);
                border-radius: 0px 4px 4px 0px;
                text-align: center;
                line-height: 34px;
                font-size: 14px;
                color:@textLight;
                border-left: 1px solid #1D2021;
                &:hover{
                    cursor: pointer;
                }
            }
            .search_tag{
                overflow: hidden;
                width:240px;
                /deep/.el-input-group__append{
                    background: rgba(29, 32, 33, 0.3);
                    border-radius: 0px 4px 4px 0px;
                    padding: 0 15px;
                    .el-button{
                        border:none;
                        &:hover{
                            color: @textLighter;
                            background: none;
                            .el-icon-search{
                                color: @textLighter;
                            }
                        }
                    }
                }
            }
        }
        .body-wrap{
            position: relative;
            border-left: 1px solid @borderColor;
            height: calc(~'100% - 56px');
            width: 100%;
            overflow: hidden;
            .table-wrap {
                position: relative;
                height: 100%;
                width: 100%;
                overflow:visible;
            }
            .cumput-height{
                height: calc(~'100% - 56px');
            }
            .pagin-div{
                position: fixed;
                bottom: 12px;
                right: 12px;
            }
            .slot-temp {
                text-align: left;
                i {
                    font-size: 14px;
                }
                .red-i{
                    color:@error;
                    margin-left: 15px;
                }
            }
        }
        .delete_dialog{
            /deep/.el-form{
                padding: 20px;
            }
        }
    }
</style>
