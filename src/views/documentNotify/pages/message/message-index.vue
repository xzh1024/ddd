<template>
    <div class="message-list-box">
        <div class="message-menu">
            <select-bar :tabs='messageLeftMenu' :active="currentTab"
                        @handleItemClick='handleItemClick'></select-bar>
        </div>
        <div class="message-box">
            <div class="message-tab-box">
                <ul>
                    <li v-for="(item,index) in checkTabParams"
                        :key="index"
                        :class="{'active-sty': messageReadState === item.type}"
                        @click="checkMenuItem(item)">{{item.name}}
                        <sup class="dot"
                             v-if="Number(unreadMessageCount) > 0 && (item.badge)">{{unreadMessageCount}}</sup>
                    </li>
                </ul>
            </div>
            <div class="message-content-box">
                <template v-if="currentMenuItem===1">
                    <global-message :currentMenuItem="currentMenuItem" ref="messageList"
                                    @unreadNum='getUnreadNum' :messageReadState='messageReadState'></global-message>
                </template>
                <template v-if="currentMenuItem===2">
                    <global-message :currentMenuItem="currentMenuItem" ref="messageList"
                                    @unreadNum='getUnreadNum' :messageReadState='messageReadState'></global-message>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import selectBar from "./components/selectBar";
    import globalMessage from "./components/globalMessage";
    
    export default {
        name: "message-index",
        components: {globalMessage, selectBar},
        data() {
            return {
                messageLeftMenu: [
                    {type: 1, name: '消息提醒'},
                    {type: 2, name: '系统公告'}
                ],
                checkTabParams: [
                    {type: 0, name: '全部'},
                    {type: 1, name: '未读', badge: true}
                ],
                currentMenuItem: 1,
                unreadMessageCount: 0,
                messageReadState: 0,
                currentTab: -1
            };
        },
        mounted() {
            const params = this.$route.query;
            if (Number(params.type) === 1) {
                this.currentTab = 0;
                this.messageReadState = 1;
            } else if (Number(params.type) === 2) {
                this.currentTab = 1;
                this.messageReadState = 1;
            } else {
                this.currentTab = Number(sessionStorage.msgIndex) ? Number(sessionStorage.msgIndex) : 0;
            }
            this.currentMenuItem = this.currentTab + 1;
            if (params.notice_id && Number(params.type) === 1) {
                this.$nextTick(() => {
                    this.$refs.messageList && this.$refs.messageList.getMessageItemsDetails(params.notice_id, 'check');
                });
            }
        },
        methods: {
            checkMenuItem(currentItem) {
                this.messageReadState = currentItem.type;
            },
            handleItemClick(item) {
                this.currentMenuItem = item.type;
                sessionStorage.msgIndex = Number(item.type) - 1;
                this.currentTab = Number(item.type) - 1;
            },
            getUnreadNum(data) {
                this.unreadMessageCount = data;
            }
        },
        destroyed() {
            sessionStorage.removeItem('msgIndex');
        }
    };
</script>

<style lang="less" scoped>
    .message-list-box {
        height: 100%;
        .message-box {
            display: flex;
            width: 100%;
            height: calc(~'100% - 60px');
            .message-tab-box {
                width: 240px;
                line-height: 56px;
                border-right: 1px solid #3B3F41;
                
                li {
                    padding: 0 30px;
                    position: relative;
                    border-left: 3px solid transparent;
                    cursor: pointer;
                    &:hover {
                        background: @backGroundHover;
                    }
                    &.active-sty {
                        color: @white;
                        border-left-color: @baseColor;
                        background: #373F43;
                    }
                    .dot {
                        display: inline-block;
                        padding: 0 6px;
                        line-height: 18px;
                        background: @error;
                        color: @white;
                        text-align: center;
                        border-radius: 10px;
                        transform: translateY(22%) translateX(22%);
                        z-index: 9;
                    }
                }
            }
            .message-content-box {
                width: calc(~'100% - 240px');
            }
        }
    }
</style>
