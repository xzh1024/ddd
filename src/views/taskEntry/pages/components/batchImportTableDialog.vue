<template>
    <div class="batch-import-table-dialog">
        <el-dialog
            title="批量导入任务"
            :visible.sync="visible"
            :close-on-click-modal="false"
            @closed="closed"
            width="1200px"
        >
            <div class="batch-import-content dialog-has-footer">
                <el-table
                    v-if="tableData.length"
                    :data="tableData"
                    border
                    style="width: 100%"
                    v-scroll:table
                >
                    <el-table-column prop="task_name" label="任务名称" min-width="180">
                        <div
                            slot-scope="scope"
                            class="cell-padding"
                            :class="{'danger': !scope.row.name_flag}"
                        >
                            <el-input
                                v-model.trim="scope.row.task_name"
                                @input="nameValidate(scope.row)"
                            ></el-input>
                        </div>
                    </el-table-column>
                    <el-table-column prop="project_name" label="所属项目" min-width="180">
                        <div
                            slot-scope="scope"
                            class="cell-padding"
                            :class="{'danger': !scope.row.project_flag}"
                        >
                            <el-select
                                v-model="scope.row.project_name"
                                @change="changeProject($event, scope.row)"
                            >
                                <el-option
                                    v-for="project in projectOptions"
                                    :key="project.id"
                                    :label="project.name"
                                    :value="project.name"
                                ></el-option>
                            </el-select>
                        </div>
                    </el-table-column>
                    <el-table-column prop="user_phone" label="CP管理" min-width="180">
                        <div
                            slot-scope="scope"
                            class="cell-padding"
                            :class="{'danger': !scope.row.user_flag}"
                        >
                            <el-select
                                v-model="scope.row.user_phone"
                                @change="changeCp($event, scope.row)"
                            >
                                <el-option
                                    v-for="user in scope.row.users"
                                    :key="user.id"
                                    :label="user.name"
                                    :value="user.phone"
                                    :disabled="user.is_update === 2"
                                >
                                    <span>{{user.name}}</span>
                                    <cp-tip :disabled="user.is_update === 2"></cp-tip>
                                </el-option>
                            </el-select>
                        </div>
                    </el-table-column>
                    <el-table-column prop="standard_name" label="制作类型" min-width="180">
                        <div
                            slot-scope="scope"
                            class="cell-padding"
                            :class="{'danger': !scope.row.standard_flag}"
                        >
                            <el-select
                                v-model="scope.row.standard_name"
                                @change="changeStandard($event, scope.row)"
                            >
                                <el-option
                                    v-for="standard in scope.row.standards"
                                    :key="standard.id"
                                    :label="standard.name"
                                    :value="standard.name"
                                ></el-option>
                            </el-select>
                        </div>
                    </el-table-column>
                    <el-table-column prop="expire_price_max" label="报价最大值" min-width="120">
                        <div
                            slot-scope="scope"
                            class="cell-padding"
                            :class="{'danger': !scope.row.price_flag}"
                        >
                            <el-input
                                v-model.trim="scope.row.expire_price_max"
                                @keyup.native="scope.row.expire_price_max = intNumberValidate(scope.row.expire_price_max, scope.row)"
                                @change="scope.row.expire_price_max = intNumberValidate(scope.row.expire_price_max, scope.row)"
                            ></el-input>
                        </div>
                    </el-table-column>
                    <el-table-column prop="expire_end_time" label="预计完成" min-width="180">
                        <div
                            slot-scope="scope"
                            class="cell-padding"
                            :class="{'danger': !scope.row.tiem_flag}"
                        >
                            <el-date-picker
                                v-model="scope.row.expire_end_time"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="选择日期"
                                :picker-options="pickerOptions"
                                :clearable="false"
                                @change="dateValidate(scope.row)"
                            ></el-date-picker>
                        </div>
                    </el-table-column>
                </el-table>
                <no-data text="暂无任务数据" v-if="!tableData.length && !isLoading"></no-data>
                <loading v-if="isLoading"></loading>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="medium" round @click="hide">取消</el-button>
                <el-button
                    type="primary"
                    size="medium"
                    round
                    @click="submit"
                    :disabled="!tableData.length"
                >确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { TaskEntryRequest } from "../../service/http";
import { SystemGlobalRequest } from "commonHttp";

export default {
    name: "batchImportTabelDialog",
    props: {
        fileId: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            visible: true,
            isLoading: true,
            tableData: [],
            projectOptions: [],
            projectGroupData: [],
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now();
                },
            },
        };
    },
    created() {
        this.getProjectGroupData();
        this.getProjectList();
    },
    methods: {
        messageSuccess(msg) {
            this.$message.success(msg);
        },
        messageError(msg) {
            this.$message.error(msg);
        },
        hide() {
            this.visible = false;
        },
        closed() {
            this.$emit("hide");
        },
        async getData() {
            this.isLoading = true;
            const params = {
                file_id: this.fileId,
            };
            const {
                err_code,
                data = [],
            } = await TaskEntryRequest.taskBatchInsert(params);
            if (err_code === 0) {
                this.pickTaskList(data);
            }
            this.isLoading = false;
        },
        pickTaskList(list) {
            if (!Array.isArray(list)) return;
            list.forEach((task) => {
                // 当前任务的所属项目为false，默认对应的CP管理与制作类型都为false
                if (!task.project_flag) {
                    task.user_flag = false;
                    task.standard_flag = false;
                }
                // 通过项目绑定当前任务的CP管理与制作类型列表
                const { standards, users } = this.eachProjectGroup(
                    task.project_name
                );
                task.standards = standards;
                task.users = users.map((user) => {
                    return {
                        id: user.id,
                        name: user.name,
                        phone: user.mobile,
                        is_update: user.is_update,
                    };
                });
                // 任务名称
                this.nameValidate(task);
                // 预计完成
                this.dateValidate(task);
                // 报价最大值
                this.priceValidate(task);
            });
            this.tableData = list;
        },
        // 项目列表
        async getProjectList() {
            const {
                err_code,
                data,
            } = await SystemGlobalRequest.getMyProjectList();
            if (err_code === 0) {
                this.projectOptions = data || [];
            }
        },
        // 属于自己的项目的规范及管理员数据
        async getProjectGroupData() {
            const {
                err_code,
                data,
            } = await TaskEntryRequest.getProjectGroupData();
            if (err_code === 0) {
                this.projectGroupData = data || [];
            }
            this.getData();
        },
        // 通过项目名称获取项目下的CP管理列表、制作类型列表
        eachProjectGroup(name) {
            const projectGroupData = this.projectGroupData;
            for (let index = 0; index < projectGroupData.length; index++) {
                const item = projectGroupData[index];
                if (item.name === name) {
                    return {
                        standards: item.standards || [],
                        users: item.users || [],
                    };
                }
            }
            return {
                standards: [],
                users: [],
            };
        },
        // 当改变项目时，获取对应的CP管理与制作类型列表
        changeProject(val, row) {
            row.standard_name = "";
            row.user_phone = "";
            const { standards, users } = this.eachProjectGroup(
                row.project_name
            );
            row.standards = standards;
            row.users = users.map((user) => {
                return {
                    id: user.id,
                    name: user.name,
                    phone: user.mobile,
                    is_update: user.is_update,
                };
            });

            if (val) {
                row.project_flag = true;
                row.user_flag = false;
                row.standard_flag = false;
            }
        },
        // 报价最大值仅可输入非零正整数，上限10000
        intNumberValidate(value, row) {
            value = String(value);
            value = value.replace(/^(0+)|[^\d]+/g, "");
            if (value > 10000) {
                value = 10000;
            }
            value = parseInt(value, 10) || "";
            // 当报价最大值合法时取消红色背景
            this.priceValidate(row);
            return value;
        },
        // 验证项目报价最大值
        priceValidate(row) {
            const max = row.expire_price_max;
            if (max > 0 && max <= 10000) {
                row.price_flag = true;
            } else {
                row.price_flag = false;
            }
        },
        // 验证项目名称
        nameValidate(row) {
            if (row.task_name) {
                row.name_flag = true;
            } else {
                row.name_flag = false;
            }
        },
        // 验证日期
        dateValidate(row) {
            const dateFormat = /^(\d{4})-(\d{2})-(\d{2})$/;
            if (dateFormat.test(row.expire_end_time)) {
                row.tiem_flag = true;
            } else {
                row.tiem_flag = false;
            }
        },
        // CP管理改变
        changeCp(val, row) {
            if (val) {
                row.user_flag = true;
            } else {
                row.user_flag = false;
            }
        },
        // 制作类型改变
        changeStandard(val, row) {
            if (val) {
                row.standard_flag = true;
            } else {
                row.standard_flag = false;
            }
        },
        async submit() {
            const keys = [
                "project_flag", //项目flag
                "user_flag", // CP管理flag
                "standard_flag", //制作类型flag
                "price_flag", //报价最大值flag
                "name_flag", //项目名称flag
                "tiem_flag", //预计完成flag
            ];
            const tableData = this.tableData;
            // 排查是否都通过验证
            for (let index = 0; index < tableData.length; index++) {
                const task = tableData[index];
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (!task[key]) {
                        this.messageError("有错误数据需修改");
                        return false;
                    }
                }
            }
            const params = {
                data: JSON.stringify(tableData),
            };
            const {
                err_code,
                data = {},
            } = await TaskEntryRequest.taskBatchExec(params);
            if (err_code === 0) {
                let contnet = `
                    <p>导入成功数量：<span style="color: #66BB6A;">${data.success}</span></p>
                    <p>导入失败数量：<span style="color: #EF5351;">${data.fail}</span></p>
                `;
                this.$alert(contnet, "操作成功", {
                    showClose: true,
                    showConfirmButton: false,
                    lockScroll: false,
                    dangerouslyUseHTMLString: true,
                    callback: (action) => {},
                });
                this.pickTaskList(data.data);
                if (!data.data.length) {
                    this.$emit("hide");
                }
                if (data.success) {
                    this.$emit("update");
                }
            }
        },
    },
};
</script>

<style lang='less' scoped>
.batch-import-table-dialog {
    /deep/ .el-dialog {
        height: 637px;
        .el-dialog__body {
            height: calc(~"100% - 137px");
        }
    }
    .batch-import-content {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 20px;
        overflow: hidden;
        /deep/ .danger {
            background-color: rgba(122, 43, 41, 0.8);
            .el-select,
            .el-input {
                .el-input__inner {
                    background: none;
                }
            }
        }
        /deep/ .lucency {
            background-color: @backGroundLightExtra;
        }
        /deep/ .el-table td {
            padding: 0 !important;
            .cell {
                padding: 0 !important;
                white-space: nowrap;
                .cell-padding {
                    box-sizing: border-box;
                    height: 49px;
                    line-height: 49px;
                    padding: 1px 12px 0 30px;
                    .el-date-editor {
                        width: 100%;
                    }
                }
            }
        }
    }
}
</style>