<template>
    <div class="task-summary-wrap">
        <div class="header-wrap">
            <ScreenTableHeader
                ref="tableHeader"
                @screenDataChange="screenDataChange"
                :taskStatuType='2'
                :showConpanySelecter="true"
                showNodeStatuSelecter
                showTaskStatuSelecter
                showGroupTimeSelecter
                showScreenTypeSelecter
                :cpParam="{is_general:1}"
            >
                <template slot="rightheader">
                    <el-button round v-if="companyType === 1 && authConfig.task_excel" size="medium" type="primary"
                               @click="exportfun">导出
                    </el-button>
                    <el-button round v-if="companyType === 2" size="medium" type="primary"
                               @click="changeAudit">变更审核
                    </el-button>
                </template>
            </ScreenTableHeader>
        </div>
        <div class="body-warp">
            <loading v-if="isLoading"></loading>
            <template v-else>
                <div class="table-wrap">
                    <el-table
                        v-scrolls="scrollFun"
                        v-scroll:table
                        :data="tableData"
                        :row-style="rowClass"
                        style="width: 100%"
                        ref="table"
                        row-key="uuid"
                        border
                        :default-expand-all="tableExpand"
                        @row-click="gotoTask"
                        @expand-change="expandChange"
                        @sort-change="sortChange"
                        :default-sort="sortOrders"
                        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                        <el-table-column :min-width="100" prop="name" label="任务" align="left" :resizable="false" show-overflow-tooltip>
                            <template slot-scope="scope">
                                <span class="abnormal" v-if="scope.row.mainTaskAbnormalFlag">异</span>
                                <span class="name hover-name" @click="goDetail(scope.row)">{{ scope.row.name }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :min-width="50" prop="cp_admin_name" label="制作人" align="left" :resizable="false" class-name="notFirst" show-overflow-tooltip>
                            <template slot-scope="scope">
                                <span class="name">{{scope.row.is_node ? scope.row.cp_admin_name : ''}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :min-width="70" prop="cp_name" label="CP" align="left" :resizable="false" show-overflow-tooltip class-name="notFirst"
                                         sortable="custom"></el-table-column>
                        <el-table-column :min-width="50" prop="follow_user_name" label="跟进人" align="left" :resizable="false" class-name="notFirst"
                                         show-overflow-tooltip></el-table-column>
                        <el-table-column :min-width="50" prop="status" label="状态" align="left" :resizable="false" show-overflow-tooltip class-name="notFirst">
                            <template slot-scope="scope">
                                <span class="name" :title="status[scope.row.status]"
                                      :style="{'color':colorObj[scope.row.status]}">{{ status[scope.row.status] }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :min-width="50" label="操作" :resizable="false" class-name="notFirst">
                            <template slot-scope="scope">
                                <!-- 一级 -->       <!-- 这里应该是狗产品的设计，第一级可能是子任务，也可能是主任务。当为单任务的时候，将二级数据放到一级上来，此时二级数据本来是子任务，变成了节点。 -->       
                                <div class="slot-temp" v-if="scope.row.is_main_task">
                                    <i class="el-icon-edit-outline" v-if="companyType == 1 && scope.row.isSingle" @click.stop="changePrice(scope.row)"
                                        title="报价变更"></i>
                                    <i class="el-icon-document" @click.stop="openHistroy(scope.row)" v-if="scope.row.isSingle"
                                       title="报价变更日志"></i>
                                </div>
                                <template v-else>
                                    <!-- 三级 -->
                                    <div class="slot-temp" v-if="typeof(scope.row.children) == 'undefined'">
                                        <i class="el-icon-edit-outline" v-if="companyType == 1" @click.stop="changeNode(scope.row)"
                                        title="排期变更"></i>
                                        <i class="el-icon-document" @click.stop="openHistroy(scope.row)"
                                        title="排期变更日志"></i>
                                    </div>
                                    <!-- 二级 -->
                                    <div class="slot-temp" v-else>
                                        <i class="el-icon-edit-outline" v-if="companyType == 1" @click.stop="changePrice(scope.row)"
                                            title="报价变更"></i>
                                        <i class="el-icon-document" @click.stop="openHistroy(scope.row)"
                                        title="报价变更日志"></i>
                                    </div>
                                </template>
                            </template>
                        </el-table-column>
                        <div slot="empty">
                            <no-data></no-data>
                        </div>
                    </el-table>
                </div>
                <div class="cavans-warp">
                    <component ref="gantt" :is="currentGantt" :data="tableData" :dateTime="dateTime" :scrollY="scrollY"
                               @scrollTop="emitScrollTop($event)" @selectRow="emitSelectRow"></component>
                </div>
            </template>
        </div>
        <dialog-task-info v-if="taskInfoVisible" :uuid="uuid" @hide="hideTaskInfo"></dialog-task-info>
        <ChangePriceDialog v-if="changePriceDialogVisible" ref="changePriceDialog"  @dialogClose="changePriceDialogVisible = false"></ChangePriceDialog>
        <ChangeNodeDialog v-if="changeNodeDialogVisible" ref="changeNodeDialog"  @dialogClose="changeNodeDialogVisible = false"></ChangeNodeDialog>
        <ChangeHistroyDialog v-if="changeHistroyDialogVisible" ref="changeHistroyDialog"  @dialogClose="changeHistroyDialogVisible = false"></ChangeHistroyDialog>
        <ChangeAuditDialog v-if="changeAuditDialogVisible" ref="changeAuditDialog"  @dialogClose="changeAuditDialogVisible = false"></ChangeAuditDialog>
    </div>
</template>

<script>
    import ScreenTableHeader from "@components/cusUI/screenTableHeader";
    import week from "./components/week2";
    import month from "./components/month2";
    import {Request} from './service/http';
    import {SystemGlobalRequest} from "commonHttp";
    import Constant from '@libs/js/constant';
    import DialogTaskInfo from './components/dialogTaskInfo'
    import ChangePriceDialog from './components/changePriceDialog'
    import ChangeNodeDialog from './components/changeNodeTimeDialog'
    import ChangeHistroyDialog from './components/changeHistoryDialog'
    import ChangeAuditDialog from './components/changeAuditDialog'
    export default {
        name: "task-summary-index",
        directives: {
            scrolls: {
                bind: function (el, binding) {
                    let selectWrap = el.querySelector('.el-table__body-wrapper');
                    selectWrap.addEventListener('scroll', function (e) {
                        binding.value(e);
                    })
                }
            }
        },
        components: {ScreenTableHeader, week, month, DialogTaskInfo,ChangePriceDialog,ChangeHistroyDialog,ChangeNodeDialog,ChangeAuditDialog},
        watch: {
            todoRouteParams(params) {
                this.getProjectTimeFrame(params);
            }
        },
        computed: {
            judgeAuthType: function () {
                let authType = 0;
                if (this.companyType === 1 && this.authConfig.task_general_list) {
                    //甲方有 任务总览权限
                    authType = 1;
                } else if (this.companyType === 2 && this.authConfig.task_cp_list_general) {
                    //乙方有 任务总览权限
                    authType = 2;
                } else if (this.companyType === 2 && !this.authConfig.task_cp_list_general && this.authConfig.node_commit) {
                    //乙方没有 任务总览权限 但是有 节点提交权限
                    authType = 3;
                }
                return authType;
            },
            todoRouteParams: function () {
                return this.$store.state.todoRouteParams;
            }
        },
        data() {
            return {
                sortOrders: {},
                screenData: {
                    project_id: null,
                    like: null,
                    standard_id: null,
                    task_status: null,
                    task_node_status: null,
                    cp_id: null,
                    start_time: null,
                    end_time: null,
                },
                tableData: [],
                isLoading: false,
                scrollY: 0,
                tableExpand: false,
                status: Constant.taskStatus,
                taskInfoVisible: false,
                uuid: null,
                currentGantt: null,
                dateTime: [],
                companyType: sessionStorage.userData ? JSON.parse(sessionStorage.userData).company_type : null,
                authConfig: sessionStorage.pageAuthConfig ? JSON.parse(sessionStorage.pageAuthConfig) : null,
                colorObj: {
                    103: '#00A8FF',
                    202: '#00A8FF',
                    107: '#00A8FF',
                    206: '#00A8FF',
                    106: '#EF5351',
                    205: '#EF5351',
                    208: '#66BB6A',
                    209: '#66BB6A',
                    110: '#66BB6A',
                    201: '#9E9E9E',
                    102: '#9E9E9E',
                    203: '#FFA726',
                    104: '#FFA726',
                    105: '#9E9E9E',
                    204: '#9E9E9E',
                    108: '#4E7E96',
                    207: '#4E7E96',
                },
                abnormaStatus: [106, 205, 104, 203],
                changePriceDialogVisible:false,
                changeNodeDialogVisible:false,
                changeHistroyDialogVisible:false,
                changeAuditDialogVisible:false
            }
        },
        methods: {
            changeAudit(){
                this.changeAuditDialogVisible = true;
                this.$nextTick(function(){this.$refs.changeAuditDialog.open()})
            },
            changePrice(row){
                this.changePriceDialogVisible = true;
                this.$nextTick(function(){this.$refs.changePriceDialog.open(row)})
            },
            changeNode(row){
                this.changeNodeDialogVisible = true;
                this.$nextTick(function(){this.$refs.changeNodeDialog.open(row)})
            },
            openHistroy(row){
                this.changeHistroyDialogVisible = true;
                this.$nextTick(function(){this.$refs.changeHistroyDialog.open(row)})
            },
            sortChange(event) {
                this.sortOrders = {prop: event.prop, order: event.order};
                this.screenData.sort = event && event.order ? event.prop + ' ' + event.order : null;
                this.refreshTaskList();
            },
            screenDataChange(data, type) {
                // console.log('筛选条件发生变化',data,type);
                this.screenData = {
                    project_id: data.task,
                    like: data.searchValue,
                    standard_id: data.productType,
                    task_status: data.taskStatu,
                    task_node_status: data.nodeStatu,
                    cp_id: data.company,
                    start_time: data.start_time,
                    end_time: data.end_time,
                };
                this.currentGantt = data.ganttType;
                if (type === 'group_time' || type === 'group') {
                    this.allRequest();
                } else {
                    this.refreshTaskList();
                }
            },
            //刷新任务列表
            refreshTaskList() {
                this.isLoading = true;
                this.getTaskList().then(() => {
                    this.isLoading = false;
                    this.$nextTick(function () {
                        this.emitScrollTop(0);
                        this.ganttInit(true);
                    });
                });
            },
            allRequest() {
                this.isLoading = true;
                Promise.all([this.getTaskList(), this.getTimeDate()]).then((data) => {
                    if (data[0] && data[1]) {
                        this.isLoading = false;
                        this.$nextTick(function () {
                            this.emitScrollTop(0);
                            this.ganttInit(true);
                        })
                    }
                })
            },
            //获取任务列表
            getTaskList() {
                return new Promise(async (resolve, reject) => {
                    let params = this.screenData;
                    let data = null;
                    if (this.judgeAuthType === 0) {
                        //甲方没有 任务总览权限 数据不展示
                        //乙方没有 任务总览权限 也 没有节点提交权限  数据不展示
                        this.isLoading = false;
                        resolve(true);
                    } else {
                        if (this.judgeAuthType === 1) {
                            //甲方有 任务总览权限 （甲方管理 任务列表）
                            data = await Request.getBaseTaskList(params);
                        } else if (this.judgeAuthType === 2) {
                            //乙方有 任务总览权限  （乙方管理 任务列表）
                            data = await Request.getCPTaskList(params);
                        } else if (this.judgeAuthType === 3) {
                            //乙方没有 任务总览权限 但是有 节点提交权限  (乙方制作人 任务列表)
                            data = await Request.getTaskCPGeneralSubmitList(params);
                        }
                        if (data.err_code === 0) {
                            this.tableData = [];
                            let dataArr = data.data;
                            let currentDateTime = {
                                dateTime: data.date,
                                timeStamp: data.timestamp
                            };
                            // this.coverTaskData(dataArr, currentDateTime).then((data) => {
                            //     this.judgeAbnormal(data).then((dataArr) => {
                            //         this.tableData = dataArr;
                            //         this.isLoading = false;
                            //         resolve(true);
                            //     });
                            // })
                            
                            this.tableData = this.formatData(dataArr,currentDateTime);
                            this.isLoading = false;
                            resolve(true);
                        }
                    }
                })
            },
            formatData(data,currentDateTime){
                if(_.isArray(data) && data.length){
                    data.forEach(dataLevel_1=>{               //主任务级
                        this.formatStateTime(dataLevel_1)
                        if (!Boolean(dataLevel_1.end_time_unix)) {
                            if (dataLevel_1.schedule_end_time_unix >= currentDateTime.timeStamp) {
                                dataLevel_1.end_time_unix = dataLevel_1.schedule_end_time_unix;
                                dataLevel_1.end_time = dataLevel_1.schedule_end_time;
                            } else {
                                dataLevel_1.end_time_unix = currentDateTime.timeStamp;
                                dataLevel_1.end_time = currentDateTime.dateTime;
                            }
                            dataLevel_1.isDelay = true;
                        }

                        if(dataLevel_1.children && dataLevel_1.children.length > 0){
                            if(dataLevel_1.children.length == 1 && dataLevel_1.children[0].is_origin){   //单任务
                                var firstChildren = dataLevel_1.children[0];
                                if (firstChildren.is_origin === 1) {
                                    dataLevel_1.children = firstChildren.children;
                                    dataLevel_1.status = firstChildren.status;
                                    dataLevel_1.uuid = firstChildren.uuid
                                    if (firstChildren.status === 102) {
                                        dataLevel_1.end_time_unix = firstChildren.schedule_end_time_unix;
                                        dataLevel_1.end_time = firstChildren.schedule_end_time;
                                    }
                                    dataLevel_1.is_main_task = false;
                                }
                                dataLevel_1.isSingle = true   //标识单任务              此时数据结构为两层。子任务=》节点

                                if(!dataLevel_1.children.length) return
                                dataLevel_1.children.forEach(dataLevel_2=>{            //节点
                                    this.formatStateTime(dataLevel_2)
                                    dataLevel_2.FollowUser = dataLevel_1.FollowUser
                                    this.formatChildrenAndNode(dataLevel_2,currentDateTime)
                                    this.formatNode(dataLevel_2)
                                    if (this.abnormaStatus.includes(dataLevel_2.status)) {
                                        dataLevel_1.mainTaskAbnormalFlag = true;
                                    }
                                })

                            }
                            
                            
                            else{     
                                dataLevel_1.isSingle = false                       //多任务   数据结构为三层，主任务，子任务，节点

                                if(!dataLevel_1.children.length) return
                                dataLevel_1.children.forEach(dataLevel_2=>{            //子任务
                                    this.formatStateTime(dataLevel_2)
                                    dataLevel_2.FollowUser = dataLevel_1.FollowUser
                                    this.formatChildrenAndNode(dataLevel_2,currentDateTime)
                                    if (this.abnormaStatus.includes(dataLevel_2.status)) {
                                        dataLevel_1.mainTaskAbnormalFlag = true;
                                    }

                                    if(!dataLevel_2.children.length) return
                                    dataLevel_2.children.forEach(dataLevel_3=>{            //节点
                                        this.formatStateTime(dataLevel_3)
                                        dataLevel_3.FollowUser = dataLevel_1.FollowUser
                                        this.formatChildrenAndNode(dataLevel_3,currentDateTime)
                                        this.formatNode(dataLevel_3)
                                        if (this.abnormaStatus.includes(dataLevel_3.status)) {
                                            dataLevel_1.mainTaskAbnormalFlag = true;
                                        }
                                    })
                                })
                            }

                        }else{   //有没有可能任务没节点，没子任务

                        }
                    })
                    return data
                }else{
                    return []
                }
            },
            formatStateTime(item){
                item.flag = this.tableExpand;
                //如果没有实际开始时间 那么就用排期开始时间 进行计算
                if (!Boolean(item.start_time_unix)) {
                    item.start_time_unix = item.schedule_start_time_unix;
                    item.start_time = item.schedule_start_time;
                }
            },
            formatChildrenAndNode(item,currentDateTime){
                if (!Boolean(item.end_time_unix)) {
                    if (item.status === 106 || item.status === 205) {
                        if (item.schedule_end_time_unix >= currentDateTime.timeStamp) {
                            item.end_time_unix = item.schedule_end_time_unix;
                            item.end_time = item.schedule_end_time;
                        } else {
                            //状态为已逾期的 用后端服务器时间计算
                            item.end_time_unix = currentDateTime.timeStamp;
                            item.end_time = currentDateTime.dateTime;
                        }
                    } else {
                        //如果没有实际结束时间 那么就用排期结束时间 进行计算
                        item.end_time_unix = item.schedule_end_time_unix;
                        item.end_time = item.schedule_end_time;
                    }
                }
                //已暂停和已终止
                if (item.status === 203 || item.status === 104 || item.status === 204 || item.status === 105) {
                    item.start_time_unix = item.schedule_start_time_unix;
                    item.start_time = item.schedule_start_time;
                    item.end_time_unix = item.schedule_end_time_unix;
                    item.end_time = item.schedule_end_time;
                }
            },
            formatNode(item){
                if (item.cp_admin_name && item.cp_admin_name.length > 0) {
                    item.cp_admin_name = item.cp_admin_name.join(',');
                }
            },
            // judgeAbnormal: function (data) {
            //     return new Promise(((resolve, reject) => {
            //         data.forEach((item) => {
            //             if (item.children && item.children.length > 0) {
            //                 item.children.FollowUser =item.FollowUser
            //                 if(item.children.length == 1){
            //                     if(item.children[0].is_origin){
            //                         item.isSingle = true   //标识单任务
            //                     }else{
            //                         item.isSingle = false   
            //                     }
            //                 }else{
            //                         item.isSingle = false   
            //                     }
            //                 item.children.forEach((task) => {
            //                     task.FollowUser = item.FollowUser
            //                     if (task.abnormalFlag) {
            //                         item.mainTaskAbnormalFlag = true;
            //                     }
            //                 })
            //             }
            //         });
            //         resolve(data);
            //     }));
            // },
            coverTaskData(taskData, currentDateTime) {
                var _this = this;
                return new Promise(function (reslove, reject) {
                    if (taskData && taskData.length > 0) {
                        taskData.forEach(function (item) {
                            //如果没有实际开始时间 那么就用排期开始时间 进行计算
                            if (!Boolean(item.start_time_unix)) {
                                item.start_time_unix = item.schedule_start_time_unix;
                                item.start_time = item.schedule_start_time;
                            }
                            if (item.is_main_task) {
                                //如果主任务没有实际结束时间 就按当天时间计算
                                if (!Boolean(item.end_time_unix)) {
                                    if (item.schedule_end_time_unix >= currentDateTime.timeStamp) {
                                        item.end_time_unix = item.schedule_end_time_unix;
                                        item.end_time = item.schedule_end_time;
                                    } else {
                                        item.end_time_unix = currentDateTime.timeStamp;
                                        item.end_time = currentDateTime.dateTime;
                                    }
                                    item.isDelay = true;
                                }
                            } else {
                                if (!Boolean(item.end_time_unix)) {
                                    if (item.status === 106 || item.status === 205) {
                                        if (item.schedule_end_time_unix >= currentDateTime.timeStamp) {
                                            item.end_time_unix = item.schedule_end_time_unix;
                                            item.end_time = item.schedule_end_time;
                                        } else {
                                            //状态为已逾期的 用后端服务器时间计算
                                            item.end_time_unix = currentDateTime.timeStamp;
                                            item.end_time = currentDateTime.dateTime;
                                        }

                                    } else {
                                        //如果没有实际结束时间 那么就用排期结束时间 进行计算
                                        item.end_time_unix = item.schedule_end_time_unix;
                                        item.end_time = item.schedule_end_time;
                                    }
                                }
                                //已暂停和已终止
                                if (item.status === 203 || item.status === 104 || item.status === 204 || item.status === 105) {
                                    item.start_time_unix = item.schedule_start_time_unix;
                                    item.start_time = item.schedule_start_time;
                                    item.end_time_unix = item.schedule_end_time_unix;
                                    item.end_time = item.schedule_end_time;
                                }
                            }
                            
                            if ('children' in item) {
                                item.cp_admin_name = null;
                                if (item.children && item.children.length > 0) {
                                    //过滤单任务报价产生的重复子任务
                                    if (item.children.length === 1) {
                                        var firstChildren = item.children[0];
                                        if (firstChildren.is_origin === 1) {
                                            item.children = firstChildren.children;
                                            item.status = firstChildren.status;
                                            if (firstChildren.status === 102) {
                                                item.end_time_unix = firstChildren.schedule_end_time_unix;
                                                item.end_time = firstChildren.schedule_end_time;
                                            }
                                            item.is_main_task = false;
                                        }
                                    }
                                    item.flag = _this.tableExpand;
                                    _this.coverTaskData(item.children, currentDateTime);
                                }
                            } else {
                                if (item.cp_admin_name && item.cp_admin_name.length > 0) {
                                    item.cp_admin_name = item.cp_admin_name.join(',');
                                }
                            }
                            
                            if (_this.abnormaStatus.includes(item.status)) {
                                item.abnormalFlag = true;
                            }
                        });
                    }
                    reslove(taskData);
                });
            },

            //导出
            async exportfun() {
                let params = this.screenData;
                if (params.project_id) {
                    let data = await Request.exportExcelGeneral(params);
                    if (data.err_code === 0) {
                        this.$Tools.download(data.data);
                    }
                }
            },
            //获取日期时间
            getTimeDate() {
                return new Promise(async (resolve, reject) => {
                    let params = {
                        start_time: this.screenData.start_time,
                        end_time: this.screenData.end_time,
                        type: this.currentGantt
                    };
                    let data = await SystemGlobalRequest.getCalendarList(params);
                    if (data.err_code === 0) {
                        let timeArr = data.data;
                        if (params.type === 'week') {
                            if (timeArr.length > 0) {
                                let weekNum = null;
                                let m = null;
                                timeArr.forEach((item) => {
                                    //判断是否是今天
                                    let date = item.y + '/' + item.m + '/' + item.d;
                                    if (new Date(date).toDateString() === new Date().toDateString()) {
                                        item.today = true;
                                    }
                                    //判断日期是当年的第几周
                                    let date1 = new Date(item.y, item.m - 1, item.d);   //当天日期时间
                                    let date2 = new Date(item.y, 0, 1);   //当年第一天
                                    let d = Math.round((date1.valueOf() - date2.valueOf()) / 86400000);  //当天是当年的第多少天
                                    item.weekNum = Math.ceil((d + ((date2.getDay() + 1) - 1)) / 7);   //当天是当年的第多少周
                                    //显示周数
                                    if (weekNum != item.weekNum) {
                                        item.weekNumShow = 1;
                                        weekNum = item.weekNum;
                                    }
                                    //显示月份
                                    if (m != item.m) {
                                        item.monthShow = 1;
                                        m = item.m;
                                    }
                                })
                            }
                        }
                        if (params.type === 'month') {
                            if (timeArr.length > 0) {
                                let m = null;
                                let y = null;
                                timeArr.forEach((item) => {
                                    if (m != item.m || y != item.y) {
                                        item.yearShow = 1;
                                        m = item.m;
                                        y = item.y;
                                    }
                                });
                            }
                        }
                        this.dateTime = timeArr;
                        resolve(true);
                    }
                })
            },
            
            //展开折叠任务
            expandChange(row, expanded) {
                row.flag = expanded;
                this.ganttInit(false);
            },
            //初始化甘特图
            ganttInit(flag) {
                if (this.$refs.gantt) this.$refs.gantt.init(flag);
            },
            //监听表格滚动同步甘特图
            scrollFun(e) {
                this.scrollY = e.target.scrollTop;
            },
            //甘特图滚动同步表格
            emitScrollTop(top) {
                this.scrollY = top;
                if (this.$refs.table) {
                    this.$refs.table.bodyWrapper.scrollTop = top;
                }
            },
            //选中行
            emitSelectRow(id) {
                this.uuid = id;
            },
            showTaskInfo(row) {
                if (!row.task_id) return;
                this.taskInfoVisible = true;
            },
            hideTaskInfo() {
                this.taskInfoVisible = false;
            },
            //跳转到任务所在刻度
            gotoTask(event) {
                this.uuid = event.task_id;
                this.$refs.gantt.gotoTask(event);
            },
            goDetail(event){
                this.uuid = event.task_id;
                //任务详情
                this.showTaskInfo(event);
            },
            rowClass({row}) {
                if (Number(this.uuid) === Number(row.uuid)) {
                    return {"background-color": "rgba(185, 221, 249, 0.3)"};
                }
            },
            //根据项目id查询项目时间段
            async getProjectTimeFrame(params) {
                let data = await Request.getProjectTimeFrame({project_id: params.projectID});
                if (data.err_code === 0) {
                    params.start_time = data.data.start_time;
                    params.end_time = data.data.end_time;
                    this.todoScreenTaskList(params);
                }
            },
            //任务待办筛选
            todoScreenTaskList(params) {
                let tempParams = {
                    task: params.projectID,
                    start_time: params.start_time,
                    end_time: params.end_time
                };
                if (params.type === 0) {
                    tempParams.taskStatu = params.status;
                    tempParams.nodeStatu = null;
                    // this.tableExpand = false;
                } else {
                    tempParams.taskStatu = null;
                    tempParams.nodeStatu = params.status;
                    // this.tableExpand = true;
                }
                this.$refs.tableHeader.setScreenData(tempParams);
            }
        },
        mounted() {
            let routerParams = this.$route.params;
            if (routerParams.projectID) {
                this.getProjectTimeFrame(routerParams);
            }
        }
    };
</script>

<style lang="less" scoped>
    .task-summary-wrap {
        position: relative;
        width: 100%;
        height: 100%;
        /*padding: 20px;*/
        -webkit-border-radius: @radius;
        -moz-border-radius: @radius;
        border-radius: @radius;
        box-shadow: @boxShadow;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        .header-wrap {
            position: relative;
            width: 100%;
        }
        .body-warp {
            position: relative;
            width: 100%;
            height: calc(~'100% - 60px');
            display: flex;
            flex-direction: row;
            .table-wrap {
                position: relative;
                flex: 1;
                overflow: hidden;
                /deep/ .el-table {
                    td {
                        position: relative;
                        .abnormal {
                            position: absolute;
                            left: 3%;
                            top: 15px;
                            width: 24px;
                            height: 20px;
                            background: @abnormal;
                            border-radius: 2px;
                            font-size: 12px;
                            text-align: center;
                            line-height: 20px;
                        }
                    }
                    .notFirst {
                        padding: 13px 2px 13px 2px !important;
                        height: 50px;
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
            .cavans-warp {
                position: relative;
                flex: 1;
                overflow: hidden;
            }
        }
        .hover-name{
            &:hover{
                cursor: pointer;
            }
        }
    }
</style>
