/*选项卡组件*/
<template>
    <div class="tab-bar">
        <div class="tab-item" v-for="(item, index) in tabs" :key="index" :class="{'item-active': index === activity}"
            @click="itemClicked(item, index)">
            <p>{{item.name}}</p>
            <sup class="dot" v-if="Number(count) > 0 && item.badge">{{count}}</sup>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'selectBar',
        props: {
            tabs: {
                type: Array,
                required: true
            },
            active: {
                type: Number,
                default: 0
            },
            count: {
                type: [Number, String],
                default: 0
            }
        },
        data() {
            return {
                activity: 0
            };
        },
        mounted() {
            this.activity = this.active;
        },
        methods: {
            itemClicked: function (item, index) {
                this.activity = index;
                this.$emit('handleItemClick', item);
            }
        },
        watch: {
            active(value) {
                this.activity = value;
            }
        }
    };
</script>
<style lang="less" scoped>
    .tab-bar {
        position: relative;
        width: 100%;
        height: 60px;
        display: flex;
        flex-direction: row;
        align-items: center;
        background-color: @backGroundLighter;
        border-bottom: 1px solid @borderColor;
        .tab-item {
            position: relative;
            height: 60px;
            width: 240px;
            text-align: center;
            line-height: 60px;
            font-size: 14px;
            border-right: 1px solid #3B3F41;
            &:hover {
                cursor: pointer;
            }
            &.item-active {
                border-bottom: 0;
                color: @baseColor;
                background-color: @backGround;
            }
            .dot{
                position: absolute;
                top: 28%;
                right: 42%;
                height: 18px;
                display: inline-block;
                padding: 0 6px;
                line-height: 18px;
                background: @error;
                color: @white;
                text-align: center;
                border-radius: 10px;
                transform: translateY(-50%) translateX(70%);
                z-index: 9;
            }
        }
    }
</style>
