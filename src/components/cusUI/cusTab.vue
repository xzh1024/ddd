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
        name: 'cus_tab',
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
        display: flex;
        flex-direction: row;
        align-items: center;
        .tab-item {
            position: relative;
            height: 40px;
            width: 120px;
            text-align: center;
            line-height: 40px;
            font-size: 14px;
            border-top: 1px solid @borderColor;
            border-bottom: 1px solid @borderColor;
            &:hover {
                cursor: pointer;
                background: @backGroundHover;
            }
            &.item-active {
                color: @baseColor;
                background-color: @backGroundLighter;
            }
            &:first-child {
                border-left: 1px solid @borderColor;
                border-radius: @radius 0 0 @radius;
            }
            &:last-child {
                border-right: 1px solid @borderColor;
                border-radius: 0 @radius @radius 0;
            }
        }
    }
</style>
