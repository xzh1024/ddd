<template>
    <div class="dialog-ducment">
        <el-dialog
            title="上传文档"
            :visible.sync="visible"
            :close-on-click-modal="false"
            :lock-scroll="false"
            @closed="closed"
            width="475px"
        >
            <el-form :model="formModel" ref="ducmentForm" label-width="80px">
                <!-- <el-form-item label="文档名称" prop="title" :required="true">
                    <el-input v-model.trim="formModel.title" clearable></el-input>
                </el-form-item> -->
                <el-form-item label="本地文件" prop="file_id" :required="true">
                    <div class="upload-cover">
                        <upload
                            :initParams="uploadParams"
                            :hasFile="hasFile"
                            :directory="directory"
                            :title="formModel.title"
                            @focusUpload="imgIsEmpty = false"
                            @fileUploadSuccess="uploadSuccess"
                            @deleteImg="deleteFile"
                        >
                            <div slot="upload" class="document-name">
                                <p>{{formModel.title}}</p>
                            </div>
                        </upload>
                    </div>
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
    import {DocumentService} from "../service/http";
    import Upload from "@components/upload/upload";
    
    export default {
        name: "dialogDucment",
        components: {Upload},
        data() {
            return {
                visible: true,
                formModel: {
                    title: "",
                    file_id: "",
                    // file_name: "",
                },
                attachments: [],
                hasFile: false,
                directory: "document",
                uploadParams: {
                    attrs: {
                        accept:
                            "application/msword,text/csv,application/vnd.ms-works,application/vnd.ms-powerpoint,application/pdf,application/vnd.ms-excel,aplication/zip,.zip,.docx,.xlsx",
                    }, // 限定上传文件格式
                },
                imgIsEmpty: false,
            };
        },
        methods: {
            hide() {
                this.visible = false;
            },
            closed() {
                this.$emit("hide");
            },
            resetForm() {
                this.$refs.ducmentForm.resetFields();
            },
            messageSuccess(msg) {
                this.$message({
                    type: "success",
                    message: msg,
                });
            },
            messageError(msg) {
                this.$message({
                    type: "error",
                    message: msg,
                });
            },
            submitForm() {
                const {title, file_id} = this.formModel;
                if (title === "") {
                    this.messageError("文件不能为空!");
                    return false;
                } else if (file_id === "") {
                    this.messageError("文件不能为空!");
                    return false;
                }
                this.addDocument();
            },
            addDocument(row) {
                const params = {...this.formModel};
                DocumentService.addDocument(params).then((res) => {
                    const {err_code} = res;
                    if (err_code === 0) {
                        this.messageSuccess("上传文件成功!");
                        this.$emit("update");
                        this.hide();
                    }
                });
            },
            uploadSuccess(file) {
                this.formModel.title = file.name;
                this.formModel.file_id = file.id;
                this.hasFile = true;
            },
            deleteFile() {
                this.formModel.title = "";
                this.hasFile = false;
            },
        },
    };
</script>

<style lang='less' scoped>
    .dialog-ducment {
        @height: 160px;
        /deep/ .el-dialog .el-dialog__body {
            padding-bottom: 10px !important;
            .el-form {
                padding: 20px;
                .el-form-item {
                    &:last-child {
                        margin-bottom: 0;
                    }
                }
            }
            .el-form-item__label {
                line-height: @height;
            }
        }
        .upload-cover {
            position: relative;
            width: 100%;
            height: @height;
            -webkit-border-radius: @radius;
            -moz-border-radius: @radius;
            border-radius: @radius;
            &:hover {
                cursor: pointer;
            }
            .document-name {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                > p {
                    padding: 10px 20px;
                    line-height: 22px;
                    text-align: justify;
                }
            }
        }
    }
</style>
