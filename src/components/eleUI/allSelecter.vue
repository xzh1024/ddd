/*全选复选框组件*/
<template>
        <el-popover
            placement="right"
            :width="componentWidth+'px'"
            trigger="click">
            <div :style="{'width':componentWidth-25 + 'px'}" class="fold">
                <div @click="allClick" :class="`${isAllSelelcted ? 'active' : '' } allitem`">
                    <span>{{allSelectTitle}}</span>
                    <i class="el-icon-magic-stick"></i>
                </div>
                <div @click="itemClick(index)" :class="`${isActivity(index) ? 'active' : '' } item`" v-for="(item,index) in list" :key="index">{{item.name}}</div>
            </div>
            <div slot="reference" class="selected-bc">
                <P v-if="!selectListC.length">{{placeholder}}</P>
                <el-tag v-else size="small" v-for="(item,index) in tags" :key="index">{{item}}</el-tag>                   
            </div>
        </el-popover>
</template>
<script>
import { mapMutations } from 'vuex';
import _ from 'lodash'
    export default {
        name: 'allSelect',
        props: {
            list:{
                type: Array,
                required: true
            },
            selectList:{
                type: Array,
                required: true
            },
            allSelectTitle:{
                type: String,
                default: '全部选择'
            },
            componentWidth:{
                type: Number,
                default: 215
            },
            placeholder:{
                type: String,
                default: "请选择"
            }
        },
        data() {
            return {
                listC:this.list,
                selectListC:this.selectList
            }
        },
        computed:{
            isAllSelelcted(){
                if(this.selectListC.length == this.listC.length){
                    return true
                }else{
                    return false
                }
            },
            tags(){
                let arr = []
                this.selectListC.forEach((element) => {
                    this.listC.findIndex((ele)=>{
                        if(ele.id == element){
                            arr.push(ele.name)
                        }
                    })
                });
                return arr
            }
        },
        watch:{
            selectListC(){
                this.$emit('valueChange',this.selectListC)
            }
        },
        methods: {
            isActivity(index){
                
                const cindex = this.selectListC.findIndex((item)=>{
                    return item == this.listC[index].id
                })
                return cindex > -1
            },
            getIndex(index){
                return this.selectListC.indexOf(this.listC[index].id)
            },
            itemClick(index){
                let temp = _.cloneDeep(this.selectListC)
                if(this.isActivity(index)){
                    temp.splice(this.getIndex(index),1)
                }else{
                    temp.splice(index,0,this.listC[index].id)
                }
                this.selectListC = temp
            },
            allClick(){
                if(this.isAllSelelcted){
                    this.selectListC = []
                }else{
                    let temp = _.cloneDeep(this.listC)
                    
                    this.selectListC = temp.map((item)=>{
                        return item.id
                    })
                }
            },
        },
        
    };
</script>
<style lang="less" scoped>
    .selected-bc {
        width: 215px;
        min-height: 40px;
        border: 1px solid @textLighter;
        display: flex;
        padding: 4px;
        flex-direction: row;
        flex-wrap: wrap;
        border-radius: @radius;
        :focus{
            border: 1px solid @baseColor;
        }
        .el-tag{
            margin:4px;
        }
        >p{
            color:@placeholder;
            position:absolute;
            top:0px;
            left:15px;
        }
    }
    .fold{
        .item{
            height: 34px;
            width: 100%;
            font-size: 14px;
            line-height:34px;
            user-select: none;
            &:hover{
                background-color: @backGround;
            }
        }
        .allitem{
            .item();
            font-weight: bold;
            border-bottom: 1px solid @textLighter;
            i{
                margin-left: 5px;
            }
            }
        .active{
            color:@baseColor;
        }
    }
</style>
