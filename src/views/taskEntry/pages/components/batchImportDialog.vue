<template>
    <div class="batch-import-dialog">
        <el-dialog
            title="批量导入任务"
            :visible.sync="visible"
            :close-on-click-modal="false"
            @closed="closed"
            width="600px"
        >
            <div class="batch-import">
                <div class="batch-import-left">
                    <div class="batch-import-title">操作步骤</div>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-dot">1</div>
                            <div class="timeline-content">
                                点击
                                <a
                                    href="https://front-static-1301661509.cos.ap-chongqing.myqcloud.com/%E4%BB%BB%E5%8A%A1%E4%B8%8A%E4%BC%A0%E6%A8%A1%E6%9D%BF.xlsx"
                                    download="任务模板"
                                >
                                    <el-button type="primary" size="mini" plain round>下载任务模板</el-button>
                                </a>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot">2</div>
                            <div class="timeline-content">编辑任务模板</div>
                            <div class="timeline-tail"></div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-dot">3</div>
                            <div class="timeline-content">上传任务文件</div>
                            <div class="timeline-tail"></div>
                        </div>
                    </div>
                </div>
                <div class="batch-import-right">
                    <div class="upload-cover">
                        <upload
                            :initParams="uploadParams"
                            :hasFile="hasFile"
                            :directory="directory"
                            :title="fileModel.name"
                            btn="点击或拖拽到此区域上传任务文件"
                            @fileUploadSuccess="uploadSuccess"
                            @deleteImg="deleteFile"
                        >
                            <div slot="upload" class="file-name">{{fileModel.name}}</div>
                        </upload>
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="medium" round @click="hide">取消</el-button>
                <el-button
                    type="primary"
                    size="medium"
                    round
                    @click="submit"
                    :disabled="!fileModel.id"
                >下一步</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import Upload from "@components/upload/upload";

export default {
    name: "batchImportDialog",
    components: { Upload },
    data() {
        return {
            visible: true,
            color: "#FFA726",
            fileModel: {
                name: "",
                id: "",
            },
            hasFile: false,
            directory: "taskEntry",
            uploadParams: {
                attrs: {
                    accept: "application/vnd.ms-excel,.xls,.xlsx",
                },
            },
        };
    },
    methods: {
        hide() {
            this.visible = false;
        },
        closed() {
            this.$emit("hide");
        },
        uploadSuccess(file) {
            this.fileModel.name = file.realname;
            this.fileModel.id = file.id;
            this.hasFile = true;
        },
        deleteFile() {
            this.fileModel.name = "";
            this.fileModel.id = "";
            this.hasFile = false;
        },
        submit() {
            if (!this.fileModel.id) return;
            this.$emit("showTable", this.fileModel.id);
        },
    },
};
</script>

<style lang='less' scoped>
.batch-import-dialog {
    @height: 240px;
    @fileHeight: 180px;
    @fileWidth: 278px;
    .batch-import {
        display: flex;
        height: @height;
        box-sizing: border-box;
        padding: 20px;
        .batch-import-left {
            flex: 1;
            // height: 100%;
            margin: 10px 0;
            .batch-import-title {
                margin-bottom: 22px;
            }
            .timeline {
                // padding: 10px;
                .timeline-item {
                    position: relative;
                    display: flex;
                    align-items: center;
                    margin-top: 30px;
                    &:first-child {
                        margin-top: 0;
                    }
                    .timeline-dot {
                        position: relative;
                        width: 24px;
                        height: 24px;
                        line-height: 20px;
                        border: 2px solid @textLight;
                        font-size: 12px;
                        text-align: center;
                        color: @textLight;
                        border-radius: 50% 50%;
                    }
                    .timeline-content {
                        margin-left: 10px;
                        a {
                            position: relative;
                            /deep/ .el-button {
                                position: absolute;
                                margin-left: 10px;
                                top: -6px;
                            }
                        }
                    }
                    .timeline-tail {
                        width: 0;
                        height: 30px;
                        border-left: 2px solid @textLight;
                        position: absolute;
                        left: 11px;
                        bottom: 100%;
                    }
                }
            }
        }
        .batch-import-right {
            height: 100%;
            margin-left: 30px;
            display: flex;
            align-items: center;
            overflow: hidden;
            .upload-cover {
                position: relative;
                width: @fileWidth;
                height: @fileHeight;
                background-color: #3d4245;
                border-radius: @radius;
                /deep/ .drop-upload-area {
                    border: none;
                }
                &:hover {
                    cursor: pointer;
                }
                .file-name {
                    width: 100%;
                    height: @fileHeight;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 20px;
                    box-sizing: border-box;
                }
            }
        }
    }
}
</style>