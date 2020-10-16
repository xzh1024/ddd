<template>
    <div class="table-header">
        <div class="header-left">
            <CusSelect size="medium" class="left-item" ref="task" needAllSelect :clearable='false'
                       key='task' :multiple="false" placeholder="选择项目" allLable = "全部项目"
                       @indexSelect="screenDataChange('task')" :values.sync='screenData.task'
                       :lists="tasksList"></CusSelect>
            <el-input
                class="left-item search_tag"
                size="medium"
                ref="search_input"
                :placeholder="searchPlaceHolder"
                @input="searchInputChange"
                @clear="searchInputChange"
                v-model.trim="screenData.searchValue">
                <el-button slot="append" icon="el-icon-search" size="medium"></el-button>
            </el-input>
            <el-select size="medium" class="left-item" :disabled="productType_disabled"
                       @change='screenDataChange("productType")' @focus="screenFocus('productType')"
                       v-model="screenData.productType" clearable placeholder="选择制作类型">
                <el-option v-for="(item, index) in productTypesList" :key="index" :label="item.name"
                           :value="item.id"></el-option>
            </el-select>
            <el-select v-if="showTaskStatuSelecter" size="medium" class="left-item"
                       @change='screenDataChange("taskStatu")' v-model="screenData.taskStatu"
                       @focus="screenFocus('taskStatus')" clearable
                       :placeholder="taskStatuType === 1 ? '选择主任务状态' : '选择子任务状态'">
                <el-option v-for="(item, index) in taskStatusList" :key="index" :label="item.name"
                           :value="item.id"></el-option>
            </el-select>
            <el-select v-if="showNodeStatuSelecter" size="medium" class="left-item"
                       @change='screenDataChange("nodeStatu")' v-model="screenData.nodeStatu"
                       @focus="screenFocus('nodeStatu')" clearable :placeholder="'选择节点状态'">
                <el-option v-for="(item, index) in nodeStatusList" :key="index" :label="item.name"
                           :value="item.id"></el-option>
            </el-select>
            <CusSelect size="medium" v-if="screen_company_show" filterable class="left-item" ref="companyId"
                       key='companyId' :multiple="false" placeholder="选择CP"
                       @indexSelect="screenDataChange('companyId')" :values.sync='screenData.company'
                       url="/api/get-project-cp-list" urlWithPrama :params="{'project_id':screenData.task,...cpParam}"></CusSelect>
            <el-date-picker
                size="medium"
                v-if="screen_time_group"
                key="group-date-picker"
                v-model="screenData.group_time"
                type="daterange"
                range-separator="至"
                @change="screenDataChange('group')"
                class="left-item left-item-long"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
            <el-date-picker
                size="medium"
                v-if="screen_bill_group"
                key="group-bill-picker"
                :clearable='false'
                v-model="screenData.group_bill"
                type="daterange"
                range-separator="至"
                @change="screenDataChange('billGroup')"
                :picker-options="pickerOptionsGroup"
                class="left-item left-item-long"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
            <el-date-picker
                size="medium"
                v-if="screen_time_month"
                key="month-date-picker"
                v-model="screenData.bill_month"
                @change="screenDataChange('bill_month')"
                :value-format="'yyyy-MM-dd'"
                :picker-options="pickerOptions"
                class="left-item month-picker"
                type="month"
                :clearable='false'
                placeholder="选择日期">
            </el-date-picker>
            <el-date-picker
                size="medium"
                v-if="screen_over_time"
                key="month-date-picker"
                v-model="screenData.over_time"
                @change="screenDataChange('month')"
                :value-format="'yyyy-MM-dd'"
                class="left-item"
                placeholder="选择完成时间">
            </el-date-picker>
            <el-select size="medium" v-if="time_type_show" class="left-item time-type"
                       @change='(val)=>{screenDataChange("ganttType",val)}' v-model="screenData.ganttType"
                       placeholder="选择时间筛选选项">
                <el-option v-for="(item, index) in ganttTypeList" :key="index" :label="item.label"
                           :value="item.type"></el-option>
            </el-select>
            <el-select size="medium" :disabled="billStatuDisable" clearable v-if="screen_bill_group"
                       class="left-item bill-statu" @change='(val)=>{screenDataChange("billStatus",val)}'
                       v-model="screenData.billStatus" placeholder="结算状态">
                <el-option v-for="(item, index) in billStatusList" :key="index" :label="item.label"
                           :value="item.type"></el-option>
            </el-select>
        </div>
        <div class="header-right">
            <slot name="rightheader"></slot>
        </div>
    </div>
</template>
<script>
    
    /*
     列表头部筛选
     showConpanySelecter 是否显示公司
     showOverTimeSelecter 是否显示“完成时间”datePicker
     showGroupTimeSelecter 是否显示时间范围datePicker
     showScreenTypeSelecter 是否显示‘周\月’选框
     showTaskStatuSelecter  是否显示 任务状态
     showNodeStatuSelecter  是否显示 节点状态
     showMonthSelecter 是否显示月份datePicker
     taskStatuType 任务状态 1主任务 2子任务
     cpParam 任务总况在请求公司信息时需要单独传参数
     */
    
    import {Debounce} from '@libs/js/utils';
    import CusSelect from '@components/cusUI/cusSelect'
    import {SystemGlobalRequest} from "commonHttp";
    import moment from "moment"
    import _ from 'lodash'
    
    export default {
        name: 'staff-header',
        props: {
            showConpanySelecter: {
                type: Boolean,
                default: false
            },
            showOverTimeSelecter: {
                type: Boolean,
                default: false
            },
            showGroupTimeSelecter: {
                type: Boolean,
                default: false
            },
            showGroupBillSelecter: {
                type: Boolean,
                default: false
            },
            showScreenTypeSelecter: {
                type: Boolean,
                default: false
            },
            showMonthSelecter: {
                type: Boolean,
                default: false
            },
            taskStatuType: {
                type: Number,
                default: 1
            },
            showTaskStatuSelecter: {
                type: Boolean,
                default: false
            },
            showNodeStatuSelecter: {
                type: Boolean,
                default: false
            },
            searchPlaceHolder:{
                type: String,
                default: "输入主任务名"
            },
            cpParam:{
                type:Object,
                default:function(){ return {}}
            }
        },
        data() {
            return {
                screenData: {
                    task: '',                  //项目
                    productType: '',           //工作类型
                    taskStatu: '',             //任务状态
                    nodeStatu: '',             //节点状态
                    searchValue: '',           //模糊搜索值
                    group_time: [moment().subtract(30, 'days')._d, moment().add(30, 'days')._d],            //时间范围
                    group_bill: '',//[moment().subtract(2,'months').startOf('month').format('YYYY-MM-DD'),moment().subtract(1,'months').startOf('month').format('YYYY-MM-DD')],            //提单的时间组
                    bill_month: moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),//moment(),            //时间筛选月
                    company: '',               //公司
                    over_time: '',             //时间筛选结束时间
                    ganttType: 'week',         //甘道图周月选项
                    billStatus: '',            //提单状态
                },
                billStatuDisable: false,
                tasksList: [],
                productTypesList: [],
                taskStatusList: [],
                nodeStatusList: [],
                ganttTypeList: [
                    {
                        type: 'week',
                        label: '周',
                    },
                    {
                        type: 'month',
                        label: '月',
                    }
                ],
                billStatusList: [
                    {
                        type: '1',
                        label: '未结算',
                    },
                    {
                        type: '2',
                        label: '已结算',
                    }
                ],
            };
        },
        components: {
            CusSelect
        },
        computed: {
            productType_disabled() {                   //制作类型可以操作
                return this.$Tools.isEmpty(this.screenData.task)
            },
            screen_time_group() {
                return this.showGroupTimeSelecter
            },
            screen_bill_group() {
                return this.showGroupBillSelecter
            },
            screen_time_month() {
                return this.showMonthSelecter
            },
            screen_over_time() {
                return this.showOverTimeSelecter
            },
            time_type_show() {
                return this.showScreenTypeSelecter
            },
            screen_company_show() {
                return this.showConpanySelecter
            },
            pickerOptions() {
                return {
                    disabledDate(time) {
                        return (moment().startOf('month').subtract(1, 'months')).isBefore(time);
                    }
                }
            },
            pickerOptionsGroup() {
                return {
                    disabledDate(time) {
                        return (moment().month(moment().month() - 1).endOf('month')).isBefore(time);
                    }
                }
            }
        },
        mounted() {
            this.getMyProjectList();
            this.taskStatusList = this.$Tools.CoverTaskStatusArray(this.taskStatuType);
            this.nodeStatusList = this.$Tools.CoverTaskStatusArray(3);
        },
        methods: {
            //清空所有筛选项
            clear() {
                this.screenData = {
                    task: '',                  //项目
                    productType: '',           //工作类型
                    taskStatu: '',             //任务状态
                    searchValue: '',           //模糊搜索值
                    group_time: '',            //时间范围
                    bill_month: moment().subtract(1, 'months').startOf('month'),            //时间筛选月
                    company: '',               //公司
                    over_time: '',             //时间筛选结束时间
                    start_time: '',
                    end_time: '',
                    ganttType: '',
                    nodeStatu: ''
                }
            },
            setScreenData(data) {
                let oldData = _.cloneDeep(this.screenData);
                this.screenData = Object.assign({}, oldData, data);
                this.$emit('screenDataChange', Object.assign({}, oldData, data), 'group')
            },
            screenFocus(type) {
                if (type == 'productType') {
                    if (!this.productTypesList.length) {   //当制作类型在获得焦点是都没有数据,则获取制作类型数据(节约点点)
                        this.getProjectProductionTypeList()
                    }
                }
            },
            screenDataChange(type, val) {
                if (type == 'task') {     //当选择项目变化时，清空制作类型有关数据
                    this.productTypesList = [];
                    this.screenData.productType = ''
                } else if (type == 'group') {
                    this.emitProp('group_time');
                    return
                } else if (type == 'bill_month') {                           //在提单中,月筛选与日期筛选互斥
                    this.billStatuDisable = false;
                    this.screenData.group_bill = ''
                } else if (type == 'billGroup') {                      //在提单中,月筛选与日期筛选互斥
                    this.screenData.bill_month = '';
                    this.screenData.billStatus = '';
                    this.billStatuDisable = true
                } else if (type == 'billStatus') {                      //在提单中,月筛选与日期筛选互斥
                    this.screenData.group_bill = ''
                } else if (type == 'ganttType') {
                    if (val == 'month') {
                        this.screenData.group_time = [moment().subtract(70, 'days')._d, moment().add(70, 'days')._d]
                    } else {
                        this.screenData.group_time = [moment().subtract(30, 'days')._d, moment().add(30, 'days')._d]
                    }
                    this.emitProp('group_time');
                    return
                }
                this.emitProp()
            },
            emitProp(type = '') {
                this.$nextTick(function () {
                    let temp = _.cloneDeep(this.screenData);
                    if (this.screen_time_group && this.time_type_show) {
                        temp.start_time = moment(this.screenData.group_time[0]).format('YYYY-MM-DD');
                        temp.end_time = moment(this.screenData.group_time[1]).format('YYYY-MM-DD')
                    }
                    this.$emit('screenDataChange', temp, type)
                })
            },
            searchInputChange: _.throttle(function () {
                this.emitProp()
            }, 500),
            //获取我的项目列表
            async getMyProjectList() {
                let data = await SystemGlobalRequest.getMyProjectList();
                if (data.err_code === 0) {
                    let dataArr = data.data || [];
                    if (dataArr.length > 0) {
                        this.tasksList = dataArr;
                        if (!this.screenData.task) {
                            //如果从项目列表页过来取路由id参数，否则默认取第一个项目
                            this.screenData.task = this.$route.params.id || 0;
                            this.emitProp('group_time')
                            // this.screenDataChange('init')
                        }
                    }
                }
            },
            //根据项目获取制作类型
            async getProjectProductionTypeList() {
                let params = {project_ids: this.screenData.task};
                let data = await SystemGlobalRequest.getProjectProductionTypeList(params);
                if (data.err_code === 0) {
                    this.productTypesList = data.data
                }
            },
        }
    };
</script>
<style lang="less" scoped>
    .flex-box {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    
    .table-header {
        .flex-box();
        width: 100%;
        min-width: 1430px;
        justify-content: space-between;
        height: 60px;
        padding: 0 12px;
        align-items: center;
        .header-left {
            .flex-box();
            justify-content: flex-start;
            .left-item {
                margin-right: 10px;
                width: 150px !important;
            }
            /deep/ .left-item-long {
                width: 210px !important;
                i {
                    width: 10% !important;
                    &.el-range__close-icon {
                        margin-right: -5px;
                    }
                }
                input {
                    width: 55% !important;
                }
                .el-range-separator {
                    width: 10% !important;
                    padding: 0 !important;
                }
            }
            .time-type {
                width: 60px !important;
            }
            .month-picker {
                width: 120px !important;
            }
            .bill-statu {
                width: 120px !important;
            }
        }
        .input_suffix {
            width: 34px;
            height: 34px;
            background: rgba(29, 32, 33, 0.3);
            border-radius: 0px 4px 4px 0px;
            text-align: center;
            line-height: 34px;
            font-size: 14px;
            color: @textLight;
            border-left: 1px solid #1D2021;
            &:hover {
                cursor: pointer;
            }
        }
        .search_tag {
            overflow: hidden;
            width: 240px;
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
        
    }
</style>
