<template>
    <div class="work-type-wrap" v-if="pageAuthConfig.basic_category">
        <el-button-group class="el-button-right">
            <el-button size="small" type="primary" round @click="addCategory">添加类型</el-button>
        </el-button-group>
        <div class="loading-container">
            <el-scrollbar class="table-container">
                <el-table
                    v-if="tableData.length"
                    :data="tableData"
                    style="width: 100%"
                    lazy
                    :show-header="false"
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                    :row-key="getRowKeys"
                    :expand-row-keys="expands"
                >
                    <el-table-column prop="name" label="名称" min-width="540">
                        <template slot-scope="scope">
                            <el-input
                                class="input-style"
                                :class="{'input-border-none': scope.row.noBorder}"
                                v-model.trim="scope.row.name"
                                @focus="handleFocus($event, scope.row)"
                                @blur="handleBlur($event, scope.row)"
                                :title="scope.row.name"
                            ></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column width="200">
                        <template slot-scope="scope">
                            <div class="operate-button">
                                <i class="el-icon-plus" v-if="scope.row.children" title="添加分类" @click="addCategory(scope.row)"></i>
                                <i
                                    class="el-icon-delete"
                                    title="删除"
                                    @click="deleteNotice(scope.row)"
                                ></i>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-scrollbar>
            <no-data v-show="!tableData.length && !isLoading"></no-data>
            <loading v-show="isLoading"></loading>
        </div>
    </div>
</template>

<script>
import { WorkService } from "../service/http";

export default {
    name: "work",
    data() {
        return {
            isLoading: true,
            tableData: [],
            genreModel: {
                name: "新增类型",
            },
            classifyModel: {
                name: "新增分类",
                parent_id: 0,
            },
            pageAuthConfig: sessionStorage.pageAuthConfig
                ? JSON.parse(sessionStorage.pageAuthConfig)
                : {},
            // 要展开的行，数值的元素是row的key值
            expands: [],
        };
    },
    created() {
        this.getData();
    },
    methods: {
        // 获取row的key值
        getRowKeys(row) {
            return row.id;
        },
        getData() {
            this.isLoading = true;
            return WorkService.getCategoryTree()
                .then((res) => {
                    const { err_code, data = [] } = res;
                    if (err_code === 0) {
                        this.formatData(data);
                    }
                    this.isLoading = false;
                })
                .catch((err) => {
                    this.isLoading = false;
                });
        },
        formatData(list) {
            list.forEach((genreItem) => {
                genreItem.noBorder = true;
                const classifys = genreItem.children;
                if (Array.isArray(classifys)) {
                    classifys.forEach((classify) => {
                        classify.noBorder = true;
                    });
                }
            });
            this.tableData = list;
        },
        async addCategory(row) {
            let params = { ...this.genreModel };
            let msg = "添加类型成功";
            if (row.children) {
                params = { ...this.classifyModel, parent_id: row.id };
                msg = "添加分类成功";
            }
            const { err_code } = await WorkService.createCategory(params);
            if (err_code === 0) {
                this.messageSuccess(msg);
                await this.getData();
                this.expands = [String(row.id)];
            }
        },
        handleFocus(event, row) {
            row.noBorder = false;
        },
        handleBlur(event, row) {
            row.noBorder = true;
            const { id, name } = row;
            if (!id) return;
            if (name === "") {
                let msg = "类型名称不能为空!";
                if (row.parent) {
                    msg = "分类名称不能为空!";
                }
                this.messageError(msg);
                return false;
            }
            const params = { id, name };
            WorkService.updateCategory(params).then((res) => {
                const { err_code } = res;
                if (err_code === 0) {
                    let msg = "更新类型成功!";
                    if (row.parent) {
                        msg = "更新分类成功!";
                    }
                    this.messageSuccess(msg);
                }
            });
        },
        deleteNotice(row) {
            if (!row.id) return;
            let content =
                "类型的删除会将下属的所有二级分类全部删除，确定删除此类型吗?";
            let msg = "删除类型成功!";
            if (row.parent) {
                content = "确定删除此分类吗?";
                msg = "删除分类成功!";
            }
            const _this = this;
            this.$Tools.deleteConfirm(
                this,
                { text: content, title: "提示" },
                async () => {
                    const data = await WorkService.deleteCategory({
                        id: row.id,
                    });
                    data.info = msg;
                    if (data.err_code === 0) {
                        _this.getData();
                    }
                    return data;
                }
            );
        },
        messageSuccess(msg) {
            this.$message.success(msg);
        },
        messageError(msg) {
            this.$message.error(msg);
        },
    },
};
</script>

<style lang="less" scoped>
.work-type-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    /deep/ .el-button-right {
        margin: 12px 30px;
        .el-button {
            float: right;
        }
    }
    .m-b10 {
        margin-bottom: 10px;
    }
    .loading-container {
        position: relative;
        flex: 1;
        width: 100%;
        border-top: @border;
        overflow: hidden;
        .table-container {
            position: relative;
            width: 100%;
            height: 100%;
            .operate-button {
                margin-right: 35px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
            }
            .input-style {
                width: 500px;
            }
            /deep/ .el-icon-delete,.el-icon-plus {
                font-size: 14px;
                margin-left: 20px;
                cursor: pointer;
            }
            /deep/ .el-input__inner {
                background: transparent;
            }
            /deep/ .input-border-none .el-input__inner {
                border: 1px solid transparent;
            }
            /deep/ .el-table__row td {
                padding-top: 5px !important;;
                padding-bottom: 4px !important;;
            }
        }
    }
}
</style>
