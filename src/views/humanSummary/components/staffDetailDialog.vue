<template>
    <div class="staff-detail-dialog-warp">
    <el-dialog :title="type == 'audit' ? '人力信息审核' : '人力信息详情'" width="650px" :close-on-click-modal='false' :visible.sync="dialogFormVisible"  @close="dialogClose" :lock-scroll="false">
        <loading v-if="isLoading"></loading>
        <el-form :model="form" :rules="showLeaveTime ? rulesLeave : rules" class="dialog-has-footer" ref="staffForm" label-width="90px" :validate-on-rule-change="false" :disabled="!writeAble || (type == 'audit')">
            <el-scrollbar style="width:100%;height:100%">
            <div class="form-div">
                <div class="form-left">
                    <el-form-item label="名称">
                        <el-input v-model.trim="form.name" disabled placeholder="请输入人员名称" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话">
                        <el-input v-model.trim="form.mobile" disabled placeholder="请输入联系电话" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="职位" prop="office">
                        <el-input v-model.trim="form.office" placeholder="请输入职位" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="主职" prop='zhuzhi'>
                        <CusSelecter ref="zhuzhi" key='form.Selecter' :disabled="!writeAble" groupList placeholder="请选择主职能" :lists='roleList' @indexSelect="roleSelsect" :values.sync='form.zhuzhi'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="细分职能1">
                        <CusSelecter key='xizhiAzhiSelecter' :disabled="!writeAble" groupList placeholder="请选择细分职能" :lists='roleList' @indexSelect="roleSelsect" :values.sync='form.xizhi1'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="省份" prop="province">
                        <el-input v-model.trim="form.province" placeholder="请输入省份" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="AH账号">
                        <el-input v-model.trim="form.ah_account" placeholder="请输入AH账号" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="驻场时间">
                        <el-date-picker
                            disabled
                            v-model="form.resident_time"
                            type="date"
                            placeholder=""
                            format="yyyy 年 MM 月 dd 日"
                            value-format="timestamp">
                        </el-date-picker>
                    </el-form-item>
                </div>
                <div class="form-right">
                    <el-form-item label="性别" prop='sex'>
                        <CusSelecter ref="sex" key='SEXSelecter' :disabled="!writeAble"  placeholder="请选择性别" :lists='sexArr' :values.sync='form.sex'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="职级" prop='zhiji'>
                        <CusSelecter ref="zhiji" key='zhijiSelecter' :disabled="!writeAble"  placeholder="请选择职级" :lists='zhijiArr' :values.sync='form.zhiji'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="CP">
                        <el-input v-model.trim="form.company_name" disabled placeholder="请输入cp" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="副职">
                        <CusSelecter key='fuzhizhiSelecter' :disabled="!writeAble" groupList placeholder="请选择副职" :lists='roleList' @indexSelect="roleSelsect" :values.sync='form.fuzhi'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="细分职能2">
                        <CusSelecter key='xizhi2Selecter' :disabled="!writeAble" groupList placeholder="请选择细分职能" :lists='roleList' @indexSelect="roleSelsect" :values.sync='form.xizhi2'></CusSelecter>
                    </el-form-item>
                    <el-form-item label="城市" prop="city">
                        <el-input v-model.trim="form.city" placeholder="请输入城市" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="人员属性">
                        <el-input v-model.trim="form.ability" placeholder="请输入人员属性" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="绑定账号">
                        <el-input v-model.trim="form.wcw_id" disabled placeholder="" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="工号" prop='work_number'>
                        <el-input v-model.trim="form.work_number" placeholder="请输入工号" autocomplete="off"></el-input>
                    </el-form-item>
                </div>
            </div>
            <div v-show="showLeaveTime" style="position: relative;margin: -70px 0 0 10px; width:620px">
                <el-form-item label="离场时间" prop="leave_time">
                    <el-date-picker
                        disabled
                        v-model="form.leave_time"
                        type="date"
                        placeholder="选择日期"
                        :default-value="new Date()"
                        format="yyyy 年 MM 月 dd 日"
                        value-format="timestamp">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="离场原因" prop="mobilize">
                    <el-input v-model.trim="form.mobilize" placeholder="请输入离场原因" autocomplete="off"></el-input>
                </el-form-item>
            </div>
            </el-scrollbar>
        </el-form>
        <div v-if="type == 'audit'" slot="footer" class="dialog-footer">
            <el-button round size="medium" @click="auditForm(3)">驳回</el-button>
            <el-button round size="medium" type="primary" @click="auditForm(2)">通过</el-button>
        </div>
        <div v-else slot="footer" class="dialog-footer">
            <el-button round size="medium" @click="dialogFormVisible = false">{{writeAble ? "取消" : "关闭"}}</el-button>
            <el-button :disabled="isLoading" round size="medium" v-if="writeAble" type="primary" @click="submitForm('staffForm')">确定</el-button>
        </div>
    </el-dialog>
    </div>
</template>
<script>
import CusSelecter from '@components/cusUI/cusSelect'
import {Request} from '../service/http'
import moment from 'moment'
import _ from 'lodash'
export default {
    name:'staffDetailDialog',
    props:{
    },
    data(){
        let pageAuthConfig = sessionStorage.getItem("pageAuthConfig") ? JSON.parse(sessionStorage.getItem("pageAuthConfig")) : {};
        return {
            dialogFormVisible:false,
            type:'detail',   //detail 详情    audit审核
            id:'',
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
                company_name:'',
                resident_time:'',
                leave_time:'',
                wcw_id:'',
                mobilize:'',
                city:'',
                work_number:''
            },
            oldForm:{},
            sexArr:[{name:'男',id:1},{name:'女',id:2}],
            roleList:[
            ],
            zhijiArr:[
            ],
            isLoading:false,
            writeAble:true,

            rules: {
                sex:{required:true,message:'请选择性别', trigger: 'blur' },
                zhiji:{required:true,message:'请选择职级', trigger: 'blur' },
                zhuzhi:{required:true,message:'请选择主职', trigger: 'blur' },
                province:{required:true,message:'请输入省份', trigger: 'blur' },
                city:{required:true,message:'请输入城市', trigger: 'blur' },
                office:{required:true,message:'请输入职位', trigger: 'blur' },
            },
            rulesLeave: {
                sex:{required:true,message:'请选择性别', trigger: 'blur' },
                zhiji:{required:true,message:'请选择职级', trigger: 'blur' },
                zhuzhi:{required:true,message:'请选择主职', trigger: 'blur' },
                province:{required:true,message:'请输入省份', trigger: 'blur' },
                city:{required:true,message:'请输入城市', trigger: 'blur' },
                office:{required:true,message:'请输入职位', trigger: 'blur' },
                leave_time:{required:true,message:'请选择立场时间', trigger: 'blur' },
                mobilize:{required:true,message:'请输入立场原因', trigger: 'blur' },
            },
        }
    },
    computed: {
        showLeaveTime(){
            return this.form.leave_time
        },
    },
    components:{
        CusSelecter
    },
    methods: {
        open({id,writeAble=true,type='detail'}){
            this.type = type;
            this.writeAble = writeAble;    //是否可以操作  甲方只能看，不能摸
            this.isLoading =true;
            this.dialogFormVisible=true;
            this.id = id;
            Promise.all([Request.getRankList(),Request.getPositionList(),Request.humanDetail({
                id:id
            })])
            .then(res=>{
                this.isLoading =false;
                if(res[0].err_code === 0 && res[1].err_code === 0 && res[2].err_code === 0){
                    this.zhijiArr = res[0].data;
                    let temp = _.cloneDeep(res[1].data);
                    temp.forEach((item)=>{
                        item.new_select = false
                    });
                    this.roleList = temp;
                    const data3 =res[2].data;
                    this.form.name = data3.user_name ||  data3.name;
                    this.form.zhiji = data3.rank_id;
                    this.form.sex = data3.sex;
                    this.form.mobile = data3.mobile;
                    this.form.zhuzhi = data3.position_v1;
                    this.form.work_number = data3.work_number;
                    if(data3.position_v2){ this.form.fuzhi = data3.position_v2 }
                    if(data3.position_v3){ this.form.xizhi1 = data3.position_v3 }
                    if(data3.position_v4){ this.form.xizhi2 = data3.position_v4 }
                    this.form.province = data3.province;
                    this.form.city = data3.city;
                    this.form.ability = data3.ability;
                    this.form.ah_account = data3.ah_account;
                    this.form.office = data3.office;
                    this.form.company_name = data3.company_name;
                    this.form.resident_time = moment(data3.resident_time);
                    if(data3.bind_code){this.form.wcw_id = data3.bind_code}
                    if(data3.leave_time && data3.leave_time !== 0){
                        this.form.leave_time = moment(data3.leave_time);
                        this.form.mobilize = data3.mobilize;
                        this.freedPeople=true,
                        this.isGoout=true;
                        this.form.wcw_id = ''
                    }
                    this.$nextTick(function(){
                        this.roleSelsect();
                        //存下来原始值
                        this.oldForm = _.cloneDeep(this.form)
                    })
                }else{
                    // this.$message.error('出错了，请刷新页面再试')
                }
            })
            .catch(errs=>{
                this.$message.error('出错了，请刷新页面再试');
                console.log('errs',errs);
                this.isLoading =false
            })
        },
        submitForm(formName){
            this.$refs[formName].validate((valid,obj)=>{
                if(valid){
                    let parama={
                        id:this.id
                    };
                    const newform = _.cloneDeep(this.form);
                    const oldform = _.cloneDeep(this.oldForm);
                    let form = this.$Tools.ObjDifference(newform,oldform);//仅仅上传被改变的数据
                    if(_.isEmpty(form)){
                        this.$message.error('您未更改任何选项!');
                        return
                    }
                    _.forOwn(form,function(val,key){
                        form[key] = newform[key]
                    });
                    if(form.fuzhi){parama.position_v2 =form.fuzhi}
                    if(form.xizhi1){parama.position_v3 =form.xizhi1}
                    if(form.xizhi2){parama.position_v4 =form.xizhi2}
                    if(form.ability){parama.ability =form.ability}
                    if(form.ah_account){parama.ah_account =form.ah_account}
                    //必传还得传
                    parama.sex =newform.sex;
                    parama.rank_id =newform.zhiji;
                    parama.position_v1 =newform.zhuzhi;
                    parama.province =newform.province;
                    parama.city =newform.city;
                    parama.office =newform.office;
                    parama.name =newform.name;
                    parama.mobile =newform.mobile;
                    if(form.work_number){parama.work_number =form.work_number}
                    
                    if(this.isFreePeople || this.isGoout){ parama.status=1 }
                    if(this.isGoout && form.leave_time){parama.leave_time =moment(form.leave_time).format('YYYY-MM-DD')}
                    if(this.isGoout && form.mobilize){parama.mobilize =form.mobilize}
                    this.isLoading =true;
                    Request.humanAdd(parama)
                    .then(res=>{
                        this.isLoading = false;
                        if(res.err_code === 0){
                            this.$message({
                            message: '操作成功!',
                            type: 'success'
                            });
                            this.$emit('reloadList');
                            this.dialogFormVisible=false
                        }
                    })
                    .catch(err=>{
                        this.isLoading =false;
                        console.log(err)
                    })
                }
            })
        },
        auditForm(audit){
            Request.auditHuman({
                id:this.id,
                audit
            })
            .then(res=>{
                if(res.err_code === 0){
                    this.$message({
                    message: '操作成功!',
                    type: 'success'
                    });
                    this.$emit('reloadList');
                    this.dialogFormVisible=false
                }
            })
            .catch(err=>{
                console.log(err)
            })
        },
        roleSelsect(index){
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
        },
    },
    mounted(){
    }
    
}
</script>
<style lang="less" scoped>
    .staff-detail-dialog-warp{
        /deep/.el-dialog{
            overflow: visible!important;
        }
        .dialog-has-footer{
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
        .checkbox-wrap{
            position:absolute;
            width: 220px;
            height: 40px;
            right: 20px;
            display: flex;
            flex-direction: row;
            align-items:center;
        }
    }
</style>
