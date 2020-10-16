<template>
    <div class="upload-wrapper">
        <div class="upload-container" v-show="!noSupportUpload">
            <div id="dropUploadArea" class="drop-upload-area" v-if="!previewParams.show">
                <div :id="uploadId" class="upload-btn" v-if="!hasFile && !uploadBegin && !disabled">
                    <div class="default-text">
                        <i class="el-icon-upload"></i>
                        <span>{{btn}}</span>
                    </div>
                </div>
                <div class="uploaded-files-container" v-show="uploadingFile">
                    <slot name="upload"></slot>
                </div>
                <div class="upload-status" v-show="uploadBegin">正在上传...</div>
                <div class="operation-btn" v-if="hasFile && uploadParams.isEdit && !disabled">
                    <i :id="`${uploadId}Edit`" class="el-icon-edit" title="替换"></i>
                    <i class="el-icon-delete" title="删除" @click="deleteImg"></i>
                </div>
                <div class="custom-actions" v-if="$slots.actions">
                    <slot name="actions"></slot>
                </div>
            </div>
            <div class="can-preview-upload" v-else>
                <div class="preview-upload">
                    <el-button :id="`${uploadId}Simple`" type="primary" size="small" plain round v-if="!disabled">{{previewParams.btnText}}</el-button>
                    <div class="uploaded-files">
                        <slot name="files"></slot>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="noSupportUpload">该浏览器不支持上传！</div>
    </div>
</template>

<script>
    /**
     * Component parameters
     *  auth: 上传的文件是否为加密文件，默认需要加密
     *  uploadId: 若在同一个页面使用多个上传组件，则传入对应的 id;
     *  type: 上传类型，默认为 document
     *  directory: 文件存放路径  **不同逻辑页面的上传路径不同，需自己重新定义以作区分**
     *  btn: 按钮文字内容
     *  initParams: 默认值 => {
     *      isEdit: true,  // 是否可编辑， 默认 true
     *      isDirectory: false,  // 是否需要上传文件夹，默认false
     *      singleFile: true,  // 是否为单文件上传，默认 true
     *      attrs: {accept: 'image/*'}  // 限定上传文件格式，默认为 图片格式，根据逻辑按MIME格式传值,
     *      exceeds: 限制上传文件大小，单位Mb
     *  }
     *  hasFile: 是否有上传完成显示的值
     *  previewParams: 参数 {
     *      show: false,  // 默认为 false, 如果需要预览图片则传值为 true
     *      btnText: '上传文件'  // 默认值，可自定义传入
     *  }
     *  disabled: 禁用，默认为false
     *
     *  slots ===>>> upload, actions, files
     *
     *  Return function: fileUploadSuccess => {name, realname, url, eTag}
     *                           fileUploadComplete => [{name, realname, url, eTag}]
     */
    
    import moment from 'moment';
    import Flow from '@libs/js/flow';
    import _ from '@libs/js/tc-upload';
    
    export default {
        name: 'upload',
        props: {
            auth: {
                type: Boolean,
                default: true
            },
            uploadId: {
                type: String,
                default: 'uploadFile'
            },
            type: {
                type: String,
                default: 'document'
            },
            directory: {
                type: String,
                default: 'cover-img'
            },
            btn: {
                type: String,
                default: '点击或拖拽到此区域上传'
            },
            initParams: {
                type: Object,
                default: () => ({})
            },
            hasFile: {
                type: Boolean,
                default: false
            },
            previewParams: {
                type: Object,
                default: () => ({
                    show: false,
                    btnText: '点击上传'
                })
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                uploadParams: {
                    isEdit: true,
                    isDirectory: false,
                    singleFile: true,
                    attrs: {accept: 'image/*'},
                    exceeds: 0
                },
                flowInstance: null,
                noSupportUpload: false,
                uploadBegin: false,
                uploadingFile: false,
                uploadQuery: {},
                fileUploadList: [],
                authority: {},
                randomFileName: '',
                uploadedFilesData: []
            };
        },
        watch: {
            disabled(val) {
                this.$nextTick(() => {
                    this.init();
                });
            },
            hasFile(val) {
                this.uploadingFile = val;
                this.flowInstance = null;
                this.initFlow();
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                const _this = this;
                _this.uploadingFile = _this.hasFile;
                if (_this.disabled) {
                    if (_this.flowInstance) {
                        _this.flowInstance = null;
                    }
                    return;
                }
                _.Authorization({type: _this.type}, (err, data) => {
                    if (err && err === 'unLogin') {
                        _this.$message.warning('登录失效，请重新登录！');
                        _this.$router.push('/');
                        return;
                    }
                    if (data) {
                        _this.authority = {
                            path: `${data.path}/${_this.directory}`,
                            auth: data.Authorization,
                            token: data.XCosSecurityToken
                        };
                        _this.initFlow();
                    }
                });
            },
            initFlow() {
                this.uploadParams = Object.assign({}, this.uploadParams, this.initParams);
                const _this = this;
                const option = {
                    headers: {
                        token: localStorage.token
                    },
                    target: this.$Constant.tcuParams.prefix,
                    chunkSize: 10737418240,
                    testChunks: false,
                    simultaneousUploads: 1,
                    exceeds: _this.uploadParams.exceeds,
                    query: {}
                };
                
                option.singleFile = _this.uploadParams.singleFile;
                const flow = new Flow(option);
                _this.flowInstance = flow;
                if (!flow.support) {
                    _this.noSupportUpload = true;
                }
                if (_this.previewParams.show) {
                    flow.assignBrowse(document.getElementById(`${_this.uploadId}Simple`), false, _this.uploadParams.singleFile, _this.uploadParams.attrs);
                } else {
                    _this.$nextTick(() => {
                        const domNodes = [];
                        if (_this.uploadingFile) {
                            domNodes.push(document.getElementById(`${this.uploadId}Edit`));
                        } else {
                            domNodes.push(document.getElementById(_this.uploadId));
                        }
                        flow.assignBrowse(domNodes, false, _this.uploadParams.singleFile, _this.uploadParams.attrs);
                        flow.assignDrop(document.getElementById('dropUploadArea'));
                    });
                }
                if (_this.uploadParams.isDirectory) {
                    flow.assignBrowse(document.getElementById(`${_this.uploadId}FileBtn`), !_this.uploadParams.isDirectory, _this.uploadParams.singleFile, _this.uploadParams.attrs);
                    flow.assignBrowse(document.getElementById(`${_this.uploadId}FolderBtn`), _this.uploadParams.isDirectory, _this.uploadParams.singleFile, _this.uploadParams.attrs);
                }
                flow.on('fileSizeExceed', function(file) {
                    _this.$message.warning(`上传文件超出限制大小(${option.exceeds}Mb)，请重新上传！`);
                });
                flow.on('fileAdded', function (file, event) {
                    _this.uploadBegin = true;
                    _this.uploadingFile = false;
                    _this.$nextTick(() => {
                        _this.$emit('uploadStart', true);
                    });
                });
                flow.on('filesAdded', function (files, event) {
                    _this.uploadedFilesData = [];
                    const filesAddedList = files.map(item => {
                        item.totalSize = _this.$Tools.byteSizeConversion(item.size);
                        item.uploadStatus = '等待上传...';
                        item.uploadedSize = _this.$Tools.byteSizeConversion(0);
                        item.uploadSpeed = '0Byte/s';
                        item.percent = '0%';
                        return item;
                    });
                    _this.$emit('focusUpload', 'file');
                    _this.fileUploadList = _this.fileUploadList.concat(filesAddedList);
                });
                flow.on('filesSubmitted', function (files) {
                    if (files && files.length > 0) {
                        let fileName = files[0].name;
                        const index = fileName.lastIndexOf('.');
                        const ext = fileName.substring(index);
                        fileName = `${fileName.substring(0, index)}(${moment().format('YYYYMDHms')})${ext}`;
                        fileName = _this.$Tools.switchSymbolToLine(fileName);
                        _this.randomFileName = fileName;
                        _this.uploadQuery = {
                            'key': `${_this.authority.path}/${fileName}`,
                            'name': fileName,
                            'signature': _this.authority.auth,
                            'x-cos-security-token': _this.authority.token
                        };
                        flow.opts.query = _this.uploadQuery;
                        flow.upload();
                    }
                });
                flow.on('fileProgress', function (file) {
                    if (file.flowObj.opts.singleFile) {
                        _this.fileUploadList = _this.fileUploadList.filter(item => item.name === file.name);
                    } else {
                        _this.fileUploadList.forEach(item => {
                            if (item.relativePath === file.relativePath) {
                                const percent = Math.floor(file.progress() * 100) + '%';
                                const uploadSpeed = _this.$Tools.byteSizeConversion(file.averageSpeed) + '/s';
                                item.uploadedSize = _this.$Tools.byteSizeConversion(file.size * file.progress());
                                item.uploadSpeed = uploadSpeed;
                                item.percent = percent;
                                item.uploadStatus = '正在上传中';
                            }
                        });
                    }
                });
                flow.on('fileError', function (file, message) {
                    console.log(file, message);
                });
                flow.on('fileSuccess', function (file, message) {
                    const responseData = _.AcceptUploadResult(_this.uploadQuery.key, message);
                    if (_this.auth) {
                        const params = {
                            path: _this.uploadQuery.key,
                            name: _this.randomFileName,
                            type: _this.type,
                            etag: responseData.eTag.toString()
                        };
                        flow.pause();
                        _.UploadedFileVerify(params, data => {
                            // 判断上一个上传完成的文件位置
                            _this.fileUploadList.forEach((item, index) => {
                                if (item.relativePath === file.relativePath) {
                                    item.uploadStatus = '上传完成';
                                    _this.fileIndex = index;
                                    _this.fileIndex++;
                                }
                            });
                            const filePath = _this.fileUploadList[_this.fileIndex] ? _this.fileUploadList[_this.fileIndex].relativePath : null;
                            if (filePath) {
                                let fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
                                const index = fileName.lastIndexOf('.');
                                const ext = fileName.substring(index);
                                fileName = `${fileName.substring(0, index)}(${moment().format('YYYYMDHms')})${ext}`;
                                fileName = _this.$Tools.switchSymbolToLine(fileName);
                                _this.randomFileName = fileName;
                                _this.uploadQuery.key = `${_this.authority.path}/${fileName}`;
                                _this.uploadQuery.name = fileName;
                            }
                            flow.resume();
                            data.uploadId = _this.uploadId;
                            data.realname = file.name;
                            data.fileType = _this.$Tools.judgeFileType(file.name);
                            _this.uploadedFilesData.push(data);
                            _this.$emit("fileUploadSuccess", data);
                        });
                    } else {
                        _this.fileUploadList.forEach((item, index) => {
                            if (item.relativePath === file.relativePath) {
                                item.uploadStatus = '上传完成';
                                _this.fileIndex = index;
                                _this.fileIndex++;
                            }
                        });
                        const filePath = _this.fileUploadList[_this.fileIndex] ? _this.fileUploadList[_this.fileIndex].relativePath : null;
                        if (filePath) {
                            let fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
                            const index = fileName.lastIndexOf('.');
                            const ext = fileName.substring(index);
                            fileName = `${fileName.substring(0, index)}(${moment().format('YYYYMDHms')})${ext}`;
                            fileName = _this.$Tools.switchSymbolToLine(fileName);
                            _this.randomFileName = fileName;
                            _this.uploadQuery.key = `${_this.authority.path}/${fileName}`;
                            _this.uploadQuery.name = fileName;
                        }
                        responseData.uploadId = _this.uploadId;
                        responseData.realname = file.name;
                        responseData.id = _this.$Tools.getRangeRandom(6, 8);
                        responseData.name = _this.randomFileName;
                        responseData.fileType = _this.$Tools.judgeFileType(file.name);
                        _this.uploadedFilesData.push(responseData);
                        _this.$emit("fileUploadSuccess", responseData);
                    }
                });
                flow.on('complete', function () {
                    _this.fileUploadList = [];
                    _this.flowInstance.files = [];
                    _this.uploadBegin = false;
                    _this.uploadingFile = true;
                    _this.$emit("fileUploadComplete", _this.uploadedFilesData);
                });
            },
            deleteImg(file) {
                this.$emit('deleteImg', file);
            }
        }
    };
</script>

<style lang="less" scoped>
    .upload-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        .upload-container {
            position: relative;
            width: 100%;
            height: 100%;
        }
        .drop-upload-area {
            position: relative;
            width: 100%;
            height: 100%;
            -webkit-border-radius: @radius;
            -moz-border-radius: @radius;
            border-radius: @radius;
            border: 1px dashed @borderColorDeep;
            -webkit-transition: all 0.3s ease-in-out;
            -moz-transition: all 0.3s ease-in-out;
            -ms-transition: all 0.3s ease-in-out;
            -o-transition: all 0.3s ease-in-out;
            transition: all 0.3s ease-in-out;
            overflow: hidden;
            .upload-btn {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                .default-text {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    font-size: 12px;
                    i {
                        font-size: 30px;
                        color: @baseColor;
                    }
                    span {
                        margin: 10px 0 0;
                        line-height: 20px;
                    }
                }
            }
            .upload-status {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 12px;
                color: @textLight;
            }
            .operation-btn {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background: rgba(0, 0, 0, 0.4);
                opacity: 0;
                z-index: -1;
                -webkit-transition: all 0.3s ease-in-out;
                -moz-transition: all 0.3s ease-in-out;
                -ms-transition: all 0.3s ease-in-out;
                -o-transition: all 0.3s ease-in-out;
                transition: all 0.3s ease-in-out;
                i {
                    font-size: 18px;
                    color: @white;
                    padding: 3px 8px;
                    -webkit-transition: all 0.3s ease-in-out;
                    -moz-transition: all 0.3s ease-in-out;
                    -ms-transition: all 0.3s ease-in-out;
                    -o-transition: all 0.3s ease-in-out;
                    transition: all 0.3s ease-in-out;
                    &.el-icon-edit:hover {
                        color: @baseColor;
                    }
                    &.el-icon-delete:hover {
                        color: @error;
                    }
                }
            }
            .uploaded-files-container {
                position: relative;
                width: 100%;
                height: 100%;
            }
            &:hover {
                cursor: pointer;
                border-color: @baseColor;
                .operation-btn {
                    opacity: 1;
                    z-index: 9;
                }
            }
        }
        
        .can-preview-upload {
            position: relative;
            width: 100%;
            height: 100%;
            .preview-upload {
                position: relative;
                width: 100%;
                height: 100%;
                min-height: 40px;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                .uploaded-files {
                    width: 100%;
                    margin: 0 0 0 12px;
                }
            }
        }
    }
</style>
