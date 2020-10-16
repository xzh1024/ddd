<template>
    <div class="sub-task-template dialog-no-footer">
        <div class="container dialog-no-footer">
            <div class="form-container">
                <el-scrollbar class="task-scroll">
                    <el-form class="container-padding" :model="formModel" label-width="70px">
                        <el-form-item label="任务名称" prop="name">
                            <el-input v-model.trim="formModel.name" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="制作类型" prop="standard_name">
                            <el-input v-model.trim="formModel.standard_name" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item label="任务报价" prop="price">
                            <el-input v-model.trim="formModel.price" :disabled="disabled">
                                <template slot="append">人天</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="任务状态" prop="status">
                            <el-select v-model="formModel.status" filterable :disabled="disabled">
                                <el-option
                                    v-for="item in taskStatusOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    placeholder=" "
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item
                            v-if="!errorValues.includes(formModel.start_time)"
                            label="实际开始"
                            prop="start_time"
                        >
                            <el-input v-model.trim="formModel.start_time" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item
                            v-if="!errorValues.includes(formModel.end_time)"
                            label="实际结束"
                            prop="end_time"
                        >
                            <el-input v-model.trim="formModel.end_time" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item
                            v-if="!errorValues.includes(formModel.pauseStart)"
                            label="暂停开始"
                            prop="pauseStart"
                        >
                            <el-input v-model.trim="formModel.pauseStart" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item
                            v-if="!errorValues.includes(formModel.pauseEnd)"
                            label="暂停结束"
                            prop="pauseEnd"
                        >
                            <el-input v-model.trim="formModel.pauseEnd" :disabled="disabled"></el-input>
                        </el-form-item>
                        <el-form-item
                            v-if="!errorValues.includes(formModel.termination_time)"
                            label="终止时间"
                            prop="termination_time"
                        >
                            <el-input
                                v-model.trim="formModel.termination_time"
                                :disabled="disabled"
                            ></el-input>
                        </el-form-item>
                        <el-form-item v-if="formModel.status === 105" label="任务结算">
                            <el-input
                                v-if="myTask ? !auth.task_add && formModel.balance_price : true"
                                v-model.trim="formModel.balance_price"
                                :disabled="disabled"
                            ></el-input>
                            <el-input
                                v-else
                                v-model.trim="taskBalancePrice"
                                :class="{'input-button': Number(taskBalancePrice)}"
                                @keyup.native="taskBalancePrice = intNumberValidate(taskBalancePrice)"
                                @change="taskBalancePrice = intNumberValidate(taskBalancePrice)"
                            >
                                <el-button
                                    slot="append"
                                    type="primary"
                                    title="保存"
                                    icon="el-icon-edit"
                                    @click="handleTaskBalance"
                                ></el-button>
                            </el-input>
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
                                    icon="el-icon-edit"
                                    title="更新"
                                    :disabled="!formModel.cp_remark"
                                    @click="handleTaskCpRemark"
                                ></el-button>
                            </div>
                        </el-form-item>
                        <el-form-item
                            v-if="formModel.status === 108 && !errorValues.includes(formModel.audit_remark)"
                            label="驳回原因"
                            prop="audit_remark"
                        >
                            <el-input
                                type="textarea"
                                class="resize-none"
                                v-model="formModel.audit_remark"
                                maxlength="200"
                                show-word-limit
                                :autosize="{ minRows: 4, maxRows: 4}"
                                :disabled="disabled"
                            ></el-input>
                        </el-form-item>
                    </el-form>
                </el-scrollbar>
                <div
                    class="button-container button-space-between"
                    v-if="myTask && (taskPassVisible || taskRejectVisible || taskBreakVisible || taskPauseVisible || taskRestartVisible)"
                >
                    <el-button
                        type="primary"
                        size="small"
                        round
                        v-if="taskPassVisible"
                        :disabled="formModel.status !== 107"
                        @click="handleTaskPass"
                    >通过任务</el-button>
                    <el-button
                        type="primary"
                        size="small"
                        round
                        v-if="taskRejectVisible"
                        :disabled="formModel.status !== 107"
                        @click="auditTaskShow"
                    >驳回任务</el-button>
                    <el-button
                        type="primary"
                        size="small"
                        round
                        v-if="taskBreakVisible"
                        :disabled="!include.taskNotStop.includes(formModel.status)"
                        @click="handleTaskTermination"
                    >终止任务</el-button>
                    <el-button
                        type="primary"
                        size="small"
                        round
                        v-if="taskPauseVisible"
                        :disabled="include.taskNotPause.includes(formModel.status)"
                        @click="handleTaskPause"
                    >暂停任务</el-button>
                    <el-button
                        type="primary"
                        size="small"
                        round
                        v-if="taskRestartVisible"
                        @click="handleTaskRecover"
                    >重启任务</el-button>
                </div>
                <div
                    class="button-container center"
                    v-if="myTaskCp ? auth.taskchild_commit && include.taskCommit.includes(formModel.status) : false"
                >
                    <el-button
                        type="primary"
                        size="small"
                        round
                        :disabled="!nodeStatusFinal"
                        @click="handleTaskCommit"
                    >提交任务</el-button>
                </div>
                <div
                    class="button-container center"
                    v-if="myTaskCp ? auth.task_cp_list_general && formModel.status === 102 : false"
                >
                    <el-button type="primary" size="small" round @click="handleTaskActive">激活任务</el-button>
                </div>
            </div>
        </div>
        <el-scrollbar class="container dialog-no-footer">
            <div class="container-padding">
                <div class="node-wrap" v-for="(node, index) in nodes" :key="index">
                    <div class="node">
                        <div class="node-number">
                            <span class="icon-number-bg">{{index + 1}}</span>
                            <span class="node-name">{{node.name}}</span>
                        </div>
                        <div class="row">
                            <div class="row-label">CP制作</div>
                            <div
                                class="row-content"
                                v-if="type === 1 || include.taskEnd.includes(formModel.status) || !myTaskCp"
                            >
                                <el-select
                                    v-model="node.make_users"
                                    multiple
                                    filterable
                                    :disabled="disabled"
                                    :reserve-keyword="true"
                                    value-key="id"
                                    placeholder=" "
                                >
                                    <el-option
                                        v-for="user in node.make_users_name"
                                        :key="user.id"
                                        :label="user.name"
                                        :value="user.id"
                                    ></el-option>
                                </el-select>
                            </div>
                            <div class="row-content row-select" v-else>
                                <el-select
                                    v-model="node.make_users"
                                    multiple
                                    filterable
                                    :disabled="!auth.taskchild_commit || !include.taskOngoing.includes(formModel.status)"
                                    :reserve-keyword="true"
                                    value-key="id"
                                    placeholder=" "
                                >
                                    <el-option
                                        class="cp-options"
                                        v-for="user in cpMakerOptions"
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
                                    v-if="auth.taskchild_commit && include.taskOngoing.includes(formModel.status)"
                                    type="primary"
                                    icon="el-icon-edit"
                                    :disabled="!node.make_users.length"
                                    title="修改"
                                    @click="handleUpdateMakeuser(node)"
                                ></el-button>
                            </div>
                        </div>
                        <div class="row">
                            <div class="row-label">计划排期</div>
                            <div class="row-content">
                                <el-input v-model="node.schedule_time" :disabled="disabled"></el-input>
                            </div>
                        </div>
                        <div class="row">
                            <div class="row-label">节点描述</div>
                            <div class="row-content">
                                <el-input
                                    type="textarea"
                                    class="resize-none"
                                    v-model="node.upload_remark"
                                    maxlength="200"
                                    show-word-limit
                                    :autosize="{ minRows: 4, maxRows: 4}"
                                    :disabled="!(node.my && auth.node_commit && include.taskCommit.includes(formModel.status) && include.nodeCommit.includes(node.status))"
                                ></el-input>
                            </div>
                        </div>
                        <div class="row">
                            <div class="row-label">节点附件</div>
                            <div
                                class="row-content file-box"
                                :class="{'hide-file-btn': !(node.my && auth.node_commit && include.taskCommit.includes(formModel.status) && include.nodeCommit.includes(node.status))}"
                            >
                                <upload
                                    v-if="include.nodeStart.includes(node.status)"
                                    :auth="true"
                                    directory="custom-name"
                                    :init-params="uploadParams"
                                    :previewParams="previewParams"
                                    @fileUploadSuccess="uploadSuccess"
                                    :uploadId="String(node.id)"
                                >
                                    <template slot="files" v-if="node.file && node.file.name">
                                        <div
                                            class="file-name"
                                            :title="node.file.name"
                                        >{{node.file.name}}</div>
                                        <div class="btn-groups">
                                            <i
                                                class="el-icon-view pointer"
                                                title="预览"
                                                v-if="node.file.fileType && node.file.fileType === 'img'"
                                                @click="previewFile(node.file)"
                                            ></i>
                                            <i
                                                class="el-icon-download pointer"
                                                title="下载"
                                                @click="download(node.file)"
                                            ></i>
                                        </div>
                                    </template>
                                    <template slot="files" v-if="!(node.file && node.file.name) && !(node.my && auth.node_commit && include.taskCommit.includes(formModel.status) && include.nodeCommit.includes(node.status))">无</template>
                                </upload>
                                <div v-else>无</div>
                            </div>
                        </div>
                        <div class="row" v-if="node.status === 207">
                            <div class="row-label">驳回原因</div>
                            <div class="row-content">
                                <el-input
                                    type="textarea"
                                    class="resize-none"
                                    v-model="node.audit_remark"
                                    maxlength="200"
                                    show-word-limit
                                    :autosize="{ minRows: 4, maxRows: 4}"
                                    :disabled="disabled"
                                ></el-input>
                            </div>
                        </div>
                    </div>
                    <div class="button-group">
                        <el-tag
                            v-if="(auth.node_audit || auth.node_commit) && include.nodeStart.includes(node.status)"
                            type="success"
                            size="medium"
                            effect="plain"
                        >{{ node.status | formatStatus }}</el-tag>
                        <template v-if="auth.node_audit && node.status === 206 && myTaskCp">
                            <el-button
                                type="primary"
                                size="mini"
                                round
                                @click="auditNodeShow(node)"
                            >驳回</el-button>
                            <el-button
                                type="primary"
                                size="mini"
                                round
                                @click="nodeAudit(node, 1)"
                            >通过</el-button>
                        </template>
                        <el-button
                            v-if="node.my && auth.node_commit && include.nodeCommit.includes(node.status)"
                            type="primary"
                            size="mini"
                            round
                            :disabled="!include.taskCommit.includes(formModel.status)"
                            @click="handleSubmitTaskNode(node)"
                        >提交</el-button>
                    </div>
                </div>
            </div>
        </el-scrollbar>
        <!-- 图片文件预览 -->
        <div class="file-preview">
            <div v-if="showPreviewDialog">
                <image-preview :visible.sync="showPreviewDialog" :data="previewData"></image-preview>
            </div>
        </div>
        <!-- 驳回弹框 -->
        <el-dialog
            class="rule-dialog"
            width="500px"
            :title="auditType === 'task' ? '任务驳回' : '节点驳回'"
            :visible.sync="auditVisible"
            :close-on-click-modal="false"
            append-to-body
            @closed="auditClosed"
        >
            <el-form :model="auditForm" :rules="auditRules" ref="nodeReject" label-width="80px">
                <el-form-item label="驳回原因" prop="auditRemark">
                    <el-input
                        type="textarea"
                        v-model="auditForm.auditRemark"
                        maxlength="200"
                        show-word-limit
                        :autosize="{ minRows: 4, maxRows: 10}"
                    ></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button size="small" round @click="auditHide">取消</el-button>
                <el-button type="primary" size="small" round @click="auditSubmit">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { TaskService } from "../service/http";
import Upload from "@components/upload/upload";
import ImagePreview from "@components/preview/imagePreview";
import { formatDate } from "@libs/js/utils";

export default {
    name: "subTaskTemplate",
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
        cpMakerOptions: {
            type: Array,
            required: false,
            default: () => [],
        },
    },
    components: { Upload, ImagePreview },
    data() {
        return {
            auth: sessionStorage.pageAuthConfig
                ? JSON.parse(sessionStorage.pageAuthConfig)
                : {},
            userData: sessionStorage.userData
                ? JSON.parse(sessionStorage.userData)
                : {},
            disabled: true,
            errorValues: [null, undefined, ""],
            formModel: {
                name: "", //任务名称
                standard_id: "", //制作类型
                price: "", //报价
                status: "", //任务状态 101 录入中 102 待开始 103 进行中 104 暂停 105 终止 106 逾期 107 待审核 108 已驳回 109 逾期完成 110 已完成
                start_time: "", //实际开始
                end_time: "", //实际结束
                pauseStart: "", //暂停开始
                pauseEnd: "", //暂停结束
                termination_time: "", //终止时间
                balance_price: "", //任务结算 报价人天
                remark: "", //驳回原因
                cp_remark: "", //制作备注
            },
            taskBalancePrice: "", //任务结算
            nodes: [], //节点状态 201 待开始 202 进行中 203 暂停 204 终止 205 逾期 206待审核 207 已驳回 208 逾期完成 209 已完成
            nodeStatusFinal: false, //当所有的节点状态为已完成时为true，控制提交按钮
            //任务状态列表
            taskStatusOptions: [
                {
                    value: 101,
                    label: "录入中",
                },
                {
                    value: 102,
                    label: "待开始",
                },
                {
                    value: 103,
                    label: "进行中",
                },
                {
                    value: 104,
                    label: "暂停",
                },
                {
                    value: 105,
                    label: "终止",
                },
                {
                    value: 106,
                    label: "逾期",
                },
                {
                    value: 107,
                    label: "待审核",
                },
                {
                    value: 108,
                    label: "已驳回",
                },
                {
                    value: 109,
                    label: "逾期完成",
                },
                {
                    value: 110,
                    label: "已完成",
                },
            ],
            previewParams: {
                show: true,
                btnText: "上传附件", //默认描述为 **上传文件**
            },
            uploadParams: {
                attrs: {
                    accept: "*",
                }, //可上传的文件格式，需按照MIME格式书写
            },
            showPreviewDialog: false,
            previewData: {},
            activeNode: {},
            auditVisible: false,
            auditForm: {
                auditRemark: "", //节点驳回原因
            },
            auditRules: {
                auditRemark: [
                    {
                        required: true,
                        message: "驳回原因不能为空",
                        trigger: "blur",
                    },
                ],
            },
            auditType: "", //记录是任务驳回还是节点驳回
            include: {
                taskAudit: [103, 104, 106, 107, 108],
                taskOngoing: [102, 103, 104, 106, 107, 108],
                taskNotStop: [102, 103, 104, 106, 108],
                taskPause: [102, 103, 106, 107, 108],
                taskNotPause: [102, 107],
                taskCommit: [103, 106, 108],
                taskEnd: [105, 109, 110],
                nodeStart: [202, 203, 204, 205, 206, 207, 208, 209],
                nodeCommit: [202, 205, 207],
            },
        };
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
    computed: {
        userId() {
            return this.userData.id || "";
        },
        taskPassVisible() {
            return (
                this.auth.task_audit &&
                this.include.taskAudit.includes(this.formModel.status)
            );
        },
        taskRejectVisible() {
            return (
                this.auth.task_audit &&
                this.include.taskAudit.includes(this.formModel.status)
            );
        },
        taskBreakVisible() {
            return (
                this.auth.task_stop &&
                this.include.taskOngoing.includes(this.formModel.status)
            );
        },
        taskPauseVisible() {
            return (
                this.auth.task_pause &&
                this.include.taskPause.includes(this.formModel.status)
            );
        },
        taskRestartVisible() {
            return this.auth.task_pause && this.formModel.status === 104;
        },
        taskCpRemarkVisible() {
            return this.myTaskCp && this.auth.taskchild_commit;
        },
    },
    methods: {
        intNumberValidate(value) {
            value = String(value);
            value = value.replace(/^(0+)|[^\d]+/g, "");
            return value;
        },
        messageSuccess(msg) {
            this.$message.success(msg);
        },
        messageError(msg) {
            this.$message.error(msg);
        },
        checkBox(cb, contnet = "是否确认当前操作?", data, title = "提示") {
            if (!cb) return;
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
                        if (data) {
                            cb(data);
                        } else {
                            cb();
                        }
                    }
                },
            });
        },
        init(task) {
            if (!task) return;
            const data = JSON.parse(JSON.stringify(task));
            const { task_node = [] } = data;
            Object.assign(this.formModel, data);
            this.pickNodeList(task_node);
        },
        pickNodeList(list) {
            let nodeStatusFinal = true; //当所有节点完成时为true
            list.forEach((node) => {
                const { schedule_start_time, schedule_end_time } = node;
                //计划排期
                let schedule_time = "";
                if (schedule_start_time && schedule_end_time) {
                    schedule_time =
                        formatDate(schedule_start_time) +
                        " 至 " +
                        formatDate(schedule_end_time);
                }
                node.schedule_time = schedule_time;
                //获取文件类型
                if (node.file && node.file.name) {
                    node.file.fileType = this.$Tools.judgeFileType(
                        node.file.name
                    );
                }
                //判断是否有节点提交权限
                if (Array.isArray(node.make_users)) {
                    const userId = this.userId;
                    node.my = node.make_users.some((makeUserId) => {
                        return userId === makeUserId;
                    });
                }
                if (![208, 209].includes(node.status)) {
                    nodeStatusFinal = false;
                }
            });
            this.nodeStatusFinal = nodeStatusFinal;
            this.nodes = list;
        },
        uploadSuccess(file) {
            const nodes = this.nodes;
            nodes.some((node) => {
                let result = false;
                if (node.id === Number(file.uploadId)) {
                    node.file = {
                        id: file.id,
                        name: file.realname,
                        fileType: file.fileType,
                    };
                    result = true;
                }
                return result;
            });
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
        //激活任务
        handleTaskActive() {
            this.checkBox(this.taskActive, "是否激活此任务?");
        },
        async taskActive() {
            if (!this.formModel.uuid) return;
            const params = { id: this.formModel.uuid };
            const { err_code } = await TaskService.taskActive(params);
            if (err_code === 0) {
                this.messageSuccess("激活任务成功!");
                this.$emit("update");
                this.$bus.emit("todo");
            }
        },
        //节点提交
        handleSubmitTaskNode(node) {
            if (!node.id) return;
            const { id, upload_remark, file } = node;
            if (!upload_remark) {
                this.messageError("节点描述不能为空!");
                return false;
            }
            if (!(file && file.id)) {
                this.messageError("附件不能为空!");
                return false;
            }
            this.submitTaskNode({
                id,
                upload_remark,
                file_id: file.id,
            });
        },
        async submitTaskNode(params) {
            const { err_code } = await TaskService.nodeCommit(params);
            if (err_code === 0) {
                this.messageSuccess("节点提交成功!");
                this.$emit("update");
            }
        },
        //节点审核
        async nodeAudit(node, audit) {
            if (!node.id) return;
            const params = {
                id: node.id,
                audit,
            };
            let msg = "节点通过成功!";
            if (audit === 2) {
                msg = "节点驳回成功!";
                params.audit_remark = this.auditForm.auditRemark;
            }
            const { err_code } = await TaskService.nodeAudit(params);
            if (err_code === 0) {
                this.messageSuccess(msg);
                this.auditHide();
                this.$emit("update");
            }
        },
        auditClosed() {
            this.activeNode = {};
            this.$refs.nodeReject.resetFields();
        },
        auditNodeShow(node) {
            if (!node.id) return;
            this.auditType = "node";
            this.activeNode = node;
            this.auditVisible = true;
        },
        auditHide() {
            this.auditVisible = false;
        },
        auditSubmit() {
            this.$refs.nodeReject.validate((valid) => {
                if (valid) {
                    const auditType = this.auditType;
                    if (auditType === "node") {
                        this.nodeAudit(this.activeNode, 2);
                    } else if (auditType === "task") {
                        this.taskAudit(2);
                    }
                } else {
                    return false;
                }
            });
        },
        //任务审核
        async taskAudit(audit) {
            if (!this.formModel.uuid) return;
            const params = {
                id: this.formModel.uuid,
                audit,
            };
            let msg = "任务通过成功!";
            if (audit === 2) {
                msg = "任务驳回成功!";
                params.audit_remark = this.auditForm.auditRemark;
            }
            const { err_code } = await TaskService.taskAudit(params);
            if (err_code === 0) {
                this.messageSuccess(msg);
                this.auditHide();
                this.$emit("update");
                this.$bus.emit("todo");
            }
        },
        //任务通过
        handleTaskPass() {
            this.checkBox(this.taskAudit, "是否通过此任务?", 1);
        },
        auditTaskShow() {
            this.auditType = "task";
            this.auditVisible = true;
        },
        //提交任务
        handleTaskCommit() {
            this.checkBox(this.taskCommit, "是否提交此任务?");
        },
        async taskCommit() {
            if (!this.formModel.uuid) return;
            const params = { id: this.formModel.uuid };
            const { err_code } = await TaskService.taskCommit(params);
            if (err_code === 0) {
                this.messageSuccess("提交任务成功!");
                this.$emit("update");
            }
        },
        //任务暂停
        handleTaskPause() {
            this.checkBox(this.taskPause, "是否暂停此任务?");
        },
        async taskPause() {
            if (!this.formModel.uuid) return;
            const params = { task_child_id: this.formModel.uuid };
            const { err_code } = await TaskService.taskPause(params);
            if (err_code === 0) {
                this.messageSuccess("任务暂停成功!");
                this.$emit("update");
            }
        },
        //重启任务
        handleTaskRecover() {
            this.checkBox(this.taskRecover, "是否重启此任务?");
        },
        async taskRecover() {
            if (!this.formModel.uuid) return;
            const params = { task_child_id: this.formModel.uuid };
            const { err_code } = await TaskService.taskRecover(params);
            if (err_code === 0) {
                this.messageSuccess("重启任务成功!");
                this.$emit("update");
            }
        },
        //终止任务
        handleTaskTermination() {
            this.checkBox(this.taskTermination, "是否终止此任务?");
        },
        async taskTermination() {
            if (!this.formModel.uuid) return;
            const params = { uuid: this.formModel.uuid };
            const { err_code } = await TaskService.taskTermination(params);
            if (err_code === 0) {
                this.messageSuccess("终止任务成功!");
                this.$emit("update");
            }
        },
        //任务结算
        handleTaskBalance() {
            const price = Number(this.taskBalancePrice);
            if (!price) return;
            let content = `是否确认此任务结算为${price}人天?`;
            this.checkBox(this.taskBalance, content, price);
        },
        async taskBalance(price) {
            if (!this.formModel.uuid) return;
            const params = {
                id: this.formModel.uuid,
                price,
            };
            const { err_code } = await TaskService.taskBalance(params);
            if (err_code === 0) {
                this.messageSuccess("结算任务成功!");
                this.taskBalancePrice = "";
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
                type: "task_child",
                id: uuid,
                text: cp_remark,
            };
            const { err_code } = await TaskService.updateRemark(params);
            if (err_code === 0) {
                this.messageSuccess("更新制作备注成功!");
                this.$emit("update");
            }
        },
        //修改节点的CP制作人
        handleUpdateMakeuser(node) {
            this.checkBox(
                this.updateMakeuser,
                "是否修改此节点的CP制作人?",
                node
            );
        },
        async updateMakeuser(node) {
            const { id, make_users = [] } = node;
            if (!this.formModel.uuid) return;
            const data = [
                {
                    node_id: id,
                    make_users: make_users,
                },
            ];
            const params = {
                id: this.formModel.uuid,
                data: JSON.stringify(data),
            };
            const { err_code } = await TaskService.updateMakeuser(params);
            if (err_code === 0) {
                this.messageSuccess("修改CP制作成功!");
                this.$emit("update");
            }
        },
    },
    filters: {
        formatStatus(value) {
            const statusObj = {
                201: "待开始",
                202: "进行中",
                203: "暂停",
                204: "终止",
                205: "逾期",
                206: "待审核",
                207: "已驳回",
                208: "逾期完成",
                209: "已完成",
            };
            return statusObj[value] || "";
        },
    },
};
</script>

<style lang='less' scoped>
@height: 600px;
.rule-dialog .el-form {
    padding: 20px;
    .el-form-item {
        margin-bottom: 0;
    }
}
.sub-task-template {
    width: 100%;
    height: @height;
    display: flex;
    overflow: hidden;
    .m-b10 {
        margin-bottom: 10px;
    }
    .pointer {
        color: @baseColor;
        cursor: pointer;
    }
    .center {
        text-align: center;
    }
    /deep/ .el-textarea__inner {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
        &::-webkit-scrollbar {
            display: none;
        }
    }
    .container {
        flex: 1;
        position: relative;
        height: @height;
        box-sizing: border-box;
        border-left: 1px solid @borderColor;
        .form-container {
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            .task-scroll {
                width: 100%;
                flex: 1;
            }
        }
        &:first-child {
            border-left: none;
        }
        .container-padding {
            box-sizing: border-box;
            padding: 20px;
        }
        /deep/ .el-form-item {
            margin-bottom: 22px;
            &:last-child {
                margin-bottom: 0;
            }
            .el-input-group__append {
                padding: 0 19px;
            }
            .input-button {
                .el-input-group__append {
                    color: @white;
                    background-color: @baseColor;
                    border-color: @baseColor;
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
        }
        /deep/ .el-select {
            width: 100%;
        }
        /deep/ .resize-none {
            textarea {
                resize: none;
            }
        }
        .button-container {
            width: 100%;
            height: 52px;
            padding: 10px;
            box-sizing: border-box;
        }
        .button-space-between {
            display: flex;
            justify-content: space-around;
        }
        .node-wrap {
            margin-bottom: 40px;
            &:last-child {
                margin-bottom: 0;
            }
            .button-group {
                display: flex;
                justify-content: space-between;
            }
            .node {
                .node-number {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                    .icon-number-bg {
                        display: flex;
                        flex-wrap: nowrap;
                        align-items: center;
                        justify-content: center;
                        width: 20px;
                        height: 20px;
                        font-size: 12px;
                        border-radius: 50% 50%;
                        color: @white;
                        background-color: @baseColor;
                        margin-right: 10px;
                    }
                    .node-name {
                        color: @baseColor;
                    }
                }
                .row {
                    position: relative;
                    display: flex;
                    margin-bottom: 22px;
                    line-height: 40px;
                    overflow: hidden;
                    &:last-child {
                        margin-bottom: 0;
                    }
                    .row-label {
                        width: 70px;
                        height: 40px;
                        padding-right: 10px;
                        overflow: hidden;
                        text-align: right;
                    }
                    .row-content {
                        flex: 1;
                    }
                    /deep/ .row-select {
                        display: flex;
                        align-items: flex-start;
                        .el-select .el-input__inner {
                            border-radius: 4px 0 0 4px;
                        }
                        .el-button {
                            border-radius: 0 4px 4px 0;
                        }
                    }
                    .file-box {
                        overflow: hidden;
                        /deep/ .upload-wrapper {
                            width: 100%;
                            .upload-container {
                                width: 100%;
                                .can-preview-upload {
                                    width: 100%;
                                    .preview-upload {
                                        width: 100%;
                                        display: flex;
                                        overflow: hidden;
                                        .el-button {
                                            margin-right: 6px;
                                        }
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
                                                text-indent: 1px;
                                            }
                                            .btn-groups {
                                                i {
                                                    font-size: 16px;
                                                    color: @baseColor;
                                                    margin-left: 10px;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    .hide-file-btn {
                        /deep/ .preview-upload {
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
        }
    }
}
</style>
