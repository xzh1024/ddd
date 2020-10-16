<template>
    <div class="cus_warp" @click="boxclick">
        <div :class="checked ? 'cus_radio active' : 'cus_radio'">
            <div v-if="checked"></div>
        </div>
        <div class="lable_warp">待修改</div>
    </div>
</template>
<script>
    export default {
        name: 'cus_radio_bar',
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
                this.$emit('boxclick')
            }
        }
    };
</script>
<style lang="less" scoped>
    .cus_warp{
        display: flex;
        flex-direction: row;
        align-items: center;
        user-select: none;
        &:hover{
            cursor: pointer;
        }
        .cus_radio{
            width: 14px;
            height: 14px;
            border-radius: 7px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid @borderColorDeep;
            >div{
                width: 4px;
                height: 4px;
                border-radius: 2px;
                background-color: #fff;
            }
        }
        .active{
            border: 0;
            background-color: @baseColor;
        }
        .lable_warp{
            margin-left: 10px;
        }
    }
</style>
