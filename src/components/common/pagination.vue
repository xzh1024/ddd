<template>
    <div class="pagination-wrap">
        <el-pagination
            background
            :hide-on-single-page="true"
            :layout="paginationLayout"
            :current-page="params.page"
            :page-size="params.pageSize"
            :total="params.total"
            @current-change="handleCurrentChange">
        </el-pagination>
    </div>
</template>

<script>
    export default {
        name: "pagination",
        props: {
            params: {
                type: Object,
                default: () => {
                    return {
                        page: 1,
                        pageSize: 20,
                        total: 0
                    };
                }
            }
        },
        data() {
            return {};
        },
        computed: {
            totalPages() {
                return Math.ceil(this.params.total / this.params.pageSize);
            },
            paginationLayout() {
                return this.totalPages >= 8 ? 'total, prev, pager, next, jumper' : 'total, prev, pager, next';
            }
        },
        methods: {
            handleCurrentChange(currentPage) {
                this.$emit('handleCurrentChange', currentPage);
            }
        }
    };
</script>

<style lang="less" scoped>
    .pagination-wrap {
        position: absolute;
        right: 5px;
        bottom: 0;
        /deep/ .el-pagination {
            .number {
                -webkit-border-radius: @radius;
                -moz-border-radius: @radius;
                border-radius: @radius;
            }
            .el-pagination__jump {
                margin: 0 0 0 10px;
            }
            &.is-background .btn-next, &.is-background .btn-prev, &.is-background .el-pager li {
                background-color: @backGround;
            }
            &.is-background .el-pager li {
                line-height: 30px;
                &:not(.disabled).active {
                    background-color: @baseColor;
                    color: @text;
                }
            }
        }
    }
</style>
