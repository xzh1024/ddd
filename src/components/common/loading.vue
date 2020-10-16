<template>
	<div class="global-loading">
        <div class="loading-item">
            <i class="el-icon-loading"></i>
            <span v-if="showText">{{text || '加载中'}}</span>
        </div>
    </div>
</template>

<script>
	export default {
        name: "loading",
        props: {
            showText: {
                type: Boolean,
                default: true
            },
            text: String
        }
	};
</script>

<style lang="less" scoped>
    .global-loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        overflow: hidden;
        z-index: 999;
        .loading-item {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            width: 92px;
            height: 92px;
            padding: 10px;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;
            color: @textLight;
            > i {
                font-size: 44px;
            }
            > span {
                font-size: 14px;
                margin-top: 12px;
            }
        }
    }
</style>
