<template>
    <div class="image-preview-wrapper-mask" v-if="closeState">
        <div class="image-preview-wrapper" v-clickoutside="maskClose">
            <div class="preview-header">
                <span>{{title || '图片预览'}}</span>
                <i class="el-icon-close" @click="handlerClose"></i>
            </div>
            <div class="preview-body" :class="{'has-footer': footer}">
                <el-carousel trigger="click" autoplay :arrow="imgList.length > 1 ? 'hover' : 'never'"
                             :indicator-position="imgList.length > 1 ? '' : 'none'">
                    <el-carousel-item v-for="(item, index) in imgList" :key="index">
                        <img :src="item.url" @click="scaleFullScreen(item)"/>
                    </el-carousel-item>
                </el-carousel>
            </div>
            <div class="preview-footer" v-if="footer">
                <slot name="footer">
                    <el-button size="medium" @click.native="handlerClose" round>取消</el-button>
                    <el-button type="primary" size="medium" @click="submit" round>确定</el-button>
                </slot>
            </div>
            <!-- 全屏显示 -->
            <div class="full-screen" v-if="biggestUrl" @click="biggestUrl = ''">
                <img :src="biggestUrl"/>
            </div>
        </div>
    </div>
</template>

<script>
    /**
     * @description  图片预览
     * @props  visible: 显示或隐藏状态
     *              title: 弹出框标题，默认为 **图片预览**
     *              data: 显示数据 => 必需  可传入对象(Object)或数组(Array)，每一项中必须包含的字段为 url (即该图片的加载地址)
     *              maskClosable: 空白区域点击关闭弹窗，默认为 true
     *              footer: 是否显示底部按钮，默认为 **取消** **确定**，可通过 slot 自定义
     */
    import Clickoutside from 'element-ui/src/utils/clickoutside';
    
    export default {
        name: "imagePreview",
        directives: {Clickoutside},
        props: {
            visible: Boolean,
            title: String,
            data: {
                type: [Object, Array],
                required: true
            },
            maskClosable: {
                type: Boolean,
                default: true
            },
            footer: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                closeState: false,
                imgList: [],
                biggestUrl: ''
            };
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                this.closeState = this.visible;
                if (this.data.constructor === Array) {
                    this.imgList = this.data;
                } else {
                    this.imgList = [this.data];
                }
            },
            submit() {
                this.$emit('submit');
            },
            scaleFullScreen({url}) {
                this.biggestUrl = url;
            },
            handlerClose() {
                this.closeState = false;
                this.$emit('update:visible', false);
            },
            maskClose() {
                if (!this.maskClosable) return;
                this.closeState = false;
                this.$emit('update:visible', false);
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.closeState = val;
                    this.init();
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .image-preview-wrapper-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 4003;
        .image-preview-wrapper {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            width: 928px;
            height: 680px;
            background: @backGround;
            -webkit-border-radius: @radius;
            -moz-border-radius: @radius;
            border-radius: @radius;
            box-shadow: @boxShadow;
            overflow: hidden;
            .preview-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                height: 58px;
                padding: 0 20px;
                border-bottom: @border;
                span {
                    font-size: 16px;
                    color: @text;
                }
                i {
                    font-size: 20px;
                    color: @textLight;
                    transition: color 0.1s ease-in-out;
                    &:hover {
                        cursor: pointer;
                        color: @text;
                    }
                }
            }
            .preview-body {
                position: relative;
                width: 100%;
                height: calc(~'100% - 58px');
                padding: 20px;
                &.has-footer {
                    height: calc(~'100% - 134px');
                }
                .el-carousel {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.18);
                    /deep/ .el-carousel__container {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        img {
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
                }
            }
            .preview-footer {
                width: 100%;
                height: 76px;
                padding: 20px;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                border-top: @border;
            }
        }
        .full-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            z-index: 2009;
            > img {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                margin: auto;
                max-width: 100%;
                max-height: 100%;
            }
        }
    }
</style>
