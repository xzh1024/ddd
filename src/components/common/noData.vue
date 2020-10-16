<template>
    <div class="no-data-tips">
        <div class="empty-item">
            <div class="icon-types">
                <img src="@assets/images/data-icon.png" v-if="type === 'data'"/>
                <img src="@assets/images/member-icon.png" v-if="type === 'member'"/>
                <img src="@assets/images/message-icon.png" v-if="type === 'msg'"/>
                <img src="@assets/images/permission-icon.png" v-if="type === 'auth'"/>
                <img src="@assets/images/unbound-icon.png" v-if="type === 'bound'"/>
            </div>
            <span>{{text}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "noData",
        props: {
            text: {
                type: String,
                default: '暂无数据'
            },
            type: {
                type: String,
                default: 'data'
            }
        }
    };
</script>

<style lang="less" scoped>
    .no-data-tips {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .empty-item {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            width: 220px;
            height: 265px;
            padding: 10px;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: space-between;
            .icon-types {
                width: 200px;
                height: 200px;
                > img {
                    max-width: 100%;
                }
            }
            > span {
                font-size: 14px;
                color: @textLight;
            }
        }
    }
</style>
