<template>
    <div class="router-page-item">
        <div class="inject-page">
            <router-view/>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'routerViewContainer'
    };
</script>

<style lang="less" scoped>
    .router-page-item {
        position: relative;
        margin: 0;
        background: @backGround;
        width: 100%;
        height: 100%;
        .inject-page {
            position: relative;
            width: 100%;
            height: 100%;
        }
    }
</style>
