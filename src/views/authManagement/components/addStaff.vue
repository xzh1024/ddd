<template>
    <div class="add-dialog-warp" >
    <el-dialog title="成员新增" width="500px" :close-on-click-modal='false' :visible.sync="dialogFormVisible" :lock-scroll="false" @close="dialogClose">
        <loading v-if="isLoading"></loading>
        <el-form :model="form" :rules="rules" ref="form" label-width="80px">
            <el-form-item label="用户名" prop = 'name'>
                <el-input v-model.trim="form.name" autocomplete="off" ref="focusInput"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop = 'mobile'>
                <el-input v-model.trim="form.mobile" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop = 'email'>
                <el-input v-model.trim="form.email" autocomplete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button round size="medium" @click="dialogFormVisible = false">取消</el-button>
            <el-button :disabled="isLoading" round size="medium" type="primary" @click="submitForm('form')">确定</el-button>
        </div>
    </el-dialog>
    </div>
</template>
<script>
import {Request} from '../service/http'
import _ from 'lodash'
import {mapState, mapMutations,mapActions} from 'vuex';
export default {
    name:'addAccountDialog',
    props:{
    },
    data(){
        var checkPhone = (rule, value, callback) => {
		    const phoneReg = /^1[3|4|5|6|7|8][0-9]{9}$/;
		    if (!value) {
		      return callback(new Error('电话号码不能为空'))
		    }
		    setTimeout(() => {
		      if (!Number.isInteger(+value)) {
		        callback(new Error('请输入数字值'))
		      } else {
		        if (phoneReg.test(value)) {
		          callback()
		        } else {
		          callback(new Error('电话号码格式不正确'))
		        }
		      }
		    }, 100)
		  };
        return {
            dialogFormVisible:false,
            form:{
                name:'',
                mobile:'',
                email:''
            },
            rules: {
                name:{required:true,message:'请输入名称', trigger: 'blur' },
                mobile:{required:true, validator:checkPhone, trigger:'blur' },
                email:{required:true,type:'email',message:'请输入邮箱', trigger: 'blur' },
            },
            isLoading:false
        }
    },
    computed: {
    },
    methods: {
        ...mapActions('auths',['loadRoleList']),
        open(){
            this.dialogFormVisible= true;
            this.$nextTick(function(){
                this.$refs.focusInput.focus()
            })
        },
        submitForm(formName){
            this.$refs[formName].validate((valid,obj)=>{
                if(valid){
                    let parama={};
                    const form = _.cloneDeep(this.form);
                    parama.name = form.name;
                    parama.mobile = form.mobile;
                    parama.email = form.email;
                    this.isLoading = true;
                    Request.accountAdd(parama)
                    .then(res=>{
                        this.isLoading = false;
                        if(res.err_code === 0){
                            this.$message({
                            message: '录入成功!',
                            type: 'success'
                            });
                            this.$emit('reloadList');
                            this.loadRoleList();
                            this.dialogFormVisible=false
                        }
                    })
                    .catch(err=>{
                        console.log(err);
                        this.isLoading = false
                    })
                }
            })
        },
        dialogClose(){
            this.$emit('dialogClose')
        }
    },
    mounted(){
    }
    
}
</script>
<style lang="less" scoped>
    .add-dialog-warp{
        /deep/.el-dialog{
            overflow: visible!important;
            .el-form{
                padding: 20px;
            }
        }
    }
</style>
