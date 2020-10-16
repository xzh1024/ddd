<template>
    <div class="human-summary-wrap">
        <div class="header-wrap">
            <ScreenTableHeader
                headerType='staff'
                @screenDataChange="screenDataChange"
                :showConpanySelecter="isTypeA"
                :taskStatuType='3'
                showNodeStatuSelecter
                showGroupTimeSelecter
                showScreenTypeSelecter
                searchPlaceHolder="输入制作人名"
            >
                <template slot="rightheader" class="rightheader">
                    <el-button v-if="configAdd" size="medium" type="primary" round
                               @click="addStaff()">人力录入
                    </el-button>
                    <el-button v-if="configList_Au" size="medium" type="primary" round
                               @click="exitStaff()">导出
                    </el-button>
                </template>
            </ScreenTableHeader>
        </div>
        <loading v-if="isLoading"></loading>
        <div v-else class="body-warp">
            <div class="table-wrap">
                <el-table
                    v-scrolls="scrollFun" :data="tableData" :row-style="rowClass"
                    style="width: 100%" ref="table" row-key="tableID"
                    border
                    @row-click="gotoTask"
                    @expand-change="expandChange"
                    :tree-props="{children: 'node', hasChildren: 'hasChildren'}"
                    :default-expand-all="expandFlag"
                    @sort-change='sort_change'
                    :default-sort="{prop: 'company', order: 'descending'}"
                    v-scroll:table
                >
                    <template v-for="(col, index) in columnData">
                        <!-- 操作列/自定义列 -->
                        <el-table-column v-if="col.slot" :key="index" label="制作人" width="200" class-name="oprate"
                                         :resizable="false">
                            <template slot-scope="scope">
                                <!--一级row-->
                                <template v-if="scope.row.tableLevel === 1">
                                    <div class="slot-temp">
                                        <div :title="scope.row.name" class="title-div"
                                             @click="detailStaff(scope.row.id,scope.row.is_bind,scope)">
                                            {{scope.row.name}}
                                        </div>
                                        <!--乙方显示   // -->
                                        <template v-if="configAdd">
                                            <div v-if="scope.row.is_leave === 1" class="cus-tag">已离场</div>
                                            <div v-if="scope.row.status === 1" class="cus-tag">待审核</div>
                                            <el-button size="mini"
                                                       v-if="scope.row.status === 2 && scope.row.is_bind === 0"
                                                       @click="bindStaff(scope.row.id)" type="warning" round>测试
                                            </el-button>
                                            <el-button size="mini"
                                                       v-if="scope.row.status === 3 && scope.row.is_bind === 0"
                                                       @click="detailStaff(scope.row.id,scope.row.is_bind,scope)"
                                                       type="danger" round>已驳回
                                            </el-button>
                                        </template>
                                        <!--甲方显示-->
                                        <template v-else>
                                            <el-button size="mini" v-if="scope.row.status === 1"
                                                       @click="auditStaff(scope.row.id, scope.row.status)"
                                                       type="warning" round>待审核
                                            </el-button>
                                            <div v-if="scope.row.status === 2 && scope.row.is_bind === 0"
                                                 class="cus-tag">测试
                                            </div>
                                            <div v-if="scope.row.status === 3 && scope.row.is_bind === 0"
                                                 class="cus-tag">已驳回
                                            </div>
                                            <div v-if="scope.row.is_leave === 1" class="cus-tag">已离场</div>
                                        </template>
                                    </div>
                                </template>
                                <!--二级row-->
                                <template v-else>
                                    <div :title="scope.row.task_child_name" class="title-div level-2">
                                        {{scope.row.task_child_name}}
                                    </div>
                                </template>
                            </template>
                        </el-table-column>
                        <!-- 普通列 -->
                        <el-table-column
                            v-else
                            :key="index"
                            :prop="col.prop"
                            :label="col.label"
                            show-overflow-tooltip
                            :min-width="col.width"
                            :resizable="false"
                            align="left"
                            :sortable='col.sortable || false'
                            :sort-orders="['ascending', 'descending']"
                        ></el-table-column>
                    </template>
                    <div slot="empty">
                        <no-data type='member'></no-data>
                    </div>
                </el-table>
            </div>
            <div class="cavans-warp">
                <component ref="gantt" :is="screenData.ganttType" :data="tableData" :dateTime="dateTime" :currentDateTime="currentDateTime"
                           :scrollY="scrollY" @scrollTop="emitScrollTop($event)" @selectRow="emitSelectRow"></component>
            </div>
        </div>
        
        <AddDialog v-if="addDialogShow" ref='addDialog' @reloadList='getList' @dialogClose="addDialogShow = false"/>
        <ActiveDialog v-if="activeDialogShow" ref='activeDialog' @reloadList='getList'
                      @dialogClose="activeDialogShow = false"/>
        <staffDetailDialog v-if="detailDialogShow" ref="detailDialog" @reloadList='getList'
                           @dialogClose="detailDialogShow = false"/>
    </div>
</template>

<script>
    import AddDialog from './components/addStaffDialog'                 //添加弹窗
    import ActiveDialog from './components/activeStaffDialog'           //激活 绑定弹窗
    import staffDetailDialog from './components/staffDetailDialog'      // 详情 审核弹窗
    import Table from "@components/eleUI/table";
    import ScreenTableHeader from "@components/cusUI/screenTableHeader";
    import week from "./components/week2";
    import month from "./components/month2";
    import {Request} from './service/http';
    import {SystemGlobalRequest} from "commonHttp";
    import chineseSort from '@libs/js/chineseSort/lib/index'
    import moment from 'moment'
    
    export default {
        name: "human-summary-index",
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
        data() {
            let pageAuthConfig = sessionStorage.getItem("pageAuthConfig") ? JSON.parse(sessionStorage.getItem("pageAuthConfig")) : {};
            let userConfig = sessionStorage.getItem("userData") ? JSON.parse(sessionStorage.getItem("userData")) : {};
            const config_task_after_rate = pageAuthConfig.task_after_rate || false;   //显示延后率
            const config_task_before_rate = pageAuthConfig.task_before_rate || false;   //显示提前率
            let colData = [
                {slot: 'maker'},
                {
                    label: 'CP',
                    prop: 'company',
                    width: '160',
                    sortable: 'custom'
                },
                {
                    label: '职级',
                    prop: 'rank',
                    width: '120',
                },
                {
                    label: '主职能',
                    prop: 'position',
                    width: '140',
                    sortable: 'custom'
                },
                {
                    label: '制作类型',
                    prop: 'standard_name',
                    width: '140',
                },
                {
                    label: '任务倒计时',
                    prop: 'countDown',
                    width: '150',
                    sortable: 'custom'
                },
                {
                    label: '排期人天',
                    prop: 'schedule_complete_day',
                    width: '140',
                },
                {
                    label: '实际人天',
                    prop: 'complete_day',
                    width: '140',
                },
            ];
            if (config_task_before_rate) {
                colData.push({
                    label: '提前率',
                    prop: 'before_rate',
                    width: '120',
                    sortable: 'custom'
                })
            }
            if (config_task_after_rate) {
                colData.push({
                    label: '延后率',
                    prop: 'after_rate',
                    width: '120',
                    sortable: 'custom'
                })
            }
            return {
                screenData: {
                    task: '',                  //项目
                    productType: '',           //工作类型
                    nodeStatu: '',             //任务状态
                    searchValue: '',           //模糊搜索值
                    group_time: '',            //时间范围
                    time_month: '',            //时间筛选月
                    company: '',               //公司
                    over_time: '',             //时间筛选结束时间
                    start_time: '',
                    end_time: '',
                    ganttType: 'week'
                },
                columnData: colData,
                tableData: [],
                isLoading: false,
                addDialogShow: false,
                activeDialogShow: false,
                detailDialogShow: false,
                
                sordProp: 'company',
                sordOrder: 'descending',
                
                configAdd: pageAuthConfig.man_power_store || false,   //人力新增编辑
                configBind: pageAuthConfig.man_power_bind || false,   //人力资源绑定
                configList: pageAuthConfig.manpower_list || false,   //人力列表（总）
                configList_Au: pageAuthConfig.manpower_audit_list || false,   //人力列表（待审）
                configAudit: pageAuthConfig.manpower_audit || false,   //人力审核
                isTypeA: userConfig.company_type === 1, //用户是甲方
                dateTime: [],
                currentDateTime:{
                    dateTime:null,
                    timeStamp:null
                },
                scrollY: 0,
                ganttType: 'week',
                id: '',
                expandFlag:false
            }
        },
        computed: {},
        components: {AddDialog, ScreenTableHeader, Table, ActiveDialog, staffDetailDialog, week, month},
        methods: {
            addStaff() {
                this.addDialogShow = true;
                this.$nextTick(function () {this.$refs.addDialog.open()})
            },
            bindStaff(id) {
                if (!this.configBind) {
                    return;
                }
                this.activeDialogShow = true;
                this.$nextTick(function () {this.$refs.activeDialog.open(id)})
            },
            auditStaff(id, status) {
                if (!this.configAudit) {
                    return;
                }
                this.detailDialogShow = true;
                this.$nextTick(function () {this.$refs.detailDialog.open({id, type: 'audit'})})
            },
            detailStaff(id, isbind, scope) {
                this.detailDialogShow = true;
                this.$nextTick(function () {
                    this.$refs.detailDialog.open(
                        {id, writeAble: (this.configAdd && scope.row.is_leave != 1)}
                    )
                })
            },
            screenDataChange(data, type) {
                console.log('筛选条件发生变化', data, type);
                this.screenData = data;
                if (type === 'group_time') {
                    this.allRequest()
                } else {
                    this.getList(true)
                }
            },
            exporTaskEntryExcel() {},
            allRequest() {
                Promise.all([this.getList(false), this.getTimeDate()])
                    .then(
                        data => {
                            this.isLoading = false
                            if(data[0] && data[1]){
                                this.ganttInit(true);
                            }
                        }
                    ).catch(err => {
                        this.isLoading = false
                    console.log('出错了', err)
                })
            },
            //初始化甘特图
            ganttInit(flag) {
                this.$nextTick(function(){
                   if(this.$refs.gantt) this.$refs.gantt.init(flag);
                })
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
                this.id = id
            },
            rowClass({row}) {
                if (Number(this.id) === Number(row.id)) {
                    return {"background-color": "rgba(185, 221, 249, 0.3)"};
                }
            },
            //跳转到任务所在刻度
            gotoTask(event) {
                this.id = event.id;
                this.$refs.gantt.gotoTask(event);
            },
            //展开折叠任务
            expandChange(row, expanded) {
                row.flag = expanded;
                this.ganttInit(false);
            },
            getList(reloadGant = false) {
                return new Promise(async(resolve, reject) => {
                    if (this.$Tools.isEmpty(this.screenData.task)) {
                        this.$message.error('必须先选择项目');
                        return
                    }
                    this.isLoading = true;
                    let param = { project_id: this.screenData.task }
                    if (this.screenData.productType) { param.standard_id = this.screenData.productType }
                    if (this.screenData.company) { param.cp = this.screenData.company }
                    if (this.screenData.nodeStatu) { param.task_status = this.screenData.nodeStatu }
                    if (this.screenData.searchValue) { param.search = this.screenData.searchValue }
                    if (this.screenData.group_time) {
                        param.start_time = this.screenData.start_time;
                        param.end_time = this.screenData.end_time
                    }
                    let res =  this.configAdd ? await Request.getHumanList(param) : await Request.auditList(param)
                    this.isLoading = false;
                    if (res.err_code === 0) {
                        if (res.data && res.data.length) {
                            let temp = _.cloneDeep(res.data);
                            //计算任务倒计时
                            let _this = this;
                            temp.forEach((element) => {
                                element.tableID = 'father' + element.id;
                                element.tableLevel = 1;
                                element.flag = _this.expandFlag;
                                if (element.node.length) {
                                    element.node.forEach((ele) => {
                                        ele.tableID = 'father' + element.id + 'node' + ele.id;
                                        ele.tableLevel = 2;
                                        if (ele.schedule_end_time) {
                                            ele.countDown = moment(ele.schedule_end_time).diff(moment(), 'days')
                                        }
                                    })
                                }
                            });
                            //排序
                            let orderData = this.cusOrder(this.sordProp, this.sordOrder, temp);
                            this.tableData = orderData;
                            resolve(true);
                            if(reloadGant && orderData.length){
                                this.ganttInit(true)
                            }
                        }else{
                            this.tableData = [];
                            if(reloadGant){
                                this.ganttInit(true)
                            }
                        }
                    } else {
                        reject('出错了')
                    }
                })
            },
            //获取日期时间
            getTimeDate() {
                return new Promise(async (resolve, reject) => {
                    let params = {
                        start_time: this.screenData.start_time,
                        end_time: this.screenData.end_time,
                        type: this.screenData.ganttType
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
                        this.currentDateTime = {
                            dateTime:data.date,
                            timeStamp:data.timestamp
                        };
                        resolve(true);
                    }
                })
            },
            changeLoading(loading) {
                this.isLoading = loading
            },
            sort_change(col) {
                if (!col.order) return;
                if (this.sordProp == col.prop && this.sordOrder == col.order) return;
                this.isLoading = true;
                this.sordProp = col.prop;
                this.sordOrder = col.order;
                let data = this.cusOrder(col.prop, col.order)
                this.tableData = data;
                this.ganttInit(true);
                this.isLoading = false
            },
            exitStaff(){
                this.isLoading = true;
                let param = {
                    project_id: this.screenData.task
                };
                if (this.screenData.productType) {
                    param.standard_id = this.screenData.productType
                }
                if (this.screenData.company) {
                    param.cp = this.screenData.company
                }
                if (this.screenData.nodeStatu) {
                    param.task_status = this.screenData.nodeStatu
                }
                if (this.screenData.searchValue) {
                    param.search = this.screenData.searchValue
                }
                if (this.screenData.group_time) {
                    param.start_time = this.screenData.start_time;
                    param.end_time = this.screenData.end_time
                }
                Request.exportList(param)
                .then(res=>{
                    this.isLoading =false
                    if(res.err_code === 0){
                        this.$Tools.download(res.data);
                    }
                })
                .catch(err=>{
                    this.isLoading = false;
                    console.log('err',err)
                    this.$message.error('出错了，请刷新页面再试')
                })
            },
            //自定义排序方式
            cusOrder(prop, order, list) {
                //总是将没有子节点的排序在前面 将数组分为有子节点的和没有子节点的。分别按需排序最后再合并
                let temp = list || _.cloneDeep(this.tableData);
                let noChild = [];
                let hasChild = [];
                let newData = [];
                temp.forEach((element) => {
                    if (element.node && element.node.length) {
                        hasChild.push(element)
                    } else {
                        noChild.push(element)
                    }
                });
                //排子节点的，   主项顺序不动，仅仅改变子项的顺序
                if (prop == 'countDown') {
                    hasChild.forEach((element) => {
                        let sortedArr = _.sortBy(element.node, function (item) {
                            if (order == 'descending') {  //降序
                                return -item[prop]
                            }
                            return item[prop]
                        });
                        element.node = sortedArr
                    });
                    //拼接总数据
                    newData = _.concat(noChild, hasChild)
                }
                //排主项的，  hasChild的和noChild分别各自排序再拼接
                else {
                    let newNoC = [];
                    let newHasC = [];
                    if (prop == 'company') {           //lodash的中文排序有问题
                        newNoC = chineseSort(noChild, 'company', {
                            EnglishBeforeChinese: order != 'descending',               //英文在前
                            SpellSort: order != 'descending',                    //中文是否按拼音首字母正序排序
                            EnglishUp: order != 'descending',                    //英文排序是否按正序排序， 即a-z
                        });
                        newHasC = chineseSort(hasChild, 'company', {
                            EnglishBeforeChinese: order != 'descending',               //英文在前
                            SpellSort: order != 'descending',                    //中文是否按拼音首字母正序排序
                            EnglishUp: order != 'descending',                    //英文排序是否按正序排序， 即a-z
                        })
                    } else {
                        newNoC = _.sortBy(noChild, function (item) {
                            if (order == 'descending') {  //降序
                                return -item[prop]
                            }
                            return item[prop]
                        });
                        newHasC = _.sortBy(hasChild, function (item) {
                            if (order == 'descending') {  //降序
                                return -item[prop]
                            }
                            return item[prop]
                        })
                    }
                    
                    //拼接总数据
                    newData = _.concat(newNoC, newHasC)
                }
                return newData
            },
        },
        mounted() {
        }
    };
</script>

<style lang="less" scoped>
    .human-summary-wrap {
        position: relative;
        width: 100%;
        height: 100%;
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
            height: calc(~"100% - 60px");
            display: flex;
            flex-direction: row;
            .table-wrap {
                position: relative;
                flex: 1;
                overflow: hidden;
                /deep/ .el-table {
                    position: relative;
                    height: 100%;
                    &.el-table--scrollable-x .el-table__body-wrapper {
                        overflow-x: hidden;
                    }
                }
                /deep/ .oprate {
                    padding: 0 !important;
                    /deep/ .el-table__expand-icon, .el-table__indent {
                        color: @text;
                        position: absolute;
                        left: 10px;
                        top: 15px;
                    }
                    .title-div {
                        display: block;
                        width: 76px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .level-2 {
                        position: relative;
                        width: 60%;
                        margin-top: -20px;
                        margin-left: 32px;
                    }
                }
                
                /deep/ .slot-temp {
                    position: absolute;
                    display: flex;
                    flex-direction: row;
                    left: 35px;
                    top: 10px;
                    width: calc(~"100% - 38px");
                    line-height: 28px;
                    height: 28px;
                    &:hover {
                        cursor: pointer;
                    }
                    .cus-tag {
                        background-color: #595959;
                        height: 20px;
                        line-height: 20px;
                        width: 60px;
                        margin-top: 4px;
                        margin-left: 10px;
                        font-size: 12px;
                        text-align: center;
                    }
                    > button {
                        margin-left: 10px;
                    }
                }
                .bolder {
                    font-weight: bold;
                }
            }
            .cavans-warp {
                flex: 1;
                overflow: hidden;
            }
        }
        
    }
</style>
