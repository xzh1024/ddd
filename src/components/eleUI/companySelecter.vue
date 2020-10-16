/*全选复选框组件*/
<template>
        <el-popover
            placement="right"
            :width="componentWidth+'px'"
            ref="pop"
            trigger="click">
            <div :style="{'width':componentWidth-25 + 'px'}" class="fold">
                <div class="fold-header">
                    <el-input
                        class="left-item"
                        placeholder="请输入公司名称进行查找"
                        :clearable='true'
                        @input="searchInputChange"
                        @clear="searchInputChange"
                        size="small"
                        suffix-icon="el-icon-search"
                        v-model="searchValue">
                    </el-input>
                </div>
                <div class="fold-body">
                    <div class="fold-cell" v-for="(item,index) in list" :key='index' @click="clickCell(item)">{{item}}</div>
                </div>    
                <div class="fold-bottom">
                    <el-pagination
                        layout="prev, pager, next"
                        :total="50">
                    </el-pagination>
                </div>
            </div>
            <div slot="reference" class="selected-bc">
                <P>{{selectCell}}</P>                   
            </div>
        </el-popover>
</template>
<script>
import { mapMutations } from 'vuex';
    export default {
        name: 'allSelect',
        props: {
            // list:{
            //     type: Array,
            //     required: true
            // },
            // selectList:{
            //     type: Array,
            //     required: true
            // },
            // allSelectTitle:{
            //     type: String,
            //     default: '全部选择'
            // },
            // componentWidth:{
            //     type: Number,
            //     default: 215
            // },
            // placeholder:{
            //     type: String,
            //     default: "请选择"
            // }
        },
        data() {
            return {
                searchValue:'',
                selectCell:'',
                list:['自由之翼','惊蝉','LOL'],
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
            searchInputChange(){

            },
            clickCell(item){
                this.selectCell=item
                this.$refs.pop.doClose()
            }
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
        .fold-header{
            border-bottom: @border;
            padding-bottom: 10px;
        }
        .fold-body{
            padding: 5px 0;
            .fold-cell{
                padding: 5px;
            }
        }
        .fold-bottom{
            margin-bottom: -10px;
        }
    }
</style>
