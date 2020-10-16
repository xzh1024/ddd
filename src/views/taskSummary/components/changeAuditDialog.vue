<template>
    <div class="change_price_dialog">
        <el-dialog title="变更审核" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="1000px" @close="dialogClose">
            <div class="body-wrap">
                <loading v-if="isLoading"></loading>
                <el-table
                    v-else :data="tableData" v-scroll:table
                    style="width: 100%;height:100%" ref="custable" row-key="tableID"
                    border
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                    default-expand-all
                >
                    <el-table-column key="name" prop="name" label="任务名称" :min-width="lable_width*1.2"
                        show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column key="content" prop="text" label="变更内容" :min-width="lable_width * 4.5"
                        show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column :min-width="lable_width" label="操作" :resizable="false">
                        <template slot-scope="scope">
                            <div v-if="scope.row.status === 0" class="slot-temp">
                                <el-button type="primary" size="mini" @click="submit(scope.row,1)">通过</el-button>
                                <el-button type="default" size="mini" @click="submit(scope.row,2)">驳回</el-button>    
                            </div>
                            <div v-if="scope.row.status === 2" class="slot-temp">
                                <div class="notice back">已驳回</div>
                            </div>
                            <div v-if="scope.row.status === 1" class="slot-temp" >
                                <div class="notice">已通过</div>
                            </div>
                        </template>
                    </el-table-column>
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
        name: 'changeAuditDialog',
        data() {
            const user = JSON.parse(sessionStorage.userData) || {}
            return {
                dialogFormVisible: false,
                tableData:[
                ],
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
            open() {
                this.dialogFormVisible = true
                this.getList()
            },
            getList(){
                this.isLoading = true
                Request.auditChangeList({
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
            },
            submit(row,statu){
                this.isLoading = true
                Request.auditChange({
                    id:row.id,
                    audit:statu
                })
                .then(res => {
                    this.isLoading=false
                    if (res.err_code === 0) {
                        this.getList()
                        this.$message.success('操作成功')
                    }
                })
                .catch(err => {
                    this.isLoading=false
                    this.$message.error('出错了，请重试')
                    console.log('出错了', err)
                })
            }
        },
        
    }
</script>
<style lang="less" scoped>
    .change_price_dialog {
        .el-dialog {
            overflow: visible !important;
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
                        .back{
                            background: @backGroundLightExtra;
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
}
</style>
