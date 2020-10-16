/*弹窗组件*/

<template>
<div v-if="dialogFormVisible">
    <el-dialog width='750px' title="批量设置用户权限组" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
        <div class="dialogbc">
            <div class="left">
                <h3>操作步骤</h3>
                <div class="step-div">
                    <div class="step-floor">
                        <div class="step-index">1</div>
                        <p class="step-lable">点击</p>
                        <el-button round size="medium" type="primary" style="margin-left:10px" plain  class="el-icon-upload el-icon--right">下载未分配成员模板</el-button>
                    </div>
                    <div class='step-line'></div>
                    <div class="step-floor">
                        <div class="step-index">2</div>
                        <p class="step-lable">编辑未分配成员模板</p>
                    </div>
                    <div class='step-line'></div>
                    <div class="step-floor">
                        <div class="step-index">3</div>
                        <p class="step-lable">上传未分配成员文件</p>
                    </div>
                </div>
            </div>
            <div class="right">
                <div>
                    <el-button round size="medium" type="primary" plain class="el-icon-upload el-icon--right">上传未分配成员文件</el-button>
                </div>
            </div>
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button round size="medium" @click="dialogFormVisible = false">取消</el-button>
            <el-button round size="medium" type="primary" @click="dialogFormVisible = false">确定</el-button>
        </div>
    </el-dialog>
</div>
</template>
<script>
export default {
    name:'batchStaffDialog',
    props:{
    },
    data(){
        return {
            dialogFormVisible:false,
        }
    },
    computed: {
    },
    methods: {
        open(){
            this.dialogFormVisible=true
        },
        workhandleChange(){}
    },
}
</script>
<style lang="less" scoped>
    .dialogbc{
        width: 100%;
        height: 250px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        color: @black;
        .left{
            background-color: @backGround;
            width: 45%;
            height: 100%;
             h3{
                margin: 20px;
            };
        }
        .right{
            background-color: @backGround;
            width:55%;
            margin-left: 20px;
            height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            >div{
                display: flex;
                justify-content: center;
                align-items: center;
                width: 70%;
                height: 50%;
                border: 1px dashed @baseColor;
                border-radius: @radius;
            }
        }
        
    }
    .step-div{
        margin: 20px;
        .step-floor{
            display: flex;
            flex-direction: 'row';
            align-items: center;
            .step-index{
                height: 30px;
                width: 30px;
                border-radius: 15px;
                line-height: 30px;
                text-align: center;
                font-size: 14px;
                background-color: @orange;
                margin-right: 10px;
            }
            .step-lable{
                font-weight: bold;
            }
        }
        .step-line{
            height: 20px;
            width: 1px;
            background-color: @backGround;
            margin:5px 14px;
        }
    }
</style>
