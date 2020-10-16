<template>
    <div class="main-task-template">
        <el-scrollbar class="main-task-scroll">
            <el-form :model="formModel" ref="companyForm" label-width="70px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="任务名称" prop="name">
                            <el-input v-model.trim="formModel.name" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="所属项目" prop="project_name">
                            <el-input v-model.trim="formModel.project_name" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="制作类型" prop="standard_name">
                            <el-input v-model.trim="formModel.standard_name" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="跟进人">
                            <div class="row-select" v-if="baseEditVisible">
                                <el-select
                                    v-model="formModel.follow_user.id"
                                    filterable
                                    placeholder=" "
                                >
                                    <el-option
                                        v-for="user in followUserOptions"
                                        :key="user.id"
                                        :label="user.name"
                                        :value="user.id"
                                        :disabled="user.is_update === 2"
                                    >
                                        <span>{{user.name}}</span>
                                        <cp-tip :disabled="user.is_update === 2"></cp-tip>
                                    </el-option>
                                </el-select>
                                <el-button
                                    type="primary"
                                    title="修改"
                                    icon="el-icon-edit"
                                    :disabled="!formModel.follow_user.id"
                                    @click="handleUpdateFollowUser"
                                ></el-button>
                            </div>
                            <el-select
                                v-else
                                v-model="formModel.follow_user.id"
                                placeholder=" "
                                :disabled="disabled"
                            >
                                <el-option
                                    :label="formModel.follow_user.name"
                                    :value="formModel.follow_user.id"
                                ></el-option>
                            </el-select>
                            <div class="follow-user-list">
                                <span
                                    v-for="(user, index) in formModel.follow_users"
                                    :key="index"
                                    title="历史跟进人"
                                >
                                    {{user.name}}
                                    {{formModel.follow_users.length > index+1 ? ',' : ''}}
                                </span>
                            </div>
                        </el-form-item>
                        <el-form-item label="预计完成" prop="expire_end_time" v-if="auth.auth_s">
                            <el-input v-model.trim="formModel.expire_end_time" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="CP管理" prop="cp_admin_name">
                            <div class="row-select" v-if="baseEditVisible || cpEditVisible">
                                <el-select
                                    v-model="formModel.cp_admin_id"
                                    filterable
                                    placeholder=" "
                                >
                                    <el-option
                                        v-for="user in cpAdminOptions"
                                        :key="user.id"
                                        :label="user.name"
                                        :value="user.id"
                                        :disabled="user.is_update === 2"
                                    >
                                        <span>{{user.name}}</span>
                                        <cp-tip :disabled="user.is_update === 2"></cp-tip>
                                    </el-option>
                                </el-select>
                                <el-button
                                    type="primary"
                                    title="修改"
                                    icon="el-icon-edit"
                                    :disabled="!formModel.follow_user.id"
                                    @click="handleUpdateCpAdmin"
                                ></el-button>
                            </div>
                            <el-select
                                v-else
                                v-model="formModel.cp_admin_id"
                                placeholder=" "
                                :disabled="disabled"
                            >
                                <el-option
                                    :label="formModel.cp_admin_name"
                                    :value="formModel.cp_admin_id"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="所属CP" prop="company_name">
                            <el-input v-model.trim="formModel.company_name" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="参考资料" prop="file">
                            <div class="file-box hide-file-btn">
                                <upload
                                    :auth="true"
                                    directory="custom-name"
                                    :init-params="uploadParams"
                                    :previewParams="previewParams"
                                    uploadId="data"
                                >
                                    <template slot="files" v-if="formModel.file && formModel.file.name">
                                        <div
                                            class="file-name"
                                            :title="formModel.file.name"
                                        >{{formModel.file.name}}</div>
                                        <div class="btn-groups">
                                            <i
                                                class="el-icon-view pointer"
                                                title="预览"
                                                v-if="formModel.file.fileType && formModel.file.fileType === 'img'"
                                                @click="previewFile(formModel.file)"
                                            ></i>
                                            <i
                                                class="el-icon-download pointer"
                                                title="下载"
                                                @click="download(formModel.file)"
                                            ></i>
                                        </div>
                                    </template>
                                    <template slot="files" v-else>无</template>
                                </upload>
                            </div>
                        </el-form-item>
                        <el-form-item label="参考原型">
                            <div class="file-box hide-file-btn">
                                <upload
                                    :auth="true"
                                    directory="custom-name"
                                    :init-params="uploadParams"
                                    :previewParams="previewParamsProto"
                                    uploadId="proto"
                                >
                                    <template slot="files" v-if="formModel.rsp_prototype_file && formModel.rsp_prototype_file.name">
                                        <div
                                            class="file-name"
                                            :title="formModel.rsp_prototype_file.name"
                                        >{{formModel.rsp_prototype_file.name}}</div>
                                        <div class="btn-groups">
                                            <i
                                                class="el-icon-view pointer"
                                                title="预览"
                                                v-if="formModel.rsp_prototype_file.fileType && formModel.rsp_prototype_file.fileType === 'img'"
                                                @click="previewFile(formModel.rsp_prototype_file)"
                                            ></i>
                                            <i
                                                class="el-icon-download pointer"
                                                title="下载"
                                                @click="download(formModel.rsp_prototype_file)"
                                            ></i>
                                        </div>
                                    </template>
                                    <template slot="files" v-else>无</template>
                                </upload>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="任务报价" prop="taskQuote">
                            <el-input v-model.trim="formModel.taskQuote" :disabled="disabled">
                                <template slot="append">人天</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="计划排期">
                            <el-input v-model="dateRangePicker" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="排期天数" prop="schedule_day">
                            <el-input v-model.trim="formModel.schedule_day" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="任务状态" prop="status">
                            <el-select v-model="formModel.status" :disabled="disabled">
                                <el-option
                                    v-for="item in statusOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <!-- <el-form-item label="单号" prop="odd">
							<el-input v-model.trim="formModel.odd" clearable :disabled="!auth.task_general_list"></el-input>
                        </el-form-item>-->
                        <el-form-item
                            label="实际开始"
                            prop="start_time"
                            v-if="!errorValues.includes(formModel.start_time)"
                        >
                            <el-input v-model.trim="formModel.start_time" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item
                            label="实际结束"
                            prop="end_time"
                            v-if="!errorValues.includes(formModel.end_time)"
                        >
                            <el-input v-model.trim="formModel.end_time" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="备注" prop="remark" v-if="auth.task_general">
                            <el-input
                                type="textarea"
                                class="resize-none"
                                v-model="formModel.remark"
                                maxlength="200"
                                show-word-limit
                                :autosize="{minRows: 4, maxRows: 4}"
                                :disabled="disabled"
                            ></el-input>
                        </el-form-item>
                        <el-form-item label="制作备注">
                            <div class="row-textarea">
                                <el-input
                                    type="textarea"
                                    class="resize-none"
                                    v-model="formModel.cp_remark"
                                    maxlength="200"
                                    show-word-limit
                                    :autosize="{ minRows: 4, maxRows: 4}"
                                    :disabled="!taskCpRemarkVisible"
                                ></el-input>
                                <el-button
                                    v-if="taskCpRemarkVisible"
                                    type="primary"
                                    title="更新"
                                    icon="el-icon-edit"
                                    :disabled="!formModel.cp_remark"
                                    @click="handleTaskCpRemark"
                                ></el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </el-scrollbar>
        <!-- 图片文件预览 -->
        <div class="file-preview">
            <div v-if="showPreviewDialog">
                <image-preview :visible.sync="showPreviewDialog" :data="previewData"></image-preview>
            </div>
        </div>
    </div>
</template>

<script>
import { SystemGlobalRequest } from "commonHttp";
import { TaskService } from "../service/http";
import Upload from "@components/upload/upload";
import ImagePreview from "@components/preview/imagePreview";
import { formatDate } from "@libs/js/utils";
import Service from "service";

export default {
    name: "mainTaskTemplate",
    props: {
        //1：甲方，2：乙方
        type: {
            type: Number,
            required: true,
        },
        task: {
            type: Object,
            required: true,
        },
        myTask: {
            type: Boolean,
            required: true,
        },
        myTaskCp: {
            type: Boolean,
            required: true,
        },
    },
    components: { Upload, ImagePreview },
    data() {
        return {
            auth: sessionStorage.pageAuthConfig
                ? JSON.parse(sessionStorage.pageAuthConfig)
                : {},
            disabled: true,
            errorValues: [null, undefined, ""],
            formModel: {
                name: "", //任务名称
                project_name: "", //所属项目
                standard_name: "", //制作类型
                cp_admin_id: "", //CP管理id
                cp_admin_name: "", //CP管理name
                company_name: "", //所属CP
                file: "", //obj
                rsp_prototype_file: "", //参考原型
                taskQuote: "", //任务报价
                expire_start_time: "", //预计开始时间
                expire_end_time: "", //预计结束时间
                schedule_day: "", //排期天数
                status: "", //任务状态 1 待报价 2 已报价 3已预警 4待确认 5已确认
                odd: "", //单号
                start_time: "", //实际开始
                end_time: "", //实际结束
                remark: "", //备注
                follow_users: [], //历史跟进人
                follow_user: {
                    id: "",
                    name: "",
                },
                cp_remark: "", //制作备注
            },
            followUserOptions: [],
            previewParams: {
                show: true,
                btnText: "上传附件", //默认描述为 **上传文件**
            },
            previewParamsProto: {
                show: true,
                btnText: "上传原型",
            },
            uploadParams: {
                attrs: {
                    accept: "*",
                }, //可上传的文件格式，需按照MIME格式书写
            },
            showPreviewDialog: false,
            previewData: {},
            //CP管理
            cpAdminOptions: [],
            statusOptions: [
                {
                    value: 1,
                    label: "待报价",
                },
                {
                    value: 2,
                    label: "已报价",
                },
                {
                    value: 3,
                    label: "已预警",
                },
                {
                    value: 4,
                    label: "待确认",
                },
                {
                    value: 5,
                    label: "已确认",
                },
            ],
        };
    },
    computed: {
        dateRangePicker() {
            let value = "";
            const { schedule_start_time, schedule_end_time } = this.formModel;
            if (schedule_start_time && schedule_end_time) {
                value =
                    formatDate(schedule_start_time) +
                    " 至 " +
                    formatDate(schedule_end_time);
            }
            return value;
        },
        baseEditVisible() {
            return this.myTask && this.formModel.update_follow_user;
        },
        cpEditVisible() {
            return this.myTaskCp && this.formModel.update_follow_user;
        },
        taskCpRemarkVisible() {
            return this.myTaskCp && this.auth.taskchild_commit;
        },
    },
    watch: {
        task: {
            handler: function (val) {
                this.init(val);
            },
            deep: true,
            immediate: true,
        },
    },
    created() {
        //任务跟进人列表
        this.getCreateUserList();
        //CP管理列表
        this.getCpManageList();
    },
    methods: {
        messageSuccess(msg) {
            this.$message.success(msg);
        },
        init(task) {
            if (task) {
                const { follow_users, cp_admin_id, cp_admin_name } = task;
                if (task.file && task.file.name) {
                    task.file.fileType = this.$Tools.judgeFileType(
                        task.file.name
                    );
                }
                if (task.rsp_prototype_file && task.rsp_prototype_file.name) {
                    task.rsp_prototype_file.fileType = this.$Tools.judgeFileType(
                        task.rsp_prototype_file.name
                    );
                }
                if (Array.isArray(follow_users) && follow_users.length) {
                    task.follow_user = follow_users.shift();
                }
                if (cp_admin_id && cp_admin_name) {
                    task.cp_admin_id = Number(cp_admin_id);
                    if (!this.cpAdminOptions.length) {
                        this.cpAdminOptions = [
                            {
                                id: cp_admin_id,
                                name: cp_admin_name,
                                is_update: "",
                            },
                        ];
                    }
                }
                const data = JSON.parse(JSON.stringify(task));
                Object.assign(this.formModel, data);
            }
        },
        //附件预览
        previewFile(currentFile) {
            this.previewData = currentFile;
            this.showPreviewDialog = true;
        },
        //附件下载
        download(file) {
            this.$Tools.downloadFile(file.url, file.name);
        },
        //跟进人列表
        async getCreateUserList() {
            if (!this.task.project_id) return;
            const params = {
                page: 1,
                page_size: 9999,
                project_id: this.task.project_id,
            };
            const {
                err_code,
                data,
            } = await SystemGlobalRequest.getCreateUserList(params);
            if (err_code === 0) {
                this.followUserOptions = data || [];
            }
        },
        checkBox(cb, contnet = "是否确认当前操作?", title = "提示") {
            this.$alert(contnet, title, {
                showClose: false,
                lockScroll: false,
                showCancelButton: true,
                confirmButtonText: "确定",
                confirmButtonClass: "is-round",
                cancelButtonText: "取消",
                cancelButtonClass: "is-round",
                callback: (action) => {
                    if (action === "confirm") {
                        cb && cb();
                    }
                },
            });
        },
        //修改任务的跟进人
        handleUpdateFollowUser() {
            this.checkBox(this.updateFollowUser, "是否修改此任务的跟进人?");
        },
        async updateFollowUser() {
            const { uuid, follow_user } = this.formModel;
            if (!uuid) return;
            const params = {
                uuid,
                follow_user: follow_user.id,
            };
            const { err_code } = await TaskService.updateFollowUser(params);
            if (err_code === 0) {
                this.messageSuccess("修改跟进人成功!");
                this.$emit("update");
            }
        },
        //获取CP管理列表
        async getCpManageList() {
            const { project_id, cp_id } = this.formModel;
            if (!project_id) return;
            const params = {
                project_id,
                page: 1,
                page_size: 9999,
                company_id: cp_id,
            };
            const { err_code, data } = await TaskService.getEnterUser(params);
            if (err_code === 0) {
                this.cpAdminOptions = data || [];
            }
        },
        //修改CP管理
        handleUpdateCpAdmin() {
            this.checkBox(this.updateCpAdmin, "是否修改此任务的CP管理?");
        },
        async updateCpAdmin() {
            const { uuid, cp_admin_id } = this.formModel;
            if (!uuid) return;
            const params = {
                uuid,
                cp_admin_id,
            };
            const { err_code } = await TaskService.updateFollowUser(params);
            if (err_code === 0) {
                this.messageSuccess("修改CP管理成功!");
                this.$emit("update");
            }
        },
        //制作备注
        handleTaskCpRemark() {
            this.checkBox(this.updateCpRemark, "是否更新此任务的制作备注?");
        },
        async updateCpRemark() {
            const { uuid, cp_remark } = this.formModel;
            if (!uuid) return;
            const params = {
                type: "task",
                id: uuid,
                text: cp_remark,
            };
            const { err_code } = await TaskService.updateRemark(params);
            if (err_code === 0) {
                this.messageSuccess("更新制作备注成功!");
                this.$emit("update");
            }
        },
    },
};
</script>

<style lang='less' scoped>
.main-task-template {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    .main-task-scroll {
        height: 100%;
        .el-form {
            padding: 20px;
        }
    }
    .pointer {
        color: @baseColor;
        cursor: pointer;
    }
    /deep/ .el-form-item {
        margin-bottom: 22px;
        &:last-child {
            margin-bottom: 0;
        }
        .input-button {
            .el-input-group__append {
                color: @white;
                background-color: @baseColor;
                border-color: @baseColor;
                &:hover {
                    color: @white;
                    background: @baseHover;
                    border-color: @baseHover;
                }
            }
        }
        .row-select {
            display: flex;
            align-items: flex-start;
            .el-select .el-input__inner {
                border-radius: 4px 0 0 4px;
            }
            .el-button {
                border-radius: 0 4px 4px 0;
            }
        }
        .row-textarea {
            display: flex;
            align-items: flex-start;
            .el-textarea__inner {
                border-radius: 4px 0 4px 4px;
            }
            .el-button {
                border-radius: 0 4px 4px 0;
            }
        }
        .el-select {
            width: 100%;
        }
        .resize-none {
            textarea {
                resize: none;
            }
        }
        .follow-user-list {
            width: 100%;
            max-height: 72px;
            line-height: 24px;
            font-size: 14px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
        }
        .file-box {
            .upload-wrapper {
                width: 100%;
                .upload-container {
                    width: 100%;
                    .can-preview-upload {
                        width: 100%;
                        .preview-upload {
                            width: 100%;
                            display: flex;
                            overflow: hidden;
                            .uploaded-files {
                                width: ceil(100% - 78px);
                                overflow: hidden;
                                flex: 1;
                                display: flex;
                                align-items: center;
                                margin: 0;
                                .file-name {
                                    flex: 1;
                                    display: inline-block;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                }
                                .btn-groups {
                                    i {
                                        font-size: 16px;
                                        color: @baseColor;
                                        margin-left: 10px;
                                    }
                                }
                                .button-clear-style {
                                    margin: 0;
                                }
                            }
                        }
                    }
                }
            }
            .el-button {
                padding: 12px 20px;
                margin-right: 12px;
            }
        }
        .hide-file-btn {
            .preview-upload {
                .el-button {
                    display: none;
                }
                .uploaded-files {
                    width: 100%;
                }
            }
        }
    }
}
</style>
