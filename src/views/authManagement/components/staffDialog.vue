/*弹窗组件*/

<template>
    <div class="addStaffDialog-warp">
    <el-dialog title="编辑成员信息" width="650px" :close-on-click-modal='false' :visible.sync="dialogFormVisible" @close="dialogClose" :lock-scroll="false">
        <loading v-if="isLoading"></loading>
        <el-form :model="form" :rules="typeCompany ? secondRules : firstRules" ref="staffForm" label-width="80px" :validate-on-rule-change="false">
            <div class="form-div">
                <div class="form-left">
                    <el-form-item label="用户名">
                        <el-input v-model.trim="form.name" disabled autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="权限组" prop="authtype">
                        <CusSelect ref="authtype" key='authtype' :clearable="false"  placeholder="请选择权限组" :lists='authArr' :values.sync='form.authType'></CusSelect>
                    </el-form-item>
                    <el-form-item v-if="!typeCompany" prop="workType"  label="工作类型" >
                        <el-cascader
                            v-model="form.workType"
                            popper-class="cus-work-type"
                            :options="workOptions"
                            placeholder="请选择工作类型"
                            :props="{ expandTrigger: 'hover' }"
                            @change="workhandleChange('workType')"
                            ></el-cascader>
                    </el-form-item>
                    <el-form-item label="负责项目" prop="proType">
                        <CusSelect ref="proType" key='proType' needAllSelect multiple placeholder="请选择负责项目" :lists='prolist' :values.sync='form.proType'></CusSelect>
                    </el-form-item>
                </div>
                <div class="form-right">
                    <el-form-item label="手机号">
                        <el-input v-model.trim="form.mobile" disabled autocomplete="off"></el-input>
                    </el-form-item>
                    <template v-if="typeCompany">
                        <el-form-item label="CP" prop="companyId">
                            <CusSelect ref="companyId" filterable key='companyId' placeholder="请关联公司" :values.sync='form.companyId' url="/api/get-company-list"></CusSelect>
                        </el-form-item>
                    </template>
                    <template v-else>
                        <el-form-item label="职级" prop="zhiji">
                            <el-input v-model.trim="form.zhiji" autocomplete="off"></el-input>
                        </el-form-item>
                        <el-form-item label="工作室" prop="officeType">
                            <CusSelect ref="officeType" key='officeType' needAllSelect multiple placeholder="请选择工作室" :lists='officeArr' :values.sync='form.officeType' ></CusSelect>
                        </el-form-item>
                    </template>
                    <div class="radio_warp">
                        <CusRadio @boxclick="boxclick" :checked="form.isChange" :disabled="!form.isChange"></CusRadio>
                    </div>
                    
                </div>
            </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button round size="medium" @click="dialogFormVisible = false">取消</el-button>
            <el-button :disabled="isLoading" round size="medium" type="primary" @click="submitForm('staffForm')">确定</el-button>
        </div>
    </el-dialog>
    </div>
</template>
<script>
import CusSelect from '@components/cusUI/cusSelect'
import CusRadio from '../components/cusRadioBar'
import {Request} from '../service/http'
import {mapState, mapMutations,mapActions} from 'vuex';
import _ from 'lodash'
export default {
    name:'staffDialog',
    props:{
    },
    data(){
        return {
            isLoading:false,
            dialogFormVisible:false,
            form: {
                name: '',
                mobile:'',
                zhiji:'',
                authType:'',
                workType:[],
                officeType:[],
                proType:[],
                companyId:'',
                isChange:false,
            },
            oldForm:{},
            firstRules: {
                authType:{required:true,message:'请选择权限组！', trigger: 'blur' },
                zhiji:{required:true,message:'请输入职级！', trigger: 'blur' },
                workType:{required:true,message:'请选择工作类型！', trigger: 'blur' },
                officeType:{required:true,message:'请选择工作室！', trigger: 'blur' },
                proType:{required:true,message:'请选择负责项目！', trigger: 'blur' },
            },
            secondRules:{
                authType:{required:true,message:'请选择权限组！', trigger: 'blur' },
                companyId:{required:true,message:'请关联公司！', trigger: 'blur' },
                officeType:{required:true,message:'请选择工作室！', trigger: 'blur' },
                proType:{required:true,message:'请选择负责项目！', trigger: 'blur' },
            },
            authArr:[],
            workOptions: [],
            officeArr:[],
            prolist:[],
            user_id:'',
            companyName:'',
        }
    },
    computed: {
        typeCompany(){
            const index = this.authArr.findIndex((item)=>{
                return item.id == this.form.authType
            });
            if(index > -1){
                let companyType = this.authArr[index].company_type;
                if(companyType == 2){
                return true
                }else{
                    return false
                }
            }else{
                return false
            }
        },
    },
    components:{
        CusSelect,CusRadio
    },
    methods: {
        ...mapActions('auths',['loadRoleList']),
        
        open(data){
            this.isLoading = true;
            this.dialogFormVisible=true;
            Request.getUserInfoDetail({'user_id':data.id,'category_id':0})
            .then((res)=>{
                this.isLoading =false;
                if(res.err_code === 0){
                    const data = res.data;
                    this.user_id =data.user_info.id;
                    this.officeArr = data.studio_list;
                    this.prolist = data.project_list;
                    this.form.name =data.user_info.name;
                    this.form.mobile=data.user_info.mobile;
                    this.form.officeType = data.studio_ids;
                    this.form.proType=data.project_ids;
                    this.form.zhiji = data.rank_name;
                    let auth_list = _.cloneDeep(data.auth_list);
                    let teee = [];       //甲方不能转乙方，乙方不能转甲方
                    let companyTypett = '';
                    auth_list.forEach(element => {
                        element.name = element.auth_name;
                        if(element.is_check){
                            this.form.authType=element.id;
                            companyTypett = element.company_type
                        }
                    });
                    if(companyTypett){
                        auth_list.forEach(element => {
                            if(element.company_type == companyTypett){
                                teee.push(element)
                            }
                        });
                        this.authArr = teee
                    }else{                            //未分配
                        this.authArr = auth_list
                    }
                    this.form.workType=data.category_id;
                    if(data.category_list.length){
                        let tempcate = _.cloneDeep(data.category_list);
                        this.changeKey(tempcate);
                        this.workOptions =tempcate
                    }
                    if(data.company_info){
                        this.form.companyId = data.company_info.id;
                        this.companyName = data.company_info.name
                    }
                    if(data.user_info.is_update === 2){
                        this.form.isChange = true
                    }
                    //存下来原始值
                    this.$nextTick(function(){
                        this.oldForm = _.cloneDeep(this.form)
                    })
                }else{
                    this.$message(res.err_message)
                }
            })
            .catch(err=>{
                console.log('err',err);
                this.$message('出错了，请刷新页面重试');
                this.isLoading =false
            })
        },
        changeKey(arr){
            arr.forEach((item)=>{
                item.label=item.name;
                item.value=item.id;
                if(item.children){
                    this.changeKey(item.children)
                }
            })
        },
        workhandleChange(prop){
            this.$refs.staffForm.validateField(prop)
        },
        submitForm(formName){
            this.$refs[formName].validate((valid,obj)=>{
                if(valid){
                    let parama={
                        user_id:this.user_id,
                    };
                    const newform = _.cloneDeep(this.form);
                    if(newform.proType.length && newform.proType[0] == 'cus_all'){ newform.proType.shift() }
                    if(newform.officeType.length && newform.officeType[0] == 'cus_all'){ newform.officeType.shift() }
                    const oldform = _.cloneDeep(this.oldForm);
                    let form = this.$Tools.ObjDifference(newform,oldform);//仅仅上传被改变的数据
                    if(_.isEmpty(form)){
                        this.$message.error('您未更改任何选项!');
                        return
                    }
                    _.forOwn(form,function(val,key){
                        form[key] = newform[key]
                    });
                    if(this.typeCompany){
                        if(form.companyId){ parama.company_id =form.companyId }
                    }else{
                        if(form.workType){ parama.category_ids=_.join(form.workType) }
                        if(form.officeType){ parama.studio_ids=_.join(form.officeType) }
                        if(form.zhiji){ parama.rank_name = form.zhiji }
                    }
                    if(form.authType){ parama.auth_id=form.authType }
                    if(form.proType){ parama.project_ids=_.join(form.proType) }
                    this.isLoading = true;
                    Request.updataStaffInfo(parama)
                    .then(res=>{
                        this.isLoading = false;
                        if(res.err_code === 0){
                            this.$message({
                            message: '修改成功!',
                            type: 'success'
                            });
                            this.$emit('reloadList');
                            this.loadRoleList();
                            this.dialogFormVisible=false
                        }else if(res.err_code === 113){
                            this.form.isChange = true
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
        },
        cusBlur(prop){
            if(this.$refs.staffForm){
                this.$refs.staffForm.validateField(prop,(err)=>{
                    if(err){
                        this.$refs[prop].validError(true)
                    }else{
                        this.$refs[prop].validError(false)
                    }
                })
            }
            
        },
        boxclick(){
            let temp = _.cloneDeep(this.form)
            Request.updataStaffInfo({
                user_id:this.user_id,
                is_update:1
            })
            .then(res=>{
                this.isLoading = false;
                if(res.err_code === 0){
                    temp.isChange=false
                    this.form = temp
                }
                })
            .catch(err=>{
                console.log(err);
                this.isLoading = false
            })
        }
    },
    
}
</script>
<style lang="less" scoped>
    .addStaffDialog-warp{
        /deep/.el-dialog{
            overflow: visible!important;
            .el-scrollbar .el-cascader-menu{
                max-width: 120px;
                overflow: hidden;
                white-space:nowrap;
                text-overflow: ellipsis;
                
            }
        }
        .add-btn{
        color:@baseColor;
        margin-left: 10px;
        text-decoration-line: underline;
        &:hover {
                cursor: pointer;
            }
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
            /deep/ .el-input--suffix{
                width: 225px;
            }
            .radio_warp{
                width: 305px;
                height: 40px;
                display: flex;
                justify-content: flex-end;
                align-items: center;
            }
        }
        // .el-tag{
        //     margin-right: 10px;
        // }
        /deep/ .el-select__tags{
            .el-tag{
                line-height: 24px;
                &:first-child{
                    // max-width: 140px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    .el-select__tags-text{
                        display: block;
                        max-width: 105px;
                        overflow: hidden;
                        white-space:nowrap;
                        text-overflow: ellipsis;
                    }
                    .el-icon-close{
                        display: block;
                        margin-top: 0;
                    }
                }
            }
        }
        /deep/ .el-cascader{
            input{
                &:hover{
                    border-color: #00A8FF;
                }
            }
        }
        
    }
</style>

<style lang="less">
    .cus-work-type{
        /deep/.el-cascader-node__label{
            max-width: 180px;
            overflow-x: hidden;
            white-space:nowrap;
            text-overflow: ellipsis;
        }
    }
</style>
