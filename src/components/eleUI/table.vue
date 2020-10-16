/*表格组件*/
<template>
    <el-table
        :data="tableData"
        ref="table"
        :border="border"
        :style="{...tableStyle}"
        :tree-props="{children:children_name, hasChildren: 'hasChildren'}"
        default-expand-all
        :row-key="row_key"
        :height="tableHeight"
        row-class-name="cellclass"
        highlight-current-row
        :default-sort="{...default_sort}"
        @sort-change='sort_change'
        v-scrolls="scrollFun"
        :current-row-key="currentkey"
        @row-click="row_click"
        @expand-change="expand_change"
        v-scroll:table
    >
        <el-table-column v-if="serialNumber" type="index" label="序号" :index="customIndex"
                         width="90"></el-table-column>
        <template v-for="(col, index) in columnData">
            <!-- 操作列/自定义列 -->
            <slot v-if="col.slot" :name="col.slot"></slot>
            <!-- 普通列 -->
            <el-table-column
                v-else
                :key="index"
                :prop="col.prop"
                :label="col.label"
                show-overflow-tooltip
                :min-width="col.width"
                :align="align"
                :sortable='col.sortable || false'
                :sort-orders="sortOrders"
            ></el-table-column>
        </template>
    </el-table>
</template>
<script>
    export default {
        name: "cTable",
        directives: {
            scrolls: {
                bind:function (el,binding) {
                    let selectWrap = el.querySelector('.el-table__body-wrapper');
                    selectWrap.addEventListener('scroll', function (e) {
                        binding.value(e);
                    })
                }
            }
        },
        props: {
            columnData: {
                type: Array,
                required: true
            },
            tableData: {
                type: Array,
                required: true
            },
            headerCellStyle: {
                type: Object
            },
            serialNumber: {
                type: Boolean,
                required: false,
                default: false
            },
            align: {
                type: String,
                default: "left"
            },
            border: {
                type: Boolean,
                required: false,
                default: false
            },
            default_sort: {
                type: Object,
                default: () => ({})
            },
            tableStyle: {
                type: Object,
                default: () => ({})
            },
            tableHeight: {
                type: [Number, String]
            },
            pages: {
                type: Object,
                default: () => ({
                    page: 1,
                    pageSize: 20
                })
            },
            children_name:{
                type: String,
                default: 'children'
            },
            row_key:{
                type: String,
                default: 'uuid'
            },
            current_row_key:{
                type: [String,Number],
                default:''
            }
        },
        data(){
            return{
                currentkey:this.current_row_key,
                sortOrders:['ascending', 'descending']
            }
        },
        watch:{
            current_row_key(val){
                console.log('获得了新的uuid',val);
                this.currentkey = val
            }
        },
        methods: {
            customIndex(index) {
                return index + (this.pages.pageSize * (this.pages.page - 1)) + 1;
            },
            getHeaderCellStyle() {
                if (this.headerCellStyle) {
                    return this.headerCellStyle;
                } else {
                    return "padding:12px 2px;";
                }
            },
            sort_change(col) {
                this.$emit('sort_change', col);
            },
            scrollFun(e){
                this.$emit('scrollFun',e)
            },
            row_click(event){
                this.$emit('row_click',event)
            },
            expand_change(row,expanded){
                this.$emit('expand_change',row,expanded)
            }
        },
        mounted(){
        }
    };
</script>
<style lang="less" scoped>
    /deep/ .cellclass{
        .cell{
            white-space:nowrap;
        }
    }
</style>
