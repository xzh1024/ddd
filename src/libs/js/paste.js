import _ from '@libs/js/tc-upload';
import Tools from '@libs/js/tools';
import {Message} from 'element-ui';

/**
 *@description 观察者模式 全局监听富文本编辑器
 */
export const QuillWatch = {
    watcher: {},  // 登记编辑器信息
    active: null,  // 当前触发的编辑器
    on: function (imageExtendId, ImageExtend) {  // 登记注册使用了ImageEXtend的编辑器
        if (!this.watcher[imageExtendId]) {
            this.watcher[imageExtendId] = ImageExtend;
        }
    },
    emit: function (activeId, type = 1) {  // 事件发射触发
        this.active = this.watcher[activeId];
        if (type === 1) {
            imgHandler();
        }
    }
};

/**
 * @description 图片功能拓展： 增加上传 拖动 复制
 */
export class ImageExtend {
    /**
     * @param quill {Quill}富文本实例
     * @param config {Object} options
     * config  keys: action, headers, editForm start end error  size response
     */
    constructor(quill, config = {}) {
        this.id = Math.random();
        this.quill = quill;
        this.quill.id = this.id;
        this.config = config;
        this.file = '';  // 要上传的图片
        this.imgURL = '';  // 图片地址
        quill.root.addEventListener('paste', this.pasteHandle.bind(this), false);
        quill.root.addEventListener('drop', this.dropHandle.bind(this), false);
        quill.root.addEventListener('dropover', function (e) {
            e.preventDefault();
        }, false);
        this.cursorIndex = 0;
        QuillWatch.on(this.id, this);
    }
    
    /**
     * @description 粘贴
     * @param e
     */
    pasteHandle(e) {
        e.preventDefault();
        QuillWatch.emit(this.quill.id, 0);
        const clipboardData = e.clipboardData;
        let i = 0;
        let items, item, types;
        
        if (clipboardData) {
            items = clipboardData.items;
            
            if (!items) {
                return;
            }
            item = items[0];
            types = clipboardData.types || [];
            
            for (; i < types.length; i++) {
                if (types[i] === 'Files') {
                    item = items[i];
                    break;
                }
            }
            if (item && item.kind) {
                if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
                    this.file = item.getAsFile();
                    const self = this;
                    // 如果图片限制大小
                    if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
                        if (self.config.sizeError) {
                            self.config.sizeError();
                        }
                        return;
                    }
                    if (this.config.action) {
                        this.uploadImg();
                    } else {
                        this.toBase64();
                    }
                }
                if (item.kind === 'string') {
                    item.getAsString(string => {
                        if (string && string.trim().length > 0) {
                            QuillWatch.active.quill.insertText(QuillWatch.active.cursorIndex, string);
                            QuillWatch.active.cursorIndex = (QuillWatch.active.quill.getSelection() || {}).index || QuillWatch.active.quill.getLength();
                            QuillWatch.active.quill.setSelection(QuillWatch.active.cursorIndex + 1);
                        }
                    });
                }
            } else {
                if (this.config.limitFileExtension) {
                    this.config.limitFileExtension();
                }
            }
        }
    }
    
    /**
     * 拖拽
     * @param e
     */
    dropHandle(e) {
        QuillWatch.emit(this.quill.id, 0);
        const self = this;
        e.preventDefault();
        // 如果图片限制大小
        self.file = e.dataTransfer.files[0]; // 获取到第一个上传的文件对象
        if (self.file.type.indexOf('image') !== -1) {
            if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
                if (self.config.sizeError) {
                    self.config.sizeError();
                }
                return;
            }
            if (this.config.action) {
                self.uploadImg();
            } else {
                self.toBase64();
            }
        } else {
            if (this.config.limitFileExtension) {
                this.config.limitFileExtension();
            }
        }
    }
    
    /**
     * @description 将图片转为base4
     */
    toBase64() {
        const self = this;
        const reader = new FileReader();
        reader.onload = (e) => {
            // 返回base64
            self.imgURL = e.target.result;
            ImageExtend.insertImg();
        };
        reader.readAsDataURL(self.file);
    }
    
    /**
     * @description 上传图片到服务器
     */
    uploadImg() {
        const self = this;
        const config = self.config;
        _.Authorization({type: config.type}, (err, data) => {
            if (err && err === 'unLogin' && config.loginInvalid) {
                config.loginInvalid();
                return;
            }
            if (data) {
                const random = Tools.getRangeRandom(6, 10);
                const authority = {
                    key: `${data.path}/${config.directory}/${random}-${self.file.name}`,
                    signature: data.Authorization,
                    token: data.XCosSecurityToken
                };
                // 构造表单
                const formData = new FormData();
                // 自定义修改表单
                if (config.editForm) {
                    config.editForm(formData);
                }
                // 创建ajax请求
                const xhr = new XMLHttpRequest();
                xhr.open('post', config.action, true);
                // 如果有设置请求头
                if (config.headers) {
                    config.headers(xhr);
                }
                if (config.change) {
                    config.change(xhr);
                    formData.append('key', authority.key);
                    formData.append('signature', authority.signature);
                    formData.append('x-cos-security-token', authority.token);
                    formData.append(config.name, self.file, 'tt');
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 204) {
                            //success
                            const url = xhr.responseURL + authority.key;
                            const name = url.substring(url.lastIndexOf('/') + 1);
                            self.imgURL = config.response({url: url, name: name});
                            ImageExtend.uploadSuccess();
                            ImageExtend.insertImg();
                            if (self.config.success) {
                                self.config.success();
                            }
                        } else {
                            //error
                            if (self.config.error) {
                                self.config.error();
                            }
                            ImageExtend.uploadError();
                        }
                    }
                };
                // 开始上传数据
                xhr.upload.onloadstart = function (e) {
                    if (config.loading) {
                        ImageExtend.uploading();
                    } else {
                        const length = (self.quill.getSelection() || {}).index || self.quill.getLength();
                        QuillWatch.active.cursorIndex = length;
                    }
                    if (config.start) {
                        config.start();
                    }
                };
                // 上传过程
                xhr.upload.onprogress = function (e) {
                    const complete = (e.loaded / e.total * 100 | 0) + '%';
                    ImageExtend.progress(complete);
                };
                // 当发生网络异常的时候会触发，如果上传数据的过程还未结束
                xhr.upload.onerror = function (e) {
                    ImageExtend.uploadError();
                    if (config.error) {
                        config.error();
                    }
                };
                // 上传数据完成（成功或者失败）时会触发
                xhr.upload.onloadend = function (e) {
                    if (config.end) {
                        config.end();
                    }
                };
                xhr.send(formData);
            }
        });
    }
    
    /**
     * @description 往富文本编辑器插入图片
     */
    static insertImg() {
        const self = QuillWatch.active;
        self.quill.insertEmbed(QuillWatch.active.cursorIndex, 'image', self.imgURL);
        self.quill.update();
        self.quill.setSelection(self.cursorIndex + 1);
    }
    
    /**
     * @description 显示上传的进度
     */
    static progress(pro) {
        pro = '[' + 'uploading' + pro + ']';
        QuillWatch.active.quill.root.innerHTML = QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, pro);
    }
    
    /**
     * 开始上传
     */
    static uploading() {
        const length = (QuillWatch.active.quill.getSelection() || {}).index || QuillWatch.active.quill.getLength();
        QuillWatch.active.cursorIndex = length;
        QuillWatch.active.quill.insertText(QuillWatch.active.cursorIndex, '[uploading...]', {'color': 'red'}, true);
    }
    
    /**
     * 上传失败
     */
    static uploadError() {
        QuillWatch.active.quill.root.innerHTML = QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, '[upload error]');
    }
    
    static uploadSuccess() {
        QuillWatch.active.quill.root.innerHTML = QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, '');
    }
}

/**
 * @description 点击图片上传
 */
export function imgHandler() {
    let fileInput = document.querySelector('.quill-image-input');
    if (fileInput === null) {
        fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.classList.add('quill-image-input');
        fileInput.style.display = 'none';
        // 监听选择文件
        fileInput.addEventListener('change', function () {
            const self = QuillWatch.active;
            self.file = fileInput.files[0];
            fileInput.value = '';
            // 如果图片限制大小
            if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
                if (self.config.sizeError) {
                    self.config.sizeError();
                }
                return;
            }
            if (self.config.action) {
                self.uploadImg();
            } else {
                self.toBase64();
            }
        });
        document.body.appendChild(fileInput);
    }
    fileInput.click();
}

/**
 *@description 全部工具栏
 */
export const container = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{'header': 1}, {'header': 2}],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    [{'script': 'sub'}, {'script': 'super'}],
    [{'indent': '-1'}, {'indent': '+1'}],
    [{'direction': 'rtl'}],
    [{'size': ['small', false, 'large', 'huge']}],
    [{'header': [1, 2, 3, 4, 5, 6, false]}],
    [{'color': []}, {'background': []}],
    [{'font': []}],
    [{'align': []}],
    ['clean'],
    ['link', 'image', 'video']
];
