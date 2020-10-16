<template>
    <div class="child-tas-left-details">
        <el-form ref="childTaskDetailsForm" :model="childtTaskDetailsData" label-width="80px">
            <el-form-item label="任务名称" required>
                <el-input v-model="childtTaskDetailsData.data.name" :disabled="isDisabled" @input="focusTaskNameEnter"></el-input>
                <div class="err-tips" v-if="childtTaskDetailsData.data.childTaskNameIsEmpty">请填写任务名称</div>
            </el-form-item>
            <el-form-item label="任务报价" required>
                <el-input v-model.trim="childtTaskDetailsData.data.price" maxlength="9" :disabled="isDisabled" @input="changePrice">
                    <template slot="append">人天</template>
                </el-input>
                <div class="err-tips" v-if="childtTaskDetailsData.data.childTaskPriceIsEmpty">请填写任务报价(输入大于0的数字)</div>
            </el-form-item>
            <el-form-item label="制作类型" required>
                <el-select v-model="childtTaskDetailsData.data.standard_id" placeholder="请选择制作类型"  style="width:100%" :disabled="isDisabled" @change='changeStandard'>
                    <el-option v-for="item in productionSpecification" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
                <div class="err-tips" v-if="childtTaskDetailsData.data.childTaskTypeIsEmpty">请选择制作类型</div>
            </el-form-item>
            <!-- supportDep权限下任务在已预警状态下 任务出现 报价确认且可录入 -->
            <el-form-item label="报价确认" v-if="confirmPriceFlag" required>
                <el-input v-model.trim="childtTaskDetailsData.data.confirm_price" @input="changesupportDepQuotatePrice" :disabled="taskEntryStatus == 4" maxlength="9">
                    <template slot="append">人天</template>
                </el-input>
                <div class="err-tips" v-if="childtTaskDetailsData.data.confirmPriceIsEmpty">请填写报价确认(输入大于0的数字)</div>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
export default {
    name: "childTaskLeftDetails",
    props: {
        childtTaskDetailsData: Object,
        productionSpecification: Array,
        taskEntryStatus:[Number,String],
        isEditChildTaskFlag: Boolean,
    },
    computed: {
        userType() {
            return this.userData.company_type;
        },
        confirmPriceFlag(){
            if(this.taskEntryStatus == 3 && this.userType==1){
                return true;
            } else if(this.taskEntryStatus == 4 && this.userType==2){
                return true;
            }else{
                return false;
            }
        }
    },
    data() {
        return {
            isDisabled: false,
            userData: sessionStorage.userData ? JSON.parse(sessionStorage.userData) : {},
        };
    },
    mounted() {
        this.isDisabled = this.isEditChildTaskFlag ? false : true;
    },
    methods: {
        changeStandard(){
            this.$emit('changeStandard');
        },
        changePrice(){
            this.$emit('changePrice');
        },     
        changesupportDepQuotatePrice(){
            this.$emit('changesupportDepQuotatePrice');
        },
        focusTaskNameEnter(value){
            this.$emit('focusTaskNameEnter',value);
        }
    }
};
</script>
<style lang="less" scoped>
.child-tas-left-details{
    position: relative;
    .err-tips{
        color: #f56c6c;
        font-size: 12px;
        line-height: 1;
        padding-top: 4px;
        position: absolute;
        top: 100%;
        left: 0;;
    }
}
</style>