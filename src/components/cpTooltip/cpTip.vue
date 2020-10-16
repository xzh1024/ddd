<template>
    <el-tooltip popper-class="cp-tooltip" placement="right" v-if="disabled" content="待编辑成员">
        <i class="el-icon-info"></i>
    </el-tooltip>
</template>

<script>
    export default {
        name: "cp-tip",
        props: {
            disabled: Boolean
        }
    };
</script>

<style lang="less">
    .el-tooltip.el-icon-info {
        float: right;
        margin: 10px 0 0 10px;
        color: @textLighter;
        &:hover {
             cursor: pointer;
             color: @textLight;
         }
    }
    
    .el-tooltip__popper.cp-tooltip {
        padding: 12px;
    }
</style>
