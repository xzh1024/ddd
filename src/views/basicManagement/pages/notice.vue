<template>
    <div class="notice-wrap" v-if="pageAuthConfig.notice">
        <el-button-group class="el-button-right">
            <el-button size="small" type="primary" round @click="showDialog">新建公告</el-button>
        </el-button-group>
        <div class="loading-container">
            <div class="table-container" ref="noticeTable">
                <Table
                    v-if="tableData.length"
                    :columnData="columnData"
                    :tableData="tableData"
                    :serialNumber="true"
                    :border="true"
                    :pages="pageParams"
                >
                    <el-table-column slot="operate" label="操作" width="200">
                        <template slot-scope="scope">
                            <i
                                class="el-icon-delete pointer"
                                title="删除"
                                @click="deleteNotice(scope.row)"
                            ></i>
                            <i
                                class="el-icon-edit-outline pointer m-l10"
                                title="编辑"
                                @click="handleEdit(scope.row)"
                            ></i>
                        </template>
                    </el-table-column>
                </Table>
            </div>
            <no-data v-show="!tableData.length && !isLoading"></no-data>
            <loading v-show="isLoading"></loading>
        </div>
        <pagination :params="pageParams" @handleCurrentChange="handleCurrentChange"></pagination>
        <dialog-notice
            v-if="noticeVisible"
            :id="noticeId"
            :templateType="templateType"
            @update="getData"
            @hide="hideDialog"
        ></dialog-notice>
    </div>
</template>

<script>
import { NoticeService } from "../service/http";
import Table from "@components/eleUI/table";
import DialogNotice from "../components/dialogNotice";

export default {
    name: "notice",
    components: { Table, DialogNotice },
    data() {
        return {
            pageAuthConfig: sessionStorage.pageAuthConfig
                ? JSON.parse(sessionStorage.pageAuthConfig)
                : {},
            pageParams: {
                page: 1,
                pageSize: 20,
                total: 0
            },
            isLoading: true,
            columnData: [
                {
                    label: "公告名",
                    prop: "title",
                    width: 350
                },
                {
                    label: "建立时间",
                    prop: "craete_date",
                    width: 180
                },
                {
                    slot: "operate"
                }
            ],
            tableData: [],
            noticeVisible: false,
            noticeId: 0,
        };
    },
    created() {
        this.getData();
    },
    methods: {
        initPage() {
            this.pageParams.page = 1;
            this.getData();
        },
        getData() {
            this.isLoading = true;
            const { page = 1, pageSize = 20 } = this.pageParams;
            const params = {
                page,
                page_size: pageSize
            };
            NoticeService.getNoticeList(params)
                .then((res) => {
                    const { err_code, data = [], page } = res;
                    if (err_code === 0) {
                        this.tableData = data;
                        this.pageParams.total = page.count || 0;
                    }
                    this.isLoading = false;
                })
                .catch((err) => {
                    this.isLoading = false;
                });
        },
        deleteNotice(row) {
            const _this = this;
            this.$Tools.deleteConfirm(
                this,
                { text: "确定删除此公告吗?", title: "提示" },
                async () => {
                    const data = await NoticeService.deleteNotice({
                        id: row.id
                    });
                    data.info = "删除公告成功!";
                    if (data.err_code === 0) {
                        _this.initPage();
                    }
                    return data;
                }
            );
        },
        handleEdit(row) {
            if (!row.id) return;
            this.templateType = "edit";
            this.noticeId = row.id;
            this.noticeVisible = true;
        },
        showDialog() {
            this.templateType = "add";
            this.noticeVisible = true;
        },
        hideDialog() {
            this.noticeVisible = false;
        },
        handleCurrentChange(currentPage) {
            this.pageParams.page = currentPage;
            this.getData();
            const noticeTable = this.$refs.noticeTable;
            const noticeEle = noticeTable ? document.querySelector(`.${noticeTable.className} .el-table__body-wrapper`) : '';
            if (noticeEle) {
                noticeEle.scrollTop = 0;
            }
        }
    }
};
</script>

<style lang="less" scoped>
.notice-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .pointer {
        cursor: pointer;
    }
    .m-b10 {
        margin-bottom: 10px;
    }
    .m-l10 {
        margin-left: 10px;
    }
    /deep/ .el-button-right {
        margin: 12px 30px;
        .el-button {
            float: right;
        }
    }
    .loading-container {
        position: relative;
        flex: 1;
        width: 100%;
        overflow: hidden;
        .table-container {
            position: relative;
            width: 100%;
            height: 100%;
            /deep/ .el-table {
                height: 100%;
            }
        }
    }
    .pagination-wrap {
        position: relative;
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
