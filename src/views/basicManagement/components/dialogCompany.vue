<template>
    <div class="dialog-company">
        <el-dialog
            :title="title"
            :visible.sync="visible"
            :close-on-click-modal="false"
            :lock-scroll="false"
            @closed="closed"
            width="475px"
        >
            <el-form :model="formModel" :rules="rules" ref="companyForm" label-width="80px">
                <el-form-item label="公司名称" prop="name">
                    <el-input v-model.trim="formModel.name" clearable placeholder="请输入公司名称"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button size="medium" round @click="hide">取消</el-button>
                <el-button type="primary" size="medium" round @click="submitForm">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { CompanyService } from "../service/http";

export default {
    name: "dialogCompany",
    data() {
        return {
            visible: false,
            templateType: "", // add、edit
            formModel: {
                name: "",
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: "公司名称不能为空",
                        trigger: "change",
                    },
                ],
            },
        };
    },
    computed: {
        title() {
            const templateType = this.templateType;
            let title = "";
            switch (templateType) {
                case "add":
                    title = "新增公司";
                    break;
                case "edit":
                    title = "编辑公司";
                    break;
                default:
                    title = "";
            }
            return title;
        },
    },
    methods: {
        show(model) {
            if (model) {
                this.templateType = "edit";
                Object.assign(this.formModel, model);
            } else {
                this.templateType = "add";
            }
            this.visible = true;
        },
        hide() {
            this.visible = false;
        },
        closed() {
            this.templateType = "";
            this.resetForm();
        },
        resetForm() {
            this.$refs.companyForm.resetFields();
        },
        submitForm() {
            this.$refs.companyForm.validate((valid) => {
                if (valid) {
                    const templateType = this.templateType;
                    if (templateType === "add") {
                        this.addCompany();
                    } else if (templateType === "edit") {
                        this.editCompany();
                    }
                } else {
                    return false;
                }
            });
        },
        addCompany(row) {
            const params = { ...this.formModel };
            CompanyService.createCompany(params).then((res) => {
                const { err_code } = res;
                if (err_code === 0) {
                    this.messageSuccess("新增公司成功!");
                    this.$emit("update");
                    this.hide();
                }
            });
        },
        editCompany(row) {
            const params = { ...this.formModel };
            CompanyService.updateCompany(params).then((res) => {
                const { err_code } = res;
                if (err_code === 0) {
                    this.messageSuccess("编辑公司成功!");
                    this.$emit("update");
                    this.hide();
                }
            });
        },
        messageSuccess(msg) {
            this.$message({
                type: "success",
                message: msg,
            });
        },
    },
};
</script>

<style lang='less' scoped>
.dialog-company {
    /deep/ .el-dialog {
        .el-form {
            padding: 20px;
            .el-form-item {
                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }
}
</style>
