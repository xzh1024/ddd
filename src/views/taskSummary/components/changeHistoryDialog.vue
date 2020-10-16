<template>
    <div class="change_histroy_dialog">
        <el-dialog :title="type == 'node' ? '排期变更日志' : '报价变更日志'" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="1100px" @close="dialogClose">
            <div class="body-wrap">
                <loading v-if="isLoading"></loading>
                <el-table
                    v-else :data="tableData" v-scroll:table
                    style="width: 100%;height:100%" ref="custable" row-key="tableID"
                    border
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                    default-expand-all
                >
                    <el-table-column key="time" prop="created_at" label="时间" :min-width="lable_width * 1.3"
                        show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column key="name" prop="user" label="用户名" :min-width="lable_width"
                        show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column key="mobile" prop="mobile" label="手机号" :min-width="lable_width"
                        show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column key="content" prop="text" label="日志内容" :min-width="lable_width * 5"
                        show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <div slot="empty">
                        <no-data></no-data>
                    </div>
                </el-table>
                
            </div>

            <div slot="footer" class="dialog-footer">
                <pagination v-if="showPagination" class="pagination-wrap" :params="paginationParams"
                            @handleCurrentChange="handleCurrentChange"></pagination>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import {Request} from '../service/http'
    import _ from 'lodash'
    export default {
        name: 'changeHistroyDialog',
        data() {
            const user = JSON.parse(sessionStorage.userData) || {}
            return {
                dialogFormVisible: false,
                tableData:[],
                isLoading: false,
                lable_width:80,
                type:'price',
                page_size:20,
                page:1,
                count:0,
                id:'',
            }
        },
        computed: {
            paginationParams(){
                return  {pageSize:this.page_size,page:this.page,total:this.count}
            },
            showPagination(){
                return  this.count / this.page_size > 1
            }
        },
        methods: {
            open(row) {
                this.level = row.tableLevel
                this.id = row.uuid
                if(row.is_node){
                    this.type = 'node'
                }
                this.$nextTick(function(){
                    this.dialogFormVisible = true
                    this.getList()
                })
            },
            getList(){
                this.isLoading = true
                Request.getChangeHistroy({
                    busi_id: this.id,
                    busi_type:this.type == 'node' ? 'node' : 'taskchild',
                    page:this.page,
                    page_size:this.page_size
                })
                .then(res => {
                    this.isLoading=false
                    if (res.err_code === 0) {
                        this.dialogFormVisible = true;
                        this.count = res.page.count
                        let temp = res.data
                        temp.forEach(ele=>{
                          ele.text = ele.text.replace(" 00:00:00","") 
                          ele.text = ele.text.replace(" 23:59:59","") 
                        })
                        this.tableData = temp;
                    }
                })
                .catch(err => {
                    this.isLoading=false
                    console.log('出错了', err)
                })
            },
            dialogClose() {
                this.$emit('dialogClose')
            },
            handleCurrentChange(page){
                this.page = page;
                this.$nextTick(function(){
                    this.getList()
                })
            }
        },
        
    }
</script>
<style lang="less" scoped>
    .change_histroy_dialog {
        .body-wrap {
            height: 450px;
            /deep/ .el-table {
                    td {
                        padding: 13px 2px 13px 2px !important;
                        height: 50px;
                    }
                    th {
                        padding: 13px 2px 13px 2px !important;
                        height: 50px;
                    }
                .slot-temp{
                    display: flex;
                    flex-direction: row;
                    .notice{
                        background: @scrollHover;
                        width: 60px;
                        height: 22px;
                        line-height: 22px;
                        text-align: center;
                    }
                }
            }
        }        

    }
    .dialog-footer{
        height: 37px;
        text-align: center;
        text-align: right;
        .pagination-wrap{
           position: relative;
        }
    }

</style>
