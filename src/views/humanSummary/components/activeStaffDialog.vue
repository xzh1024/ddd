<template>
    <div class="active-dialog-warp">
        <el-dialog title="激活人力" width="460px" :close-on-click-modal='false' :visible.sync="dialogFormVisible"
                   @close="dialogClose" :lock-scroll="false">
            <loading v-if="isLoading"></loading>
            <div class="body_cus">
                <div class="header">
                    <el-input
                        placeholder="请输入名称\手机号"
                        class="search_tag"
                        :clearable='true'
                        @input="searchInputChange"
                        @clear="searchInputChange"
                        size="medium"
                        prefix-icon="el-icon-search"
                        v-model.trim="searchValue">
                        <el-button slot="append" icon="el-icon-search" size="medium"></el-button>
                    </el-input>
                    <div class="showlabel">
                        <div v-if="selectName">{{selectName}}</div>
                    </div>
                </div>
                <div class="content-warp">
                    <el-scrollbar class="option-wrap-scroll">
                        <div class="option-wrap">
                            <template v-if="tableData && tableData.length">
                                <div v-for="(item,index) in tableData" :key="index"
                                     :class="selectID == item.id ? 'option active' : 'option'" @click="itemClick(item)">
                                    <div>{{item.name}}</div>
                                    <div>{{item.mobile}}</div>
                                </div>
                            </template>
                            <div v-else class="nodata">没有数据了</div>
                        </div>
                    </el-scrollbar>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button round size="medium" @click="dialogFormVisible = false">取消</el-button>
                <el-button round size="medium" type="primary" @click="submitForm"
                           :disabled="(selectID && selectID !==0) ? false : true">确定
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import CusSelecter from '@components/cusUI/cusSelecter'
    import {Request} from '../service/http'
    import _ from 'lodash'
    
    export default {
        name: 'activeStaffDialog',
        props: {},
        data() {
            return {
                dialogFormVisible: false,
                searchValue: '',
                isLoading: false,
                selectID: '',
                tableData: [],
                selectName: null,
                id: ''
            }
        },
        computed: {},
        components: {},
        methods: {
            submitForm() {
                this.isLoading = true;
                Request.bindHuman({
                    id: this.id,
                    user_id: this.selectID
                })
                    .then(res => {
                        this.isLoading = false;
                        if (res.err_code === 0) {
                            this.$message({
                                message: '绑定成功!',
                                type: 'success'
                            });
                            this.$emit('reloadList');
                            this.dialogFormVisible = false
                        }
                    })
                    .catch(err => {
                        this.isLoading = false;
                        console.log(err)
                    })
            },
            open(id) {
                this.dialogFormVisible = true;
                this.id = id;
                this.getList()
            },
            dialogClose() {
                this.$emit('dialogClose')
            },
            handleCurrentChange(page) {
                this.page = page;
                this.getList({page: page})
            },
            getList(data = {}) {
                let params = {
                    page: 1,
                    page_size: 999,
                };
                if (this.searchValue.length) {
                    params.search = this.searchValue
                }
                this.isLoading = true;
                Request.getUserList(params)
                    .then(res => {
                        this.isLoading = false;
                        if (res.err_code === 0) {
                            this.tableData = res.data;
                            this.count = res.page.count
                        } else {
                            console.log('出错了', res.err_message)
                        }
                    }).catch(err => {
                    this.isLoading = false;
                    console.log('出错了', err)
                });
            },
            itemClick(item) {
                this.selectID = item.id;
                this.selectName = item.name
            },
            searchInputChange: _.throttle(function () {
                this.page = 1;
                this.getList({page: 1})
            }, 1000),
        },
        mounted() {
        
        }
        
    }
</script>
<style lang="less" scoped>
    .active-dialog-warp {
        .body_cus {
            padding: 20px 0;
            .header {
                width: 100%;
                padding: 0 20px;
                .showlabel {
                    margin-top: 10px;
                    height: 26px;
                    > div {
                        font-size: 12px;
                        border-radius: @radius;
                        border: 1px solid @borderColorDeep;
                        color: @textLighter;
                        width: 100px;
                        height: 26px;
                        line-height: 24px;
                        text-align: center;
                        background: rgba(32, 35, 37, 0.3);
                    }
                }
                .search_tag {
                    overflow: hidden;
                    width: 100%;
                    /deep/ .el-input-group__append {
                        background: rgba(29, 32, 33, 0.3);
                        border-radius: 0px 4px 4px 0px;
                        padding: 0 15px;
                        .el-button {
                            border: none;
                            &:hover {
                                color: @textLighter;
                                background: none;
                                .el-icon-search {
                                    color: @textLighter;
                                }
                            }
                        }
                    }
                }
            }
            .content-warp {
                margin-top: 10px;
                width: 100%;
                height: 160px;
                overflow: hidden;
                .option-wrap-scroll {
                    width: 100%;
                    height: 100%;
                }
                .option-wrap {
                    width: 100%;
                    padding: 0 20px;
                    .option {
                        display: flex;
                        flex-direction: row;
                        padding: 0 20px;
                        font-size: 14px;
                        height: 34px;
                        line-height: 34px;
                        justify-content: space-between;
                        > img {
                            width: 30px;
                            height: 30px;
                            margin: 2px;
                        }
                        &:hover {
                            cursor: pointer;
                            background-color: @backGroundHover;
                        }
                    }
                    .active {
                        background-color: @backGroundHover;
                    }
                    .nodata {
                        color: #999;
                        text-align: center;
                    }
                }
            }
            
            .pagination-wrap {
                position: relative;
                width: 100%;
                text-align: right;
            }
        }
        
    }
</style>
