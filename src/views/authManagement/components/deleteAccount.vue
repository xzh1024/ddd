<template>
    <div class="delete_dialog">
        <el-dialog title="删除成员账号" width="500px" :close-on-click-modal='false' :visible.sync="dialogFormVisible"
                   @close="dialogClose"
                   :lock-scroll="false">
            <el-form :model="deleteform" :rules="rules" ref="form" label-width="80px">
                <el-form-item label="离场原因" prop='reason'>
                    <el-input type="textarea" v-model.trim="deleteform.reason"
                              :autosize="{'minRows':'4','maxRows':'10'}" show-word-limit :maxlength="200"
                              autocomplete="off" ref="focusInput"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button round size="medium" @click="dialogFormVisible = false">取消
                </el-button>
                <el-button round size="medium" type="primary" @click="deleteForm('form')">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import {Request} from '../service/http'
    import _ from 'lodash'
    
    export default {
        name: 'deleteAccountDialog',
        props: {},
        data() {
            return {
                dialogFormVisible: false,
                deletingItem: {},
                deleteform: {
                    reason: '',
                },
                isLoading: false,
                rules: {
                    reason: {required: true, message: '请输入离场原因', trigger: 'blur'},
                },
            }
        },
        computed: {},
        methods: {
            open(e) {
                this.dialogFormVisible = true;
                this.deletingItem = e;
                this.$nextTick(function () {
                    this.$refs.focusInput.focus()
                })
            },
            deleteForm(formName) {
                this.$refs[formName].validate(async (valid, obj) => {
                    if (valid) {
                        const user_id = this.deletingItem.row.id;
                        this.isLoading = true;
                        const res = await Request.deleteStaff({account_id: user_id, mobilize: this.deleteform.reason});
                        if (res.err_code === 0) {
                            this.$message.success('操作成功');
                            this.$emit('reloadList');
                            this.dialogFormVisible = false;
                        }
                        this.isLoading = false;
                    }
                })
            },
            dialogClose() {
                this.$emit('dialogClose')
            }
        },
        mounted() {
        }
        
    }
</script>
<style lang="less" scoped>
    .add-dialog-warp {
        /deep/ .el-dialog {
            overflow: visible !important;
            .el-form {
                padding: 20px;
            }
        }
    }
</style>
