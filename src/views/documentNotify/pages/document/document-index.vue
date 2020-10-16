<template>
    <div class="documentation-container">
        <loading v-if="isLoading"></loading>
        <div class="content-part" v-if="!isLoading && documentList.length > 0">
            <div class="list-header">
                <label class="document-name-th">文档名称</label>
                <label class="document-date-th">上传时间</label>
                <label class="document-operate-th">操作</label>
            </div>
            <div class="document-list">
                <div class="scroll-list" v-scroll>
                    <ul>
                        <li v-for="(item, index) in documentList" :key="index">
                            <div class="document-title">
                                <span>{{item.title}}</span>
                            </div>
                            <div class="document-time">{{item.create_date}}</div>
                            <div class="operate-group">
                                <a class="download-btn" @click="downloadDocument(item)" title="下载">
                                    <i class="el-icon-download"></i>
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <pagination :params="pageParams" @handleCurrentChange="changePage"></pagination>
        </div>
        <no-data text="文档列表为空" v-if="!isLoading && documentList.length <= 0"></no-data>
    </div>
</template>

<script>
    import {DocumentNotifyRequest} from "../../service/http";
    
    export default {
        name: "document-index",
        data() {
            return {
                isLoading: true,
                documentList: [],
                pageParams: {
                    page: 1,
                    pageSize: 20
                }
            };
        },
        mounted() {
            this.init();
        },
        methods: {
            async init() {
                const params = {
                    page: this.pageParams.page,
                    page_size: this.pageParams.pageSize
                };
                this.isLoading = true;
                const data = await DocumentNotifyRequest.getDocumentList(params);
                if (data.err_code === 0) {
                    this.isLoading = false;
                    this.documentList = data.data;
                    const pager = data.page || {};
                    this.pageParams.total = pager.count;
                }
            },
            changePage(currentPage) {
                this.pageParams.page = currentPage;
                this.init();
            },
            downloadDocument(item) {
                if (!item.file_url) {
                    this.$message.warning('文件路径不存在，请检查是否存在该文件！');
                    return;
                }
                this.$Tools.download(item.file_url);
            }
        }
    };
</script>

<style lang="less" scoped>
    .documentation-container {
        width: 100%;
        height: 100%;
        padding: 12px 0;
        -webkit-box-shadow: @boxShadow;
        -moz-box-shadow: @boxShadow;
        box-shadow: @boxShadow;
        .content-part {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 0;
            .list-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                height: 58px;
                border: 1px solid @borderColor;
                background: @backGroundLightExtra;
                > label {
                    height: 100%;
                    padding: 0 30px;
                    line-height: 58px;
                    color: @textLight;
                    border-right: 1px solid @borderColor;
                    &.document-name-th {
                        width: 55%;
                    }
                    &.document-date-th {
                        width: 35%;
                    }
                    &.document-operate-th {
                        width: 10%;
                    }
                }
            }
            .document-list {
                position: relative;
                width: 100%;
                height: calc(~'100% - 102px');
                overflow: hidden;
                .scroll-list {
                    position: relative;
                    height: 100%;
                }
                ul {
                    width: 100%;
                    li {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        height: 50px;
                        border-bottom: 1px solid @borderColor;
                        border-left: 1px solid @borderColor;
                        border-right: 1px solid @borderColor;
                        > div {
                            height: 100%;
                            padding: 0 30px;
                            line-height: 50px;
                            border-right: 1px solid @borderColor;
                        }
                        .document-title {
                            width: 55%;
                            overflow: hidden;
                            -ms-text-overflow: ellipsis;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .document-time {
                            width: 35%;
                            color: @textLight;
                        }
                        .operate-group {
                            width: 10%;
                        }
                        &:hover {
                            background: @backGroundHover;
                        }
                    }
                }
                &:hover {
                    /deep/ .scroll-track-bar {
                        opacity: 1;
                    }
                }
            }
        }
    }
</style>
