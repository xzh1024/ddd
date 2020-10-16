<template>
    <div class="dialog-notice">
        <el-dialog
            :title="isEdit ? '编辑公告' : '新增公告'"
            :visible.sync="visible"
            :close-on-click-modal="false"
            :lock-scroll="false"
            @closed="closed"
            width="820px"
        >
            <el-form
                ref="noticeForm"
                :model="formModel"
                label-width="80px"
                class="dialog-has-footer"
            >
                <el-form-item label="公告名称" :required="true">
                    <el-input
                        v-model.trim="formModel.title"
                        @input="focusEnter"
                        clearable
                        placeholder="请输入公告名称"
                    ></el-input>
                    <div class="err" v-if="titleIsEmpty">公告名称不能为空</div>
                </el-form-item>
                <el-row :gutter="20" class="notice-scope" :class="{'hide-close': isEdit}">
                    <el-col :span="9">
                        <el-form-item label="项目范围" :required="true">
                            <el-select
                                v-model="formModel.project_ids"
                                multiple
                                collapse-tags
                                placeholder="请选择项目"
                                @change="selectProjectAll"
                            >
                                <el-option
                                    v-if="projectOptions.length && !isEdit"
                                    :key="0"
                                    label="全部项目"
                                    :value="0"
                                    :disabled="isEdit"
                                ></el-option>
                                <el-option
                                    v-for="item in projectOptions"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                    :disabled="isEdit"
                                ></el-option>
                            </el-select>
                            <div class="err" v-if="projectIsEmpty">项目范围不能为空</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="15">
                        <el-row :gutter="12">
                            <el-col :span="14">
                                <el-form-item label="归属范围" :required="true">
                                    <el-select
                                        v-model="formModel.studio_ids"
                                        multiple
                                        collapse-tags
                                        placeholder="请选择工作室"
                                        @change="selectStudioAll"
                                    >
                                        <el-option
                                            v-if="studioOptions.length && !isEdit"
                                            :key="0"
                                            label="全部工作室"
                                            :value="0"
                                            :disabled="isEdit"
                                        ></el-option>
                                        <el-option
                                            v-for="item in studioOptions"
                                            :key="item.id"
                                            :label="item.name"
                                            :value="item.id"
                                            :disabled="isEdit"
                                        ></el-option>
                                    </el-select>
                                    <div class="err" v-if="affiliationIsEmpty">归属范围不能为空</div>
                                </el-form-item>
                            </el-col>
                            <el-col :span="10">
                                <el-select
                                    v-model="formModel.cp_ids"
                                    multiple
                                    collapse-tags
                                    placeholder="请选择CP"
                                    @change="selectCpAll"
                                >
                                    <el-option
                                        v-if="cpOptions.length && !isEdit"
                                        :key="0"
                                        label="全部CP"
                                        :value="0"
                                        :disabled="isEdit"
                                    ></el-option>
                                    <el-option
                                        v-for="item in cpOptions"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id"
                                        :disabled="isEdit"
                                    ></el-option>
                                </el-select>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
                <div class="notice-content">
                    <el-form-item label="公告内容" :required="true">
                        <rich-text
                            v-if="richTextFlag"
                            :content="formModel.content"
                            @returnRichContent="returnRichContent"
                        ></rich-text>
                        <div class="err" v-if="contentIsEmpty">公告内容不能为空</div>
                    </el-form-item>
                </div>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button size="medium" round @click="hide">取消</el-button>
                <el-button type="primary" size="medium" round @click="submitForm">发送</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { SystemGlobalRequest } from "commonHttp";
import { NoticeService } from "../service/http";
import richText from "@/components/richText/rich-text";

export default {
    name: "dialogNotice",
    props: {
        // add、edit
        templateType: {
            type: String,
            required: true,
        },
        id: {
            type: Number,
            required: false,
        },
    },
    components: { richText },
    data() {
        return {
            visible: true,
            dialogVisible: true,
            formModel: {
                title: "",
                content: "",
                project_ids: [],
                studio_ids: [],
                cp_ids: [],
            },
            richTextFlag: false,
            titleIsEmpty: false,
            contentIsEmpty: false,
            projectIsEmpty: false,
            affiliationIsEmpty: false,
            projectOptions: [],
            projectAll: [],
            isProjectAll: false,
            studioOptions: [],
            studioAll: [],
            isStudioAll: false,
            cpOptions: [],
            cpAll: [],
            isCpAll: false,
        };
    },
    computed: {
        isEdit() {
            return this.templateType === "edit";
        },
    },
    created() {
        this.getProjectList();
        this.getCompanyList();
        this.getStudioList();
        if (this.isEdit) {
            this.getNoticeInfo(this.id);
        } else {
            this.richTextFlag = true;
        }
    },
    methods: {
        hide() {
            this.visible = false;
        },
        closed() {
            this.$emit("hide");
        },
        submitForm() {
            let valid = true;
            const { title, content, project_ids, studio_ids, cp_ids } = this.formModel;
            if (!title || title.trim().length <= 0) {
                this.titleIsEmpty = true;
                valid = false;
            }
            if (!this.isEdit) {
                if (!project_ids.length) {
                    this.projectIsEmpty = true;
                    valid = false;
                }
                if (!studio_ids.length && !cp_ids.length) {
                    this.affiliationIsEmpty = true;
                    valid = false;
                }
            }
            if (!content || content.trim().length <= 0) {
                this.contentIsEmpty = true;
                valid = false;
            }
            if (valid) {
                if (this.isEdit) {
                    this.editNotice();
                } else {
                    this.addNotice();
                }
            }
        },
        addNotice(row) {
            const {
                title,
                content,
                project_ids,
                studio_ids,
                cp_ids,
            } = this.formModel;
            const params = {
                title,
                content,
                project_ids: project_ids.filter((project) => project).join(","),
                studio_ids: studio_ids.filter((studio) => studio).join(","),
                cp_ids: cp_ids.filter((cp) => cp).join(","),
            };
            NoticeService.addNotice(params).then((res) => {
                const { err_code } = res;
                if (err_code === 0) {
                    this.messageSuccess("新增公告成功!");
                    this.$emit("update");
                    this.hide();
                }
            });
        },
        editNotice(row) {
            const params = { ...this.formModel };
            NoticeService.editNotice(params).then((res) => {
                const { err_code } = res;
                if (err_code === 0) {
                    this.messageSuccess("编辑公告成功!");
                    this.$emit("update");
                    this.hide();
                }
            });
        },
        getNoticeInfo(id) {
            NoticeService.getNoticeInfo({ id })
                .then((res) => {
                    const { err_code, data = {} } = res;
                    if (err_code === 0) {
                        Object.assign(this.formModel, data);
                    }
                    this.richTextFlag = true;
                })
                .catch((err) => {
                    this.richTextFlag = true;
                });
        },
        returnRichContent(data) {
            let value = data.html;
            this.formModel.content = value;
            this.contentIsEmpty =
                !value || (!!value && value.trim().length <= 0);
        },
        messageSuccess(msg) {
            this.$message.success(msg);
        },
        messageError(msg) {
            this.$message.error(msg);
        },
        focusEnter(value) {
            this.titleIsEmpty = !value || (!!value && value.trim().length <= 0);
        },
        // 获取项目列表
        getProjectList() {
            SystemGlobalRequest.getSimpleProjectList().then((res) => {
                const { err_code, data } = res;
                if (err_code === 0) {
                    const list = data || [];
                    const projectAll = [];
                    this.projectOptions = list.map((project) => {
                        projectAll.push(project.id);
                        return {
                            id: project.id,
                            name: project.project_name,
                        };
                    });
                    this.projectAll = projectAll;
                }
            });
        },
        selectProjectAll(val) {
            this.projectIsEmpty = !val.length;
            const formModel = this.formModel;
            const arr = this.projectAll;
            const isProjectAll = this.isProjectAll;
            if (val.includes(0)) {
                if (isProjectAll) {
                    this.isProjectAll = false;
                    formModel.project_ids.shift();
                } else {
                    this.isProjectAll = true;
                    formModel.project_ids = [0, ...arr];
                }
            } else if (isProjectAll) {
                this.isProjectAll = false;
                formModel.project_ids = [];
                this.projectIsEmpty = true;
            } else {
                if (formModel.project_ids.length === arr.length) {
                    this.isProjectAll = true;
                    formModel.project_ids = [0, ...arr];
                }
            }
        },
        // 获取工作室列表
        getStudioList() {
            SystemGlobalRequest.getStudioList().then((res) => {
                const { err_code, data } = res;
                if (err_code === 0) {
                    const list = data || [];
                    const studioAll = [];
                    list.forEach((item) => {
                        studioAll.push(item.id);
                    });
                    this.studioAll = studioAll;
                    this.studioOptions = list;
                }
            });
        },
        selectStudioAll(val) {
            const formModel = this.formModel;
            this.affiliationIsEmpty = !val.length && !formModel.cp_ids.length;
            const arr = this.studioAll;
            const isStudioAll = this.isStudioAll;
            if (val.includes(0)) {
                if (isStudioAll) {
                    this.isStudioAll = false;
                    formModel.studio_ids.shift();
                } else {
                    this.isStudioAll = true;
                    formModel.studio_ids = [0, ...arr];
                }
            } else if (isStudioAll) {
                this.isStudioAll = false;
                formModel.studio_ids = [];
                this.affiliationIsEmpty = !formModel.cp_ids.length;
            } else {
                if (formModel.studio_ids.length === arr.length) {
                    this.isStudioAll = true;
                    formModel.studio_ids = [0, ...arr];
                }
            }
        },
        // 获取公司列表
        getCompanyList() {
            SystemGlobalRequest.getSimpleCompanyList().then((res) => {
                const { err_code, data } = res;
                if (err_code === 0) {
                    const list = data || [];
                    const cpAll = [];
                    list.forEach((item) => {
                        cpAll.push(item.id);
                    });
                    this.cpAll = cpAll;
                    this.cpOptions = list;
                }
            });
        },
        selectCpAll(val) {
            const formModel = this.formModel;
            this.affiliationIsEmpty = !val.length && !formModel.studio_ids.length;
            const arr = this.cpAll;
            const isCpAll = this.isCpAll;
            if (val.includes(0)) {
                if (isCpAll) {
                    this.isCpAll = false;
                    formModel.cp_ids.shift();
                } else {
                    this.isCpAll = true;
                    formModel.cp_ids = [0, ...arr];
                }
            } else if (isCpAll) {
                this.isCpAll = false;
                formModel.cp_ids = [];
                this.affiliationIsEmpty = !formModel.studio_ids.length;
            } else {
                if (formModel.cp_ids.length === arr.length) {
                    this.isCpAll = true;
                    formModel.cp_ids = [0, ...arr];
                }
            }
        },
    },
};
</script>

<style lang='less' scoped>
.dialog-notice {
    /deep/ .el-dialog {
        height: 650px;
        .el-dialog__body {
            height: calc(~"100% - 137px");
            .el-form {
                box-sizing: border-box;
                height: 100%;
                padding: 20px;
                .notice-content {
                    height: calc(~"100% - 104px");
                    .el-form-item {
                        height: calc(~"100% - 22px");
                        margin-bottom: 0;
                        .el-form-item__content {
                            height: 100%;
                            line-height: 22px !important;
                            .ql-container {
                                height: calc(~"100% - 49px");
                            }
                        }
                    }
                }
                .notice-scope {
                    /deep/ .el-select__tags {
                        white-space: nowrap;
                        overflow: hidden;
                        .el-tag,
                        .el-tag--small {
                            height: auto;
                            word-break: break-word;
                            white-space: normal;
                            max-width: 98px;
                            overflow: hidden;
                            display: flex;
                            align-items: center;
                            .el-select__tags-text {
                                flex: 1;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                            }
                        }
                    }
                }
                .hide-close {
                    /deep/ .el-tag__close {
                        display: none;
                    }
                }
            }
            .err {
                position: absolute;
                top: 100%;
                left: 0;
                line-height: 1;
                padding-top: 4px;
                color: @error;
                font-size: 12px;
            }
        }
    }
}
</style>
