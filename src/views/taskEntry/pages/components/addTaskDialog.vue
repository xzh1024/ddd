<!-- 新增任务组件 -->
<template>
    <div class="add-task-dialog-wrapper">
        <el-dialog title="新增任务" :visible.sync="isShowAddTaskDialog" :close-on-click-modal='false' width="600px"
                   @close="dialogClose()">
            <el-scrollbar class="add-task-dialog dialog-has-footer">
                <div class="task-add-layout">
                    <el-form :model="taskInfos" ref="addTaskForm" label-width="80px">
                        <el-form-item label="任务名称" required>
                            <el-input v-model="taskInfos.taskName" placeholder="请输入任务名称"
                                      @input="focusTaskName"></el-input>
                            <div class="err-tips" v-if="checkAddTaskInfos.taskNameIsEmpty">任务名称不能为空</div>
                        </el-form-item>
                        <el-form-item label="所属项目" required>
                            <el-select v-model="taskInfos.project" placeholder="请选择所属项目" style="width:100%"
                                       @change="getProjectId()">
                                <el-option v-for="item in projectListData" :key="item.id" :label="item.name"
                                           :value="item.id"></el-option>
                            </el-select>
                            <div class="err-tips" v-if="checkAddTaskInfos.projectIsEmpty">请选择所属项目</div>
                        </el-form-item>
                        <el-form-item label="制作类型" required>
                            <el-select v-model="taskInfos.proType" placeholder="请选择制作类型" :disabled='!taskInfos.project'
                                       style="width:100%" @change="changeProType">
                                <el-option v-for="item in productionSpecification" :key="item.id" :label="item.name"
                                           :value="item.id"></el-option>
                            </el-select>
                            <div class="err-tips" v-if="checkAddTaskInfos.proTypeIsEmpty">请选择制作类型</div>
                        </el-form-item>
                        <el-form-item label="参考资料" required>
                            <div class="file-box">
                                <upload :auth="true" directory="task-file" :init-params="uploadParams"
                                        :previewParams="taskLileParams" @fileUploadSuccess="uploadFileSuccess" :uploadId="'uploadFile'">
                                    <div class="show-files" slot="files" v-if="taskInfos.referencefile">
                                        <span class="file-name" :title="taskInfos.referencefile.realname">{{taskInfos.referencefile.realname}}</span>
                                        <a class="btn-groups">
                                            <i v-if="taskInfos.referencefile.fileType==='img'" class="el-icon-view" title="预览"
                                               @click="previewFile(taskInfos.referencefile)"></i>
                                            <i class="el-icon-download" title="下载"
                                               @click="downloadCurrentFile(taskInfos.referencefile)"></i>
                                        </a>
                                    </div>
                                </upload>
                            </div>
                            <div class="err-tips" v-if="checkAddTaskInfos.referencefileIsEmpty">上传附件不能为空</div>
                        </el-form-item>
                        <el-form-item label="参考原型">
                            <div class="file-box">
                                <upload :auth="true" directory="task-prototype" :init-params="uploadPrototypeParams"
                                        :previewParams="prototypeParams" @fileUploadSuccess="uploadPrototypeSuccess" :uploadId="'uploadPrototype'">
                                        <div class="show-files" slot="files" v-if="taskInfos.prototypefile && taskInfos.prototypefile">
                                        <span class="file-name" :title="taskInfos.prototypefile.realname">{{taskInfos.prototypefile.realname}}</span>
                                        <a class="btn-groups">
                                            <i v-if="taskInfos.prototypefile.fileType==='img'" class="el-icon-view" title="预览"
                                                @click="previewFile(taskInfos.prototypefile)"></i>
                                            <i class="el-icon-download" title="下载"
                                                @click="downloadCurrentFile(taskInfos.prototypefile)"></i>
                                        </a>
                                    </div>                                        
                                </upload>
                            </div>
                        </el-form-item>
                        <el-form-item label="CP管理" required>
                            <el-select v-model="taskInfos.cpManage" placeholder="请选择CP管理" :disabled="!taskInfos.project"
                                       style="width:100%" @change="changeCpSelsect">
                                <el-option v-for="item in cpManageLists" :key="item.id" :label="item.name" :disabled="item.is_update===2"
                                           :value="item.id">
                                    <span>{{item.name}}</span>
                                    <cp-tip :disabled="item.is_update===2"></cp-tip>
                                </el-option>
                            </el-select>
                            <div class="err-tips" v-if="checkAddTaskInfos.cpManageIsEmpty">请选择CP管理</div>
                        </el-form-item>
                        <el-form-item label="预计完成" required>
                            <el-date-picker
                                v-model="taskInfos.expectedCompletion"
                                :value="taskInfos.expectedCompletion"
                                :picker-options="pickerOptions"
                                value-format="yyyy-MM-dd"
                                type="date"
                                placeholder="选择预计完成日期"
                                @change="changeDate"
                                style="width:100%">
                            </el-date-picker>
                            <div class="err-tips" v-if="checkAddTaskInfos.expectedCompletionIsEmpty">请选择预计完成时间</div>
                        </el-form-item>
                        <el-form-item label="最高报价" required class="max-price">
                            <el-input-number v-model="taskInfos.quotateScopeMax" controls-position="right"
                                             @change="focusQuotateScopeMax" :min="1" :max="99999999">
                            </el-input-number>
                            <span style="margin-left: 8px;">人 / 天</span>
                            <div class="err-tips" v-if="checkAddTaskInfos.quotateScopeMaxIsEmpty">最高报价不能为空且必须数字</div>
                        </el-form-item>
                        <el-form-item label="备注">
                            <el-input type="textarea" v-model="taskInfos.remarks" :rows="4" resize="none"
                                      placeholder="请输入备注内容"></el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </el-scrollbar>
            <div slot="footer" class="dialog-footer">
                <el-button size="medium" round @click="dialogClose()">取消</el-button>
                <el-button size="medium" round type="primary" @click="saveAddTaskInfos()">确定</el-button>
            </div>
        </el-dialog>
        <!-- 文件预览 -->
        <div class="file-preview">
            <!-- Image -->
            <div v-if="showPreviewDialog">
                <image-preview :visible.sync="showPreviewDialog" :data="previewData"></image-preview>
            </div>
        </div>
    </div>
</template>

<script>
    import upload from "@components/upload/upload";
    import CusSelect from "@components/cusUI/cusSelect";
    import {TaskEntryRequest} from "../../service/http";
    import {ProjectGroupRequest} from "../../../projectSelection/service/http";
    import {SystemGlobalRequest} from "commonHttp";
    import ImagePreview from "@components/preview/imagePreview";
    import {Debounce} from '@libs/js/utils';
    
    export default {
        name: 'addTaskDialog',
        components: {
            upload,
            ImagePreview,
            CusSelect
        },
        props: {},
        data() {
            return {
                productionSpecification: [],
                projectListData: [],
                taskLileParams: {
                    show: true,
                    btnText: '上传附件' // 默认描述为 **上传文件**
                },
                uploadParams: {
                    isDirectory: false, // 是否需要上传文件夹
                    singleFile: true, // 是否为多文件上传，默认为true（单文件）， false为多文件
                    attrs: {accept: 'image/*, application/msword, application/pdf, application/zip, application/vnd.ms-excel'} // 可上传的文件格式，需按照MIME格式书写
                },
                prototypeParams:{
                    show: true,
                    btnText: '上传原型' // 默认描述为 **上传文件** 
                },
                uploadPrototypeParams: {
                    isDirectory: false, // 是否需要上传文件夹
                    singleFile: true, // 是否为多文件上传，默认为true（单文件）， false为多文件
                    attrs: {accept: 'image/*, application/msword, application/pdf, application/zip, application/vnd.ms-excel'} // 可上传的文件格式，需按照MIME格式书写
                },
                previewData: {},
                showPreviewDialog: false,
                isShowAddTaskDialog: false,
                taskInfos: {
                    taskName: null,
                    project: null,
                    proType: null,
                    referencefile: null,
                    prototypefile: null,
                    cpManage: '',
                    expectedCompletion: null, // 预计完成时间
                    quotateScopeMax: 1,
                    remarks: null
                },
                checkAddTaskInfos: {
                    taskNameIsEmpty: false,
                    projectIsEmpty: false,
                    proTypeIsEmpty: false,
                    referencefileIsEmpty: false,
                    cpManageIsEmpty: false,
                    expectedCompletionIsEmpty: false,
                    quotateScopeMaxIsEmpty: false,
                },
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() < Date.now();
                    }
                },
                cpManageLists: [],
            };
        },
        methods: {
            open() {
                this.isShowAddTaskDialog = true;
                this.getProjectListData();
            },
            async getProjectListData() {
                const data = await ProjectGroupRequest.getProjectList();
                if (data.err_code === 0) {
                    this.projectListData = data.data || [];
                }
            },
            getProjectId() {
                this.checkAddTaskInfos.projectIsEmpty = false;
                if (this.taskInfos.project) {
                    this.$set(this.taskInfos, 'cpManage', '');
                    this.$set(this.taskInfos, 'proType', null);
                }
                this.getSysStandardData();
                this.getTaskCpManageData();
            },
            async getSysStandardData() {
                const data = await SystemGlobalRequest.getProjectProductionTypeList({project_ids: this.taskInfos.project});
                if (data.err_code === 0) {
                    this.productionSpecification = data.data || [];
                }
            },
            async getTaskCpManageData() {
                let params = {
                    page: 1,
                    page_size: 999,
                    project_id: this.taskInfos.project
                };
                const data = await TaskEntryRequest.getTaskCpManage(params);
                if (data.err_code === 0) {
                    this.cpManageLists = data.data || [];
                }
            },
            uploadFileSuccess(file) {
                if (file) {
                    this.taskInfos.referencefile = file;
                    this.checkAddTaskInfos.referencefileIsEmpty = false;
                }
            },
            uploadPrototypeSuccess(file){
					this.taskInfos.prototypefile = file;
				},
            // 附件预览
            previewFile(currentFile) {
                this.showPreviewDialog = true;
                this.previewData = currentFile;
            },
            changeCpSelsect() {
                this.checkAddTaskInfos.cpManageIsEmpty = false;
            },
            dialogClose() {
                this.resetForm();
                this.$emit('dialogClose')
            },
            saveAddTaskInfos: Debounce(function () {
                let data = this.taskInfos;
                if(!data.taskName){
                    this.checkAddTaskInfos.taskNameIsEmpty = true;
                } else if(!data.project){
                    this.checkAddTaskInfos.projectIsEmpty = true;
                }else if(!data.proType){
                    this.checkAddTaskInfos.proTypeIsEmpty = true;
                } else if(!data.referencefile){
                    this.checkAddTaskInfos.referencefileIsEmpty = true;
                } else if(!data.cpManage){
                    this.checkAddTaskInfos.cpManageIsEmpty = true;
                }else if(!data.expectedCompletion){
                    this.checkAddTaskInfos.expectedCompletionIsEmpty = true;
                } else if(!data.quotateScopeMax){
                    this.checkAddTaskInfos.quotateScopeMaxIsEmpty = true;
                } else {
                    let params = {
                        project_id: data.project, // 项目id
                        name: data.taskName,// 名称
                        standard_id: data.proType,// 制作类型
                        files: data.referencefile.id,//文件
                        prototype_file: data.prototypefile && data.prototypefile.id, // 原型
                        cp_admin_id: data.cpManage,//cp管理员
                        expire_end_time: data.expectedCompletion,//结束时间
                        expire_price_max: data.quotateScopeMax,// 最大报价
                        remark: data.remarks//备注
                    };
                    this.addAddTaskRequest(params);
                }
            }, 3000),
            // 新建任务
            async addAddTaskRequest(params) {
                let data = await TaskEntryRequest.addBaseTaskInfoAdd(params);
                if(data.err_code === 0){
                    this.$message.success('新增任务成功');
                    this.$emit('reloadTaskList');
                    this.dialogClose();
                }
            },
            // 重置表单数据
            resetForm() {
                this.taskInfos = {
                    taskName: null,
                    project: null,
                    proType: null,
                    referencefile: null,
                    prototypefile: null,
                    cpManage: '',
                    expectedCompletion: null,
                    quotateScopeMax: 1,
                    remarks: null
                };
                this.checkAddTaskInfos = {
                    taskNameIsEmpty: false,
                    projectIsEmpty: false,
                    proTypeIsEmpty: false,
                    referencefileIsEmpty: false,
                    cpManageIsEmpty: false,
                    expectedCompletionIsEmpty: false,
                    quotateScopeMaxIsEmpty: false,
                };
            },
            // 附件下载
            downloadCurrentFile(currentFile){
                this.$Tools.downloadFile(currentFile.url, currentFile.name);
            },
            focusTaskName(value) {
                this.checkAddTaskInfos.taskNameIsEmpty = !value || (!!value && value.trim().length <= 0);
            },
            changeProType(){
                this.checkAddTaskInfos.proTypeIsEmpty = false;
            },
            changeDate(){
                this.checkAddTaskInfos.expectedCompletionIsEmpty = false;
            },
            focusQuotateScopeMax(){
                this.checkAddTaskInfos.quotateScopeMaxIsEmpty = false;
            }
        }
    };
</script>
<style lang="less" scoped>
    .add-task-dialog-wrapper {
        height: 100%;
        position: relative;
        .add-task-dialog {
            height: 100%;
            .task-add-layout {
                padding: 0 0 20px;
            }
        }
        /deep/ .el-form {
            padding: 20px;
            .el-form-item {
                &:last-child {
                    margin-bottom: 0;
                }
                &.max-price .el-form-item__content {
                    display: flex;
                    justify-content: space-between;
                    .el-input-number {
                        width: 100%;
                    }
                    span {
                        width: 48px;
                    }
                }
            }
        }
        /deep/ .el-input-number {
            input {
                text-align: left !important;
            }
        }
        .file-box {
            position: relative;
            display: flex;
            justify-content: space-between;
            .show-files {
                display: flex;
                .file-name {
                    display: inline-block;
                    max-width: 180px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap
                }
                .btn-groups {
                    margin: 0 0 0 8px;
                    i {
                        font-size: 16px;
                        color: @baseColor;
                        &.el-icon-download {
                            margin-left: 10px;
                        }
                    }
                }
            }
        }
        .err-tips {
            color: #f56c6c;
            font-size: 12px;
            line-height: 1;
            padding-top: 4px;
            position: absolute;
            top: 100%;
            left: 0;;
        }
        .file-preview {
            z-index: 3000;
        }
    }
</style>
