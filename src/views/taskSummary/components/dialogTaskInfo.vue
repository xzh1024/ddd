<template>
    <div class="dialog-task-info">
        <el-dialog
            title="任务详情"
            :visible.sync="visible"
            :close-on-click-modal="false"
            @closed="closed"
            width="920px"
        >
            <div class="task-info-content dialog-no-footer">
                <el-tabs tab-position="left" type="card" :stretch="true" style="height: 100%;">
                    <el-tab-pane
                        v-for="task in tasks"
                        :key="task.uuid"
                        :label="task.name"
                    >
                        <div
                            slot="label"
                            class="el-tabs__item-label"
                            :title="task.is_main_task ? '任务信息' : task.name"
                        >{{task.is_main_task ? '任务信息' : task.name}}</div>
                        <main-task-template
                            v-if="task.is_main_task"
                            :type="type"
                            :task="task"
                            :myTask="myTask"
                            :myTaskCp="myTaskCp"
                            @update="getTaskInfo"
                        ></main-task-template>
                        <sub-task-template
                            v-if="!task.is_main_task"
                            :type="type"
                            :task="task"
                            :myTask="myTask"
                            :myTaskCp="myTaskCp"
                            :cpMakerOptions="cpMakerOptions"
                            @update="getTaskInfo"
                        ></sub-task-template>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import MainTaskTemplate from "./mainTaskTemplate";
import SubTaskTemplate from "./subTaskTemplate";
import { SystemGlobalRequest } from "commonHttp";
import { TaskService } from "../service/http";

export default {
    name: "dialogTaskInfo",
    props: {
        uuid: {
            type: String,
            required: true,
        },
    },
    components: {
        MainTaskTemplate,
        SubTaskTemplate,
    },
    data() {
        return {
            auth: sessionStorage.pageAuthConfig
                ? JSON.parse(sessionStorage.pageAuthConfig)
                : {},
            userData: sessionStorage.userData
                ? JSON.parse(sessionStorage.userData)
                : {},
            visible: true,
            tasks: [],
            mainTask: {},
            cpMakerOptions: [],
            myTask: false,
            myTaskCp: false,
        };
    },
    computed: {
        type() {
            return this.userData.company_type;
        },
        userId() {
            return this.userData.id || "";
        },
    },
    created() {
        this.getTaskInfo();
    },
    methods: {
        messageSuccess(msg) {
            this.$message.success(msg);
        },
        hide() {
            this.visible = false;
        },
        closed() {
            this.$emit("hide");
        },
        // 任务详情
        async getTaskInfo() {
            const type = this.type;
            let service = "";
            if (type === 1) {
                service = TaskService.getTaskInfoBase;
            } else if (type === 2) {
                service = TaskService.getTaskInfoCp;
            } else {
                return;
            }
            const {
                err_code,
                data = {},
                data: { task_child_general = [] },
            } = await service({
                uuid: this.uuid,
            });
            if (err_code === 0) {
                //CP制作列表需要project_id参数
                if (this.type === 2) {
                    this.getCpMakerList(data.project_id);
                }
                delete data.task_child_general;
                data.is_main_task = true;
                const { follow_users } = data;
                //判断跟进人是否是当前用户
                if (Array.isArray(follow_users) && follow_users.length) {
                    data.follow_user = follow_users.shift();
                    if (this.userId === data.follow_user.id) {
                        this.myTask = true;
                    } else {
                        this.myTask = false;
                    }
                }
                //判断CP管理是否是当前用户
                if (this.userId === Number(data.cp_admin_id)) {
                    this.myTaskCp = true;
                } else {
                    this.myTaskCp = false;
                }
                // 统计任务报价
                let taskQuote = 0;
                if (Array.isArray(task_child_general)) {
                    task_child_general.forEach((childTask) => {
                        if (Number(childTask.price)) {
                            taskQuote += childTask.price;
                        }
                    });
                }
                data.taskQuote = taskQuote;
                this.tasks = [data, ...task_child_general];
            }
        },
        //CP制作列表
        async getCpMakerList(project_id) {
            const {
                err_code,
                data,
            } = await SystemGlobalRequest.getCpMakerList({project_id});
            if (err_code === 0) {
                this.cpMakerOptions = data || [];
            }
        },
    },
};
</script>

<style lang='less' scoped>
.dialog-task-info {
    @height: 600px;
    /deep/ .el-tabs--left {
        > .el-tabs__header {
            margin-right: 0;
            border: none;
            border-right: 1px solid @borderColor;
            .el-tabs__nav {
                border: none;
            }
        }
        .el-tabs__item.is-left {
            width: 140px;
            height: 50px;
            line-height: 50px;
            border: none;
            border-left: 3px solid transparent;
            &:hover {
                color: @text;
                background-color: @backGroundHover;
            }
            .el-tabs__item-label {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        .el-tabs__item.is-left.is-active {
            border-left: 3px solid @baseColor;
            border-right: none;
            color: @text;
            background-color: @backGroundHover;
        }
        .el-tabs__content {
            height: @height;
            .el-tab-pane {
                width: 100%;
                height: 100%;
            }
        }
    }
    .task-info-content {
        width: 100%;
        height: @height;
        overflow: hidden;
    }
}
</style>
