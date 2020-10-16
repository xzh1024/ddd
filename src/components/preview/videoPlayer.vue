<template>
    <div class="video-preview-wrapper-mask" v-if="closeState">
        <div class="video-preview-wrapper" v-clickoutside="maskClose">
            <div class="preview-header">
                <span>{{title || '视频预览'}}</span>
                <i class="el-icon-close" @click="handlerClose"></i>
            </div>
            <div class="preview-body" :class="{'has-footer': footer}">
                <loading v-if="isLoading"></loading>
                <div class="video-player-container" v-show="!isLoading">
                    <video v-if="path" id="videoPlayer" :src="path"></video>
                    <div class="controls-bar" v-if="canPlay">
                        <div class="play-pause-item">
                            <i class="el-icon-video-play" title="播放" v-if="videoParams.isPaused" @click="playVideo"></i>
                            <i class="el-icon-video-pause" title="暂停" v-else @click="playVideo"></i>
                        </div>
                        <div class="played-time">{{videoParams.playedTime}}</div>
                        <div class="play-progress-bar">
                            <div class="play-progress-layout" @click="jumpClickTime">
                                <div class="played-progress" :style="{width: progressPercent}">
                                    <span @mousedown="dragProgress"></span>
                                </div>
                            </div>
                        </div>
                        <div class="total-duration">{{videoParams.totalDuration}}</div>
                        <div class="volume-item" v-clickoutside="hideVolume">
                            <i class="el-icon-microphone" v-if="hasVolume" @click="showVolumeBar"></i>
                            <i class="el-icon-turn-off-microphone" v-else @click="showVolumeBar"></i>
                            <div class="slide-volume" v-show="volumeBar">
                                <el-slider
                                    @input="changeVolume"
                                    v-model="videoParams.volume"
                                    vertical
                                    height="108px"
                                    :step="5">
                                </el-slider>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="preview-footer" v-if="footer">
                <slot name="footer">
                    <el-button size="medium" @click.native="handlerClose">取消</el-button>
                    <el-button type="primary" size="medium" @click="submit">确定</el-button>
                </slot>
            </div>
        </div>
    </div>
</template>

<script>
    import Clickoutside from 'element-ui/src/utils/clickoutside';
    
    export default {
        name: "videoPreview",
        directives: {Clickoutside},
        props: {
            visible: Boolean,
            title: String,
            path: {
                type: String,
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
                isLoading: true,
                videoNode: {},
                videoParams: {
                    isPaused: false,
                    playedTime: '00:00',
                    totalDuration: '00:00',
                    volume: 50
                },
                canPlay: false,
                volumeBar: false,
                hasVolume: true,
                progressPercent: 0,
                animationFrame: null
            };
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                window.cancelAnimationFrame(this.animationFrame);
                this.closeState = this.visible;
                if (!this.path) return;
                this.$nextTick(() => {
                    this.loadVideo();
                });
            },
            loadVideo() {
                const _this = this;
                const videoPlayer = document.getElementById('videoPlayer');
                if (!videoPlayer) return;
                videoPlayer.load();
                videoPlayer.oncanplay = function () {
                    _this.videoNode = videoPlayer;
                    _this.isLoading = false;
                    _this.canPlay = true;
                    _this.videoParams.totalDuration = _this.$Tools.switchDurationToTime(videoPlayer.duration);
                    _this.videoParams.playedTime = _this.$Tools.switchDurationToTime(videoPlayer.currentTime);
                    videoPlayer.volume = parseFloat(_this.videoParams.volume / 100);
                    if (videoPlayer.paused) {
                        videoPlayer.pause();
                    } else {
                        videoPlayer.play();
                    }
                    _this.animationFrame = setInterval(_this.playProgress, 1);
                };
            },
            playProgress() {
                const percent = this.videoNode.currentTime / this.videoNode.duration;
                this.videoParams.playedTime = this.$Tools.switchDurationToTime(this.videoNode.currentTime);
                this.progressPercent = percent * 100 + '%';
                if (this.videoNode.ended) {
                    this.videoParams.isPaused = true;
                }
                this.videoParams.isPaused = this.videoNode.paused;
            },
            playVideo() {
                this.videoParams.isPaused = !this.videoParams.isPaused;
                if (this.videoNode.paused) {
                    this.videoNode.play();
                } else {
                    this.videoNode.pause();
                }
            },
            jumpClickTime(e) {
                clearInterval(this.animationFrame);
                this.animationFrame = null;
                const bar = document.querySelector('.controls-bar .play-progress-bar');
                const rect = bar.getBoundingClientRect();
                const percent = (e.pageX - rect.left) / bar.clientWidth;
                this.videoNode.currentTime = percent * this.videoNode.duration;
                this.animationFrame = setInterval(this.playProgress, 1);
            },
            dragProgress(e) {
                const _this = this;
                e.stopPropagation();
                document.onmousemove = function(e) {
                    e.stopPropagation();
                    _this.jumpClickTime(e);
                };
                document.onmouseup = function(e) {
                    e.stopPropagation();
                    document.onmousemove = null;
                    document.onmousedown = null;
                };
            },
            showVolumeBar() {
                this.volumeBar = !this.volumeBar;
            },
            changeVolume(val) {
                this.videoParams.volume = val;
                this.videoNode.volume = parseFloat(val / 100);
                this.videoNode.muted = !!(val <= 0);
                this.hasVolume = !!val;
            },
            hideVolume() {
                this.volumeBar = false;
            },
            submit() {
                console.log('Submit');
                this.$emit('submit');
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
        },
        destroyed() {
            clearInterval(this.animationFrame);
            this.animationFrame = null;
        }
    };
</script>

<style lang="less" scoped>
    .video-preview-wrapper-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 4003;
        .video-preview-wrapper {
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
                .video-player-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.18);
                    overflow: hidden;
                    > video {
                        width: 100%;
                        height: 100%;
                    }
                    .controls-bar {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        height: 45px;
                        padding: 0 10px;
                        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.28));
                        box-shadow: 0 0 12px rgba(0, 0, 0, 1);
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        color: @white;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        .play-pause-item {
                            min-width: 35px;
                            width: 35px;
                            i {
                                font-size: 25px;
                                -webkit-transition: all 0.3s ease-in-out;
                                -moz-transition: all 0.3s ease-in-out;
                                -ms-transition: all 0.3s ease-in-out;
                                -o-transition: all 0.3s ease-in-out;
                                transition: all 0.3s ease-in-out;
                                &:hover {
                                    cursor: pointer;
                                    color: @baseColor;
                                }
                            }
                        }
                        .play-progress-bar {
                            position: relative;
                            width: 100%;
                            height: 35px;
                            margin: 0 10px;
                            display: flex;
                            align-items: center;
                            .play-progress-layout {
                                position: relative;
                                width: 100%;
                                height: 6px;
                                flex: 1;
                                background: rgba(255, 255, 255, 0.9);
                                border-radius: @radius;
                                .played-progress {
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    width: 0;
                                    height: 6px;
                                    background: @baseColor;
                                    border-radius: @radius;
                                    > span {
                                        display: block;
                                        position: absolute;
                                        width: 12px;
                                        height: 12px;
                                        top: -3px;
                                        right: -6px;
                                        background: @white;
                                        border: 2px solid @baseColor;
                                        border-radius: 50%;
                                        -webkit-transition: all 0.1s ease-in-out;
                                        -moz-transition: all 0.1s ease-in-out;
                                        -ms-transition: all 0.1s ease-in-out;
                                        -o-transition: all 0.1s ease-in-out;
                                        transition: all 0.1s ease-in-out;
                                        &:hover {
                                            transform: scale(1.2);
                                        }
                                    }
                                }
                                &:hover {
                                    cursor: pointer;
                                }
                            }
                        }
                        .volume-item {
                            position: relative;
                            min-width: 25px;
                            width: 25px;
                            height: 35px;
                            margin: 0 0 0 10px;
                            display: flex;
                            align-items: center;
                            justify-content: flex-end;
                            color: @white;
                            > i {
                                font-size: 23px;
                                -webkit-transition: all 0.3s ease-in-out;
                                -moz-transition: all 0.3s ease-in-out;
                                -ms-transition: all 0.3s ease-in-out;
                                -o-transition: all 0.3s ease-in-out;
                                transition: all 0.3s ease-in-out;
                                &:hover {
                                    cursor: pointer;
                                    color: @baseColor;
                                }
                            }
                            .slide-volume {
                                position: absolute;
                                bottom: 110%;
                                left: 0;
                                width: 25px;
                                height: 108px;
                                /deep/ .el-slider__runway {
                                    margin: 0 10px;
                                    .el-slider__button {
                                        width: 12px;
                                        height: 12px;
                                    }
                                }
                            }
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
    }
</style>
