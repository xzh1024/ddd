<template>
    <div class="new_role_dialog">
        <el-dialog title="添加权限组" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="400px"
                   @close="dialogClose">
            <el-form :model="newRole" :rules="rules" ref='addStaffForm' label-width="80px">
                <el-form-item label="权限名称" prop='name'>
                    <el-input v-model.trim="newRole.name" autocomplete="off" ref="roleInput"></el-input>
                </el-form-item>
                <el-form-item label="权限类型">
                    <CusTab key='addAuth' :tabs='authTabs' :active="authIndex"
                            @handleItemClick='aothItemClicked'></CusTab>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button round size="medium" @click="dialogFormVisible = false">取消</el-button>
                <el-button round size="medium" type="primary" @click="addAuthGroup('addStaffForm')">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import {Request} from '../service/http'
    import _ from 'lodash'
    import {mapState, mapMutations, mapActions} from 'vuex';
    import CusTab from '@components/cusUI/cusTab';
    
    export default {
        name: 'addAuthGroupDialog',
        props: {},
        data() {
            return {
                dialogFormVisible: false,
                newRole: {
                    name: '',
                    type: 1
                },
                authIndex: 0,
                rules: {
                    name: {required: true, message: '请输入新权限组名称', trigger: 'blur'},
                },
                authTabs: [
                    {
                        name: '甲方权限',
                        type: 1
                    },
                    {
                        name: '乙方权限',
                        type: 2
                    }
                ],
                isLoading: false
            }
        },
        components: {
            CusTab
        },
        computed: {},
        methods: {
            ...mapActions('auths', ['loadRoleList']),
            open() {
                this.dialogFormVisible = true;
                this.$nextTick(function () {
                    this.$refs.roleInput.focus()
                })
            },
            aothItemClicked(item) {
                this.newRole.type = item.type
            },
            addAuthGroup(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        Request.addAuthGroup({
                            company_type: this.newRole.type,
                            auth_name: this.newRole.name
                        })
                            .then(res => {
                                if (res.err_code === 0) {
                                    this.$message.success('添加成功');
                                    this.loadRoleList();
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
    .new_role_dialog {
        /deep/ .el-dialog {
            overflow: visible !important;
            .el-form {
                padding: 20px 20px 0 20px;
            }
        }
    }
</style>
