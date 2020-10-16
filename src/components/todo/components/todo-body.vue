<template>
    <div class="todo-body">
        <template v-if="todoList && todoList.length > 0">
            <ul class="left-wrap">
                <li v-for="(item, index) in todoList" :key="index"
                    :class="{'active':currentTodoInfo.projectID === item.project_id}"
                    :title="item.project_name"
                    @click="getCurrentTodoInfo(item)">{{item.project_name}}
                </li>
            </ul>
            <div class="right-wrap">
                <template v-if="type === 'task'">
                    <p @click="linkToTask(108,0)" v-if="company === 1">已驳回任务 {{currentTodoInfo.reject}} 项</p>
                    <p @click="linkToTask(102,0)">待开始任务 {{currentTodoInfo.waitStart}} 项</p>
                    <p @click="linkToTask(103,0)">进行中任务 {{currentTodoInfo.working}} 项</p>
                    <p @click="linkToTask(111,0)" class="orange">今日到期任务 {{currentTodoInfo.todayOverdue}} 项</p>
                    <p @click="linkToTask(106,0)" class="red">已逾期任务 {{currentTodoInfo.overdued}} 项</p>
                </template>
                <template v-else>
                    <p @click="linkToTask(202,1)">进行中节点 {{currentTodoInfo.working}} 项</p>
                    <p @click="linkToTask(206,1)">待审核节点 {{currentTodoInfo.waitAuditing}} 项</p>
                    <p @click="linkToTask(207,1)">已驳回节点 {{currentTodoInfo.reject}} 项</p>
                    <p @click="linkToTask(210,1)" class="orange">今日到期节点 {{currentTodoInfo.todayOverdue}} 项</p>
                    <p @click="linkToTask(205,1)" class="red">已逾期节点 {{currentTodoInfo.overdued}} 项</p>
                </template>
            </div>
        </template>
        <template v-else>
            <no-data></no-data>
        </template>
    </div>
</template>

<script>
    export default {
        name: "todoBody",
        props:{
            type:String,
            todoList:Array,
            currentTodoInfo:Object
        },
        data(){
            return{
                company : sessionStorage.userData ? JSON.parse(sessionStorage.userData).company_type : null,
            }
        },
        methods:{
            getCurrentTodoInfo(item) {
                this.$emit('updateCurrentTodoInfo',item);
            },
            linkToTask(status,type) {
                let params = {
                    projectID: this.currentTodoInfo.projectID,
                    status: status,
                    type:type
                };
                this.$store.commit('setTodoRouteParams', params);
                this.$router.push(
                    {
                        name: 'taskSummaryIndex',
                        params: {
                            projectID: this.currentTodoInfo.projectID,
                            status: status,
                            type:type
                        }
                    });
            },
        },
    };
</script>

<style lang="less" scoped>
    .todo-body {
        width: 100%;
        height: 185px;
        display: flex;
        justify-content: space-between;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        .left-wrap {
            width: 50%;
            height: 100%;
            padding: 10px 0 !important;
            overflow-y: auto;
            border-right: 1px solid @borderColor;
            box-sizing: border-box;
            >li {
                padding: 10px;
                font-size: 12px;
                cursor: pointer;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                border-left: 2px solid transparent;
                text-align: left;
                &.active {
                    background: @backGroundHover;
                    border-left-color: @baseColor;
                    color: @baseColor;
                }
            }
            &::-webkit-scrollbar{
                width: 6px;
                height: 100%;
            }
            &::-webkit-scrollbar-track{
                width: 6px;
                border-radius: 4px;
                /*<!--background: @backGroundLight;-->*/
            }
            &::-webkit-scrollbar-thumb{
                background: rgba(170, 172, 173, 0.5);
                border-radius: 4px;
                transition: background-color 0.3s;
            }
        }
        .right-wrap {
            width: 50%;
            padding: 10px 30px !important;
            text-align: left;

            p {
                padding: 10px 0;
                text-decoration: underline;
                cursor: pointer;
                font-size: 12px;
                color: @grayDeep;
                &.orange {
                    color: @orange;
                }
                &.red {
                    color: @redLight;
                }
            }
        }
    }
    &:hover {
        cursor: auto;
    }
</style>
