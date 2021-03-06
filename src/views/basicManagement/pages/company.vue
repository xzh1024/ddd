<template>
    <div class="company-wrap" v-if="pageAuthConfig.basic_company">
        <el-button-group class="el-button-right">
            <el-button size="small" type="primary" round @click="createCompany">新建公司</el-button>
        </el-button-group>
        <div class="loading-container">
            <div class="table-container" ref="companyTable">
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
                                @click="deleteCompany(scope.row)"
                            ></i>
                            <i
                                class="el-icon-edit-outline pointer m-l10"
                                title="编辑"
                                @click="editCompany(scope.row)"
                            ></i>
                        </template>
                    </el-table-column>
                </Table>
            </div>
            <no-data v-show="!tableData.length && !isLoading"></no-data>
            <loading v-show="isLoading"></loading>
        </div>
        <pagination :params="pageParams" @handleCurrentChange="handleCurrentChange"></pagination>
        <dialog-company ref="dialogCompany" @update="initPage"></dialog-company>
    </div>
</template>

<script>
import { CompanyService } from "../service/http";
import Table from "@components/eleUI/table";
import DialogCompany from "../components/dialogCompany";

export default {
    name: "company",
    components: { Table, DialogCompany },
    data() {
        return {
            pageParams: {
                page: 1,
                pageSize: 20,
                total: 0,
            },
            isLoading: true,
            columnData: [
                {
                    label: "公司名",
                    prop: "name",
                    width: 180,
                },
                {
                    label: "参与项目",
                    prop: "projects",
                    width: 350,
                },
                {
                    slot: "operate",
                },
            ],
            tableData: [],
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
            const companyTable = this.$refs.companyTable;
            const companyEle = companyTable ? document.querySelector(`.${companyTable.className} .el-table__body-wrapper`) : '';
            if (companyEle) {
                companyEle.scrollTop = 0;
            }
        },
        getData() {
            this.isLoading = true;
            const { page = 1, pageSize = 20 } = this.pageParams;
            const params = {
                page,
                page_size: pageSize
            };
            CompanyService.getCompanyList(params)
                .then((res) => {
                    const { err_code, data = [], page } = res;
                    if (err_code === 0) {
                        this.pickList(data);
                        this.pageParams.total = page.count || 0;
                    }
                    this.isLoading = false;
                })
                .catch((err) => {
                    this.isLoading = false;
                });
        },
        pickList(list) {
            list.forEach((item) => {
                const { projects } = item;
                if (Array.isArray(projects)) {
                    item.projects = projects.join("，");
                }
            });
            this.tableData = list;
        },
        createCompany() {
            this.$refs.dialogCompany.show();
        },
        editCompany(row) {
            if (!row.id) return;
            this.$refs.dialogCompany.show(row);
        },
        deleteCompany(row) {
            const _this = this;
            this.$Tools.deleteConfirm(
                this,
                { text: "确定删除此公司吗?", title: "提示" },
                async () => {
                    const data = await CompanyService.deleteCompany({
                        id: row.id
                    });
                    data.info = "删除公司成功!";
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
.company-wrap {
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
