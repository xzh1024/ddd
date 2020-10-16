<template>
    <div class="lading-bill-wrap">
        <div class="header-wrap">
            <ScreenTableHeader
                @screenDataChange="screenDataChange"
                showConpanySelecter
                showGroupBillSelecter
                showMonthSelecter
                showTaskStatuSelecter
                :taskStatuType='2'
                searchPlaceHolder="输入子任务名"
            >
                <template slot="rightheader" class="rightheader">
                    <el-button v-if="configExport" size="medium" type="primary" round
                               @click="getExcal">导出
                    </el-button>
                </template>
            </ScreenTableHeader>
        </div>
        <div class="body-wrap">
            <div :class="showPagination ? 'table-wrap short-table' : 'table-wrap'">
                <loading v-if="isLoading"></loading>
                <el-table
                    v-else :data="tableData" v-scroll:table
                    style="width: 100%" ref="custable" row-key="tableID"
                    border
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                    default-expand-all
                >
                    <el-table-column key="task_name" prop="task_name" label="任务" :min-width="lable_width * 2"
                                     show-overflow-tooltip align="left" :resizable="false">
                        <template slot-scope="scope">
                            <span class="name">{{ scope.row.dataLevel == 1 ?  scope.row.task_name : scope.row.task_child_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column key="standard_id" prop="standard_id" label="类型" :min-width="lable_width * 1.2"
                                     show-overflow-tooltip align="left" :resizable="false">
                        <template slot-scope="scope">
                            <span class="name">{{getMakeTypeName(scope.row.standard_id)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column key="company" prop="cp_name" label="CP" :min-width="lable_width * 1.5"
                                     show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column key="task_status" prop="task_status" label="状态" :min-width="lable_width"
                                     show-overflow-tooltip align="left">
                        <template slot-scope="scope">
                            <span class="name" :style="{'color':colorObj[scope.row.task_status]}">{{ status[scope.row.task_status] }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column key="start_time" prop="start_time" label="开始时间" :min-width="lable_width"
                                     show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column key="end_time" prop="end_time" label="截止时间" :min-width="lable_width"
                                     show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column key="count_schedule_day" prop="count_schedule_day" label="排期天数"
                                     :min-width="lable_width" show-overflow-tooltip align="left"
                                     :resizable="false"></el-table-column>
                    <el-table-column key="commit_day" prop="commit_day" label="已结人天" :min-width="lable_width"
                                     show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column v-if="!select_by_group" key="month_schedule_day" prop="month_schedule_day"
                                     label="本月排期" :min-width="lable_width" show-overflow-tooltip align="left"
                                     :resizable="false"></el-table-column>
                    <el-table-column v-if="!select_by_group" key="month_overdue_day" prop="month_overdue_day"
                                     label="本月逾期" :min-width="lable_width" show-overflow-tooltip align="left"
                                     :resizable="false"></el-table-column>
                    <el-table-column v-if="!select_by_group" key="last_overdue_day" prop="last_overdue_day" label="上月逾期"
                                     :min-width="lable_width" show-overflow-tooltip align="left"
                                     :resizable="false"></el-table-column>
                    <el-table-column key="quote_price" prop="quote_price" label="报价人天" :width="100"
                                     show-overflow-tooltip align="left" :resizable="false">
                        <template slot="header">
                            <div>
                                <span>报价人天</span>
                                <el-tooltip class="item" effect="dark" placement="bottom" popper-class="c_el_pop">
                                    <div slot="content" class="c_el">
                                        <span>帮助说明</span><br/>
                                        <span>排期天数：任务在计划排期时间内，除去节假日和周末的工作天数</span><br/>
                                        <span>当前排期：任务在当前筛选时间内，除去节假日和周末的实际工作天数</span><br/>
                                        <span>本月报价人天：任务在当前筛选时间内，排期占比的人天消耗天数</span>
                                    </div>
                                    <i class="el-icon-question" style="margin-left:5px"></i>
                                </el-tooltip>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column key="schedule_price" prop="schedule_price" label="排期人天" :min-width="lable_width"
                                     show-overflow-tooltip align="left" :resizable="false"></el-table-column>
                    <el-table-column key="floor_price" prop="floor_price" label="计入保底" :min-width="lable_width"
                                     show-overflow-tooltip :resizable="false"></el-table-column>
                    <el-table-column key="commit_status" prop='commit_status' label="操作" :min-width="lable_width"
                                     show-overflow-tooltip :resizable="false">
                        <template slot-scope="scope">
                            <template v-if="scope.row.dataLevel == 1">
                                <el-button v-if="configSubmit && scope.row.commit_status == 1 && screenData.bill_month"
                                           size="mini" type="primary" round @click="submitClick(scope.row.id)">
                                    提单
                                </el-button>
                                <span v-else @click="seeMore(scope.row)">{{ scope.row.commit_status == 2 ?  '已提单' : '未提单'}}</span>
                            </template>
                        </template>
                    </el-table-column>
                    <div slot="empty">
                        <no-data></no-data>
                    </div>
                </el-table>
            </div>
            <pagination v-if="showPagination" class="pagination-wrap" :params="pageParams"
                        @handleCurrentChange="handleCurrentChange"></pagination>
        </div>
    </div>
</template>

<script>
    import Table from "@components/eleUI/table";
    import ScreenTableHeader from "@components/cusUI/screenTableHeader";
    import moment from "moment"
    import _ from 'lodash'
    import Constant from '@libs/js/constant';
    import {SystemGlobalRequest} from "commonHttp";
    import {Request} from './service/http'
    import {resolve} from 'path';
    
    export default {
        name: 'ladingBill',
        data() {
            let pageAuthConfig = sessionStorage.getItem("pageAuthConfig") ? JSON.parse(sessionStorage.getItem("pageAuthConfig")) : {};
            return {
                isLoading: false,
                screenData: {},
                tableData: [],
                makeTypeArr: [],
                lable_width: 70,
                colorObj: {
                    103: '#00A8FF',
                    202: '#00A8FF',
                    106: '#EF5351',
                    205: '#EF5351',
                    3: '#EF5351',
                    208: '#66BB6A',
                    209: '#66BB6A',
                    110: '#66BB6A',
                    201: '#9E9E9E',
                    102: '#9E9E9E',
                    2: '#9E9E9E',
                    5: '#66BB6A',
                    203: '#FFA726',
                    104: '#FFA726',
                    1: '#FFA726',
                    4: '#FFA726',
                },
                status: Constant.taskStatus,
                pageParams: {
                    page: 1,
                    pageSize: 20,
                    total: 0,
                },
                select_by_group: false,
                configSubmit: pageAuthConfig.commit_form_submit || false,   //发起提单
                configExport: pageAuthConfig.commit_form_export || false,   //导出提单
            }
        },
        computed: {
            showPagination() {
                return this.pageParams.total / this.pageParams.pageSize > 1;
            }
        },
        components: {ScreenTableHeader, Table},
        methods: {
            handleCurrentChange(currentPage) {
                this.pageParams.page = currentPage;
                this.getList();
                this.$refs.custable.scrollTop = 0;
            },
            screenDataChange(data) {
                console.log('筛选条件发生变化', data);
                this.screenData = data;
                this.pageParams.page = 1;
                if (data.group_bill) {
                    this.select_by_group = true
                } else {
                    this.select_by_group = false
                }
                this.$nextTick(function () {
                    this.getList()
                })
            },
            submitClick(id) {
                const _this = this;
                this.$Tools.deleteConfirm(_this, {text: '确认结算该本月人天？', message: '提单成功', title: '提示'}, async () => {
                    this.isLoading = true;
                    const data = await Request.billSubmit({id});
                    this.getList();
                    this.isLoading = false;
                    return data;
                });
            },
            getExcal() {
                this.isLoading = true;
                let param = {
                    project_id: this.screenData.task
                };
                if (this.screenData.productType) {
                    param.standard = this.screenData.productType
                }
                if (this.screenData.company) {
                    param.cp_id = this.screenData.company
                }
                if (this.screenData.taskStatu) {
                    param.status = this.screenData.taskStatu
                }
                if (this.screenData.searchValue) {
                    param.search = this.screenData.searchValue
                }
                if (this.screenData.billStatus) {
                    param.commit_status = this.screenData.billStatus
                }
                if (this.screenData.bill_month) {
                    param.month = moment(this.screenData.bill_month).format('YYYY-MM')
                } else {
                    param.start_time = moment(this.screenData.group_bill[0]).format('YYYY-MM-DD');
                    param.end_time = moment(this.screenData.group_bill[1]).format('YYYY-MM-DD')
                }
                Request.billExport({
                    ...param,
                    page: this.pageParams.page,
                    page_size: this.pageParams.pageSize,
                })
                    .then(res => {
                        this.isLoading = false;
                        if (res.err_code === 0) {
                            this.$Tools.download(res.data);
                        }
                    })
                    .catch(err => {
                        this.isLoading = false;
                        console.log('err', err);
                        this.$message.error('出错了，请刷新页面再试')
                    })
                
            },
            getList() {
                this.isLoading = true;
                let param = {
                    project_id: this.screenData.task
                };
                if (this.screenData.productType) {
                    param.standard = this.screenData.productType
                }
                if (this.screenData.company) {
                    param.cp_id = this.screenData.company
                }
                if (this.screenData.taskStatu) {
                    param.status = this.screenData.taskStatu
                }
                if (this.screenData.searchValue) {
                    param.search = this.screenData.searchValue
                }
                if (this.screenData.billStatus) {
                    param.commit_status = this.screenData.billStatus
                }
                if (this.screenData.bill_month) {
                    param.month = moment(this.screenData.bill_month).format('YYYY-MM')
                } else {
                    param.start_time = moment(this.screenData.group_bill[0]).format('YYYY-MM-DD');
                    param.end_time = moment(this.screenData.group_bill[1]).format('YYYY-MM-DD')
                }
                Promise.all([
                    SystemGlobalRequest.getProjectProductionTypeList({project_ids: this.screenData.task}),
                    Request.billList({
                        page: this.pageParams.page,
                        page_size: this.pageParams.pageSize,
                        ...param
                    })])
                    .then(res => {
                        this.isLoading = false;
                        if (res[0].err_code === 0 && res[1].err_code === 0) {
                            if (res[1].data && res[1].data.length) {
                                let temp = _.cloneDeep(res[1].data);
                                temp.forEach((element) => {
                                    element.tableID = 'father' + element.id;
                                    element.start_time = moment(element.start_time).format('YYYY-MM-DD');
                                    element.end_time = moment(element.end_time).format('YYYY-MM-DD');
                                    element.dataLevel = 1;
                                    if (element.children.length) {
                                        element.children.forEach((ele) => {
                                            ele.dataLevel = 2;
                                            ele.tableID = 'father' + element.id + 'children' + ele.id;
                                            ele.start_time = moment(ele.start_time).format('YYYY-MM-DD');
                                            ele.end_time = moment(ele.end_time).format('YYYY-MM-DD')
                                        })
                                    }
                                });
                                this.tableData = temp;
                                this.pageParams.total = res[1].page.count || 0;
                            } else {
                                this.tableData = [];
                                this.pageParams.total = 0
                            }
                            if (res[0].data && res[0].data.length) {
                                this.makeTypeArr = res[0].data
                            } else {
                                this.makeTypeArr = []
                            }
                        }
                    })
                    .catch(err => {
                        this.isLoading = false;
                        console.log('err', err);
                        this.$message.error('出错了，请刷新页面再试')
                    })
            },
            getMakeTypeName(id) {
                const index = this.makeTypeArr.findIndex((item) => {
                    return item.id == id
                });
                if (index > -1) {
                    return this.makeTypeArr[index].name
                } else {
                    return ''
                }
            },
        }
    }
</script>
<style lang="less">
    .c_el_pop {
        span {
            line-height: 24px;
        }
    }
</style>
<style lang="less" scoped>
    .lading-bill-wrap {
        position: relative;
        width: 100%;
        height: 100%;
        .header-wrap {
            position: relative;
        }
        .body-wrap {
            position: relative;
            width: 100%;
            height: calc(~'100% - 60px');
            overflow-x: auto;
            .table-wrap {
                position: relative;
                width: 100%;
                height: 100%;
                min-width: 1420px;
                /deep/ .el-table th {
                    padding: 17px 2px 17px 2px !important;
                }
                /deep/ .el-table td {
                    padding: 11px 2px 10px 2px !important;
                    height: 50px;
                }
                /deep/ .lv_2 {
                    color: @textLighter !important;
                }
            }
            .short-table {
                height: calc(~'100% - 60px');
            }
            .pagination-wrap {
                position: fixed;
                bottom: 12px;
                right: 12px;
            }
            &::-webkit-scrollbar {
                height: 6px;
                background-color: @backGround;
            }
            &::-webkit-scrollbar-thumb {
                height: 6px;
                border-radius: 3px;
                background-color: rgba(170, 172, 173, 0.5);
                &:hover {
                    background: @scrollHover;
                }
            }
        }
        
    }
</style>
