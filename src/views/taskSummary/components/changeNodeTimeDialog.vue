<template>
    <div class="change_price_dialog">
        <el-dialog title="排期变更" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="400px" @close="dialogClose">
            <div v-if="isEditing" class="notice">排期变更已提交，待乙方审核</div>
            <el-form :disabled="!imFollow || isEditing" :model="form" ref="form" label-width="80px">
                <el-form-item label="任务排期">
                    <el-date-picker
                        size="medium"
                        key="group-date-picker"
                        v-model="form.time"
                        type="daterange"
                        class="left-item-long"
                        :clearable="false"
                        :picker-options="pickerOptions"
                        @change="screenDataChange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期">
                    </el-date-picker>
                    <div class="err-name" v-if="timeError">结束时间不可选择为今日之前的时间</div>
                </el-form-item>
            </el-form>
            <div v-if="!imFollow || isEditing" slot="footer" class="dialog-footer">
                <el-button round size="medium" @click="dialogFormVisible = false">{{"关闭"}}</el-button>
            </div>
            <div v-else slot="footer" class="dialog-footer">
                <el-button round size="medium" @click="dialogFormVisible = false">取消</el-button>
                <el-button round size="medium" type="primary" @click="submitForm('form')">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import {Request} from '../service/http'
    import _ from 'lodash'
    import moment from "moment"
    export default {
        name: 'changeNodeTimeDialog',
        data() {
            const user = JSON.parse(sessionStorage.userData) || {}
            return {
                dialogFormVisible: false,
                form: {
                    time:'',
                },
                isLoading: false,
                userId : user.id,
                followerId : -1,
                taskID:'',
                isEditing:false,
                oldstartTime:'',
                oldendTime:'',
                timeError:false,
            }
        },
        computed: {
            imFollow(){
                return this.followerId == this.userId
            },
            pickerOptions() {
                return {
                    disabledDate(time) {
                        return (moment().startOf('month')).isAfter(time);
                    }
                }
            },
        },
        methods: {
            open(row) {
                Request.getNoteChangeStatu({
                    id: row.uuid,
                })
                .then(res => {
                    if (res.err_code === 0) {
                        this.dialogFormVisible = true;
                        this.followerId = row.FollowUser[0] || -1
                        this.taskID = row.uuid
                        if(res.data.start_time && res.data.end_time){
                            let d1 = moment(res.data.start_time).format('YYYY-MM-DD')
                            let d2 = moment(res.data.end_time).format('YYYY-MM-DD')
                            this.form.time=[d1,d2]
                            this.oldstartTime = d1
                            this.oldendTime =d2
                        }
                        if(res.data.is_update === 1){
                            this.isEditing = true
                        }
                    }
                })
                .catch(err => {
                    console.log('出错了', err)
                })
            },
            submitForm(formName) {
                if(this.timeError){
                    return
                }
                if(!this.form.time.length){
                    this.$message.error('请选择排期')
                    return
                }
                let p1 = moment(this.form.time[0]).format('YYYY-MM-DD');
                let p2 = moment(this.form.time[1]).format('YYYY-MM-DD');
                if(p1 == this.oldstartTime && p2 == this.oldendTime){
                    this.$message.error('排期并未被修改！')
                    return
                }
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        Request.noteChange({
                            id: this.taskID,
                            start_time: p1,
                            end_time:p2
                        })
                        .then(res => {
                            if (res.err_code === 0) {
                                this.$message.success('修改成功');
                                this.dialogFormVisible = false;
                            }
                        })
                        .catch(err => {
                            console.log('出错了', err)
                        })
                    }
                })
            },
            screenDataChange(value){
                this.timeError = false
                if(value){
                    if(moment(value[1]).isBefore(moment().subtract(1, 'days'))){
                        this.timeError= true
                    }
                }
            },
            dialogClose() {
                this.$emit('dialogClose')
            },
        },
        mounted() {
        }
        
    }
</script>
<style lang="less" scoped>
    .change_price_dialog {
        .notice{
            width: 100%;
            height: 20px;
            line-height:20px;
            text-align: center;
            background: @backGroundLightExtra;
            color:@textLighter
        }
        /deep/ .el-dialog {
            overflow: visible !important;
            .el-form {
                padding: 20px 20px 0 20px;
            }
            .left-item-long {
                width: 270px !important;
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
        }
        .err-name{
            position: absolute;
            top: 100%;
            left: 0;
            line-height: 1;
            padding-top: 4px;
            color: @error;
            font-size: 12px;
        }
    }
</style>
