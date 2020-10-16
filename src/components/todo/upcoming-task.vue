<template>
    <div class="reminder-container" v-clickoutside="handleClose">
        <div class="drag-area" v-drag:parent="getPageXY" title="待办任务"><i class="icon-task-todo"></i></div>
        <div class="todo-list" ref="toDoList" v-show="showList">
            <div class="todo-header">
                <el-tabs v-model="activeName" stretch :class="{'hiddenBar':judgeTodoType === 3 || judgeTodoType === 1}" @tab-click="checkTab">
                    <el-tab-pane label="待办任务" name="task" v-if="judgeTodoType === 3 || judgeTodoType === 2">
                        <todo-body :type="activeName" :todoList="todoList" :currentTodoInfo="currentTodoInfo" @updateCurrentTodoInfo="setCurrentTodoInfo($event)"></todo-body>
                    </el-tab-pane>
                    <el-tab-pane label="待办节点" name="stage" v-if="judgeTodoType === 1 || judgeTodoType === 2">
                        <todo-body :type="activeName" :todoList="todoList" :currentTodoInfo="currentTodoInfo" @updateCurrentTodoInfo="setCurrentTodoInfo($event)"></todo-body>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script>
    import Clickoutside from 'element-ui/src/utils/clickoutside';
    import TodoBody from "./components/todo-body";
    import {SystemGlobalRequest} from 'commonHttp';
    export default {
        name: "upcoming-task",
        components: {TodoBody},
        directives: {Clickoutside},
        data() {
            return {
                showList: false,
                activeName: null,
                todoList:[],
                currentTodoInfo:{
                    projectID: null,  //项目ID
                    projectName: null, //项目名
                    waitStart: 0,  //待开始
                    waitAuditing: 0, //待审核
                    working: 0, //进行中
                    reject: 0, //已驳回
                    todayOverdue: 0, //今日到期
                    overdued: 0 //已逾期
                }
            };
        },
        computed:{
            judgeTodoType(){
                let userData = sessionStorage.userData ? JSON.parse(sessionStorage.userData) : null;
                let todoType = null;
                if(userData){
                    if(userData.company_type === 1){
                        //甲方传3
                        todoType = 3; //project
                        this.activeName = 'task';
                    }else if(userData.company_type === 2){
                        //乙方 判断是否有 任务录入 菜单
                        let menuList = userData.menu_list;
                        if (menuList && menuList.length > 0) {
                            let hasActionKey = menuList.filter((item, index, arr) => {
                                return item.action_key === 'task_cp_a';
                            });

                            if(hasActionKey && hasActionKey.length > 0){
                                todoType = 2; //company
                                this.activeName = 'task';
                            }else {
                                todoType = 1; //personal
                                this.activeName = 'stage';
                            }
                        }
                    }
                }
                return todoType;
            }
        },
        methods: {
            checkTab(event){
                let tab = event.name;
                if(this.judgeTodoType === 2){
                    if(tab === 'task'){
                        this.getTodoTaskList(2);
                    }else if(tab === 'stage') {
                        this.getTodoTaskList(1);
                    }
                }
            },
            //获取待办事项
            async getTodoTaskList(type) {
                let data = await SystemGlobalRequest.getTodoTaskList({type: type});
                if (data.err_code === 0) {
                    let dataArr = data.data;
                    if(dataArr.length > 0){
                        this.setCurrentTodoInfo(dataArr[0]);
                    }
                    this.todoList =  data.data;
                }
            },
            setCurrentTodoInfo(item) {
                this.currentTodoInfo = {
                    projectID: item.project_id,
                    projectName: item.project_name,
                    waitStart: item.wait_start,
                    waitAuditing: item.wait_auditing,
                    working: item.working,
                    reject: item.reject,
                    todayOverdue:item.today_overdue,
                    overdued:item.overdued
                };
            },
            getPageXY(data) {
                if (data.downXY.x === data.upXY.x && data.downXY.y === data.upXY.y) {
                    this.showTodoList();
                }
            },
            showTodoList() {
                this.showList = !this.showList;
                const ele = this.$refs.toDoList;
                ele.style.transform = 'translateX(0)';
            },
            handleClose() {
                this.showList = false;
            }
        },
        mounted() {
            this.getTodoTaskList(this.judgeTodoType);
            this.$bus.on('todo',function () {
                this.getTodoTaskList(this.judgeTodoType);
            })
        }
    };
</script>

<style lang="less" scoped>
    .reminder-container {
        position: fixed;
        top: 32%;
        right: 0;
        width: 64px;
        height: 64px;
        user-select: none;
        text-align: center;
        border: 2px solid @borderColor;
        border-radius: 100%;
        z-index: 2000;
        .drag-area {
            position: relative;
            width: 100%;
            height: 100%;
            z-index: 100;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 50%;
            line-height: 60px;
            .icon-task-todo {
                display: block;
                font-size: 24px;
                color: @baseColor;
                transition: all 0.5s ease-in-out;
                &:active {
                    transform: scale(1.2);
                }
            }
        }
        .todo-list {
            position: absolute;
            top: 0;
            right: 72px;
            width: 370px;
            transform: translateX(200%);
            line-height: 1;
            background: @backGround;
            -webkit-border-radius: @radius;
            -moz-border-radius: @radius;
            border-radius: @radius;
            border: 1px solid @borderColorDeep;
            box-shadow:  0 0 40px 0 rgba(0,0,0,.4);
            -webkit-transition: all 0.3s linear;
            -moz-transition: all 0.3s linear;
            -ms-transition: all 0.3s linear;
            -o-transition: all 0.3s linear;
            transition: all 0.3s linear;
            overflow: hidden;
            z-index: 10;

            .todo-header {
                /deep/.el-tabs{
                    .el-tabs__header{
                        margin: 0 !important;
                        .el-tabs__nav-wrap::after{
                            height: 1px !important;
                        }
                    }
                    .el-tabs__item{
                        padding: 0!important;
                        height: 50px !important;
                        line-height: 50px !important;
                    }
                    .el-tabs__active-bar{
                        width: 65px !important;
                        left: 65px !important;
                    }
                }
                /deep/.hiddenBar{
                    .el-tabs__active-bar{
                        display: none !important;
                    }
                    #tab-task{
                        color: @white !important;
                    }
                }
            }
        }
        &:hover {
            cursor: move;
        }
    }
</style>
