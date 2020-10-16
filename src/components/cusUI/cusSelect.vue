<template>
    <el-select
        v-model="value"
        ref="cs"
        class="cus_select"
        :disabled="disabled"
        :multiple="multiple"
        @change="valueChange"
        :filterable="filterable" 
        :size="size"
        :clearable="clearable"
        collapse-tags
        :popper-class = "popperClass"
        :placeholder="placeholder">
        <el-option
            v-if="needAllSelect && multiple"
            key="cus_all"
            :label="allLable"
            value="cus_all"
            >
        </el-option>
        <el-option
            v-if="needAllSelect && !multiple"
            key="cus_all"
            :label="allLable"
            :value="0"
            >
        </el-option>
        <el-option
            v-for="item in list"
            :disabled="item.disabled"
            :key="item.id"
            :label="item.name"
            :value="item.id">
                <div class="cus_option_item">
                    <div class="option_left">
                        <img v-if="showAvatar" :src="item.avatar" alt="">
                        <span :title="item.name">{{ item.name }}</span>
                    </div>
                    <div class="option_right">
                        <el-tooltip v-if="item.disabled" placement="right" content="待编辑成员">
                            <i class="el-icon-info"></i>
                        </el-tooltip>
                    </div>
                </div>
        </el-option>
    </el-select>
</template>
<script>
import _ from 'lodash'
export default {
    name:'cusSelect',
    props:{
        multiple:{
            type:Boolean,
            default:false
        },
        disabled:{
            type:Boolean,
            default:false
        },
        clearable:{                                          //单选时能否清除数据
            type:Boolean,
            default:true
        },
        size:{                                          
            type:String,
        },
        lists:{                                              //数组
            type:Array,
            default:function(){return []}
        },
        values:{                                             //选中的值
            type:[Array,String,Number],
            default:function(){return ''}
        },
        needAllSelect:{                                      //是否需要全选
            type:Boolean,
            default:false
        },
        url:{                                                //数组数据请求地址
            type:String,
        },
        urlWithPrama:{                                       //是否需要传参
            type:Boolean,
            default:false
        },
        params:{
            type:Object,
        },
        placeholder:{
            type:String,
            default:function(){return '请选择'}
        },
        allLable:{
            default:function(){return '全部'}
        },
        filterable:{                                          //是否可以搜索
            type:Boolean,
            default:false
        },
        showAvatar:{                               //时候显示头像
            type:Boolean,
            default:false
        },
        groupList:{                            //主职、细分智能专用
            type:Boolean,
            default:false
        },
        popperClass:{
            type:String,
            default:function(){return ''}
        }
    },
    data(){
        return{
            value:this.values,
            list:this.lists,
            isSelectAll:false,
            oldParam:{}
        }
    },
    watch:{
        value(){
            this.$emit('update:values',this.value)
        },
        values(val){
            
            this.value = val
        },
        lists(val){
            if(this.groupList){
                let temp = []
                val.forEach(ele=>{
                    if(!ele.new_select){
                        temp.push(ele)
                    }
                })
            }
            this.list = val
            if(this.needAllSelect){
                if(this.multiple){   //当为多选时，如果选中值已经等于待选列表。则自动勾上全选
                    if(_.isArray(this.value) && (this.value.length === val.length)){
                        this.$nextTick(function(){
                            this.value = _.concat('cus_all',this.allList)
                        })
                    }
                } 
            }
        },
        params(val){
            // console.log("params改变了",val,_.isEqual(this.oldParam,val))
            if(_.isEqual(_.cloneDeep(this.oldParam),val)){
                return
            }
            this.oldParam = val
            this.$nextTick(function(){
                if(this.$Tools.isEmpty(val)) return
                let okPrama = true
                for(let key in val){
                    if(this.$Tools.isEmpty(val[key])) okPrama =false
                }
                if(okPrama) this.initWebList()
            })
        }
    },
    computed:{
        allList(){
            let temp = []
            this.list.forEach((element) => {
                temp.push(element.id)
            });
            return temp
        }
    },
    methods:{
        initWebList(){
            this.$axios.post(this.url,{
                page:1,
                page_size:999,
                ...this.oldParam
            })
            .then(
                res=>{
                    if(res.err_code === 0){
                        this.list = res.data
                    }
                }
            )
            .catch(err=>{
                console.log('err',err)
            })
        },
        valueChange(vals){
            this.$emit('indexSelect')
            if(!this.needAllSelect) return            //没有 全选选项无需操作
            if(!vals.length){ return }   
            if(this.multiple){                     //全选多选
                if(vals[vals.length - 1] == 'cus_all'){  //最后点击的是全部选择
                    this.value = _.concat('cus_all',this.allList)
                    this.isSelectAll = true
                }else{
                    if(vals[0] == 'cus_all'){
                        let temp = _.cloneDeep(this.value)
                        temp.shift()
                        this.value = temp
                        this.isSelectAll = false
                    }else{
                        if(vals.length == this.list.length ){   //选中了所有值，自动选上全选
                            if(this.isSelectAll){
                                this.value = []
                                this.isSelectAll=false
                            }else{
                                this.value = _.concat('cus_all',this.allList)
                                this.isSelectAll = true
                            }
                        }
                    }
                }
            }else{                                   
                
            }
        },
        blur(){
            this.$refs.cs.blur()
        }
    },
    mounted(){
        if(this.url && !this.urlWithPrama){this.initWebList()}
    }
}
</script>
<style lang="less">
    .cus_option_item{
        display: flex;
        flex-direction: row;
        align-items: center;
        max-width: 250px;
        height: 100%;
        width: 100%;
        justify-content: space-between;
        &:hover{
            // background: @backGroundHover;
            color:@baseColor;
        }
        .option_left{
            height: 100%;
            width: 85%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            overflow: hidden;
            >img{
                width: 34px;
                height: 34px;
                border-radius: 17px;
                margin-right: 5px;
            }
            >span{
                flex: 1;
                display: block;
                overflow: hidden;
                white-space:nowrap;
                text-overflow: ellipsis;
            }
        }
        .option_right{
            line-height: 34px;
            width: 14px;
            height: 34px;
        }
        
    }
</style>