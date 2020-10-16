<template>
    <div class="rich-text-wrapper">
        <quill-editor class="quill-editor"
                      ref="richTextEditor"
                      v-model="richContent"
                      :options="editorOption"
                      @blur="onEditorBlur($event)"
                      @focus="onEditorFocus($event)"
                      @ready="onEditorReady($event)"
                      @change="onEditorChange($event)"></quill-editor>
        <simple-upload v-show="false" :uploadId="'uploadRichTextImage'" :auth="false" :initParams="uploadParams" :previewParams="{show: true}"
                       directory="rich-text" @fileUploadSuccess="fileUploadedSuccess"
                       @fileUploadComplete="fileUploadComplete"></simple-upload>
    </div>
</template>

<script>
    /**
     * @description 富文本插件集成上传图片，粘贴，拖放等功能
     * @props content {String}
     * @returns Function @returnRichContent {Object}
     *
     */
    import SimpleUpload from "../upload/upload";
    import {Message} from 'element-ui';
    import Quill from 'quill';
    import {quillEditor} from 'vue-quill-editor';
    import 'quill/dist/quill.core.css';
    import '@assets/css/quill/quill.snow.css';
    import {ImageExtend} from '@libs/js/paste';
    import Constant from '@libs/js/constant';
    import router from '../../router';

    Quill.register('modules/ImageExtend', ImageExtend);
    const imageExtend = {
        loading: false,
        type: 'document',
        name: 'file',
        size: 5,
        action: Constant.tcuParams.prefix,
        directory: 'rich-text',
        response: (data) => {
            return data.url;
        },
        change: (xhr) => {
            xhr.setRequestHeader('token', localStorage.token);
        },
        sizeError() {
            Message.warning('图片超过限制大小(5M以内)，请检查后上传！');
        },
        limitFileExtension() {
            Message.warning('仅可粘贴或拖入图片，不支持其他类型文件！');
        },
        loginInvalid() {
            Message.warning('登录失效，请重新登录！');
            router.push('/');
        }
    };
    const toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
        // ["blockquote", "code-block"], // 引用  代码块
        [{header: 1}, {header: 2}], // 1、2 级标题
        [{list: "ordered"}, {list: "bullet"}], // 有序、无序列表
        // [{script: "sub"}, {script: "super"}], // 上标/下标
        [{indent: "-1"}, {indent: "+1"}], // 缩进
        // [{'direction': 'rtl'}],                         // 文本方向
        // [{size: ["small", false, "large", "huge"]}], // 字体大小
        [{header: [1, 2, 3, 4, 5, 6, false]}], // 标题
        [{color: []}], // 字体颜色、字体背景颜色
        [{background: []}],
        // [{font: []}], // 字体种类
        [{align: []}], // 对齐方式
        ["clean"], // 清除文本格式
        ["image"] // 图片
    ];
    const titleConfig = {
        'ql-bold': '加粗',
        'ql-color': '字体颜色',
        'ql-font': '字体',
        'ql-code': '插入代码',
        'ql-italic': '斜体',
        'ql-link': '添加链接',
        'ql-background': '背景颜色',
        'ql-size': '字体大小',
        'ql-strike': '删除线',
        'ql-script': '上标/下标',
        'ql-underline': '下划线',
        'ql-blockquote': '引用',
        'ql-header': '标题',
        'ql-indent': '缩进',
        'ql-list': '列表',
        'ql-align': '文本对齐',
        'ql-direction': '文本方向',
        'ql-code-block': '代码块',
        'ql-formula': '公式',
        'ql-image': '图片',
        'ql-video': '视频',
        'ql-clean': '清除字体样式',
        'ql-upload': '文件'
    };

    export default {
        name: "rich-text",
        components: {quillEditor, SimpleUpload},
        props: {
            content: String
        },
        data() {
            return {
                richContent: '',
                editorOption: {
                    modules: {
                        ImageExtend: imageExtend,
                        toolbar: {
                            container: toolbarOptions,
                            handlers: {
                                'image': function (value) {
                                    if (value) {
                                        document.querySelector('#uploadRichTextImageSimple input').click();
                                    } else {
                                        this.quill.format('image', false);
                                    }
                                }
                            }
                        }
                    },
                    placeholder: '请在这里填写内容',
                    readyOnly: false,
                    theme: 'snow',
                    syntax: true
                },
                uploadParams: {
                    attrs: {accept: 'image/*'}
                }
            };
        },
        methods: {
            addQuillTitle() {
                const oToolBar = document.querySelector('.ql-toolbar'),
                    aButton = oToolBar.querySelectorAll('button'),
                    aSelect = oToolBar.querySelectorAll('select');
                aButton.forEach(item => {
                    if (item.className === 'ql-script') {
                        item.value === 'sub' ? item.title = '下标' : item.title = '上标';
                    } else if (item.className === 'ql-indent') {
                        item.value === '+1' ? item.title = '向右缩进' : item.title = '向左缩进';
                    } else {
                        item.title = titleConfig[item.classList[0]];
                    }
                });
                aSelect.forEach(item => {
                    item.parentNode.title = titleConfig[item.classList[0]];
                });
                this.richContent = this.content || '';
            },
            // 失去焦点
            onEditorBlur(editor) {
            },
            // 获得焦点
            onEditorFocus(editor) {
                this.$emit('focusEditor', 'text');
            },
            // 开始
            onEditorReady(editor) {
            },
            // 值发生变化
            onEditorChange(editor) {
                this.$emit('focusEditor', 'text');
                this.richContent = editor.html;
                this.$emit('returnRichContent', editor);
            },
            fileUploadedSuccess(data) {
                let quill = this.editor;
                let length = quill.getSelection().index;
                quill.insertEmbed(length, 'image', data.url);
                quill.setSelection(length + 1);
            },
            fileUploadComplete() {
                console.log('Upload rich text complete!');
            }
        },
        computed: {
            editor() {
                return this.$refs.richTextEditor.quill;
            }
        },
        mounted() {
            this.addQuillTitle();
        }
    };
</script>

<style lang="less" scoped>
    .rich-text-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        /deep/ .quill-editor {
            position: relative;
            width: 100%;
            height: 100%;
            .ql-toolbar.ql-snow {
                border: 1px solid @borderColorDeep;
                -webkit-border-radius: @radius @radius 0 0;
                -moz-border-radius: @radius @radius 0 0;
                border-radius: @radius @radius 0 0;
                color: @textLight;
            }
            .ql-container.ql-snow {
                border: 1px solid @borderColorDeep;
                border-top: 0;
                -webkit-border-radius: 0 0 @radius @radius;
                -moz-border-radius: 0 0 @radius @radius;
                border-radius: 0 0 @radius @radius;
                overflow: hidden;
                .ql-editor {
                    height: 100%;
                    width: calc(100% + 17px);
                    &.ql-blank::before {
                        color: @textLighter;
                    }
                }
            }
        }
        /deep/ .ql-editor.ql-blank::before {
            font-style: normal;
        }
        /deep/ .simple-upload-container {
            z-index: -1;
        }
    }
</style>
