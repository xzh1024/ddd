<template>
    <div class="demo-wrapper">
        <div class="left">
            <label>上传状态切换：</label>
            <div class="state-switch">
                <el-switch
                    v-model="open"
                    active-text="启用上传"
                    inactive-text="禁用上传">
                </el-switch>
            </div>
            <br/>
            <label>上传方式一：</label>
            <div class="form-item">
                <upload :disabled="!open" :auth="true" directory="custom-name" :init-params="uploadParams" :previewParams="previewParams" @fileUploadSuccess="fileSuccess" @deleteImg="deleteImg">
                    <!-- slot 根据需求自定义，可任意添加 预览，删除，下载等操作 -->
                    <ul slot="files">
                        <li v-for="(item, index) in uploadedFilesData" :key="index">
                            <span>{{item.realname}}</span>
                            <a class="btn-groups">
                                <i v-if="item.fileType === 'img'" class="el-icon-view" title="预览" @click="previewFile(item)"></i>
                                <i class="el-icon-delete" title="删除" @click="deleteImg(item)"></i>
                            </a>
                        </li>
                    </ul>
                </upload>
            </div>
            <br/>
            <label>上传方式二：</label>
            <div class="form-area">
                <upload :disabled="!open" directory="custom-name" @fileUploadSuccess="fileUploadSuccess" @deleteImg="deleteUploadImg" :hasFile="!!uploadedFileData.url">
                    <!-- slot 图片展示根据需求自定义, 要求垂直居中 -->
                    <div class="cover-img" slot="upload">
                        <img v-if="!!uploadedFileData.url" :src="uploadedFileData.url"/>
                    </div>
                    <div class="preview-ways" slot="actions" v-if="!open && uploadedFileData.url">
                        <i class="el-icon-view" title="预览" @click="previewFile(uploadedFileData)"></i>
                    </div>
                </upload>
            </div>
            <br/>
            <label>图片预览：</label>
            <el-button type="primary" size="medium" @click="previewImage">点击预览</el-button>
            <br/>
            <br/>
            <label>视频预览：</label>
            <el-button type="primary" size="medium" @click="previewVideo">点击预览</el-button>
            <div class="form-video" v-if="showVideoPreview">
                <video-preview :visible.sync="showVideoPreview" :path="videoUrl"></video-preview>
            </div>
    
            <!-- 文件预览 -->
            <div class="file-preview">
                <!-- Image -->
                <div v-if="showImagePreview">
                    <image-preview :visible.sync="showImagePreview" :data="previewData"></image-preview>
                </div>
            </div>
        </div>
        <div class="right">
            <label>下拉选择：</label>
            <div class="form-select">
                <gz-select size="large" :data="selectData" :value="selectValue" @remoteSearch="remoteSearch" @change="changeValue">
                    <!--<span slot="option" class="el-icon-paperclip"></span>-->
                </gz-select>
            </div>
        </div>
    </div>
</template>

<script>
    /**
     * upload 组件的传参在组件开头有详细说明，仔细查看
     */
    import Upload from "../../components/upload/upload";
    import ImagePreview from "../../components/preview/imagePreview";
    import VideoPreview from "../../components/preview/videoPlayer";
    import GzSelect from "../../components/select/gz-select";
    
    export default {
        name: "upload-demo",
        components: {GzSelect, VideoPreview, ImagePreview, Upload},
        data() {
            return {
                open: true,
                previewParams: {
                    show: true,
                    btnText: '上传附件' // 默认描述为 **上传文件**
                },
                uploadParams: {
                    isDirectory: false, // 是否需要上传文件夹
                    singleFile: false, // 是否为多文件上传，默认为true（单文件）， false为多文件
                    attrs: {accept: 'image/*, application/msword, application/pdf, application/zip, application/vnd.ms-excel'} // 可上传的文件格式，需按照MIME格式书写
                },
                uploadedFilesData: [],
                uploadedFileData: {},
                showImagePreview: false,
                showVideoPreview: false,
                previewData: {},
                videoUrl: '',
                selectValue: 'c',
                selectData: [
                    {
                        id: 1,
                        name: '选择项1',
                        value: 'a'
                    },
                    {
                        id: 2,
                        name: '选择项2',
                        value: 'b'
                    },
                    {
                        id: 3,
                        name: '选择项3',
                        value: 'c'
                    },
                    {
                        id: 4,
                        name: '选择项4',
                        value: 'd'
                    },
                    {
                        id: 5,
                        name: '选择项5',
                        value: 'e'
                    },
                    {
                        id: 6,
                        name: '选择项6',
                        value: 'f'
                    },
                    {
                        id: 7,
                        name: '选择项7',
                        value: 'g'
                    }
                ],
                isLoading: false
            };
        },
        methods: {
            /**
             * 上传方式一 start
             */
            fileSuccess(file) {
                file.fileType = this.$Tools.judgeFileType(file.realname);
                this.uploadedFilesData.push(file);
            },
            deleteImg(file) {
                this.uploadedFilesData.forEach((item, index) => {
                    if (item.id === file.id) {
                        this.uploadedFilesData.splice(index, 1);
                    }
                });
            },
            /**
             * 上传方式一 end
             */
            /**
             * 上传方式二 start
             */
            fileUploadSuccess(file) {
                file.fileType = this.$Tools.judgeFileType(file.realname);
                this.uploadedFileData = file;
            },
            deleteUploadImg() {
                this.uploadedFileData = {};
            },
            /**
             * 上传方式二 end
             */
            /**
             * 图片预览
             * @param currentFile
             */
            previewFile(currentFile) {
                this.showImagePreview = true;
                this.previewData = currentFile;
            },
            previewImage() {
                this.previewData = {
                    url: 'https://documents-1301661509.cos.ap-chongqing.myqcloud.com/document/rich-text/scenery-19.jpg'
                };
                this.showImagePreview = true;
            },
            previewVideo() {
                this.videoUrl = 'https://documents-1301661509.cos.ap-chongqing.myqcloud.com/document/rich-text/VA02802.mp4';
                this.showVideoPreview = true;
            },
            /**
             * Change
             * @param data
             */
            changeValue(data) {
                console.log(data);
            },
            /**
             * Remote search
             * @param value
             */
            remoteSearch(value) {
                console.log(value);
                const _this = this;
                if (!value) {
                    this.selectData = [
                        {
                            id: 1,
                            name: '选择项1',
                            value: 'a'
                        },
                        {
                            id: 2,
                            name: '选择项2',
                            value: 'b'
                        },
                        {
                            id: 3,
                            name: '选择项3',
                            value: 'c'
                        },
                        {
                            id: 4,
                            name: '选择项4',
                            value: 'd'
                        },
                        {
                            id: 5,
                            name: '选择项5',
                            value: 'e'
                        },
                        {
                            id: 6,
                            name: '选择项6',
                            value: 'f'
                        },
                        {
                            id: 7,
                            name: '选择项7',
                            value: 'g'
                        }
                    ];
                    return;
                }
                _this.isLoading = true;
                setTimeout(() => {
                    _this.selectData = [];
                    _this.isLoading = false;
                }, 1200);
            }
        }
    };
</script>

<style lang="less" scoped>
    .demo-wrapper {
        position: relative;
        width: 100%;
        height: auto;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        .left, .right {
            width: 50%;
        }
        label {
            display: block;
            margin-bottom: 10px;
        }
        .form-item {
            position: relative;
            width: 360px;
            height: 76px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: @radius;
            /deep/ .uploaded-files {
                li {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    line-height: 36px;
                    .btn-groups {
                        margin: 0 0 0 15px;
                        i {
                            font-size: 16px;
                            color: @baseColor;
                            &.el-icon-delete {
                                margin: 0 0 0 10px;
                                color: @error;
                            }
                        }
                    }
                }
            }
        }
        
        .form-area {
            position: relative;
            width: 360px;
            height: 200px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.1);
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
            .preview-ways {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: center;
                align-items: center;
                i {
                    font-size: 24px;
                    color: #fff;
                }
            }
        }
    }
</style>
