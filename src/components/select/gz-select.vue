<template>
    <div class="gz-select-wrap" :class="{'large': size === 'large'}" :style="{height: `${multipleHeight}px`}"
         v-clickoutside="handleClose">
        <div class="multiple-items" ref="tags" v-if="multiple" :class="{'large': size === 'large'}"
             @click="switchSelectList">
            <span v-for="(item, index) in multipleSelected" :key="index">
                <span>{{item.name}}</span>
                <i class="el-icon-circle-close" v-if="!disabled" @click.stop="deleteTag(item)"></i>
            </span>
        </div>
        <div class="gz-select-outline" @mouseenter="enterInputOutline" @mouseleave="leaveInputOutline"
             @click="switchSelectList">
            <input class="gz-input" type="text" readonly v-model="scopeValue" :style="{height: `${multipleHeight}px`}"
                   :disabled="disabled" :placeholder="placeholderText"/>
            <div class="icon-groups">
                <i class="el-icon-arrow-up" :class="{'arrow-reverse': visible}" v-show="!operateStatus"></i>
                <i class="el-icon-circle-close" v-show="operateStatus && clearable && !disabled"
                   @click.stop="clearValue"></i>
            </div>
        </div>
        <transition name="el-zoom-in-top">
            <div class="gz-select-list" v-show="visible">
                <span class="up-triangle-icon"></span>
                <div class="gz-select-options">
                    <div class="gz-search-option" v-if="search">
                        <input type="text" v-model="searchValue" @keyup="searchMethod" placeholder="请输入关键词搜索"/>
                        <i class="el-icon-search"></i>
                    </div>
                    <div class="gz-search-items" :class="{'no-search': !search}">
                        <ul :class="{'is-disabled': disabled}" v-if="!isLoading && scopeData && scopeData.length > 0">
                            <li :class="{'is-selected': item.selected}" v-for="(item, index) in scopeData" :key="index"
                                @click="chooseOption(item)">
                                <div class="option-item">
                                    <slot name="option" v-if="$slots.option"></slot>
                                    <span>{{item.name}}</span>
                                </div>
                                <i class="el-icon-check" v-show="multiple && item.selected"></i>
                            </li>
                        </ul>
                        <div class="gz-select-empty"
                             v-if="!isLoading && (!scopeData || (scopeData && scopeData.length <= 0))">
                            <p>暂无数据</p>
                        </div>
                        <div class="loading-wrap" v-if="isLoading">
                            <loading :showText="false"></loading>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    /**
     * @component-name  gz-select
     * @props  value: 绑定值, 传递已选中项的 value 字段值, 多选时以数组传入
     *              data: options 数据
     *              size: UI 大小, 值为  medium  &  large, 默认 medium
     *              placeholder: 输入提示语
     *              multiple: 是否可多选, 默认 false
     *              search: 是否可搜索, 默认 false
     *              clearable: 是否可清除已选值, 默认 false; 当值为 true 时，仅在单选（即 multiple 为 false）时生效
     *              disabled: 禁用, 默认 false
     *              isLoading: 是否在搜索时显示 loading, 仅在 search 为 true 时生效
     * @returns  change: 返回已选择的数据
     *                  remoteSearch: 返回搜索值以请求接口
     */
    import Clickoutside from 'element-ui/src/utils/clickoutside';
    import debounce from 'throttle-debounce/debounce';
    
    export default {
        name: "gz-select",
        directives: {Clickoutside},
        props: {
            isLoading: Boolean,
            value: [String, Number, Array],
            data: Array,
            size: {
                type: String,
                default: 'medium'
            },
            placeholder: {
                type: String,
                default: '请选择'
            },
            multiple: Boolean,
            search: Boolean,
            clearable: Boolean,
            disabled: Boolean
        },
        data() {
            return {
                operateStatus: false,
                visible: false,
                scopeValue: '',
                searchValue: '',
                singleSelected: {},
                multipleSelected: [],
                multipleHeight: '',
                scopeData: []
            };
        },
        watch: {
            data(value) {
                this.init();
            }
        },
        computed: {
            placeholderText() {
                return this.multiple && this.multipleSelected.length > 0 ? '' : this.placeholder;
            }
        },
        created() {
            this.searchMethod = debounce(300, () => {
                this.$emit('remoteSearch', this.searchValue);
            });
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                const _this = this;
                this.multipleHeight = this.size === 'medium' ? '36' : '40';
                this.scopeData = JSON.parse(JSON.stringify(this.data)) || [];
                this.scopeData.forEach(item => {
                    _this.$set(item, 'selected', false);
                });
                this.matchSelectedValue();
            },
            matchSelectedValue() {
                const _this = this;
                if (!this.multiple) {
                    this.scopeData.forEach(item => {
                        if (item.value === _this.value) {
                            _this.scopeValue = item.name;
                            _this.$set(item, 'selected', true);
                            _this.emitSelectedValue(item);
                        }
                    });
                } else {
                    let selectedArray = [];
                    if (this.value.constructor !== Array) {
                        selectedArray.push(this.value);
                    } else {
                        selectedArray = this.value;
                    }
                    if (!selectedArray || selectedArray.length <= 0) return;
                    selectedArray.forEach(item => {
                        _this.matchOption(item);
                    });
                    const multipleSelected = this.scopeData.filter(item => item.selected);
                    this.multipleSelected = this.multipleSelected.concat(multipleSelected);
                    const obj = {};
                    this.multipleSelected = this.multipleSelected.reduce((cur, next) => {
                        obj[next.value] ? '' : obj[next.value] = true && cur.push(next);
                        return cur;
                    }, []);
                    this.multipleSelected.forEach(item => {
                        _this.matchOption(item);
                    });
                    this.resetInputHeight();
                    this.emitSelectedValue(this.multipleSelected);
                }
            },
            matchOption(value) {
                const _this = this;
                this.scopeData.forEach(item => {
                    if (value.hasOwnProperty('value') && item.value === value.value) {
                        _this.$set(item, 'selected', true);
                    }
                    if (item.value === value) {
                        _this.$set(item, 'selected', true);
                    }
                });
            },
            chooseOption(currentOption) {
                if (this.disabled) return;
                const _this = this;
                if (!this.multiple) {
                    this.scopeData.forEach(item => {
                        _this.$set(item, 'selected', false);
                    });
                    this.$set(currentOption, 'selected', true);
                    this.singleSelected = currentOption;
                    this.scopeValue = currentOption.name;
                    this.emitSelectedValue(currentOption);
                    this.visible = false;
                } else {
                    this.$set(currentOption, 'selected', !currentOption.selected);
                    this.multipleSelected = this.scopeData.filter(item => item.selected);
                    this.emitSelectedValue(this.multipleSelected);
                    this.resetInputHeight();
                }
            },
            clearValue() {
                this.scopeValue = '';
                this.singleSelected = {};
                this.linkageSingleScopeData();
                this.emitSelectedValue(this.singleSelected);
            },
            deleteTag(currentTag) {
                this.multipleSelected.forEach((item, index, self) => {
                    if (item.value === currentTag.value) {
                        self.splice(index, 1);
                    }
                });
                this.linkageMultipleScopeData(currentTag);
                this.emitSelectedValue(this.multipleSelected);
                this.resetInputHeight();
            },
            linkageSingleScopeData() {
                this.scopeData.forEach(item => {
                    this.$set(item, 'selected', this.singleSelected.value === item.value);
                });
            },
            linkageMultipleScopeData(tag) {
                this.scopeData.forEach(item => {
                    if (item.value === tag.value) {
                        this.$set(item, 'selected', false);
                    }
                });
            },
            emitSelectedValue(data) {
                this.$emit('change', data);
            },
            resetInputHeight() {
                const _this = this;
                this.$nextTick(() => {
                    const el = _this.$refs.tags;
                    const size = _this.size === 'medium' ? '36' : '40';
                    _this.multipleHeight = el.clientHeight >= size ? el.clientHeight : '';
                });
            },
            switchSelectList() {
                if (this.disabled) return;
                this.visible = !this.visible;
            },
            enterInputOutline() {
                if (!this.clearable || this.multiple || this.disabled) return;
                this.operateStatus = !!this.scopeValue.toString();
            },
            leaveInputOutline() {
                if (!this.clearable || this.multiple || this.disabled) return;
                this.operateStatus = false;
            },
            handleClose() {
                this.visible = false;
            }
        }
    };
</script>

<style lang="less" scoped>
    .gz-select-wrap {
        position: relative;
        width: 100%;
        height: 36px;
        user-select: none;
        &.large {
            height: 40px;
        }
        .multiple-items {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: auto;
            padding: 4px 30px 4px 0;
            z-index: 2050;
            user-select: none;
            &.large {
                padding: 6px 30px 6px 0;
            }
            > span {
                display: inline-block;
                padding: 0 8px;
                height: 24px;
                line-height: 24px;
                background: @textLighter;
                border-radius: @radius;
                margin: 2px 0 2px 6px;
                user-select: none;
                > span {
                    display: inline-block;
                    white-space: nowrap;
                }
                > i {
                    position: relative;
                    margin: 0 0 0 6px;
                    color: @textLight;
                    transition: color .2s cubic-bezier(.645, .045, .355, 1);
                    &:hover {
                        cursor: pointer;
                        color: @error;
                    }
                }
            }
        }
        .gz-select-outline {
            position: relative;
            width: 100%;
            height: 100%;
            user-select: none;
            .gz-input {
                position: relative;
                width: 100%;
                height: 100%;
                border: 1px solid @borderColorDeep;
                border-radius: @radius;
                padding: 0 30px 0 15px;
                outline: none;
                color: @text;
                font-size: 14px;
                transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
                user-select: none;
                background: @backGround;
                &:hover {
                    border-color: @baseColor;
                }
                &:focus {
                    border-color: @baseColor;
                }
            }
            .icon-groups {
                position: absolute;
                height: 100%;
                top: 0;
                right: 5px;
                padding: 0 5px;
                display: flex;
                align-items: center;
                i {
                    -webkit-transform: rotateZ(180deg);
                    -moz-transform: rotateZ(180deg);
                    -ms-transform: rotateZ(180deg);
                    -o-transform: rotateZ(180deg);
                    transform: rotateZ(180deg);
                    -webkit-transition: transform 0.3s;
                    -moz-transition: transform 0.3s;
                    -ms-transition: transform 0.3s;
                    -o-transition: transform 0.3s;
                    transition: transform 0.3s;
                    font-size: 14px;
                    color: @placeholder;
                    &.arrow-reverse {
                        transform: rotateZ(0deg);
                    }
                    &.el-icon-circle-close:hover {
                        cursor: pointer;
                        color: @textLight;
                    }
                }
            }
        }
        .gz-select-list {
            position: relative;
            width: 100%;
            min-width: 150px;
            height: auto;
            margin: 12px 0 0;
            transform-origin: center top;
            z-index: 2099;
            user-select: none;
            .up-triangle-icon {
                position: absolute;
                top: -6px;
                left: 35px;
                border-width: 0 6px 6px 6px;
                border-style: solid;
                border-color: transparent transparent @borderColor;
                z-index: 2100;
                &:after {
                    content: '';
                    position: absolute;
                    top: 1px;
                    left: -6px;
                    border-width: 0 6px 6px 6px;
                    border-style: solid;
                    border-color: transparent transparent @backGround;
                    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, .03));
                }
            }
            .gz-select-options {
                position: relative;
                width: 100%;
                max-height: 288px;
                background: @backGround;
                box-shadow: @boxShadow;
                border-radius: @radius;
                border: 1px solid @borderColor;
                overflow: hidden;
                z-index: 9;
                .gz-search-option {
                    position: relative;
                    width: 100%;
                    height: 60px;
                    border-bottom: 1px solid @borderColor;
                    padding: 12px 15px;
                    display: flex;
                    align-items: center;
                    > input {
                        width: 100%;
                        height: 36px;
                        outline: none;
                        border: @border;
                        border-radius: @radius;
                        padding: 0 30px 0 15px;
                        color: @text;
                        font-size: 14px;
                        background: @backGround;
                    }
                    > i.el-icon-search {
                        position: absolute;
                        right: 25px;
                        top: 24px;
                        color: @placeholder;
                        transition: color 0.2s cubic-bezier(.645, .045, .355, 1);
                        &:hover {
                            cursor: pointer;
                            color: @textLight;
                        }
                    }
                }
                .gz-select-empty {
                    position: relative;
                    width: 100%;
                    text-align: center;
                    padding: 12px 0;
                    overflow: hidden;
                    z-index: 9;
                    > p {
                        color: @textLight;
                    }
                }
                .loading-wrap {
                    position: relative;
                    width: 100%;
                    height: 80px;
                    /deep/ .loading-item {
                        height: 76px;
                        .el-icon-loading {
                            font-size: 32px;
                        }
                    }
                }
                .gz-search-items {
                    position: relative;
                    width: 100%;
                    max-height: 226px;
                    overflow-y: auto;
                    &.no-search {
                        max-height: 288px;
                    }
                    ul {
                        padding: 6px 0 !important;
                        &.is-disabled {
                            background: @backGroundLight;
                            cursor: not-allowed;
                            > li:hover {
                                cursor: not-allowed;
                            }
                        }
                        li {
                            line-height: 36px;
                            padding: 0 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            transition: all 0.2s cubic-bezier(.645, .045, .355, 1);
                            .option-item {
                                display: flex;
                                justify-content: flex-start;
                                align-items: center;
                            }
                            span {
                                color: @text;
                                font-size: 14px;
                            }
                            i {
                                font-size: 13px;
                                font-weight: bold;
                                color: @baseColor;
                            }
                            &:hover {
                                cursor: pointer;
                                background: @backGroundHover;
                            }
                            &.is-selected {
                                span {
                                    color: @baseColor;
                                    font-weight: bold;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>
