<template>
    <div class="node-wrap" v-if="pageAuthConfig.basic_standard">
        <div class="container">
            <div class="container-menu">
                <div class="menu-content">
                    <el-menu @select="handleSelect" :default-active="defaultActive">
                        <el-submenu
                            v-for="(projectItem, projectIndex) in projectList"
                            :key="projectItem.id"
                            :index="String(projectItem.id)"
                        >
                            <template slot="title">
                                <p class="menu-title">
                                    <span
                                        class="menu-title-text"
                                        :title="projectItem.name"
                                    >{{projectItem.name}}</span>
                                    <span class="menu-title-icons">
                                        <i
                                            class="icon-quote-default-type"
                                            title="引入系统类型"
                                            @click.stop="handleSysStandard(projectItem.id)"
                                        ></i>
                                        <i
                                            class="icon-quote-custom-type"
                                            title="自定义新增类型"
                                            @click.stop="handleCustomStandard(projectItem.id)"
                                        ></i>
                                    </span>
                                </p>
                            </template>
                            <el-menu-item-group>
                                <el-menu-item
                                    v-for="(standardItem, standardIndex) in projectItem.standards"
                                    :key="standardIndex"
                                    :index="projectIndex + '-' + standardIndex"
                                    :title="standardItem.name"
                                >{{standardItem.name}}</el-menu-item>
                            </el-menu-item-group>
                        </el-submenu>
                    </el-menu>
                </div>
                <no-data v-show="!projectList.length && !isMenuLoading"></no-data>
                <loading v-show="isMenuLoading"></loading>
            </div>
            <div class="container-table">
                <div class="standard-head" v-show="standardData.id">
                    <div class="standard-title" :title="standardData.name">
                        <div class="standard-title-text">
                            <el-input
                                class="input-style"
                                :class="{'input-border-none': !standardData.isBorder}"
                                v-model.trim="standardData.name"
                                @focus="updateStandardFocus"
                                @blur="updateStandard"
                            ></el-input>
                        </div>
                    </div>
                    <div class="standard-operate">
                        <i class="el-icon-delete" @click="deleteStandard">&emsp;删除</i>
                        <el-button size="small" type="primary" round @click="createNode">添加节点</el-button>
                    </div>
                </div>
                <div class="loading-container">
                    <div class="table-content">
                        <el-table
                            v-if="tableData.length"
                            :data="tableData"
                            style="width: 100%"
                            border
                            v-scroll:table
                        >
                            <el-table-column type="index" label="序号" width="96"></el-table-column>
                            <el-table-column prop="name" label="名称" min-width="540">
                                <template slot-scope="scope">
                                    <el-input
                                        class="input-style"
                                        :class="{'input-border-none': !scope.row.isBorder}"
                                        v-model.trim="scope.row.name"
                                        @focus="updateNodeFocus($event, scope.row)"
                                        @blur="updateNode($event, scope.row)"
                                    ></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="200">
                                <template slot-scope="scope">
                                    <i
                                        class="el-icon-delete"
                                        title="删除"
                                        @click="deleteNode(scope.row)"
                                    ></i>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <no-data v-show="!tableData.length && standardData.id && !isLoading"></no-data>
                    <loading v-show="isLoading"></loading>
                </div>
            </div>
        </div>
        <dialog-node-standard ref="dialogNodeStandard" @update="getData" @unfoldMenu="unfoldMenu"></dialog-node-standard>
    </div>
</template>

<script>
import { NodeService } from "../service/http";
import DialogNodeStandard from "../components/dialogNodeStandard";

export default {
    name: "node",
    components: { DialogNodeStandard },
    data() {
        return {
            isLoading: true,
            isMenuLoading: true,
            projectList: [],
            tableData: [],
            columnData: [
                {
                    label: "名称",
                    prop: "name",
                    width: 350,
                },
            ],
            menuTitle: "",
            standardData: {
                id: "",
                name: "",
                project_id: "",
            },
            defaultActive: "",
            pageAuthConfig: sessionStorage.pageAuthConfig
                ? JSON.parse(sessionStorage.pageAuthConfig)
                : {},
        };
    },
    created() {
        this.init();
    },
    methods: {
        messageSuccess(msg) {
            this.$message.success(msg);
        },
        messageError(msg) {
            this.$message.error(msg);
        },
        deepClone(data) {
            return JSON.parse(JSON.stringify(data));
        },
        async init() {
            await this.getData();
            const projectList = this.projectList;
            //设置默认展开项，遍历项目并判断是否存在类型节点，如果存在则默认项为当前项目的第一个类型节点
            projectList.some((project, index) => {
                let result = false;
                if (
                    Array.isArray(project.standards) &&
                    project.standards.length
                ) {
                    this.defaultActive = "" + index + "-0";
                    const standardData = {
                        ...this.getActiveStandard(),
                        isBorder: false,
                    };
                    this.standardData = this.deepClone(standardData);
                    this.getStandardNodes();
                    result = true;
                }
                return result;
            });
        },
        getData(params = {}, cb) {
            this.isMenuLoading = true;
            return NodeService.getProjectList()
                .then((res) => {
                    const { err_code, data = [] } = res;
                    if (err_code === 0) {
                        // 接口返回数据未排序
                        this.projectList = data.sort((a, b) => a.id - b.id);
                        cb && cb();
                    }
                    this.isMenuLoading = false;
                })
                .catch((err) => {
                    this.isMenuLoading = false;
                });
        },
        getActiveStandard() {
            const defaultActive = this.defaultActive;
            let standard = {};
            if (defaultActive) {
                const ipArr = defaultActive.split("-");
                ipArr.forEach((item) => {
                    item = Number(item);
                });
                const project = this.projectList[ipArr[0]];
                if (
                    project &&
                    project["standards"] &&
                    project["standards"][ipArr[1]]
                ) {
                    standard = project["standards"][ipArr[1]];
                }
            }
            return standard;
        },
        handleSelect(ip) {
            // ip = projectIndex + standardIndex
            this.defaultActive = ip;
            const standard = this.getActiveStandard();
            if (standard) {
                const standardData = {
                    ...standard,
                    isBorder: false,
                };
                this.standardData = this.deepClone(standardData);
                this.getStandardNodes();
            }
        },
        getStandardNodes() {
            if (!this.standardData.id) return;
            this.isLoading = true;
            NodeService.getStandardNodes({ id: this.standardData.id })
                .then((res) => {
                    const { err_code, data = [] } = res;
                    if (err_code === 0) {
                        this.formatNodeData(data);
                    }
                    this.isLoading = false;
                })
                .catch((err) => {
                    this.isLoading = false;
                });
        },
        formatNodeData(list) {
            list.forEach((item) => {
                item.isBorder = false;
            });
            this.tableData = list;
        },
        // 引入系统类型
        handleSysStandard(projectId) {
            if (!projectId) return;
            this.$refs.dialogNodeStandard.show(projectId);
        },
        //自定义新增类型
        async handleCustomStandard(projectId) {
            if (!projectId) return;
            const params = {
                name: "新建类型",
                project_id: projectId,
            };
            const { err_code } = await NodeService.createCustomStandard(params);
            if (err_code === 0) {
                this.messageSuccess("新增类型成功!");
                await this.getData();
                this.unfoldMenu(projectId);
            }
        },
        unfoldMenu(projectId) {
            const projectList = this.projectList;
            projectList.some((project, index) => {
                let result = false;
                const standards = project.standards;
                if (
                    project.id === projectId &&
                    Array.isArray(standards) &&
                    standards.length
                ) {
                    const standardIndex = project.standards.length - 1;
                    this.defaultActive = "" + index + "-" + standardIndex;
                    const standardData = {
                        ...project.standards[standardIndex],
                        isBorder: false,
                    };
                    this.standardData = this.deepClone(standardData);
                    this.getStandardNodes();
                    result = true;
                }
                return result;
            });
        },
        updateStandardFocus() {
            this.standardData.isBorder = true;
        },
        // 更新类型
        updateStandard() {
            this.standardData.isBorder = false;
            const { id, name } = this.standardData;
            if (!id) return;
            if (name === "") {
                this.messageError("类型名称不能为空!");
                return false;
            }
            const params = { id, name };
            const standard = this.getActiveStandard();
            NodeService.updateStandard(params).then((res) => {
                const { err_code } = res;
                if (err_code === 0) {
                    standard.name = name;
                    this.messageSuccess("更新类型名称成功!");
                }
            });
        },
        // 删除规范及其节点
        deleteStandard() {
            const _this = this;
            this.$Tools.deleteConfirm(
                this,
                {
                    text:
                        "类型的删除会将下属的所有节点全部删除，确定删除此类型吗?",
                    title: "提示",
                },
                async () => {
                    const data = await NodeService.deleteStandard({
                        id: _this.standardData.id,
                    });
                    data.info = "删除类型及其节点成功!";
                    if (data.err_code === 0) {
                        await _this.getData();
                        _this.afterDeleteUnfoldMenu(
                            _this.standardData.project_id
                        );
                    }
                    return data;
                }
            );
        },
        afterDeleteUnfoldMenu(projectId) {
            const projectList = this.projectList;
            // 判断当前项目是否还存在子类型，如果有则选中当前项目的第一个类型
            const nowResult = projectList.some((project, index) => {
                let result = false;
                const standards = project.standards;
                if (
                    project.id === projectId &&
                    Array.isArray(standards) &&
                    standards.length
                ) {
                    this.defaultActive = "" + index + "-0";
                    const standardData = {
                        ...standards[0],
                        isBorder: false,
                    };
                    this.standardData = this.deepClone(standardData);
                    this.getStandardNodes();
                    result = true;
                }
                return result;
            });
            // 如果当前项目不存在子类型则遍历项目list
            if (!nowResult) {
                const result = projectList.some((project, index) => {
                    let result = false;
                    const standards = project.standards;
                    if (Array.isArray(standards) && standards.length) {
                        this.defaultActive = "" + index + "-0";
                        const standardData = {
                            ...standards[0],
                            isBorder: false,
                        };
                        this.standardData = this.deepClone(standardData);
                        this.getStandardNodes();
                        result = true;
                    }
                    return result;
                });
                if (!result) {
                    this.defaultActive = "";
                    this.tableData = [];
                    this.standardData = {};
                }
            }
        },
        // 创建节点
        createNode() {
            if (!this.standardData.id) return;
            const params = {
                name: "新建节点",
                standard_id: this.standardData.id,
            };
            NodeService.createNode(params).then((res) => {
                const { err_code } = res;
                if (err_code === 0) {
                    this.messageSuccess("添加节点成功!");
                    this.getStandardNodes();
                }
            });
        },
        updateNodeFocus(event, row) {
            row.isBorder = true;
        },
        // 更新节点
        updateNode(event, row) {
            row.isBorder = false;
            const { id, name } = row;
            if (!id) return;
            if (name === "") {
                this.messageError("节点名称不能为空!");
                return false;
            }
            const params = { id, name };
            NodeService.updateNode(params).then((res) => {
                const { err_code } = res;
                if (err_code === 0) {
                    this.messageSuccess("更新节点名称成功!");
                }
            });
        },
        // 删除节点
        deleteNode(row) {
            const _this = this;
            this.$Tools.deleteConfirm(
                this,
                { text: "确定删除此节点吗?", title: "提示" },
                async () => {
                    const data = await NodeService.deleteNode({ id: row.id });
                    data.info = "删除节点成功!";
                    if (data.err_code === 0) {
                        _this.getStandardNodes();
                    }
                    return data;
                }
            );
        },
    },
};
</script>

<style lang="less" scoped>
.node-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    .container {
        width: 100%;
        height: 100%;
        flex: 1;
        position: relative;
        display: flex;
        .container-menu {
            position: relative;
            width: 240px;
            height: 100%;
            overflow: hidden;
            .menu-content {
                position: relative;
                width: 100%;
                height: 100%;
                overflow-y: auto;
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE 10+ */
                &::-webkit-scrollbar {
                    display: none;
                }
                .text-color {
                    color: @text;
                }
                .menu-title {
                    display: flex;
                    width: 100%;
                    overflow: hidden;
                    .menu-title-text {
                        flex: 1;
                        margin-left: 18px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    & [class^="el-icon-"] {
                        margin-right: 0;
                    }
                }
                /deep/ .el-menu {
                    border-right: none;
                }
                /deep/ .el-submenu__title {
                    .menu-title-icons {
                        display: none;
                        [class^="icon-quote-"] {
                            color: @baseColor;
                            margin-left: 14px;
                        }
                        [class^="icon-quote-"]:first-child {
                            margin-left: 0;
                        }
                    }
                    &:hover .menu-title-icons {
                        display: inline-block;
                    }
                    &:hover {
                        background-color: @backGroundHover;
                    }
                }
                /deep/ .el-menu-item {
                    box-sizing: border-box;
                    border-left: 3px solid transparent;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    &:hover {
                        background-color: @backGroundHover;
                    }
                }
                /deep/ .el-menu-item.is-active {
                    border-left: 3px solid @baseColor;
                    background: @backGroundHover;
                }
                /deep/ .el-submenu__icon-arrow {
                    right: auto;
                    left: 20px;
                    margin-top: -6px;
                }
                /deep/ .el-menu-item-group__title {
                    padding: 0;
                }
            }
        }
        .container-table {
            position: relative;
            flex: 1;
            overflow: hidden;
            /deep/ .el-icon-delete {
                font-size: 14px;
                cursor: pointer;
            }
            .standard-head {
                display: flex;
                align-items: center;
                padding: 0 30px;
                color: @white;
                .standard-title {
                    flex: 1;
                    overflow: hidden;
                    .standard-title-text {
                        width: 100%;
                        .input-style {
                            width: 350px;
                            font-size: 16px;
                        }
                        /deep/ .el-input__inner {
                            color: @white;
                            background: transparent;
                        }
                        /deep/ .input-border-none .el-input__inner {
                            border: 1px solid transparent;
                        }
                    }
                }
                .standard-operate {
                    display: flex;
                    align-items: center;
                    /deep/ .el-icon-delete {
                        margin-right: 20px;
                    }
                    /deep/ .el-button {
                        margin: 12px 0;
                    }
                }
            }
            .loading-container {
                position: relative;
                flex: 1;
                width: 100%;
                height: calc(~"100% - 56px");
                overflow: hidden;
                .table-content {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    .input-style {
                        width: 350px;
                    }
                    /deep/ .el-input__inner {
                        background: transparent;
                    }
                    /deep/ .input-border-none .el-input__inner {
                        border: 1px solid transparent;
                    }
                    /deep/ .el-table__row td {
                        padding-top: 5px !important;
                        padding-bottom: 4px !important;
                    }
                }
            }
        }
    }
}
</style>
