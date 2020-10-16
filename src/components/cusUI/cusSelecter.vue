<template>
    <div class="select-wrap" ref="self_div" tabindex="0" v-clickoutside.capture="clickout" @blur="cblur" @focus="cfocus">
        <div :class="disabled ? 'select-box disable-class' : isvalidError ? 'select-box error-box' : 'select-box'" :style="{minHeight:selectHeight+'px',lineHeight:selectHeight+'px'}"   @click="inputClick" >
            <div class="multiple-box" v-if="multiple">
                <template v-if="tags.length">
                    <div class="multiple-item" :style="{height:selectHeight-4+'px',lineHeight:selectHeight-4+'px'}" v-for="(item,index) in tags" :key='index'>{{item}}</div>
                </template>
                <div v-else class="placeholder-div">{{placeholder}}</div>
            </div>
            <div class="single-box" v-else>
                <p v-if="singleName">{{singleName}}</p>
                <div v-else class="placeholder-div">{{placeholder}}</div>
            </div>
            <div class='sanjiao'>
                <i :style="showClear ? '' : 'display:inline'" class="el-icon-arrow-down" :class="[{'downSty':!activeFlag},{'upSty':activeFlag}]"></i>
                <i v-if="showClear" @click.stop="clearClick" class="el-icon-circle-close" :class="[{'downSty':!activeFlag},{'upSty':activeFlag}]"></i>
            </div>
        </div>
        <transition name="slide" :style="disabled ? {'display':'none','height':'38px'} : {}">
            <div :style="fold_box_style" class="fold-box" v-show="activeFlag">
                <div class="input-wrap" v-if="Ctype == 'cpManage' || Ctype == 'conpany'">
                    <el-input
                        class="search-input"
                        placeholder="模糊搜索"
                        :clearable='true'
                        @input="searchInputChange"
                        @clear="searchInputChange"
                        size="small"
                        suffix-icon="el-icon-search"
                        v-model="searchValue">
                    </el-input>
                </div>
                
                <div v-if="showAllOption" :class="`${isAllSelelcted ? 'active' : '' } all-option`"  @click="allClick">
                    <span>{{isAllSelelcted ? '全部取消' : '全部选择'}}</span>
                    <span>{{isAllSelelcted ? '已选择全部' : ''}}</span>
                </div>
                <div class="option-wrap" :style="`${Ctype ? {'height':'180px'} : {} }`">
                    <template v-if="changeList ? screenedList.length : list.length">
                        <div v-for="(item,index) in (changeList ? screenedList : list)" :title="item.name" :key="index" :class="`${isActivity(index) ? 'active' : '' } option`" @click="itemClick(item.id)" >
                            <img v-if="showAvatar" :src="item.avatar" alt="">
                            <p>{{item.name}}</p>
                        </div>
                    </template>
                        <div v-else class="nolist">没有数据了</div>
                    <loading v-if="isLoading"></loading>
                </div>
                <div class="pagination-wrap" v-if="Ctype == 'conpany'">
                    <el-pagination
                        layout="prev, pager, next"
                        small
                        :hide-on-single-page="true"
                        :current-page="page"
                        :page-size="pageSize"
                        :total="total"
                        @current-change="handleCurrentChange">
                    </el-pagination>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
/*
    自定义下拉选择框
    参数说明
    multiple:               是否多选?
    disabled :              是否禁用
    hasAllSelectOption:     是否显示<全部选择>选项
    Type:                  【"company"】中的一种，此时显示搜索框与分页按钮,
    list:                   选项列表、除非是传入Type的情况下必传。{id:xx,name:xx}
    values:                 选中值，必传，以:.sync方式双向绑定，选中的内容为list的id (multiple时为数组)
    defaultName：           Type情况下显示出的默认选项
    changeList:             当选择某项后，是否在list中注入new_select属性，使用情形参照人力录入
    cancelAble              单选时能否取消已选中的选项
    clearAble               是否显示 X,清除所有项
    showAvatar              是否展示头像
    fold_box_style          折叠块的样式
    size                    [medium,normal] 默认normal
    暴漏事件
    cusBlur                 失去焦点
    cusFocus                获得焦点
    itemClick               点击选项
*/
import Clickoutside from 'element-ui/src/utils/clickoutside';
import {Debounce} from '@libs/js/utils';
import _ from 'lodash'
import {TaskEntryRequest} from "../../views/taskEntry/service/http";
export default {
    name:'cusSelecter',
    props:{
        multiple:{
            type:Boolean,
            default:false
        },
        disabled:{
            type:Boolean,
            default:false
        },
        cancelAble:{
            type:Boolean,
            default:false
        },
        clearAble:{
            type:Boolean,
            default:false
        },
        lists:{
            type:Array,
            default:function(){return []}
        },
        values:{
            type:[Array,String,Number],
            default:function(){return ''}
        },
        Ctype:{
            type:String,
        },
        placeholder:{
            type: String,
            default: "请选择"
        },
        size:{
            type: String,
            default: "normal"
        },
        hasAllSelectOption:{
            type:Boolean,
            default:true
        },
        defaultName:{
            type:[String,Number],
            default:''
        },
        changeList:{
            type:Boolean,
            default:false
        },
        proId:{
            type:[String,Number],
        },
        showAvatar:{
            type:Boolean,
            default:false
        },
        fold_box_style:{
            type: [String,Object],
            default:function(){return ''}
        },
        project_id:{
            type:[Number,String],
            default:0
        }
    },
    data() {
        return {
            activeFlag:false,
            value:this.values,
            searchValue:'',
            list:this.lists,
            page:1,
            pageSize:10,
            isLoading:false,
            total:0,
            isvalidError:false,
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
            this.list = val
        },
        project_id(){
            this.initWebList()
        }
    },
    computed:{
        screenedList(){
            if(this.changeList){
                //筛选list的值
                let tempList = [];
                this.list.forEach((item)=>{
                    if(item.new_select){                                 //已经被选中了(其他select和自己) 被其他选中需要被筛掉，被自己选中保留
                        if(item.id == this.value){
                            tempList.push(item)
                        }
                    }else{
                        tempList.push(item)
                    }
                });
                return tempList
            }else{
                return this.list
            }
        },
        isAllSelelcted(){
            if(!this.multiple){
                return false
            }else{
                let v1 = _.cloneDeep(this.value);
                let temp = _.cloneDeep(this.list);
                if(temp.length){
                    let v2 = [];
                    temp.forEach((item)=>{
                        v2.push(item.id)
                    });
                    return _.isEqual(v1,v2)
                }else{
                    return false
                }
            }
        },
        //多选时文本框显示内容
        tags(){
            if(!this.multiple){return []}
            let arr = [];
            this.value.forEach((element) => {
                this.list.findIndex((ele)=>{
                    if(ele.id == element){
                        arr.push(ele.name)
                    }
                })
            });
            return arr
        },
        //是否显示"全部选择"
        showAllOption(){
            return this.hasAllSelectOption && this.list.length && this.multiple
        },
        //单选时文本框显示内容
        singleName(){
            let index = this.list.findIndex((item,index)=>{
                return item.id == this.value
            });
            if(index > -1){
                return this.list[index].name
            }else{
                return this.defaultName
            }
        },
        //显示 清除所有项的XX
        showClear(){
            if(this.clearAble){
                if(_.isArray(this.value)){
                    if(this.value.length){
                        return true
                    }else{
                        return false
                    }
                }else{
                    if(this.value === ''){
                        return false
                    }else{
                        return true
                    }
                }
            }else{
                return false
            }
        },
        selectHeight(){
            if(this.size == 'medium'){
                return 34
            }else{
                return 38
            }
        }
    },
    directives: { Clickoutside },
    methods:{
        clearClick(){
            if(this.multiple){
                this.value = []
            }else{
                this.value = ''
            }
            this.activeFlag = false;
            this.$refs.self_div.blur();
            this.$emit('clearClick')
        },
        validError(val){
            this.isvalidError=val
        },
        inputClick(){
            if(this.disabled) return;
            if(this.Ctype){
                if(!this.list.length){
                    this.initWebList()
                }
                this.activeFlag = !this.activeFlag
            }else{
                this.activeFlag = !this.activeFlag
            }
        },
        handleCurrentChange(page){
            this.page = page;
            console.log('page',page);
            this.initWebList()
        },
        initWebList(data={},repage = false){
            this.isLoading = true;
            if(this.Ctype === 'cpManage'){
                this.getCpManageData();
            }else if(this.Ctype === 'company_project'){
                this.$axios.post('/api/get-project-cp-list',{
                    page:data.page || this.page,
                    page_size:999,
                    search:this.searchValue,
                    project_id:this.project_id
                })
                .then(
                    res=>{
                        if(res.err_code === 0){
                            this.list = res.data;
                            this.total = res.page.count;
                            if(repage){
                                this.page =1
                            }
                        }
                        this.isLoading = false
                    }
                )
                .catch(err=>{
                    console.log('err',err);
                    this.isLoading = false
                })
            }else{
                this.$axios.post('/api/get-company-list',{
                    page:data.page || this.page,
                    page_size:this.pageSize,
                    search:this.searchValue
                })
                .then(
                    res=>{
                        if(res.err_code === 0){
                            this.list = res.data;
                            this.total = res.page.count;
                            if(repage){
                                this.page =1
                            }
                        }
                        this.isLoading = false
                    }
                )
                .catch(err=>{
                    console.log('err',err);
                    this.isLoading = false
                })
            }
        },
        // cpManage
        async getCpManageData() {
            let params = {
                project_id:this.proId,
                page: 1,
                page_size: 999,
                search:this.searchValue
            };
            let data = await TaskEntryRequest.getTaskCpManage(params);
            if (data.err_code === 0) {
                this.isLoading = false;
                this.total = data.page.count;
                this.list = data.data;
                this.list.forEach((item,index)=>{
                    item.name = item.name;
                })
            }
        },
        changeActive(){
            this.activeFlag = !this.activeFlag
        },
        clickout(){
            if(this.disabled || !this.activeFlag){return}
            this.activeFlag = false
        },
        isActivity(index){
            if(this.multiple){
                const cindex = this.value.findIndex((item)=>{
                    return item == this.list[index].id
                });
                return cindex > -1
            }else{
                if(this.changeList){
                    return this.screenedList[index].id == this.value
                }else{
                    return this.list[index].id == this.value
                }
                
            }
        },
        itemClick(id){
            if(this.multiple){
                let temp = _.cloneDeep(this.value);
                const index = this.value.findIndex((item)=>{
                    return item == id
                });
                if(index > -1){
                    temp.splice(index,1)
                }else{
                    temp.push(id)
                }
                this.value = temp
            }else{
                if(this.cancelAble){              //可以取消选中项
                    if(this.value){
                        this.value = ''
                    }else{
                        this.value = id
                    }
                }else{
                    this.value = id
                }
                this.activeFlag = false;
                if(this.changeList){
                    this.$emit('indexSelect')
                }
            }
            this.$emit('itemClick')
        },
        allClick(){
            if(this.isAllSelelcted){
                this.value = []
            }else{
                let temp = _.cloneDeep(this.list);
                this.value = temp.map((item)=>{
                    return item.id
                })
            }
        },
        searchInputChange:_.throttle(function(text){
            this.searchValue = text;
            this.initWebList({page:1},true)
        },500),
        cblur(){
            this.$emit("cusBlur")
        },
        cfocus(){
            // this.validError(false)
            this.$emit("cusFocus")
        }
    }
}
</script>
<style lang="less" scoped>
.select-wrap{
    position: relative;
    width: 100%;
    resize: none;
    outline: none;
    &:focus{
        .select-box{
            border: 1px solid @baseColor;
        }
    }
    .select-box{
        position: relative;
        width: 100%;
        border-radius: 4px;
        border: @border;
        background-color: #fff;
        &:hover{
            .sanjiao{
                .el-icon-arrow-down{
                    display: none;
                }
                .el-icon-circle-close{
                    display: inline;
                }
            }
        }
    }
    .error-box{
        border: 1px solid @error;
    }
    .multiple-box{
        width: 100%;
        max-height: 76px;
        overflow: auto;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 1px;
        padding-right: 20px;
        .multiple-item{
            font-size: 14px;
            padding: 0 5px;
            margin: 1px 1px;
            max-width: 100%;
            overflow: hidden;
            color: @baseColor;
            border-radius: @radius;
            background-color: #e6f7ff;
            border-color: #cef;
        }
    }
    .single-box{
        width: 100%;
        height: 100%;
        overflow: hidden;
            p{
            margin-left: 14px;
            overflow: hidden;
            white-space:nowrap;
            text-overflow: ellipsis;
        }
    }
    .sanjiao{
        position: absolute;
        top:0;
        right: 0;
        height: 100%;
        width: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        .el-icon-arrow-down{
            display: inline;
            color: rgb(215, 215, 215);
            font-size: 14px;
            margin-right: 9px;
            transition: transform .3s ease-in-out;
            &.downSty {
                transform: rotate(0deg);
            }
            &.upSty {
                transform: rotate(180deg);
            }
            
        }
        .el-icon-circle-close{
            display: none;
            color: rgb(215, 215, 215);
            font-size: 14px;
            margin-right: 9px;
        }
        
    }
    .placeholder-div{
        padding-left: 14px;
        color:@placeholder;
    }
    .fold-box{
        position:absolute;
        background: #fff;
        z-index: 3000;
        width: 100%;
        border: @borderColorLight;
        box-shadow: @boxShadow;
        border-radius: @radius;
        .input-wrap{
            position: relative;
            width: 100%;
            border-bottom: @border;
            padding: 5px 0;
            >.search-input{
                width: 90%;
                margin-left: 5%;
                &>.el-input__inner{
                    border: @border!important;
                }
            }
        }
        .option-wrap{
            width: 100%;
            color: @text;
            font-size: 14px;
            line-height:34px;
            user-select: none;
            max-height: 180px;
            overflow-y: scroll;
            overflow-x: hidden;
            .nolist{
                padding:0 15px;
                color:@textLighter
            }
            .option{
            padding:0 15px;
            height: 34px;
            width: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            align-items: center;
            >p{
                width: 100%;
                overflow: hidden;
                white-space:nowrap;
                text-overflow: ellipsis;
            }
            >img{
                height: 30px;
                width: 30px;
                border-radius: 15px;
                margin-right: 10px;
            }
                &:hover{
                    background-color: @backGround;
                }
            }
        }
        .all-option{
                user-select: none;
                padding:0 15px;
                border-bottom: 1px solid @textLighter;
                height: 34px;
                line-height: 34px;
                >span:first-child{
                    border:1px solid @textLighter;
                    padding: 3px;
                }
                >span:nth-child(2){
                    font-size: 10px;
                    margin-left: 10px;
                }
                &:hover{
                    background-color: @backGround;
                }
            }
        .active{
            color:@baseColor;
        }
        
        .pagination-wrap{
            margin-top: 12px;
            width: 100%;
            display: flex;
            justify-content: center;
            >div{
                border-top:@border;
                position: relative;
                line-height: normal;
            }
        }
        
    }
    .disable-class{
        background-color: #f5f5f5;
        color:#cecece;
        cursor:not-allowed;
    }
    .slide-enter-active, .slide-leave-active {
        transition: all .4s;
    }
    .slide-enter {
        opacity: 0;
        height: 0px;
    }
    .slide-enter-to {
        opacity: 1;
        height: auto;
    }
    .slide-leave {
        opacity: 1;
        height: auto;
    }
    .slide-leave-to {
        opacity: 0;
        height: 0px;
    }
}
</style>
