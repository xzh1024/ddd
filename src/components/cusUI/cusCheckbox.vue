<template>
    <div class="checkbox-warp" @click="boxclick">
        <div :class="disabled ? 'disable-box' : isSelect ? 'csbox-active' : 'csbox'">
            <i v-show="isSelect" class="el-icon-check"></i>
        </div>
        <div :class="isSelect ? 'cslable-active' : 'cslable'">{{lable}}</div>
    </div>
</template>
<script>
    export default {
        name: 'cus_selectbox',
        props: {
            checked:{
                type:Boolean,
                default:false
            },
            lable:{
                type:String,
                default:'复选框'
            },
            disabled:{
                type:Boolean,
                default:false
            },
        },
        data() {
            return {
                isSelect: this.checked
            };
        },
        watch: {
            checked(value) {
                this.isSelect = value;
            }
        },
        methods:{
            boxclick(){
                if(this.disabled){
                    return
                }
                this.$emit('boxClick')
            }
        }
    };
</script>
<style lang="less" scoped>
    .checkbox-warp{
        display: flex;
        flex-direction: row;
        align-items: center;
        user-select: none;
        .csbox{
            width: 14px;
            height: 14px;
            border:@border;
            margin-right: 6px;
            line-height: 14px;
            text-align: center;
        }
        .disable-box{
            .csbox();
            background: @baseDisabled;
        }
        .csbox-active{
            .csbox();
            background-color:@baseColor;
            border:0;
            color:#fff;
        }
        .cslable{
        }
        .cslable-active{
        }
    }
</style>
