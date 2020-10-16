<template>
    <div class="task-bc">
        <div class="task-wrap">
            <div class="warn-screen-box" v-if="isShowWarnDaysTable">
                <div>
                    <el-select
                        class="screen-item"
                        size="medium"
                        v-model="warnScreenData.project_ids"
                        placeholder="选择项目"
                        style="width:180px;padding-right: 10px;"
                        @change='selectProject($event)'>
                        <el-option v-for="(item, index) in myProjectList" :key="index" :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                    <el-input
                        class="screen-item search-box"
                        style="width:180px"
                        placeholder="输入公司名称"
                        ref="searchCp"
                        size="medium"
                        v-model="warnScreenData.searchCP"
                        @input="getTaskWarnListData()">
                        <el-button slot="append" icon="el-icon-search" size="medium"></el-button>
                    </el-input>
                </div>
                <div>
                    <el-button type="primary" size="medium" round @click="backTo()">返回</el-button>
                </div>
            </div>
            <div v-else class="entry-screen-box">
                <div class="screen-left">
                    <el-select class="screen-item" size="medium" @change='selectProject($event)'
                               v-model="screenData.project_id" placeholder="选择项目">
                        <el-option v-for="(item, index) in myProjectList" :key="index" :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                    <el-input
                        class="screen-item search-box"
                        placeholder="输入主任务名"
                        ref="search_input"
                        @input="reloadTaskList()"
                        size="medium"
                        v-model="screenData.like">
                        <el-button slot="append" icon="el-icon-search" size="medium"></el-button>
                    </el-input>
                    <el-select class="screen-item" size="medium" @change='reloadTaskList()'
                               v-model="screenData.standard_id" clearable placeholder="选择制作类型">
                        <el-option v-for="(item, index) in productionSpecification" :key="index" :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                    <el-select class="screen-item" size="medium" @change='reloadTaskList()'
                               v-model="screenData.task_status" clearable placeholder="选择主任务状态">
                        <el-option v-for="(item, index) in taskEntryStatusList" :key="index" :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                    <el-select v-if="userType == 1" class="screen-item" size="medium" @change='reloadTaskList()'
                               v-model="screenData.cp_id" clearable placeholder="选择CP">
                        <el-option v-for="(item, index) in CPDataList" :key="index" :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                    <el-date-picker
                        v-model="screenData.end_time"
                        @change="reloadTaskList()"
                        :value-format="'yyyy-MM-dd'"
                        format="yyyy-MM-dd"
                        class="screen-item"
                        size="medium"
                        type="date"
                        clearable
                        placeholder="选择完成时间">
                    </el-date-picker>
                </div>
                <div class="screen-right">
                    <el-button type="primary" size="medium" v-if="taskEntryPageAuthConfig.task_add" @click="addTask()"
                               round>新增任务
                    </el-button>
                    <el-button type="primary" size="medium" v-if="taskEntryPageAuthConfig.task_warning"
                               @click="editWarnDays()" round>人天预警
                    </el-button>
                    <el-button type="primary" size="medium" v-if="taskEntryPageAuthConfig.task_add" round
                               @click="showBatchImport">批量导入
                    </el-button>
                    <el-button type="primary" size="medium" v-if="userType == 1" @click="exporTaskEntryExcel()" round>
                        导出
                    </el-button>
                </div>
            </div>
            <div class="warn-table-container">
                <!-- 人天预警表格 -->
                <div v-if="isShowWarnDaysTable" style="height:100%" class="warn-table-box">
                    <loading v-if="isLoading"></loading>
                    <el-table v-else :data="manDayWarnTable" border v-scroll:table>
                        <el-table-column prop="cp_name" label="CP" :resizable="false"
                                         :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="warning_price" label="预警天数" :render-header="renderHeader"
                                         :resizable="false"></el-table-column>
                        <el-table-column prop="operate" label="操作" :resizable="false">
                            <template slot-scope="scope">
                                <div @click="editWarnDaysItems(scope)">
                                    <i class="el-icon-edit-outline" :title="'编辑预警天数'"></i>
                                </div>
                            </template>
                        </el-table-column>
                        <div slot="empty">
                            <no-data></no-data>
                        </div>
                    </el-table>
                </div>
                
                <!-- 任务列表 -->
                <div v-else class="task-table">
                    <loading v-if="isLoading"></loading>
                    <el-table v-else
                              border
                              :data="taskEntryTableData"
                              row-key="uuid"
                              :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                              v-scroll:table
                              :default-sort="sortOrders"
                              @sort-change='sortChange'>
                        <el-table-column prop="name" label="任务" :show-overflow-tooltip="true" :resizable="false">
                            <template slot-scope="scope">
                                <span class="unusualStatus" v-if="scope.row.mainTaskAbnormalFlag">异</span>
                                <span class="task-name">{{ scope.row.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="cpProduct" label="制作人" :show-overflow-tooltip="true" :resizable="false">
                            <template slot-scope="scope">
                                <span class="pro-name">{{ scope.row.cpProduct }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="cp_name" label="CP" :sortable='true' :resizable="false"
                                         :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="standard_name" label="类型" :resizable="false"
                                         :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column width="120" prop="state" label="状态" sortable='custom' :resizable="false">
                            <template slot-scope="scope">
                                <div
                                    :class="{ 'beQuoted': scope.row.status == 1, 'specialColor': scope.row.status == 3 }">
                                    {{ taskEntryStatus[scope.row.status] }}
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="schedule_end_time" label="完成时间" :resizable="false"></el-table-column>
                        <el-table-column width="140" label="操作" :resizable="false">
                            <template slot-scope="scope"
                                      v-if="scope.row.hasOwnProperty('is_main_task') && scope.row.is_main_task">
                                <div class="slot-temp">
                                    <el-badge is-dot class="item" v-if="scope.row.status == 1 || scope.row.status == 3">
                                        <i class="el-icon-edit-outline" @click="editTask(scope.row)"
                                           :title="'任务详情'"></i>
                                    </el-badge>
                                    <i v-else class="el-icon-edit-outline" @click="editTask(scope.row)"
                                       :title="'任务详情'"></i>
                                    <i class="el-icon-notebook-2" @click="showTaskEditLogs(scope.row)"
                                       :title="'日志详情'"></i>
                                </div>
                            </template>
                        </el-table-column>
                        <div slot="empty">
                            <no-data></no-data>
                        </div>
                    </el-table>
                </div>
                <!-- 日志表格 -->
            </div>
        </div>
        <!-- 任务详情面板 -->
        <div class="task-details-modal" v-if="isShowTaskDetailsDialog">
            <task-details-dialog ref="taskDetails" @reloadTaskList="reloadTaskList()"
                                 @dialogClose="closeAddTaskDialog()"></task-details-dialog>
        </div>
        <!-- 新增任务面板 -->
        <div class="add-task-modal" v-if="addTaskDialogShow">
            <add-task-dialog ref="newAddTask" @reloadTaskList="reloadTaskList()"
                             @dialogClose="closeAddTaskDialog()"></add-task-dialog>
        </div>
        <!-- 人天预警面板 -->
        <div class="warn-set" v-if="isShowWarnDaysDialog">
            <el-dialog title="预警设置" :visible.sync="isShowWarnDaysDialog" :close-on-click-modal='false' width="500px">
                <div class="dialog-form">
                    <el-form label-width="80px" :model="formParams" ref="warnForm">
                        <el-form-item label="预警天数">
                            <el-input
                                v-model="formParams.days"
                                placeholder="请输入预警天数"
                                @input="inputDaysEnter"
                                maxlength="9"
                            ></el-input>
                            <div class="err-tips" v-if="checkDaysObj.daysIsEmpty">预警天数不能为空(大于0的数字)</div>
                        </el-form-item>
                    </el-form>
                </div>
                <div slot="footer" class="dialog-footer">
                    <el-button size="medium" round @click="closeWarnDialog()">取消</el-button>
                    <el-button size="medium" round type="primary" @click="updateWarnDays()">确定</el-button>
                </div>
            </el-dialog>
        </div>
        <div v-if="isShowLogTable">
            <task-details-update-log ref="logs"></task-details-update-log>
        </div>
        <batch-import-dialog v-if="batchImportVisible" @hide="hideBatchImport"
                             @showTable="showBatchImportTable"></batch-import-dialog>
        <batch-import-table-dialog v-if="batchImportTableVisible" :fileId="fileId" @hide="hideBatchImportTable"
                                   @update="reloadTaskList"></batch-import-table-dialog>
    </div>
</template>

<script>
    import addTaskDialog from "./components/addTaskDialog";
    import taskDetailsDialog from "./components/taskDetailsDialog";
    import taskDetailsUpdateLog from "./components/taskDetailsUpdateLog";
    import BatchImportDialog from "./components/batchImportDialog";
    import BatchImportTableDialog from "./components/batchImportTableDialog";
    import {TaskEntryRequest} from "../service/http";
    import {SystemGlobalRequest} from "commonHttp";
    import {ProjectGroupRequest} from "../../projectSelection/service/http";
    import Constant from '@libs/js/constant';
    
    export default {
        name: "taskEntry-index",
        components: {addTaskDialog, taskDetailsDialog, taskDetailsUpdateLog, BatchImportDialog, BatchImportTableDialog},
        data() {
            return {
                isLoading: true,
                sortOrders: {},
                isShowTaskDetailsDialog: false,
                addTaskDialogShow: false,
                taskEntryTableData: [],
                manDayWarnTable: [],
                // 任务列表筛选参数
                screenData: {
                    project_id: null,
                    like: null,
                    standard_id: null,
                    task_status: null,
                    cp_id: null,
                    end_time: null,
                },
                isShowWarnDaysTable: false,
                formParams: {
                    days: null
                }, // 预警列表
                isShowWarnDaysDialog: false,
                taskEntryStatus: Constant.taskStatus,
                taskEntryStatusList: [],
                productionSpecification: [],
                myProjectList: [],
                CPDataList: [],
                // 人天预警筛选条件
                warnScreenData: {
                    project_ids: null,
                    searchCP: null,
                    cp_id: null
                },
                taskEntryPageAuthConfig: sessionStorage.pageAuthConfig ? JSON.parse(sessionStorage.pageAuthConfig) : {},
                userData: sessionStorage.userData ? JSON.parse(sessionStorage.userData) : {},
                isShowLogTable: false,
                batchImportVisible: false,
                batchImportTableVisible: false,
                fileId: '',
                checkDaysObj: {
                    daysIsEmpty: false,
                },
                unusualTaskStatus: [104, 106, 203, 205],// 已暂停 已逾期104,106,203,205
            };
        },
        computed: {
            userType() {
                return this.userData.company_type;
            }
        },
        mounted() {
            this.getProjectListData();
        },
        methods: {
            // 筛选任务列表
            sortChange(column) {
                this.sortOrders = {prop: column.prop, order: column.order};
                this.getTaskListData(column);
            },
            //筛选项目
            selectProject(projectID) {
                if (this.isShowWarnDaysTable) {
                    this.warnScreenData.project_ids = projectID;
                    this.getTaskWarnListData();
                    this.resetWarnScreenDataData();
                } else {
                    this.screenData.project_id = projectID;
                    this.getSysStandardData();
                    // 甲方需要搜索CP
                    if (this.userType == 1) {
                        this.getProjectCPListFun();
                    }
                    this.reloadTaskList();
                    this.resetScreenDataData();
                }
            },
            resetWarnScreenDataData() {
                this.$set(this.warnScreenData, 'searchCP', null);
                this.$set(this.warnScreenData, 'cp_id', null);
            },
            resetScreenDataData() {
                this.$set(this.screenData, 'like', null);
                this.$set(this.screenData, 'standard_id', null);
                this.$set(this.screenData, 'task_status', null);
                this.$set(this.screenData, 'cp_id', null);
                this.$set(this.screenData, 'end_time', null);
            },
            async getProjectListData() {
                const data = await ProjectGroupRequest.getProjectList();
                if (data.err_code === 0) {
                    this.myProjectList = data.data || [];
                    this.myProjectList.unshift({id: 0, name: '全部项目'});
                    if (this.myProjectList && this.myProjectList.length > 0) {
                        this.screenData.project_id = this.myProjectList && this.myProjectList[0].id;
                        this.warnScreenData.project_ids = this.myProjectList && this.myProjectList[0].id;
                        this.getSysStandardData();
                        this.taskEntryStatusList = this.$Tools.CoverTaskStatusArray(1);
                        if (this.userType == 1) {
                            this.getProjectCPListFun();
                        }
                        this.reloadTaskList();
                    }
                }
            },
            // 制作类型
            async getSysStandardData() {
                const data = await SystemGlobalRequest.getProjectProductionTypeList({project_ids: this.screenData.project_id});
                if (data.err_code === 0) {
                    this.productionSpecification = data.data || [];
                }
            },
            //根据项目获取CP
            async getProjectCPListFun() {
                let data = await SystemGlobalRequest.getProjectCPList({project_id: this.screenData.project_id});
                if (data.err_code === 0) {
                    this.CPDataList = data.data || [];
                }
            },
            // 导出任务录入列表
            async exporTaskEntryExcel() {
                // if (this.screenData.project_id) {
                let data = await TaskEntryRequest.exportTaskData({project_id: this.screenData.project_id});
                if (data.err_code === 0) {
                    this.$Tools.download(data.data);
                }
                // }
            },
            addTask() {
                this.addTaskDialogShow = true;
                this.$nextTick(() => {
                    this.$refs.newAddTask.open();
                });
            },
            async getTaskListData(column) {
                // 甲乙接口分开[1甲 2乙]
                const _this = this;
                let params = {};
                params = _this.screenData;
                let data;
                _this.isLoading = true;
                params.sort = column && column.order ? `${column.prop} ${column.order}` : null;
                if (_this.userType == 1) {
                    data = await TaskEntryRequest.getPartyAtaskList(params);
                } else if (_this.userType == 2) {
                    data = await TaskEntryRequest.getPartyBtaskList(params);
                }
                if (data.err_code === 0) {
                    _this.taskEntryTableData = [];
                    if (data.data && data.data.length > 0) {
                        _this.initTaskData(data.data).then((data) => {
                            _this.judgeAbnormal(data).then((dataArr) => {
                                _this.taskEntryTableData = dataArr || [];
                            });
                        });
                    }
                    _this.isLoading = false;
                }
            },
            judgeAbnormal: function (data) {
                return new Promise(((resolve, reject) => {
                    data.forEach((item) => {
                        if (item.children && item.children.length > 0) {
                            item.children.forEach((task) => {
                                if (task.abnormalFlag) {
                                    item.mainTaskAbnormalFlag = true;
                                }
                            })
                        }
                    });
                    resolve(data);
                }));
            },
            initTaskData(taskTableData) {
                return new Promise((resolve) => {
                    if (taskTableData && taskTableData.length > 0) {
                        taskTableData.forEach(item => {
                            if (item.schedule_end_time) {
                                item.schedule_end_time = item.schedule_end_time.substring(0, 10);
                            }
                            if ('children' in item) {
                                if (item.children && item.children.length > 0) {
                                    var firstChildren = item.children[0];
                                    if (firstChildren.is_origin === 1) {
                                        item.children = firstChildren.children;
                                        item.cp_admin_id = firstChildren.cp_admin_id;
                                        item.cp_admin_name = firstChildren.cp_admin_name;
                                        item.is_main_task = true;
                                        this.initTaskData(item.children);
                                    } else {
                                        this.initTaskData(item.children);
                                    }
                                } else {
                                    item.children = [];
                                }
                            } else {
                                if (item.cp_admin_name && item.cp_admin_name.length > 0) {
                                    this.$set(item, "cpProduct", item.cp_admin_name.join(','));
                                }
                            }
                            if (this.unusualTaskStatus.includes(item.status)) {
                                item.abnormalFlag = true;
                            }
                        })
                    }
                    resolve(taskTableData);
                })
                
            },
            editTask: function (item) {
                this.isShowTaskDetailsDialog = true;
                this.$nextTick(() => {
                    this.$refs.taskDetails.open(item);
                });
            },
            closeAddTaskDialog() {
                this.addTaskDialogShow = false;
                this.$forceUpdate();
            },
            reloadTaskList() {
                // if (this.screenData.project_id) {
                this.getTaskListData();
                // }
            },
            // 人天预警
            editWarnDays() {
                this.isShowWarnDaysTable = true;
                this.getTaskWarnListData();
            },
            async getTaskWarnListData() {
                this.isLoading = true;
                let params = {
                    project_id: this.warnScreenData.project_ids,
                    search: this.warnScreenData.searchCP,
                    page: 1,
                    page_size: 999
                };
                const data = await TaskEntryRequest.getTaskWarnList(params);
                if (data.err_code === 0) {
                    this.isLoading = false;
                    this.manDayWarnTable = data.data || [];
                }
            },
            editWarnDaysItems(item) {
                this.formParams.days = item.row.warning_price;
                this.warnScreenData.cp_id = item.row.cp_id;
                this.isShowWarnDaysDialog = true;
            },
            backTo() {
                this.isShowWarnDaysTable = false;
                this.reloadTaskList();
            },
            inputDaysEnter(value) {
                this.checkDaysObj.daysIsEmpty = !value || (!!value && value.trim().length <= 0) || !(!!value && value.replace(/\D/g, '').replace(/^0{1,}/g, ''));
            },
            async updateWarnDays() {
                let params = {
                    project_id: this.warnScreenData.project_ids,
                    cp_id: this.warnScreenData.cp_id,
                    warning_price: this.formParams.days,
                };
                let tempError = !this.formParams.days;
                let notNum = isNaN(Number(this.formParams.days));
                let tempNum = Number(this.formParams.days) <= 0;
                if (tempError || notNum || tempNum) {
                    this.checkDaysObj.daysIsEmpty = true;
                    return
                }
                const data = await TaskEntryRequest.updateTaskWarnDay(params);
                if (data.err_code === 0) {
                    this.$message.success('编辑成功');
                    this.isShowWarnDaysDialog = false;
                    this.checkDaysObj.daysIsEmpty = false;
                    this.getTaskWarnListData();
                }
            },
            closeWarnDialog() {
                this.isShowWarnDaysDialog = false;
                this.checkDaysObj.daysIsEmpty = false;
            },
            renderHeader(h, {column, $index}) {
                return h("span", {}, [
                    h("span", {}, column.label),
                    h(
                        "el-popover",
                        {
                            props: {
                                popperClass: 'pop-warning',
                                placement: "bottom",
                                width: "400",
                                trigger: "hover",
                                content: `CP在当前项目中，当月报价人天超出报价范围的天数合计，若超出天数合计小于该预警天数，则不会预警。若大于预警天数，则当月内该项目中超出报价范围的任务，将其状态修改为“已预警”。`
                            }
                        },
                        [h("i", {slot: "reference", class: "el-icon-question", style: "margin-left: 9px;"})]
                    )
                ]);
            },
            showTaskEditLogs(item) {
                this.isShowLogTable = true;
                this.$nextTick(() => {
                    this.$refs.logs.open(item);
                });
            },
            //批量导入任务弹框
            showBatchImport() {
                this.batchImportVisible = true;
            },
            hideBatchImport() {
                this.batchImportVisible = false;
            },
            //批量导入任务表格弹框
            showBatchImportTable(fileId) {
                if (!fileId) return;
                this.fileId = fileId;
                this.batchImportVisible = false;
                this.batchImportTableVisible = true;
            },
            hideBatchImportTable() {
                this.batchImportTableVisible = false;
            },
        },
    };
</script>

<style lang="less" scoped>
    .task-bc {
        position: relative;
        height: 100%;
        -webkit-border-radius: @radius;
        -moz-border-radius: @radius;
        border-radius: @radius;
        -webkit-box-shadow: @boxShadow;
        -moz-box-shadow: @boxShadow;
        box-shadow: @boxShadow;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        padding-top: 12px;
        .rightheader {
            margin: 5px;
        }
        .task-wrap {
            position: relative;
            height: 100%;
            .search-box {
                /deep/ .el-input-group__append {
                    background: rgba(29, 32, 33, 0.3);
                    border-radius: 0px 4px 4px 0px;
                    padding: 0 15px;
                    .el-button {
                        border: none;
                        &:hover {
                            color: @textLighter;
                            background: none;
                            .el-icon-search {
                                color: @textLighter;
                            }
                        }
                    }
                }
            }
            .warn-screen-box {
                margin-bottom: 12px;
                padding: 0 12px;
                display: flex;
                justify-content: space-between;
            }
            .entry-screen-box {
                display: flex;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 12px;
                padding: 0 12px;
                .screen-left {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                    .screen-item {
                        margin-right: 10px;
                        width: 150px !important;
                    }
                }
            }
            .warn-table-container {
                position: relative;
                width: 100%;
                height: calc(~"100% - 48px");
                .el-tooltip__popper {
                    max-width: 340px !important;
                }
                .specialColor {
                    color: @error;
                }
                .beQuoted {
                    color: @warn;
                }
                .warn-table-box {
                    height: 100%;
                }
                .task-table {
                    height: 100%;
                }
                .el-icon-edit-outline {
                    cursor: pointer;
                }
                /deep/ .el-table {
                    td {
                        position: relative;
                        .unusualStatus {
                            position: absolute;
                            left: 2%;
                            top: 15px;
                            text-align: center;
                            font-size: 12px;
                            color: @white;
                            width: 24px;
                            height: 20px;
                            line-height: 20px;
                            background: @abnormal;
                            border-radius: 2px;
                        }
                    }
                }
            }
            .slot-temp {
                height: 23px;
                i {
                    font-size: 14px;
                    cursor: pointer;
                    &:first-child {
                        padding-right: 12px;
                    }
                }
                .el-badge {
                    /deep/ .is-fixed {
                        top: 4px;
                        right: 16px;
                    }
                }
            }
        }
        .warn-set {
            position: relative;
            /deep/ .el-dialog__body {
                padding: 20px 20px 0px 10px;
            }
            .err-tips {
                position: absolute;
                top: 100%;
                left: 0;
                line-height: 1;
                padding-top: 4px;
                color: @error;
                font-size: 12px;
            }
        }
        .dialog-details {
            position: relative;
            width: 100%;
            height: 100%;
        }
    }
</style>
