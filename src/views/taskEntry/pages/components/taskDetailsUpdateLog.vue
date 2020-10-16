<!-- 日志记录组件 -->
<template>
    <div class="task-details-update-log">
        <el-dialog title="任务修改日志记录" v-if="!isLoading" :visible.sync="taskDetailsUpdateLogsDialog"  :close-on-click-modal='false' width="920px">
            <div class="dialog-no-footer">
                <div class="table-log">
                    <el-table v-if="!isLoading" :data="logTable" border v-scroll:table>
                        <el-table-column fixed prop="created_at" label="时间"></el-table-column>
                        <el-table-column fixed prop="user_name" label="用户名"></el-table-column>
                        <el-table-column fixed prop="mobile" label="手机号"></el-table-column>
                        <el-table-column fixed prop="context" label="日志内容">
                            <template slot-scope="scope">
                                <span class="content" :title="scope.row.context">{{ scope.row.context }}</span>
                            </template>
                        </el-table-column>
                        <div slot="empty">
                            <no-data></no-data>
                        </div>
                    </el-table>
                </div>
                <div>
                    <pagination :params="pageParams" @handleCurrentChange="changePage" ></pagination>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {TaskEntryRequest} from "../../service/http";
export default {
    name: "taskDetailsUpdateLog",
    props: {
    },
    computed: {
    },
    watch: {
    },
    data() {
        return {
            isLoading: true,
            taskDetailsUpdateLogsDialog: false,
            pageParams: {
                page: 1,
                pageSize: 10,
                total: 0
            },
            logTable: [],
            taskId:null
        };
    },
    created() {},
    mounted() {
    },
    methods: {
        changePage(page){
            this.pageParams.page = page;
            this.getTaskLogTableData(this.taskId);
        },
        // 打开日志面板
        open(data){
            this.taskDetailsUpdateLogsDialog = true;
            this.taskId = data.uuid;
            this.getTaskLogTableData(this.taskId);
        },
        async getTaskLogTableData(id){
            let params = {
                id: id,
                page: this.pageParams.page,
                page_size: this.pageParams.pageSize
            };
            const data = await TaskEntryRequest.getLogsTableList(params);
            if (data.err_code === 0) {
                this.isLoading = false;
                this.logTable = data.data || [];
                this.pageParams.total = data.page && data.page.count;
                this.logTable&& this.logTable.forEach(item=>{
                    let endTime = item.created_at && item.created_at.substring(0,10);
                    this.$set(item, "created_at", endTime);
                });
                this.pageParams.total = data.page && data.page.count;
            }
        }
    }
};
</script>
<style lang="less" scoped>
.task-details-update-log{
    .dialog-no-footer {
        height: 680px;
        padding: 20px;
        .table-log {
            height: calc(100% - 44px);
        }
    }
    /deep/.el-table .cell{
    display: flex;
    .content{
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: default;
    }
}
    .pagination-wrap{
        bottom: 20px;
    }
}
</style>
