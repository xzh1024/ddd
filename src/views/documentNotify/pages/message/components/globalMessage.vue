<template>
    <div class="all-message-content">
        <loading v-if="isLoading"></loading>
        <el-scrollbar ref="msgList" class="message-list" v-if="!isLoading && allMessageListData.length > 0">
            <ul>
                <li v-for="(item,index) in allMessageListData" :key="index">
                    <div v-if="item.status === 1" class="message-title-unread">
                        <el-badge is-dot class="item">
                            <i class="el-icon-picture-outline"></i>
                        </el-badge>
                        <span @click="checkMessageDetails(item,'check')">{{item.title}}</span>
                    </div>
                    <div v-if="item.status === 2" class="message-title">
                        <i class="el-icon-picture-outline"></i>
                        <span @click="checkMessageDetails(item,'check')">{{item.title}}</span>
                    </div>
                    <div class="message-time">{{item.craete_date}}</div>
                    <div class="message-action">
                        <em @click="checkMessageDetails(item,'check')">查看</em>
                        <em>|</em>
                        <el-dropdown size="medium" trigger="click">
                            <em>更多</em>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item @click.native="setMessageReadStatus(item,'setRead')">设为已读
                                </el-dropdown-item>
                                <el-dropdown-item @click.native="delMessage(item)">删除</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </li>
            </ul>
        </el-scrollbar>
        <pagination :params="pageParams" @handleCurrentChange="changePage"></pagination>
        <no-data text="暂无消息" type='msg' v-if="!isLoading && allMessageListData.length <= 0"></no-data>
        <div class="msg-dialog" v-if="dialogMessageDetails">
            <el-dialog width="750px" :title="messageItemDetails && messageItemDetails.title"
                       :visible.sync="dialogMessageDetails">
                <div class="dialog-details dialog-no-footer">
                    <el-scrollbar class="paragraph-content">
                        <p v-html="messageItemDetails.content"></p>
                    </el-scrollbar>
                </div>
            </el-dialog>
        </div>
    </div>
</template>
<script>
    
    import {DocumentNotifyRequest} from "../../../service/http";
    
    export default {
        name: "global-message",
        components: {},
        props: {
            currentMenuItem: {
                type: Number,
                default: 1
            },
            messageReadState: {
                type: [String, Number],
                default: 0
            },
        },
        data() {
            return {
                isLoading: true,
                allMessageListData: [],
                dialogMessageDetails: false,
                messageItemDetails: {},
                pageParams: {
                    page: 1,
                    pageSize: 15,
                    total: 0
                }
            };
        },
        mounted() {
            this.initFun();
        },
        watch: {
            currentMenuItem: {
                deep: true,
                handler(newVal, oldVal) {
                    this.currentMenuItem = newVal;
                    this.pageParams.page = 1;
                    this.initFun();
                }
            },
            messageReadState: {
                deep: true,
                handler(newVal, oldVal) {
                    this.messageReadState = newVal;
                    this.pageParams.page = 1;
                    this.initFun();
                }
            }
        },
        methods: {
            initFun() {
                this.getMessageListData();
            },
            async getMessageListData() {
                // msg_type 1消息 2公告
                let params = {
                    msg_type: this.currentMenuItem,
                    status: this.messageReadState, // 0全部 1未读
                    page: this.pageParams.page,
                    page_size: this.pageParams.pageSize
                };
                this.isLoading = true;
                let data = await DocumentNotifyRequest.getMessageLists(params);
                if (data.err_code === 0) {
                    this.isLoading = false;
                    if (data.data.data && data.data.data.length > 0) {
                        data.data.data.forEach(element => {
                            element.craete_date = element.craete_date ? element.craete_date.substring(0, 10) : '';
                        });
                    }
                    this.allMessageListData = data.data.data || [];
                    this.$emit('unreadNum', data.data && data.data.unread);
                    this.pageParams.total = data.page && data.page.count;
                }
            },
            changePage(page) {
                this.pageParams.page = page;
                this.initFun();
            },
            checkMessageDetails(item, type) {
                this.getMessageItemsDetails(item.id, type);
            },
            async getMessageItemsDetails(itemId, type) {
                let params = {
                    id: itemId
                };
                let data = await DocumentNotifyRequest.getMessageDetails(params);
                if (data.err_code === 0) {
                    this.messageItemDetails = data.data || {};
                    if (type === 'check') {
                        this.dialogMessageDetails = true;
                    }
                    this.initFun();
                }
            },
            setMessageReadStatus(item, type) {
                this.getMessageItemsDetails(item.id, type);
            },
            delMessage(item) {
                const _this = this;
                this.$Tools.deleteConfirm(this, {text: '此操作将删除该消息，是否继续？', title: '提示'}, async () => {
                    const data = await DocumentNotifyRequest.delMessageListsItem({id: item.id});
                    _this.initFun();
                    return data;
                });
            }
        }
    };
</script>
<style lang="less" scoped>
    .all-message-content {
        // width: 100%;
        position: relative;
        height: calc(~'100% - 56px');
        .message-list {
            position: relative;
            height: 100%;
            ul {
                li {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    border-bottom: 1px solid #3B3F41;
                    .message-title-unread,
                    .message-title,
                    .message-time,
                    .message-action {
                        height: 56px;
                        line-height: 56px;
                        padding: 0 20px;
                        .el-icon-picture-outline {
                            font-size: 40px;
                            color: @text;
                        }
                    }
                    .message-title {
                        display: flex;
                        align-items: center;
                    }
                    .message-title, .message-title-unread {
                        width: 50%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        span {
                            margin-left: 12px;
                            &:hover {
                                cursor: pointer;
                            }
                        }
                        .el-badge {
                            width: 42px;
                            height: 40px;
                            overflow: hidden;
                            /deep/ .is-fixed {
                                top: 4px;
                                right: 8px;
                            }
                        }
                    }
                    .message-time {
                        width: 30%;
                        color: #989898;
                        
                    }
                    .message-action {
                        width: 20%;
                        em {
                            font-size: 12px;
                            color: @baseColor;
                            font-style: normal;
                            cursor: pointer;
                            &:nth-child(2) {
                                margin: 0 8px;
                            }
                        }
                        .el-dropdown {
                            display: inline;
                        }
                    }
                }
            }
        }
        .msg-dialog {
            .el-dialog__wrapper {
                overflow: hidden;
            }
            /deep/ .el-dialog__header {
                .el-dialog__title {
                    max-width: 660px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            .dialog-details {
                position: relative;
                height: 620px;
                padding: 20px 0 20px 20px;
                .paragraph-content {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                p {
                    width: 100%;
                    text-align: justify;
                    padding: 0 20px 0 0;
                    img {
                        max-width: 100%;
                    }
                }
            }
        }
        /deep/ .pagination-wrap {
            position: absolute;
            right: 5px;
            bottom: -40px;
        }
    }
</style>
