<template>
    <div class="change_price_dialog">
        <el-dialog title="报价变更" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="400px" @close="dialogClose">
            <div v-if="isEditing" class="notice">报价变更已提交，待乙方审核</div>
            <el-form :disabled="!imFollow || isEditing" :model="form" :rules="rules" ref="form" label-width="80px">
                <el-form-item label="任务报价" prop = 'price'>
                    <el-input ref="roleInput" v-model.trim="form.price" autocomplete="off"></el-input>
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
    export default {
        name: 'changePriceDialog',
        data() {
            const user = JSON.parse(sessionStorage.userData) || {}
            return {
                dialogFormVisible: false,
                form: {
                    price: '',
                },
                rules: {
                    price: [
                        {required: true, message: '请输入新报价', trigger: 'blur'},
                        {pattern: /^\+?[1-9][0-9]*$/, message: '请输入正整数' }
                        ],
                },
                isLoading: false,
                userId : user.id,
                followerId : -1,
                taskID:'',
                isEditing:false,
                oldPrice:'',
            }
        },
        computed: {
            imFollow(){
                return this.followerId == this.userId
            },
        },
        methods: {
            open(row) {
                console.log(row)
                Request.getPriceChangeStatu({
                    id: row.uuid,
                })
                .then(res => {
                    if (res.err_code === 0) {
                        this.dialogFormVisible = true;
                        this.followerId = row.FollowUser[0] || -1
                        this.taskID = row.uuid
                        this.form.price=res.data.price
                        this.oldPrice = res.data.price
                        if(res.data.is_update === 1){
                            this.isEditing = true
                        }
                    }
                })
                .catch(err => {
                    console.log('出错了', err)
                })
                this.$nextTick(function () {
                    if(this.$refs.roleInput) this.$refs.roleInput.focus()
                })
            },
            submitForm(formName) {
                if(this.oldPrice == this.form.price){
                    this.$message.error('报价与原报价相同！')
                    return
                }
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        Request.priceChange({
                            id: this.taskID,
                            price: this.form.price
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
        }
    }
</style>
