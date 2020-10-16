<!-- 任务详情组件 -->
<template>
    <div class="task-details-dialog">
        <loading v-if="isLoading"></loading>
        <el-dialog title="任务详情" v-if="!isLoading" :visible.sync="taskDetailsDialog" :close-on-click-modal='false' width="920px" @close="closeDialog()">
            <!-- 是否编辑主任务{{isEditableTaskDetails}}
            是否编辑子任务{{isEditChildTaskFlag}}
            是否可编辑最高报价{{isEditableTaskMaxPrice}} -->
            <div class="dialog-details" v-if="taskDetailsLeftTab && taskDetailsLeftTab.length > 0">
                <el-scrollbar class="task-details-left-tab">
                    <ul class="dialog-has-footer">
                        <li v-for="(tabs,index) in taskDetailsLeftTab" :key="index"
                            :class="{'active-sty': activeIndex === index}"
                            @click.stop="checkMenuItem(index)">
                            <span v-if="tabs.type==='main_task'">{{'任务信息'}}</span>
                            <span v-else :title="tabs.data.name?tabs.data.name:tabs.name">{{tabs.data.name || tabs.name}}</span>
                            <el-popconfirm title="确定删除吗？" @onConfirm="delChildTask(index)" v-if="isEditChildTaskFlag && tabs.type==='child_task'">
                                <i slot="reference" class="el-icon-close"></i>
                            </el-popconfirm>
                        </li>
                        <li class="cp-manage-li" v-if="isEditChildTaskFlag">
                            <span @click.stop="addChildTask()">
                                <i class="el-icon-plus"></i> 添加
                            </span>
                        </li>
                    </ul>
                </el-scrollbar>
                <el-scrollbar class="task-details-from dialog-has-footer" v-if="currentMenu.type==='main_task'">
                    <!-- 主任务 -->
                    <div style="display:flex;">
                        <div class="task-details-left">
                            <el-form ref="taskDetailsForm" v-if="taskDetailsData" :model="taskDetailsData" label-width="80px">
                                <el-form-item label="任务名称">
                                    <el-input v-model="taskDetailsData.name" placeholder="请输入任务名称" :disabled="!isEditableTaskDetails"></el-input>
                                </el-form-item>
                                <el-form-item label="所属项目">
                                    <el-select v-model="taskDetailsData.project_id" placeholder="请选择所属项目"  :disabled="!isEditableTaskDetails">
                                        <el-option v-for="item in projectListData" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="制作类型">
                                    <el-select v-model="taskDetailsData.standard_id" placeholder="请选择制作类型"  :disabled="!isEditableTaskDetails">
                                        <el-option v-for="item in productionSpecification" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="跟进人">
                                    <el-select v-model="taskDetailsData.follow_users" placeholder="请选择跟进人"  :disabled="!isEditableTaskDetails">
                                        <el-option v-for="item in taskCreatePersonList" :key="item.id" :label="item.name" :value="item.id" :disabled="item.is_update===2">
                                            <span>{{item.name}}</span>
                                            <cp-tip :disabled="item.is_update===2"></cp-tip>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="预计完成">
                                    <el-date-picker
                                        type="date"
                                        v-model="taskDetailsData.expire_end_time"
                                        :value="taskDetailsData.expire_end_time"
                                        value-format="yyyy-MM-dd"
                                        format="yyyy-MM-dd"
                                        placeholder="选择完成时间"
                                        :disabled="!isEditableTaskDetails"
                                    ></el-date-picker>
                                </el-form-item>
                                <el-form-item label="CP管理">
                                    <el-select v-model="taskDetailsData.cp_admin_id" placeholder="请选择CP管理"  :disabled="!isEditableTaskDetails && !isEditChildTaskFlag">
                                        <el-option v-for="item in cpAdmin" :key="item.id" :label="item.name" :value="item.id" :disabled="item.is_update===2">
                                            <span>{{item.name}}</span>
                                            <cp-tip :disabled="item.is_update===2"></cp-tip>
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="所属CP">
                                    <el-input
                                        v-model="taskDetailsData.company_name"
                                        placeholder="请输入所属CP"
                                        disabled
                                    ></el-input>
                                </el-form-item>
                                <el-form-item label="参考资料">
                                    <div class="file-box">
                                        <upload :uploadId="'uploadFile'" :disabled="!isEditableTaskDetails && !isEditableTaskMaxPrice" :auth="true" directory="task-file" :init-params="uploadParams" :previewParams="previewParams" @fileUploadSuccess="uploadSuccess">
                                            <div class="show-files" slot="files" v-if="taskDetailsData && taskDetailsData.file">
                                                <span class="file-name" :title="taskDetailsData.file.name">{{taskDetailsData.file.name}}</span>
                                                <span class="btn-groups">
                                                    <i v-if="$Tools.judgeFileType(taskDetailsData.file.name) === 'img'" class="el-icon-view" title="预览" @click="previewFile(taskDetailsData.file)"></i>
                                                    <i class="el-icon-download" title="下载" @click="downloadFile(taskDetailsData.file)"></i>
                                                </span>
                                            </div>
                                            <div v-else slot="files" class="no-file">
                                                无
                                            </div>
                                        </upload>
                                    </div>
                                </el-form-item>
                                <el-form-item label="参考原型">
                                    <div class="file-box">
                                        <upload :uploadId="'uploadPrototype'" :disabled="!isEditableTaskDetails && !isEditableTaskMaxPrice" :auth="true" directory="task-prototype" :init-params="uploadPrototypeParams" :previewParams="previewPrototypeParams" @fileUploadSuccess="uploadPrototypeSuccess">
                                            <div class="show-files" slot="files" v-if="taskDetailsData && taskDetailsData.rsp_prototype_file">
                                                <span class="file-name" :title="taskDetailsData.rsp_prototype_file.name">{{taskDetailsData.rsp_prototype_file.name}}</span>
                                                <span class="btn-groups">
                                                    <i v-if="$Tools.judgeFileType(taskDetailsData.rsp_prototype_file.name) === 'img'" class="el-icon-view" title="预览" @click="previewFile(taskDetailsData.rsp_prototype_file)"></i>
                                                    <i class="el-icon-download" title="下载" @click="downloadFile(taskDetailsData.rsp_prototype_file)"></i>
                                                </span>
                                            </div>
                                            <div v-else slot="files" class="no-file">
                                                无
                                            </div>
                                        </upload>
                                    </div>
                                </el-form-item>
                                <el-form-item :label="taskDetailsLeftTab.length === 1 ? '报价':'报价合计'" :required="taskDetailsLeftTab.length === 1">
                                    <el-input v-model.number="taskDetailsData.price_sum"
                                        maxlength="9"
                                        :disabled="isEditableTaskDetails || !isEditChildTaskFlag || taskDetailsLeftTab.length > 1"
                                        @input="focusPriceSumEnter">
                                        <template slot="append">人天</template>
                                    </el-input>
                                    <div class="err-tips" v-if="checkTaskDetailsObj.priceSumIsEmpty">报价不能为空（输入大于0的数字）</div>
                                </el-form-item>
                                <el-form-item label="计划排期">
                                    <el-date-picker
                                        type="daterange"
                                        v-model="taskDetailsData.scheduleTime"
                                        value-format="yyyy-MM-dd"
                                        format="yyyy-MM-dd"
                                        :picker-options="pickerOptionsStart"
                                        start-placeholder="开始日期"
                                        range-separator="至"
                                        end-placeholder="结束日期"
                                        disabled
                                    ></el-date-picker>
                                </el-form-item>
                                <el-form-item label="排期天数">
                                    <el-input v-model="taskDetailsData.schedule_day" disabled></el-input>
                                </el-form-item>
                                <el-form-item label="最高报价" v-if="!taskDetailsPageAuthConfig.task_cp_price">
                                    <el-input-number
                                        v-model="taskDetailsData.expire_price_max"
                                        controls-position="right"
                                        :min="1" :max="99999999"
                                        :disabled="!isEditableTaskDetails && !isEditableTaskMaxPrice">
                                    </el-input-number>
                                    <span style="padding-left: 4px;">人/天</span>
                                </el-form-item>
                                <el-form-item label="备注"  v-if="!taskDetailsPageAuthConfig.task_cp_price">
                                    <el-input type="textarea" :rows="4" resize="none" v-model="taskDetailsData.remark" :disabled="!isEditableTaskDetails"></el-input>
                                </el-form-item>
                                <el-form-item :label="taskDetailsLeftTab.length === 1 ? '报价确认':'确认合计'" v-if="confirmPriceFlag">
                                    <el-input
                                        v-model="taskDetailsData.confirm_price_sum"
                                        :disabled="taskEntryStatus == 4 || taskDetailsLeftTab.length > 1"
                                        @input="focusConfirmPriceSumEnter"
                                        maxlength="9">
                                        <template slot="append">人天</template>
                                    </el-input>
                                    <div class="err-tips" v-if="checkTaskDetailsObj.confirmPriceSumIsEmpty">报价不能为空（输入大于0的数字）</div>
                                </el-form-item>
                            </el-form>
                        </div>
                        <div class="task-details-right">
                            <task-node-info
                                v-if="taskDetailsLeftTab.length === 1"
                                :isEditChildTaskFlag="isEditChildTaskFlag"
                                :taskNodeData="(standardNode&&standardNode.length > 0) ? standardNode : currentMenu.node"
                                :taskDetailsPageAuthConfig='taskDetailsPageAuthConfig'
                                @checkRequiredData='checkRequiredData'
                                :taskDetailsData="taskDetailsData"></task-node-info>
                        </div>
                    </div>
                </el-scrollbar>

                <!--  主任务下的子任务 -->
                <div class="task-node-details dialog-has-footer" v-if="currentMenu.type==='child_task'">
                    <div class="sub-task-left">
                        <div style="padding:20px;">
                            <childTaskLeftDetails
                                :isEditChildTaskFlag="isEditChildTaskFlag"
                                :childtTaskDetailsData="currentMenu"
                                :taskEntryStatus='taskEntryStatus'
                                :productionSpecification='productionSpecification'
                                @changeStandard='changeStandard'
                                @changesupportDepQuotatePrice='changePriceSum'
                                @focusTaskNameEnter='focusTaskNameEnter'
                                @changePrice='changePriceSum'></childTaskLeftDetails>
                        </div>
                    </div>
                    <el-scrollbar class="task-node-right">
                        <div style="padding:20px;">
                            <task-node-info
                            :taskDetailsData="taskDetailsData"
                            :isEditChildTaskFlag="isEditChildTaskFlag"
                            :taskNodeData="currentMenu.data.node"
                            :taskDetailsPageAuthConfig='taskDetailsPageAuthConfig'
                            @checkRequiredData='checkRequiredData'></task-node-info>
                        </div>

                    </el-scrollbar>
                </div>
            </div>
            <!-- 甲方的编辑任务功能 -->
            <div slot="footer" class="dialog-footer" v-if="userType==1">
                <el-button size="medium" round @click="closeDialog()">取消</el-button>
                <el-button size="medium" round type="primary" @click="updateOrConfirmPriceTaskDetails()">确定</el-button>
            </div>
            <!-- 乙方cp管理的报价功能 -->
            <div slot="footer" class="dialog-footer" v-if="taskDetailsPageAuthConfig.task_cp_price">
                <el-button size="medium" round @click="cpManageUpdatePrice(2)" v-if="taskEntryStatus == 4 && userType==2">驳回</el-button>
                <el-button size="medium" round @click="closeDialog()" v-else>取消</el-button>
                <el-button size="medium" round type="primary" @click="cpManageQuotatePrice()" v-if="taskEntryStatus == 1 && isEditChildTaskFlag">确定</el-button>
                <el-button size="medium" round type="primary" @click="cpManageUpdatePrice(1)" v-if="taskEntryStatus !=1">确定</el-button>
            </div>
        </el-dialog>
        <!-- 图片文件预览 -->
        <div class="file-preview">
            <div v-if="showPreviewDialog">
                <image-preview :visible.sync="showPreviewDialog" :data="previewData"></image-preview>
            </div>
        </div>
    </div>
</template>

<script>
import upload from "@components/upload/upload";
import ImagePreview from "@components/preview/imagePreview";
import taskNodeInfo from ".././components/taskNodeInfo";
import childTaskLeftDetails from ".././components/childTaskLeftDetails";
import {TaskEntryRequest} from "../../service/http";
import { ProjectGroupRequest } from "../../../projectSelection/service/http";
import { NodeService } from "../../../basicManagement/service/http";
import {SystemGlobalRequest} from "commonHttp";
import {Debounce} from '@libs/js/utils';
export default {
    name: "addTaskDialog",
    components: {
        upload,
        ImagePreview,
        taskNodeInfo,
        childTaskLeftDetails
    },
    props: {},
    data() {
        return {
            isLoading: true,
            showPreviewDialog: false,
            previewData: {},
            taskDetailsData: {},
            taskDetailsDialog: false,
            taskDetailsLeftTab: [],
            currentMenu: {},
            projectListData:[],
            productionSpecification:[],
            taskCreatePersonList: [],
            previewParams: {
                show: true,
                btnText: '上传附件' // 默认描述为 **上传文件**
            },
            uploadParams: {
                isDirectory: false, // 是否需要上传文件夹
                singleFile: true, // 是否为多文件上传，默认为true（单文件）， false为多文件
                attrs: {accept: 'image/*, application/msword, application/pdf, application/zip, application/vnd.ms-excel'} // 可上传的文件格式，需按照MIME格式书写
            },
            previewPrototypeParams: {
                show: true,
                btnText: '上传原型' // 默认描述为 **上传文件**
            },
            uploadPrototypeParams: {
                isDirectory: false, // 是否需要上传文件夹
                singleFile: true, // 是否为多文件上传，默认为true（单文件）， false为多文件
                attrs: {accept: 'image/*, application/msword, application/pdf, application/zip, application/vnd.ms-excel'} // 可上传的文件格式，需按照MIME格式书写
            },
            // CP管理
            standardNode:[], // 节点
            ExistenceNum: 0,
            taskEntryStatus: null,
            activeIndex: 0,
            checkTaskDetailsObj:{
                priceSumIsEmpty: false,
                confirmPriceSumIsEmpty: false,
            },
            taskDetailsPageAuthConfig:{}, // 权限
            isEditableTaskDetails: false, // 主任务是否能被编辑
            pickerOptionsStart:{}, // 日期选择时间限制
            userData: sessionStorage.userData ? JSON.parse(sessionStorage.userData) : {},
            isEditableTaskMaxPrice: false, // 主任务最高报价是否能被编辑
            isEditChildTaskFlag: false, // 子任务是否能编辑
            cpAdmin: [],
            mainTaskIsEditable: [102, 103, 104, 106, 107, 108], /*  102: '待开始', 103: '进行中', 104: '已暂停', 106: '已逾期', 107: '待审核', 108: '已驳回', */
        };
    },
    computed: {
        userType(){
            return this.userData.company_type;
        },
        currentUserId(){
            return this.userData.id;
        },
        confirmPriceFlag(){
            if(this.taskEntryStatus == 3 && this.userType==1){
                return true;
            } else if(this.taskEntryStatus == 4 && this.userType==2){
                return true;
            } else{
                return false;
            }
        },
    },
    created(){
        this.pickerOptionsStart = Object.assign({},this.pickerOptionsStart,{
            disabledDate: (time) => {
                return time.getTime() < Date.now();
            }
        })
    },
    mounted() {
        this.taskDetailsPageAuthConfig = JSON.parse(sessionStorage.pageAuthConfig) || {};
    },
    methods: {
        // 是否可编辑子任务
        isEditChildTask(){
            const {task_info_child = []} = this.taskDetailsData;
            if(this.taskDetailsPageAuthConfig.task_cp_price){
                if(this.currentMenu.isCurrentManage){
                    // 任务信息没有下属任务[主任务待报价状态]&&CP管理是自己 、下属任务为录入中状态&&CP管理是自己
                    if(this.taskEntryStatus == 1){
                        this.isEditChildTaskFlag = true;
                    } else{
                        task_info_child && task_info_child.length > 0 && task_info_child.forEach( option => {
                            if(option.status == 101){
                                this.isEditChildTaskFlag = true;
                            } else {
                                this.isEditChildTaskFlag = false;
                            }
                        })
                    }
                } else{
                    this.isEditChildTaskFlag = false;
                }

            } else {
                this.isEditChildTaskFlag = false;
            }
        },
        focusPriceSumEnter(value) {
            this.checkTaskDetailsObj.priceSumIsEmpty = !value || (!!value && value.trim().length <= 0) || !(!!value && value.replace(/\D/g, '').replace(/^0{1,}/g, ''));
        },
        focusConfirmPriceSumEnter(value){
            if(value){
                if(!(value.toString().replace(/\D/g, '').replace(/^0{1,}/g, ''))){
                    this.checkTaskDetailsObj.confirmPriceSumIsEmpty = true;
                } else{
                    this.checkTaskDetailsObj.confirmPriceSumIsEmpty = false;
                }
            }
        },
        // 获取所有任务详情
        initTaskInfosFun(uuId){
            this.getTaskInfoData(uuId).then(()=>{
                this.checkTaskItemIsEditable();
                this.getTaskCpData();
                // 任务在待报价状态根据规范id 回去响应制作节点，其余状态由后台返回
                if(this.taskDetailsPageAuthConfig.task_cp_price && this.taskEntryStatus == 1 && this.taskDetailsLeftTab.length ===1){
                    this.getStandardNodeById(this.taskDetailsData.standard_id)
                }
            });
        },
        // 是否可编辑主任务信息
        checkTaskItemIsEditable(){
            const {task_info_child = []} = this.taskDetailsData;
            if(this.taskDetailsPageAuthConfig.task_add){
                // 任务信息没有下属任务[主任务待报价状态]&&跟进人是自己  下属任务为录入中状态&&跟进人是自己 可编辑主任务信息
                // 下属任务中有待开始||进行中||已暂停||待审核||已驳回||已逾期 这六种状态中的某一种或几种状态时&&跟进人是自己     可编辑最高报价、参考资料
                if(this.currentMenu.isCurrentFollowPerson){
                    if(this.taskEntryStatus == 1){
                        this.isEditableTaskDetails = true;
                    } else {
                        task_info_child && task_info_child.length > 0 && task_info_child.forEach( option => {
                            if(option.status == 101){
                                this.isEditableTaskDetails = true;
                            } else if (this.mainTaskIsEditable.includes(option.status)){
                                this.isEditableTaskMaxPrice = true;
                                this.isEditableTaskDetails = false;
                            } else {
                                this.isEditableTaskDetails = false;
                                this.isEditableTaskMaxPrice = false;
                            }
                        })
                    }
                } else{
                    this.isEditableTaskDetails = false;
                    this.isEditableTaskMaxPrice = false;              
                }

            } else {
                this.isEditableTaskDetails = false;
                this.isEditableTaskMaxPrice = false;
            }
        },
        // 打开任务详情面板
        open(data){
            // 任务status   1待报价 2已报价 3已预警 4待确认
            this.taskDetailsDialog = true;
            this.initTaskInfosFun(data.uuid);
            this.getProjectListData().then((res) => {
                if (data && data.project_id){
                    this.getSysStandardData(data.project_id);
                    this.getTaskCreatePersonData(data.project_id);
                }
            });
        },
        // CP管理列表
        async getTaskCpData() {
            let params = {
                project_id:this.taskDetailsData.project_id,
                page:1,
                page_size:999,
            };
            if(this.userType==2){
                params.company_id = this.taskDetailsData.cp_id
            }
            const data = await TaskEntryRequest.getTaskCpManage(params);
            if (data.err_code === 0) {
                this.cpAdmin = data.data || [];
            }
        },
        // 项目列表
        async getProjectListData() {
            const data = await ProjectGroupRequest.getProjectList();
            if (data.err_code === 0) {
                this.projectListData = data.data || [];
            }
        },
        // 制作类型列表
        async getSysStandardData(id) {
            const data = await SystemGlobalRequest.getProjectProductionTypeList({project_ids: id});
            if(data.err_code === 0){
                this.productionSpecification = data.data || [];
            }
        },
        // 跟进人列表
        async getTaskCreatePersonData(id) {
            let params = {
                page:1,
                page_size: 999,
                project_id: id
            };
            const data = await TaskEntryRequest.getTaskCreatePerson(params);
            if(data.err_code === 0){
                this.taskCreatePersonList = data.data || [];
            }
        },
        // 获取任务详情
        async getTaskInfoData(taskId) {
            // 甲乙接口分开[1甲 2乙]
            let data;
            let isMain;
            if(this.userType == 1){
                data = await TaskEntryRequest.getPartyAMainTaskInfos({uuid: taskId});
            } else if(this.userType == 2) {
                data = await TaskEntryRequest.getPartyBMainTaskInfos({uuid: taskId});
            }
            if (data.err_code === 0) {
                this.isLoading = false;
                if(data.data && data.data.follow_users.length > 0){
                    data.data.follow_users = data.data.follow_users[0].id;
                }
                data.data.cp_admin_id = Number(data.data.cp_admin_id);
                this.$set(data.data, "scheduleTime", [data.data.schedule_start_time,data.data.schedule_end_time]);
                this.taskEntryStatus = data.data && data.data.status;
                this.taskDetailsData = data.data || {};
                this.taskDetailsLeftTab = [];
                isMain = this.taskDetailsData.task_info_child.length ===1 && this.taskDetailsData.task_info_child[0].is_origin == 1;
                if(isMain){
                    this.taskDetailsData.task_info_child[0].task_node.forEach(item=>{
                        this.$set(item, "nodeMakerIsEmpty", false);
                        this.$set(item, "nodeScheduleIsEmpty", false);
                        this.$set(item, "pickerOptionsStart", this.pickerOptionsStart);
                        this.$set(item, "scheduleTime", [item.schedule_start_time,item.schedule_end_time]);
                    });
                    this.taskDetailsLeftTab.push({
                        node: isMain ? this.taskDetailsData.task_info_child[0].task_node : [],
                        confirm_price_sum: this.taskDetailsData.confirm_price_sum,
                        status: this.taskDetailsData.status,
                        isCurrentFollowPerson: (Number(data.data.follow_users) === Number(this.currentUserId)) && this.userType == 1 ? true : false, // 甲方 是否当前任务的跟进人
                        isCurrentManage: ((Number(data.data.cp_admin_id) === Number(this.currentUserId)) && this.userType == 2) ? true : false, // 乙方 是否当前任务的所属CP管理
                        type: 'main_task',
                    })
                } else {
                    this.taskDetailsLeftTab.push({
                        node:[],
                        confirm_price_sum: this.taskDetailsData.confirm_price_sum,
                        status: this.taskDetailsData.status,
                        isCurrentFollowPerson: (Number(data.data.follow_users) === Number(this.currentUserId)) && this.userType == 1 ? true : false, // 甲方 是否当前任务的跟进人
                        isCurrentManage: ((Number(data.data.cp_admin_id) === Number(this.currentUserId)) && this.userType == 2) ? true : false, // 乙方 是否当前任务的所属CP管理
                        type: 'main_task',
                    });
                    this.taskDetailsData.task_info_child.forEach( option =>{
                        option.task_node.forEach(item =>{
                            this.$set(item, "nodeMakerIsEmpty", false);
                            this.$set(item, "nodeScheduleIsEmpty", false);
                            this.$set(item, "pickerOptionsStart", this.pickerOptionsStart);
                            this.$set(item, "scheduleTime", [item.schedule_start_time,item.schedule_end_time]);
                        });
                        this.taskDetailsLeftTab.push({
                            uuid: option.uuid,
                            name: option.name,
                            status: option.status,
                            isCurrentFollowPerson: (Number(data.data.follow_users) === Number(this.currentUserId)) && this.userType == 1 ? true : false, // 甲方 是否当前任务的跟进人
                            isCurrentManage: ((Number(data.data.cp_admin_id) === Number(this.currentUserId)) && this.userType == 2) ? true : false, // 乙方 是否当前任务的所属CP管理
                            type: 'child_task',
                            data:{
                                name: option.name,
                                price: option.price,
                                standard_id: option.standard_id,
                                confirm_price: option.confirm_price,
                                node: option.task_node || [],
                                childTaskNameIsEmpty: false,
                                childTaskPriceIsEmpty: false,
                                childTaskTypeIsEmpty: false,
                                confirmPriceIsEmpty: false,
                            }
                        });
                    })
                }
                // this.changePriceSum();
                this.currentMenu = this.taskDetailsLeftTab[0];
                this.isEditChildTask();
            } else{
                this.taskDetailsLeftTab = [];
                this.currentMenu = {}
            }
        },
        checkMenuItem(currentIndex) {
            this.activeIndex = currentIndex;
            this.currentMenu = this.taskDetailsLeftTab[currentIndex];
            if(this.currentMenu.data && this.currentMenu.data.node.length>0){
                this.currentMenu.data.node.forEach(option => {
                    this.$set(option, "scheduleTime", [
                        option.schedule_start_time,
                        option.schedule_end_time
                    ]);
                })
            }
            if(this.currentMenu.type === 'main_task'){
                this.getTaskCpData();
            }
        },
        // 附件预览
        previewFile(currentFile) {
            this.showPreviewDialog = true;
            this.previewData = currentFile;
        },
        uploadSuccess(file) {
            // 单文件上传直接覆盖，多文件push()
            this.currentMenu.file = file;
            this.taskDetailsData.file = file;
        },
        uploadPrototypeSuccess(prototype){
            this.currentMenu.rsp_prototype_file = prototype;
            this.taskDetailsData.rsp_prototype_file = prototype;            
        },
        downloadFile (file) {
            this.$Tools.downloadFile(file.url, file.name);
        },
        // 编辑任务详情 没有子任务可编辑/子任务录入中可编辑/并且仅当前任务的跟进人可进行操作
        updateTaskDetails(){
            let params = {};
            if(this.isEditableTaskDetails || this.isEditableTaskMaxPrice){
                let endTime = this.taskDetailsData.expire_end_time && this.taskDetailsData.expire_end_time.substring(0,10);
                params = {
                    uuid: this.taskDetailsData.uuid,
                    project_id: this.taskDetailsData.project_id,
                    name: this.taskDetailsData.name,
                    standard_id: this.taskDetailsData.standard_id,
                    files: this.taskDetailsData.file && this.taskDetailsData.file.id,
                    prototype_file: this.taskDetailsData.rsp_prototype_file && this.taskDetailsData.rsp_prototype_file.id,
                    cp_admin_id: this.taskDetailsData.cp_admin_id,
                    follow_user: this.taskDetailsData.follow_users,
                    expire_end_time: endTime,
                    expire_price_max: this.taskDetailsData.expire_price_max,
                    remark: this.taskDetailsData.remark,
                };
                return this.updateTaskDetailsRequest(params);
            } else {
                this.resetData();
            }
        },
        updateTaskDetailsRequest(params){
            return TaskEntryRequest.updateTaskInfosData(params);
        },
        async updateOrConfirmPriceTaskDetails(){
            let isEdit = this.isEditableTaskDetails || this.isEditableTaskMaxPrice; // 编辑主任务信息
            let isPrice = this.taskDetailsPageAuthConfig.task_confirm && this.taskEntryStatus == 3; // 甲方人天确认
            if(isEdit && !isPrice){
                let updateInfo = await this.updateTaskDetails();
                if(updateInfo.err_code === 0){
                    this.$message.success('任务编辑成功');
                    this.resetData();
                }
            }
            if(!isEdit && isPrice){
                let quotatePrice = await this.supportConfirmQuotate();
                if(!quotatePrice){
                    this.$message.error('请核验信息是否填写完整！');
                    return;
                } else{
                    if(quotatePrice.err_code === 0){
                        this.$message.success('确认报价成功');
                        this.resetData();
                    }
                }
            }
            if(isEdit && isPrice){
                let confirmPrice = await this.supportConfirmQuotate();
                if(!confirmPrice){
                    this.$message.error('请核验信息是否填写完整！');
                    return
                }
                let updateAction = await this.updateTaskDetails();
                if(confirmPrice.err_code === 0 && updateAction.err_code === 0){
                        this.$message.success(confirmPrice.err_message || updateAction.err_message);
                        this.resetData();
                }
            }
            if(!isEdit && !isPrice){
                this.closeDialog();
            }
        },
        // cp管理权限下  任务状态 待报价
        delChildTask(index){
            this.ExistenceNum--;
            this.taskDetailsLeftTab.splice(index, 1);
            if(this.taskDetailsLeftTab.length === 1){
                this.ExistenceNum = 0;
                this.currentMenu = this.taskDetailsLeftTab[0];
                this.getStandardNodeById(this.taskDetailsData.standard_id);
                this.activeIndex = 0;
            } else {
                this.currentMenu = this.taskDetailsLeftTab[index-1];
                this.activeIndex = index-1;
            }
            this.changePriceSum();
            if(this.currentMenu.data && this.currentMenu.data.node.length>0){
                this.currentMenu.data.node.forEach(option => {
                    this.$set(option, "scheduleTime", [
                        option.schedule_start_time,
                        option.schedule_end_time
                    ]);
                })
            }
        },
        addChildTask(){
            this.ExistenceNum++;
            this.taskDetailsLeftTab.push({
                name: `子任务${this.ExistenceNum}`,
                type: 'child_task',
                data:{
                    name: "",
                    price: "",
                    standard_id: "",
                    node: [],
                    childTaskNameIsEmpty: false,
                    childTaskPriceIsEmpty: false,
                    childTaskTypeIsEmpty: false,
                }
            });
            this.activeIndex = this.taskDetailsLeftTab.length-1;
            this.currentMenu = this.taskDetailsLeftTab[this.activeIndex];
            this.changePriceSum();
        },
        changePriceSum(){
            let numSum = 0;
            let supportDepPrice = 0;
            this.taskDetailsLeftTab && this.taskDetailsLeftTab.forEach((options)=>{
                if(options.hasOwnProperty('data')){
                    numSum += Number(options.data.price);
                    supportDepPrice += Number(options.data.confirm_price)
                }
            });
            this.taskDetailsData.price_sum = numSum;
            this.taskDetailsData.confirm_price_sum = supportDepPrice;
            if(this.currentMenu.data){
                if(this.currentMenu.data.price){
                    if(!(this.currentMenu.data.price.toString().replace(/\D/g, '').replace(/^0{1,}/g, ''))){
                        this.currentMenu.data.childTaskPriceIsEmpty = true;
                    } else{
                        this.currentMenu.data.childTaskPriceIsEmpty = false;
                    }
                }
                if(this.currentMenu.data.confirm_price){
                    if(!(this.currentMenu.data.confirm_price.toString().replace(/\D/g, '').replace(/^0{1,}/g, ''))){
                        this.currentMenu.data.confirmPriceIsEmpty = true;
                    } else{
                        this.currentMenu.data.confirmPriceIsEmpty = false;
                    }
                }
            }
        },
        // CP管理权限下
        changeStandard(){
            this.getStandardNodeById(this.currentMenu.data.standard_id);
            if(this.currentMenu.data){
                if(this.currentMenu.data.standard_id){
                    this.currentMenu.data.childTaskTypeIsEmpty = false;
                }
            }
        },
        // 校验提交的数据是否为空
        checkRequiredData(item){
            if (item.make_users) {
                this.$delete(item,"nodeMakerIsEmpty");
                this.$set(item, "nodeMakerIsEmpty", false);
            }
            if(item.schedule_start_time){
                this.$delete(item,"nodeScheduleIsEmpty");
                this.$set(item, "nodeScheduleIsEmpty", false);
            }
            
        },
        // 报价(CP管理)
        // 任务status 1待报价-CP报价 2已报价-CP修改报价 4待确认-乙方确认报价
        async cpManageUpdatePrice(type){
            let update = this.taskEntryStatus !=1 && this.isEditChildTaskFlag;
            let confirm = this.taskEntryStatus == 4 && this.taskDetailsPageAuthConfig.task_cp_price;
            if(update && !confirm){
                let updatePrice = await this.cpManagePrice();
                if(!updatePrice){
                    this.$message.error('请核验信息是否填写完整！');
                    return;
                } else{
                    if(updatePrice.err_code === 0){
                        this.$message.success('任务编辑成功');
                        this.resetData();
                    }
                }
            }
            if(!update && confirm){
                const pro = type === 1 ?  this.cpConfirmQuotedPriceFun() : this.rejectQuotatePrice();
                pro.then(res=>{
                    if(res.err_code === 0){
                        this.$message.success(type === 1 ? '确认报价成功' : '驳回报价成功');
                        this.resetData();
                    }
                })
            }
            if(update && confirm){
                let updatePrice = await this.cpManagePrice();
                if(!updatePrice){
                    this.$message.error('请核验信息是否填写完整！');
                    return;
                }
                let confirmPrice = type === 1 ? await this.cpConfirmQuotedPriceFun() : await this.rejectQuotatePrice();
                if(confirmPrice.err_code === 0 && updatePrice.err_code === 0){
                    this.$message.success(confirmPrice.err_message || updatePrice.err_message);
                    this.resetData();
                }
            }
            if(!update && !confirm){
                this.closeDialog();
            }
        },
        cpManageQuotatePrice: Debounce(function () {
            if(this.taskEntryStatus == 1 && this.isEditChildTaskFlag){
                this.cpManagePrice();
            } else{
                this.closeDialog();
            }
        }),
        // cp status==1任务待报价状态下（单任务/多任务报价）    -----------     （status2任务已报价状态下单任务/多任务 修改报价）
        cpManagePrice(){
            let  params = {};
            let nodeList = [];
            let checkStatus = false;
            if(this.taskDetailsLeftTab.length===1 && this.isEditChildTaskFlag){
                // 验证必填项
                if(!this.taskDetailsData.price_sum){
                    this.checkTaskDetailsObj.priceSumIsEmpty = true;
                    checkStatus = false;
                    return;
                } else {
                    nodeList = this.currentMenu.node.length > 0 ? this.currentMenu.node : this.standardNode;
                    for (let i = 0; i < nodeList.length; i++) {
                        if (nodeList[i].make_users.length ===0) {
                            nodeList[i].nodeMakerIsEmpty = true;
                            checkStatus = false;
                            return;
                        } else if(!nodeList[i].schedule_start_time){
                            nodeList[i].nodeScheduleIsEmpty = true;
                            checkStatus = false;
                            return;
                        } else {
                            checkStatus = true;
                        }
                    }
                }
                if(checkStatus){
                    // 组装后台参数
                    params = {
                        'id': this.taskDetailsData.uuid,
                        'cp_admin_id': this.taskDetailsData.cp_admin_id,
                        'type': 'task',
                        'data': {
                            'price': Number(this.taskDetailsData.price_sum),
                            'node': []
                        }
                    };
                    nodeList = this.currentMenu.node.length > 0 ? this.currentMenu.node : this.standardNode;
                    nodeList.forEach(current => {
                        let startTime = current.schedule_start_time && current.schedule_start_time.substring(0,10);
                        let endTime = current.schedule_end_time && current.schedule_end_time.substring(0,10);
                        params.data.node.push({
                            make_users: current.make_users,
                            schedule_start_time: startTime,
                            schedule_end_time: endTime,
                        });
                    });
                    params.data = params.data ? JSON.stringify(params.data) : {};
                }
            } else if(this.taskDetailsLeftTab.length>1 && this.isEditChildTaskFlag) {
                for (let i = 0; i < this.taskDetailsLeftTab.length; i++) {
                    if(this.taskDetailsLeftTab[i].type==='child_task'){
                        if(!this.taskDetailsLeftTab[i].data.name){
                            this.taskDetailsLeftTab[i].data.childTaskNameIsEmpty = true;
                            checkStatus = false;
                            return;
                        } else if(!this.taskDetailsLeftTab[i].data.price){
                            this.taskDetailsLeftTab[i].data.childTaskPriceIsEmpty = true;
                            checkStatus = false;
                            return;
                        } else if(!this.taskDetailsLeftTab[i].data.standard_id){
                            this.taskDetailsLeftTab[i].data.childTaskTypeIsEmpty = true;
                            checkStatus = false;
                            return;
                        } else if(this.taskDetailsLeftTab[i].data.node){
                            let nodeArr = this.taskDetailsLeftTab[i].data.node;
                            for (let index = 0; index < nodeArr.length; index++) {
                                const element = nodeArr[index];
                                if (element.make_users.length ===0) {
                                    element.nodeMakerIsEmpty = true;
                                    checkStatus = false;
                                    return;
                                } else if(!element.schedule_start_time){
                                    element.nodeScheduleIsEmpty = true;
                                    checkStatus = false;
                                    return;
                                } else {
                                    checkStatus = true;
                                }
                            }
                        }

                    }
                }
                if(checkStatus){
                    params = {
                        'id':  this.taskDetailsData.uuid, //任务的UUID
                        'cp_admin_id': this.taskDetailsData.cp_admin_id,
                        'type': 'task-child',
                        'data': []
                    };
                    this.taskDetailsLeftTab.forEach( item => {
                        if(item.data){
                            params.data.push({
                                name: item.data.name,
                                price: Number(item.data.price),
                                standard_id: item.data.standard_id,
                                node: item.data.node
                            });
                        }
                    });
                    params.data && params.data.forEach( options =>{
                        options.node.forEach( obj =>{
                            let startTime = obj.schedule_start_time && obj.schedule_start_time.substring(0,10);
                            let endTime = obj.schedule_end_time && obj.schedule_end_time.substring(0,10);
                            this.$set(obj, "schedule_start_time", startTime);
                            this.$set(obj, "schedule_end_time", endTime);
                            delete obj.id;
                            delete obj.name;
                            delete obj.scheduleTime;
                            delete obj.rsp_make_users;
                            delete obj.task_child_id;
                            delete obj.task_id;
                            delete obj.status;
                            delete obj.nodeMakerIsEmpty;
                            delete obj.nodeScheduleIsEmpty;
                            delete obj.standard_id;
                            delete obj.pickerOptionsStart;
                            delete obj.isCurrentFollowPerson;
                            delete obj.isCurrentManage;
                        })
                    });
                    params.data = params.data ? JSON.stringify(params.data) : [];
                }
            } else{
                this.resetData();
            }
            if(checkStatus){
                if(this.taskEntryStatus ==1 && this.isEditChildTaskFlag){
                    this.cpManageQuotedPriceRequest(params);
                } else if(this.taskEntryStatus !=1 && this.isEditChildTaskFlag){
                    return TaskEntryRequest.updateQuotedPrice(params);
                } else{
                    this.resetData();
                }
            } else {
                return false;
            }
        },
        // cp报价请求
        async cpManageQuotedPriceRequest(params){
        let data = await TaskEntryRequest.cpManageQuotedPrice(params);
        if(data.err_code === 0){
            this.$message.success('报价成功');
            this.resetData();
        }
        },
        // // cp 主任务待确认 时确认报价
        cpConfirmQuotedPriceFun(){
            let params = {
                id: this.taskDetailsData.uuid,
                type: 1,
            };
            return TaskEntryRequest.confirmQuotedPrice(params);
        },
        // // cp 主任务待确认 时驳回报价
        rejectQuotatePrice(){
            let params = {
                id: this.taskDetailsData.uuid,
                type: 2,
            };
            return TaskEntryRequest.confirmQuotedPrice(params);
        },
        // 获取某规范的节点列表
        async getStandardNodeById(standardId) {
            let nodePro = { id: standardId};
            let data = await NodeService.getStandardNodes(nodePro);
            if(data.err_code === 0){
                data.data && data.data.forEach((option,index)=>{
                    option.make_users = [];
                    option.schedule_start_time = '';
                    option.schedule_end_time = '';
                    this.$set(option, "scheduleTime", [
                        option.schedule_start_time,
                        option.schedule_end_time
                    ]);
                    option.nodeMakerIsEmpty= false;
                    option.nodeScheduleIsEmpty= false;
                    option.pickerOptionsStart= this.pickerOptionsStart;
                    option.isCurrentFollowPerson = ((this.taskDetailsData.follow_users && this.taskDetailsData.follow_users.length > 0 && this.taskDetailsData.follow_users[0].id) == this.currentUserId && this.userType == 1) ? true : false; // 甲方 是否当前任务的跟进人
                    option.isCurrentManage = ((this.taskDetailsData.cp_admin_id == this.currentUserId) && this.userType == 2) ? true : false; // 乙方 是否当前任务的所属CP管理
                });
                this.standardNode = data.data || [];
                if(this.currentMenu.type === 'child_task'){
                    this.currentMenu.data.node = data.data || [];
                }
            }
        },
        // 确认报价（支持部门）3已预警-甲方确认报价
        supportConfirmQuotate(){
            let params = {};
            let checkDataStatus = false;
            let tempError,notNum,tempNum
            ;
            params = {
                id: this.taskDetailsData.uuid, // 任务 UUID
                data:[]
            };
            if(this.taskDetailsLeftTab.length > 1){
                for (let i = 0; i < this.taskDetailsLeftTab.length; i++) {
                    if(this.taskDetailsLeftTab[i].hasOwnProperty('data')){
                        tempError = !this.taskDetailsLeftTab[i].data.confirm_price;
                        notNum = isNaN(Number(this.taskDetailsLeftTab[i].data.confirm_price));
                        tempNum = Number(this.taskDetailsLeftTab[i].data.confirm_price)<=0;
                        if(tempError || notNum || tempNum){
                            this.$set(this.taskDetailsLeftTab[i].data,'confirmPriceIsEmpty',true);
                            checkDataStatus = false;
                            return;
                        }else{
                            checkDataStatus = true;
                        }
                    }
                }
                if(checkDataStatus){
                    this.taskDetailsLeftTab.forEach( current =>{
                        if(current.hasOwnProperty('data') && current.data){
                            params.data.push({
                                id: current.uuid,//子任务 UUID
                                price: Number(current.data.confirm_price),//建议报价
                            });
                            
                        }
                    });
                    params.data = params.data ? JSON.stringify(params.data) : [];
                }
            } else {
                tempError = !this.taskDetailsData.confirm_price_sum;
                notNum = isNaN(Number(this.taskDetailsData.confirm_price_sum));
                tempNum = Number(this.taskDetailsData.confirm_price_sum)<=0;
                if(tempError || notNum || tempNum){
                    this.$set(this.checkTaskDetailsObj,'confirmPriceSumIsEmpty',true);
                    checkDataStatus = false;
                    return;
                }else {
                    checkDataStatus = true;
                }
                if(checkDataStatus){
                    params.data.push({
                        id: this.taskDetailsData.task_info_child[0].uuid,//子任务 UUID
                        price: Number(this.taskDetailsData.confirm_price_sum),//建议报价
                    });
                    params.data = params.data ? JSON.stringify(params.data) : [];
                }
            }
            if(checkDataStatus){
                return TaskEntryRequest.supportDepConfirmQuotatePrice(params)
            }else{
                return false;
            }
        },
        resetData(){
            this.resetForm();
            this.$emit('dialogClose');
            this.$emit('reloadTaskList');
            this.$forceUpdate();
        },
        resetForm(){
            this.checkTaskDetailsObj = {
                priceSumIsEmpty: false,
                confirmPriceSumIsEmpty: false,
            };
            this.activeIndex = 0;
            this.taskDetailsDialog = false;
            this.ExistenceNum = 0;
            this.currentMenu = {};
            this.taskDetailsData = {};
            this.taskDetailsLeftTab = [];
            if(this.currentMenu.data){
                this.currentMenu.data.node = [];
            }
            this.standardNode = [];
        },
        closeDialog(){
            this.resetForm();
            this.$emit('dialogClose');
            this.$forceUpdate();
        },
        focusTaskNameEnter(value){
            if(this.currentMenu.data.name){
                this.currentMenu.data.childTaskNameIsEmpty = false;
            }
        }
    }
};
</script>
<style lang="less" scoped>
.task-details-dialog {
    height: 100%;
    position: relative;
    .dialog-details{
        display: flex;
        .task-details-left-tab {
            border-right: 1px solid #404547;
            ul{
                height: 600px;
            }
            li {
                width: 140px;
                height: 50px;
                border-left: 3px solid transparent;
                cursor: pointer;
                position: relative;
                line-height: 50px;
                text-align: left;
                padding: 0 20px;
                span{
                    display: inline-block;
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                &.active-sty {
                    color: @white;
                    border-left-color: @baseColor;
                    background: @backGroundHover;
                }
                .el-icon-close{
                    position: absolute;
                    top: 8px;
                    right: 5px;
                    font-size: 14px;
                    &:hover{
                        color: @error;
                    }
                }
            }
            .cp-manage-li{
                span{
                    &:hover{
                        color: @baseColor;
                    }
                }
            }
        }
        .task-details-from {
            display: flex;
            height: 600px;
            flex: 1;
            .el-form-item{
                &:last-child{
                    margin-bottom: 0;
                }
            }
            /deep/ .el-scrollbar__wrap {
                flex: 1;
            }
            .task-details-left ,.task-details-right{
                padding: 20px;
                position: relative;
                flex: 1;
                box-sizing: border-box;
                overflow: hidden;
                .file-box {
                    .show-files{
                        display: flex;
                        .file-name{
                            display: inline-block;
                            max-width: 100px;
                            overflow:hidden;
                            text-overflow:ellipsis;
                            white-space:nowrap
                        }
                        .btn-groups {
                            margin: 0 0 0 8px;
                            i {
                                font-size: 16px;
                                color: @baseColor;
                            }
                        }
                    }
                    .no-file{
                        padding-left: 5px;
                    }
                }
            }
            .task-details-right {
                padding: 20px;
            }
        }
        .task-node-details {
            width: calc(~'100% - 183px');
            height: 600px;
            display: flex;
            overflow: hidden;
            flex: 1;
            .sub-task-left,.task-node-right{
                position: relative;
                flex: 1;
                height: 100%;
                box-sizing: border-box;
                overflow: hidden;
            }
            .task-node-right{
                border-left: 1px solid #3B3F41;
            }
        }
        /deep/.el-input,.el-date-editor,.el-textarea,.el-select{
            width: 100%;
        }
    }
    .err-tips{
        color: #f56c6c;
        font-size: 12px;
        line-height: 1;
        padding-top: 4px;
        position: absolute;
        top: 100%;
        left: 0;
    }
    .file-preview{
        z-index: 3000;
    }
    /deep/.el-input-number{
        width: 230px!important;
        input{
            width: 230px!important;
            text-align: left!important;
        }
    }
    /deep/.el-date-editor {
        .el-range-separator {
            width: 10%;
        }
    }
}
</style>
