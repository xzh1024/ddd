<!-- 任务详情组件 -->
<template>
    <div class="task-node-info" v-if="taskNodeData">
        <div class="step-list" v-for="(item,index) in taskNodeData" :key="index">
            <div class="node-title">
                <em>{{index+1}}</em>
                <span>{{item.name}}</span>
            </div>
            <div class="cp-make">
                <span class="label"> <label>*</label>CP制作</span>
                <div v-if="userType==1" style="width:100%">
                <el-select
                    class="cp-makers"
                    v-model="item.make_users"
                    multiple
                    collapse-tags
                    placeholder="请选择CP制作"
                    disabled
                    style="width:100%">
                        <el-option
                        class="cp-options"
                        v-for="users in (item.rsp_make_users ? item.rsp_make_users: [])"
                        :key="users.id"
                        :label="users.name"
                        :value="users.id"
                        :disabled="users.is_update===2">
                            <span>{{users.name}}</span>
                            <cp-tip :disabled="users.is_update===2"></cp-tip>
                        </el-option>
                </el-select>
                </div>
                <div v-if="userType==2" style="width:100%">
                    <el-select
                        class="cp-makers"
                        v-model="item.make_users"
                        multiple
                        collapse-tags
                        placeholder="请选择CP制作"
                        :disabled="isDisabled"
                        @change="itemClick(item)"
                        style="width:100%">
                            <el-option
                            class="cp-options"
                            v-for="users in cpMaker"
                            :key="users.id"
                            :label="users.name"
                            :value="users.id"
                            :disabled="users.is_update===2">
                                <span>{{users.name}}</span>
                                <cp-tip :disabled="users.is_update===2"></cp-tip>
                            </el-option>
                    </el-select>
                </div>
                <div class="err-tips" v-if="item.nodeMakerIsEmpty">请选择CP制作</div>
            </div>
            <div class="schedule">
                <span class="label"> <label>*</label>计划排期</span>
                <el-date-picker
                    unlink-panels
                    v-model="item.scheduleTime"
                    @input="dateChange(item,index)"
                    type="daterange"
                    value-format="yyyy-MM-dd"
                    format="yyyy-MM-dd"
                    :default-time="[item.schedule_start_time, item.schedule_end_time]"
                    range-separator="至"
                    start-placeholder="开始日期"
                    :picker-options="item.pickerOptionsStart"
                    end-placeholder="结束日期"
                    :disabled="isDisabled || userType==1"
                ></el-date-picker>
                <div class="err-tips" v-if="item.nodeScheduleIsEmpty">请选择排期时间</div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import { TaskEntryRequest } from "../../service/http";
export default {
    name: "taskNodeInfo",
    props: {
        taskNodeData: Array,
        selectValue: String,
        taskDetailsPageAuthConfig: Object,
        isEditChildTaskFlag: Boolean,
        taskDetailsData: Object,
    },
    computed: {
        userType() {
            return this.userData.company_type;
        }
    },
    watch: {
        taskNodeData: {
            handler: function(newVal, oldVal) {},
            deep: true
        }
    },
    data() {
        return {
            userData: sessionStorage.userData ? JSON.parse(sessionStorage.userData) : {},
            isDisabled: false,
            cpMaker: [],
        };
    },
    mounted() {
        this.initFun();
        this.checkItemIsDisabled();
    },
    methods: {
        initFun() {
            if(this.taskNodeData && this.taskNodeData.length > 0){
                this.taskNodeData[0].pickerOptionsStart = Object.assign({},this.taskNodeData[0].pickerOptionsStart,
                    {
                        disabledDate: time => {
                            const currentdate = moment(this.taskNodeData[0].schedule_start_time).startOf('month').format('YYYY-MM-DD HH:mm:ss');
                            const timedate = moment(time).format('YYYY-MM-DD HH:mm:ss');;
                            return timedate < currentdate
                        }
                    });
            }
            if(this.userType==2){
                this.getCPMakerListData();
            }
        },
        checkItemIsDisabled(){
            this.isDisabled = this.isEditChildTaskFlag ? false : true;
        },
        dateChange(e, index) {
            if (index + 1 < this.taskNodeData.length) {
                this.taskNodeData[index + 1].pickerOptionsStart = Object.assign({}, this.taskNodeData[index + 1].pickerOptionsStart,
                    {
                        disabledDate: time => {
                            return (
                                time.getTime() < new Date(e.schedule_end_time).getTime()
                            );
                        }
                    });
            }
            if (e) {
                this.$set(
                    e,
                    "schedule_start_time",
                    e.scheduleTime && e.scheduleTime[0]
                );
                this.$set(
                    e,
                    "schedule_end_time",
                    e.scheduleTime && e.scheduleTime[1]
                );
                this.$emit("checkRequiredData", e);
            }
        },
        itemClick(item) {
            this.$emit("checkRequiredData", item);
        },
        // CP制作人列表
        async getCPMakerListData() {
            const data = await TaskEntryRequest.getCPMaker({
                search: '',
                page: 1,
                page_size: 999,
                project_id: this.taskDetailsData && this.taskDetailsData.project_id
            });
            if (data.err_code === 0) {
                this.cpMaker = data.data || [];
            }
        },
    }
};
</script>
<style lang="less" scoped>
.task-node-info {
    .step-list {
        position: relative;
        margin-bottom: 40px;
        &:last-child {
            margin-bottom: 0;
        }
        div {
            margin-bottom: 22px;
            &:last-child {
                margin-bottom: 0;
            }
        }
        .node-title {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            em {
                display: inline-block;
                width: 20px;
                height: 20px;
                line-height: 20px;
                border-radius: 100%;
                text-align: center;
                font-style: normal;
                background: @baseColor;
                color: #ffffff;
            }
            span {
                margin-left: 10px;
                color: @baseColor;
            }
        }
        .cp-make,
        .schedule {
            display: flex;
            align-items: center;
            position: relative;
            label {
                color: @error;
                margin-right: 4px;
            }
            .label {
                display: inline-block;
                width: 98px!important;
                text-align: right;
                vertical-align: middle;
                font-size: 14px;
                color: #E3E4E4;
                padding: 0 12px 0 0;
                box-sizing: border-box;
            }
            .maker-name-box {
                i {
                    font-style: normal;
                    border-radius: 2px;
                    padding: 1px 2px;
                    color: #ffffff;
                    margin-right: 5px;
                    font-size: 12px;
                    background-color: @baseColor;
                }
            }
        }
        .err-tips {
            color: #f56c6c;
            font-size: 12px;
            line-height: 1;
            padding-top: 4px;
            margin-left: 12px;
            position: absolute;
            top: 75%;
            left: 20%;
        }
    }
}
</style>
