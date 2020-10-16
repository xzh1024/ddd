<template>
    <div class="add-dialog-warp" >
    <el-dialog title="人力录入" width="650px" :close-on-click-modal='false' :visible.sync="dialogFormVisible" :lock-scroll="false" @close="dialogClose">
        <loading v-if="isLoading"></loading>
        <el-form :model="form" :rules="rules" ref="staffForm" class="dialog-has-footer" label-width="90px">
            <el-scrollbar style="width:100%;height:100%">
            <div class="form-div">
                <div class="form-left">
                    <el-form-item label="名称" prop='name'>
                        <el-input v-model.trim="form.name" placeholder="请输入人员名称" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话" prop='mobile'>
                        <el-input v-model.trim="form.mobile" placeholder="请输入联系电话" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="主职" prop='zhuzhi'>
                        <CusSelecter ref="zhuzhi" key='form.Selecter' groupList placeholder="请选择主职能" :lists='roleList' @indexSelect="roleSelsect" :values.sync='form.zhuzhi'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="细分职能1">
                        <CusSelecter key='xizhiAzhiSelecter' groupList placeholder="请选择细分职能" :lists='roleList' @indexSelect="roleSelsect" :values.sync='form.xizhi1'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="省份" prop='province' >
                        <el-input v-model.trim="form.province" placeholder="请输入省份" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="职位" prop='office'>
                        <el-input v-model.trim="form.office" placeholder="请输入职位" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="AH账号">
                        <el-input v-model.trim="form.ah_account" placeholder="请输入AH账号" autocomplete="off"></el-input>
                    </el-form-item>
                </div>
                <div class="form-right">
                    <el-form-item label="性别" prop='sex'>
                        <CusSelecter ref="sex" key='SEXSelecter'  placeholder="请选择性别" :lists='sexArr' :values.sync='form.sex'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="职级" prop='zhiji'>
                        <CusSelecter ref="zhiji" key='zhijiSelecter'  placeholder="请选择职级" :lists='zhijiArr' :values.sync='form.zhiji'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="副职">
                        <CusSelecter key='fuzhizhiSelecter' groupList placeholder="请选择副职" :lists='roleList' @indexSelect="roleSelsect" :values.sync='form.fuzhi'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="细分职能2">
                        <CusSelecter key='xizhi2Selecter' groupList placeholder="请选择细分职能" :lists='roleList' @indexSelect="roleSelsect" :values.sync='form.xizhi2'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="城市" prop='city'>
                        <el-input v-model.trim="form.city" placeholder="请输入城市" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="人员属性">
                        <el-input v-model.trim="form.ability" placeholder="请输入人员属性" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="工号" prop='work_number'>
                        <el-input v-model.trim="form.work_number" placeholder="请输入工号" autocomplete="off"></el-input>
                    </el-form-item>
                </div>
            </div>
            </el-scrollbar>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button round size="medium" @click="dialogFormVisible = false">取消</el-button>
            <el-button :disabled="isLoading" round size="medium" type="primary" @click="submitForm('staffForm')">确定</el-button>
        </div>
    </el-dialog>
    </div>
</template>
<script>
import CusSelecter from '@components/cusUI/cusSelect'
import {Request} from '../service/http'
import _ from 'lodash'
export default {
    name:'addStaffDialog',
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
                zhuzhi:'',
                fuzhi:'',
                xizhi1:'',
                xizhi2:'',
                zhiji:'',
                sex:'',
                ability:'',
                province:'',
                office:'',
                ah_account:'',
                work_number:''
            },
            sexArr:[{name:'男',id:1},{name:'女',id:2}],
            roleList:[
            ],
            zhijiArr:[
            ],
            rules: {
                name:{required:true,message:'请输入名称', trigger: 'blur' },
                mobile:{required:true, validator:checkPhone, trigger:'blur' },
                sex:{required:true,message:'请选择性别', trigger: 'blur' },
                zhiji:{required:true,message:'请选择职级', trigger: 'blur' },
                zhuzhi:{required:true,message:'请选择主职', trigger: 'blur' },
                province:{required:true,message:'请输入省份', trigger: 'blur' },
                city:{required:true,message:'请输入城市', trigger: 'blur' },
                office:{required:true,message:'请输入职位', trigger: 'blur' },
            },
            isLoading:false
        }
    },
    computed: {
    },
    components:{
        CusSelecter
    },
    methods: {
        open(data){
            this.isLoading = true;
            this.dialogFormVisible=true;
            Promise.all([Request.getRankList(),Request.getPositionList()])
            .then(res=>{
                this.isLoading = false;
                if(res[0].err_code === 0 && res[1].err_code === 0){
                    this.zhijiArr = res[0].data;

                    let temp = _.cloneDeep(res[1].data);
                    temp.forEach((item)=>{
                        item.new_select = false
                    });
                    this.roleList = temp
                }else{
                    // this.$message.error('出错了，请刷新页面再试')
                }
            })
            .catch(errs=>{
                this.$message.error('出错了，请刷新页面再试');
                this.isLoading = false;
                console.log('errs',errs)
            })
        },
        submitForm(formName){
            this.$refs[formName].validate((valid,obj)=>{
                if(valid){
                    let parama={};
                    const form = _.cloneDeep(this.form);
                    if(form.fuzhi){parama.position_v2 =form.fuzhi}
                    if(form.xizhi1){parama.position_v3 =form.xizhi1}
                    if(form.xizhi2){parama.position_v4 =form.xizhi2}
                    if(form.ability){parama.ability =form.ability}
                    if(form.ah_account){parama.ah_account =form.ah_account}
                    if(form.work_number){parama.work_number =form.work_number}
                    parama.sex = form.sex;
                    parama.rank_id = form.zhiji;
                    parama.position_v1 = form.zhuzhi;
                    parama.province = form.province;
                    parama.city=form.city;
                    parama.mobile = form.mobile;
                    parama.name = form.name;
                    parama.office = form.office;
                    this.isLoading = true;
                    Request.humanAdd(parama)
                    .then(res=>{
                        this.isLoading = false;
                        if(res.err_code === 0){
                            this.$message({
                            message: '录入成功!',
                            type: 'success'
                            });
                            this.$emit('reloadList');
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
        roleSelsect(){
            //将roleList中被主职、副职、细分职能选中的new_select设置为ture，其他的设置为false
            let tempList = _.cloneDeep(this.roleList);
            this.$nextTick(()=>{
                tempList.forEach((item)=>{
                    if(item.id == this.form.zhuzhi || item.id == this.form.fuzhi || item.id == this.form.xizhi1 || item.id == this.form.xizhi2){
                        item.new_select =true
                    }else{
                        item.new_select = false
                    }
                });
                this.roleList = tempList
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
        }
        .dialog-has-footer{
            height: 472px;
            overflow: hidden;
            width: 100%;
        }
        /deep/.cus_select{
            width: 220px;
        }
        .form-div{
            display: flex;
            flex-direction: row;
            margin:10px;
            width: calc(~'100% - 40px');
            height: calc(~'100% - 40px');
            .form-left{
                flex:1;
            }
            .form-right{
                flex:1;
            }
            
        }
    }
</style>
