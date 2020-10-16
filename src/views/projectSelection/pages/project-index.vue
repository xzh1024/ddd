<template>
    <div class="project-list-wrapper">
        <loading v-if="isLoading"></loading>
        <el-scrollbar class="project-list-selection" v-if="!isLoading">
            <div class="project-list" ref="wrap">
                <ul class="project-items">
                    <li v-if="projectListData.length > 0" v-for="(item, index) in projectListData" :key="index">
                        <div class="project-item" @click.stop="enterProject(item)">
                            <div class="project-content" v-height="getHeight" :style="itemHeight">
                                <img :src="item.cover_img"/>
                            </div>
                            <div class="bottom-bar">
                                <div class="title-part">
                                    <h1 :title="item.name">{{item.name}}</h1>
                                    <span>{{item.desc}}</span>
                                </div>
                                <div class="icon-group">
                                    <i v-if="pageAuthConfig.project_store" title="编辑项目" class="el-icon-edit-outline"
                                       @click.stop="openProjectDialog('edit', item)"></i>
                                    <i v-if="pageAuthConfig.project_delete" title="删除项目" class="el-icon-delete"
                                       @click.stop="deleteProject(item)"></i>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li class="add-project" v-if="pageAuthConfig.project_store">
                        <div class="project-item" @click="openProjectDialog('add')" v-height="getAddHeight"
                             :style="addHeight">
                            <a title="新增项目">
                                <i class="el-icon-plus"></i>
                                <span>新增项目</span>
                            </a>
                        </div>
                    </li>
                </ul>
            </div>
        </el-scrollbar>
        <div v-if="!isLoading && projectListData.length <= 0 && !pageAuthConfig.project_store" class="no-project-content">
            <no-data text="暂无项目"></no-data>
        </div>
        <!-- 新增项目 dialog -->
        <div class="add-project-dialog" v-if="dialogVisible">
            <el-dialog
                :title="type === 'add' ? '新增项目' : '编辑项目'"
                :visible.sync="dialogVisible"
                :close-on-click-modal="false"
                width="475px">
                <div class="dialog-form">
                    <el-form label-width="80px" :model="formParams" ref="projectForm">
                        <el-form-item label="项目名称" required>
                            <el-input v-model="formParams.name" placeholder="请输入项目名称"
                                      @input="focusEnter"></el-input>
                            <div class="err-name" v-if="nameIsEmpty">项目名称不能为空</div>
                        </el-form-item>
                        <el-form-item label="项目封面">
                            <div class="upload-cover-image">
                                <upload :initParams="uploadParams" :hasFile="hasUploadImg"
                                        @focusUpload="imgIsEmpty = false" @fileUploadSuccess="uploadSuccess"
                                        @deleteImg="deleteCoverImg">
                                    <div class="cover-img" slot="upload">
                                        <img v-if="hasUploadImg" :src="formParams.coverImg"/>
                                    </div>
                                </upload>
                            </div>
                            <div class="cover-img-size-recommend">封面图建议上传比例 16:9</div>
                            <div class="err-img" v-if="imgIsEmpty">项目封面图不能为空</div>
                        </el-form-item>
                    </el-form>
                </div>
                <div slot="footer" class="dialog-footer">
                    <el-button round size="medium" @click="dialogVisible = false">取消</el-button>
                    <el-button round size="medium" type="primary" @click="submitProject()">保存</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import {ProjectGroupRequest} from "../service/http";
    import Upload from "@components/upload/upload";
    
    export default {
        name: "project-index",
        components: {Upload},
        data() {
            return {
                isLoading: true,
                itemHeight: 0,
                addHeight: 0,
                projectListData: [],
                dialogVisible: false,
                type: 'add',
                hasUploadImg: false,
                uploadParams: {},
                formParams: {
                    fileId: '',
                    projectId: '',
                    name: '',
                    coverImg: ''
                },
                nameIsEmpty: false,
                imgIsEmpty: false,
                userInfo: sessionStorage.userData ? JSON.parse(sessionStorage.userData) : {},
                pageAuthConfig: sessionStorage.pageAuthConfig ? JSON.parse(sessionStorage.pageAuthConfig) : {}
            };
        },
        directives: {
            height: {
                inserted: function (el, binding) {
                    binding.value(el.clientWidth);
                }
            }
        },
        mounted() {
            this.getProjectListData();
        },
        methods: {
            getHeight(value) {
                this.itemHeight = {height: `${value * 9 / 16}px`};
            },
            getAddHeight(value) {
                this.addHeight = {height: `${value * 9 / 16 + 50}px`};
            },
            enterProject(item) {
                this.$router.push(
                    {
                        name: 'taskSummaryIndex',
                        params: {
                            id: item.id,
                            name: item.name
                        }
                    });
            },
            async getProjectListData() {
                this.isLoading = true;
                const data = await ProjectGroupRequest.getProjectList();
                this.isLoading = false;
                if (data.err_code === 0) {
                    this.projectListData = data.data || [];
                }
            },
            async openProjectDialog(type, item) {
                this.type = type;
                if (type === 'add') {
                    this.dialogVisible = true;
                    this.resetForm();
                } else {
                    this.resetForm();
                    const data = await ProjectGroupRequest.getProjectInfo({project_id: item.id});
                    if (data.err_code === 0) {
                        this.formParams = {
                            name: data.data.name,
                            projectId: data.data.id,
                            coverImg: data.data.cover_img,
                            fileId: data.data.file_id
                        };
                        this.hasUploadImg = !!data.data.cover_img;
                        this.dialogVisible = true;
                    }
                }
            },
            async submitProject() {
                if (!this.formParams.name || this.formParams.name.trim().length <= 0) {
                    this.nameIsEmpty = true;
                }
                if (this.formParams.name && this.formParams.name.trim().length > 0 && this.formParams.name.trim().length > 0) {
                    const params = {
                        user_id: this.userInfo.id,
                        project_name: this.formParams.name,
                        file_id: this.formParams.fileId
                    };
                    if (this.type === 'edit') {
                        params.project_id = this.formParams.projectId;
                    }
                    const data = await ProjectGroupRequest.addNewProject(params);
                    if (data.err_code === 0) {
                        this.$message.success(this.type === 'add' ? '项目添加成功' : '项目修改成功');
                        this.getProjectListData();
                        this.dialogVisible = false;
                    }
                }
            },
            deleteProject(item) {
                const _this = this;
                this.$Tools.deleteConfirm(this, {text: '此操作将删除该项目，是否继续？', title: '提示'}, async () => {
                    const data = await ProjectGroupRequest.deleteProject({project_id: item.id});
                    if (data.err_code === 0) {
                        data.info = '项目删除成功';
                        _this.getProjectListData();
                        return data;
                    }
                });
            },
            resetForm() {
                this.formParams = {
                    fileId: '',
                    projectId: '',
                    name: '',
                    coverImg: ''
                };
                this.hasUploadImg = false;
                this.nameIsEmpty = false;
            },
            uploadSuccess(file) {
                this.hasUploadImg = false;
                this.formParams.coverImg = '';
                this.formParams.fileId = file.id;
                this.$nextTick(() => {
                    this.formParams.coverImg = file.url;
                    this.hasUploadImg = true;
                });
            },
            deleteCoverImg() {
                this.formParams.fileId = '';
                this.formParams.coverImg = '';
                this.hasUploadImg = false;
            },
            focusEnter(value) {
                this.nameIsEmpty = !value || (!!value && value.trim().length <= 0);
            }
        }
    };
</script>

<style lang="less" scoped>
    .project-list-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .project-list-selection {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            .project-list {
                position: relative;
                width: 100%;
                height: 100%;
                padding: 25px 35px;
            }
            .project-items {
                width: 100%;
                display: flex;
                justify-content: flex-start;
                align-items: flex-start;
                flex-wrap: wrap;
                > li {
                    width: 20%;
                    padding: 15px;
                    .project-item {
                        position: relative;
                        width: 100%;
                        border: 1px solid #3E4447;
                        -webkit-border-radius: @radius;
                        -moz-border-radius: @radius;
                        border-radius: @radius;
                        background: #3E4447;
                        -webkit-transition: all 0.3s ease-in-out;
                        -moz-transition: all 0.3s ease-in-out;
                        -ms-transition: all 0.3s ease-in-out;
                        -o-transition: all 0.3s ease-in-out;
                        transition: all 0.3s ease-in-out;
                        overflow: hidden;
                        .project-content {
                            position: relative;
                            width: 100%;
                            height: 191.25px;
                            background-color: @backGround;
                            img {
                                display: block;
                                width: 100%;
                                height: 100%;
                                -webkit-transition: all 0.1s linear;
                                -moz-transition: all 0.1s linear;
                                -ms-transition: all 0.1s linear;
                                -o-transition: all 0.1s linear;
                                transition: all 0.1s linear;
                                &:hover {
                                    opacity: 0.8;
                                }
                            }
                        }
                        .bottom-bar {
                            position: relative;
                            bottom: 0;
                            left: 0;
                            width: 100%;
                            height: 50px;
                            padding: 5px 15px;
                            background: #3E4447;
                            color: @white;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            .title-part {
                                margin-right: 10px;
                                overflow: hidden;
                                > h1 {
                                    font-size: 14px;
                                    font-weight: normal;
                                    margin-bottom: 2px;
                                    overflow: hidden;
                                    -ms-text-overflow: ellipsis;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                }
                                > span {
                                    font-size: 12px;
                                    color: @textLighter;
                                }
                            }
                            .icon-group {
                                min-width: 45px;
                                width: 45px;
                                opacity: 0;
                                -webkit-transition: all 0.2s linear;
                                -moz-transition: all 0.2s linear;
                                -ms-transition: all 0.2s linear;
                                -o-transition: all 0.2s linear;
                                transition: all 0.2s linear;
                                i {
                                    font-size: 14px;
                                    color: @white;
                                    &.el-icon-delete {
                                        margin-left: 15px;
                                    }
                                }
                            }
                        }
                        &:hover {
                            cursor: pointer;
                            -webkit-box-shadow: @boxShadow;
                            -moz-box-shadow: @boxShadow;
                            box-shadow: @boxShadow;
                            .icon-group {
                                opacity: 1 !important;
                            }
                        }
                    }
                    &.add-project .project-item {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #3E4447;
                        a {
                            display: flex;
                            align-items: center;
                            flex-direction: column;
                            color: @text;
                            i {
                                font-weight: bold;
                                font-size: 44px;
                            }
                            span {
                                margin-top: 18px;
                                font-size: 20px;
                            }
                        }
                    }
                }
            }
        }
    
        // Add project dialog
        .dialog-form {
            padding: 20px;
            .el-form .el-form-item:last-child {
                margin: 0;
            }
            .upload-cover-image {
                position: relative;
                width: 194px;
                height: 110px;
                -webkit-border-radius: @radius;
                -moz-border-radius: @radius;
                border-radius: @radius;
                .cover-img {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    > img {
                        position: absolute;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        margin: auto;
                        max-width: 100%;
                        max-height: 100%;
                    }
                }
                &:hover {
                    cursor: pointer;
                }
            }
            .cover-img-size-recommend {
                position: absolute;
                left: 216px;
                top: 35px;
                font-size: 12px;
                color: @textLighter;
            }
            .err-name, .err-img {
                position: absolute;
                top: 100%;
                left: 0;
                line-height: 1;
                padding-top: 4px;
                color: @error;
                font-size: 12px;
            }
        }
        
        .no-project-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99;
        }
    }
</style>
