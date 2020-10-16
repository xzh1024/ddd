<template>
    <div class="document-wrap" v-if="pageAuthConfig.document">
        <el-button-group class="el-button-right">
            <el-button size="small" type="primary" round @click="showDucmentDialog">上传文档</el-button>
        </el-button-group>
        <div class="loading-container">
            <div class="table-container" ref="documentTable">
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
                                @click="deleteDucment(scope.row)"
                            ></i>
                        </template>
                    </el-table-column>
                </Table>
            </div>
            <no-data v-show="!tableData.length && !isLoading"></no-data>
            <loading v-show="isLoading"></loading>
        </div>
        <pagination :params="pageParams" @handleCurrentChange="handleCurrentChange"></pagination>
        <dialog-ducment v-if="ducmentVisible" @update="getData" @hide="hideDucmentDialog"></dialog-ducment>
    </div>
</template>

<script>
import { DocumentService } from "../service/http";
import Table from "@components/eleUI/table";
import DialogDucment from "../components/dialogDucment";

export default {
    name: "ducment",
    components: { Table, DialogDucment },
    data() {
        return {
            isLoading: true,
            pageParams: {
                page: 1,
                pageSize: 20,
                total: 0,
            },
            columnData: [
                {
                    label: "文档名",
                    prop: "title",
                    width: "350",
                },
                {
                    label: "建立时间",
                    prop: "create_date",
                    width: "180",
                },
                { slot: "operate" },
            ],
            tableData: [],
            ducmentVisible: false,
            pageAuthConfig: sessionStorage.pageAuthConfig
                ? JSON.parse(sessionStorage.pageAuthConfig)
                : {},
        };
    },
    created() {
        this.getData();
    },
    methods: {
        messageSuccess(msg) {
            this.$message({
                type: "success",
                message: msg,
            });
        },
        initPage() {
            this.pageParams.page = 1;
            this.getData();
        },
        handleCurrentChange(currentPage) {
            this.pageParams.page = currentPage;
            this.getData();
            const documentTable = this.$refs.documentTable;
            const docEle = documentTable ? document.querySelector(`.${documentTable.className} .el-table__body-wrapper`) : '';
            if (docEle) {
                docEle.scrollTop = 0;
            }
        },
        getData() {
            this.isLoading = true;
            const { page = 1, pageSize = 20 } = this.pageParams;
            const params = {
                page,
                page_size: pageSize
            };
            DocumentService.getDocumentList(params)
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
        showDucmentDialog() {
            this.ducmentVisible = true;
        },
        hideDucmentDialog() {
            this.ducmentVisible = false;
        },
        deleteDucment(row) {
            const _this = this;
            this.$Tools.deleteConfirm(
                this,
                { text: "确定删除此文档吗?", title: "提示" },
                async () => {
                    const data = await DocumentService.deleteDocument({
                        id: row.id
                    });
                    data.info = "删除文档成功!";
                    if (data.err_code === 0) {
                        _this.initPage();
                    }
                    return data;
                }
            );
        }
    }
};
</script>

<style lang="less" scoped>
.document-wrap {
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
