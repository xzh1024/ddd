<template>
    <div class="dialog-node-standard">
        <el-dialog
            title="引入系统类型"
            :visible.sync="visible"
            :close-on-click-modal="false"
            :lock-scroll="false"
            @closed="closed"
            width="685px"
        >
            <el-checkbox-group v-model="standardIds" size="medium">
                <el-checkbox
                    border
                    v-for="standard in standards"
                    :label="standard.id"
                    :key="standard.id"
                    :title="standard.name"
                >{{standard.name}}</el-checkbox>
            </el-checkbox-group>
            <span slot="footer" class="dialog-footer">
                <el-button size="medium" round @click="hide">取消</el-button>
                <el-button
                    type="primary"
                    size="medium"
                    round
                    :disabled="!standardIds.length"
                    @click="submit"
                >确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { NodeService } from "../service/http";

export default {
    name: "dialogNodeStandard",
    data() {
        return {
            visible: false,
            projectId: "",
            standards: [],
            standardIds: [],
        };
    },
    created() {
        this.getData();
    },
    methods: {
        show(projectId) {
            this.projectId = projectId;
            this.visible = true;
        },
        hide() {
            this.visible = false;
        },
        closed() {
            this.projectId = "";
            this.standardIds = [];
        },
        messageSuccess(msg) {
            this.$message({
                type: "success",
                message: msg,
            });
        },
        getData() {
            NodeService.getSysStandard().then((res) => {
                const { err_code, data = [] } = res;
                if (err_code === 0) {
                    this.standards = data;
                }
            });
        },
        async submit() {
            const params = {
                sys_standard_id: this.standardIds.join(","),
                project_id: this.projectId,
            };
            const { err_code } = await NodeService.applySysStandard(params);
            if (err_code === 0) {
                this.messageSuccess("引入系统类型成功!");
                this.$emit("update", {}, () => {
                    this.$emit("unfoldMenu", this.projectId);
                    this.hide();
                });
            }
        },
    },
};
</script>

<style lang='less' scoped>
.dialog-node-standard {
    /deep/ .el-checkbox-group {
        padding: 20px;
        .el-checkbox {
            margin: 0;
            margin-right: 15px;
            margin-top: 10px;
            width: 150px;
            .el-checkbox__label {
                width: 100%;
                padding: 0;
                line-height: 22px;
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                text-align: center;
            }
            .el-checkbox__input {
                display: none;
            }
        }
        .el-checkbox:nth-child(4n + 0) {
            margin-right: 0;
        }
        .is-checked {
            background: @baseColor;
            .el-checkbox__label {
                color: @white;
            }
        }
    }
}
</style>