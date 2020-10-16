<template>
    <div class="gantt-box">
        <div class="view-box">
            <div class="drag-box" :style="{minWidth:minWidth+'px',width:dateTime.length * cellWidth +'px',transform:'translateX('+(translateX)+'px)'}" @mousedown="dragMoveFun">
                    <ul>
                        <li v-for="item in dateTime" :class="[{'today':item.today},{'weekDay':item.weeks === 6 || item.weeks === 0}]">
                            <p>
                                <span v-if="item.weekNumShow">{{item.weekNum}}周</span>
                                <span v-if="item.monthShow">{{item.m}}月</span>
                            </p>
                            <p>{{coverWeek(item.weeks)}}</p>
                            <p>{{item.m}}/{{item.d}}</p>
                        </li>
                    </ul>
                    <div class="canvas-view" ref="fixedWrap" @scroll="scroll($event)" :style="{minWidth:minWidth+'px'}">
                        <canvas id="canvas">您的浏览器不支持Canvas,请升级浏览器！</canvas>
                        <div id="task-info-box" v-show="taskInfoObj.flag">
                            <p>任务信息</p>
                            <ul>
                                <li>
                                    <span>名称：</span>
                                    <span class="task-name">{{taskInfoObj.info.name}}</span>
                                </li>
                                <li>
                                    <span>制作人：</span>
                                    <span>{{taskInfoObj.info.cp_admin_name}}</span>
                                </li>
                                <li>
                                    <span>开始：</span>
                                    <span>{{taskInfoObj.info.firstTime}}</span>
                                </li>
                                <li>
                                    <span>结束：</span>
                                    <span>{{taskInfoObj.info.lastTime}}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "week",
        props: {
            data: {
                type: Array,
                required: true,
                default: []
            },
            scrollY: {
                type: Number,
                required: true,
                default: 0
            },
            dateTime: {
                type: Array,
                required: true,
                default: []
            }
        },
        watch: {
            scrollY(top) {
                this.scrollTop = top;
                this.$refs.fixedWrap.scrollTop = top;
            }
        },
        data() {
            return {
                coverTaskArr: [],
                cellWidth: 55,
                cellHeight: 20,
                cellRadius: 2,
                lineHeight: 50,
                advanceColor: '#66BB6A',
                delayColor: '#EF5B58',
                stopColor: '#FFA726',
                underwayColor:'rgba(0, 168, 255, 0.4)',
                notStartedColor: '#9E9E9E',
                backGroundLight: '#2C2F30',
                borderColor:'#3B3F41',
                todayColor:'#4E7E96',
                bezierColor:'#979797',
                translateX: 0,
                scrollTop: 0,
                canvasWidth: 0,
                canvasHeight: 0,
                taskInfoObj: {
                    flag: false,
                    info: {
                        name: null,
                        member: null,
                        firstTime: null,
                        lastTime: null
                    }
                },
                minWidth:0
            };
        },
        methods: {
            init() {
                //初始化开始组装数据
                var _this = this;
                var view = document.querySelector('.view-box');
                this.minWidth = view.offsetWidth;
                this.coverTaskArr = [];
                this.coverTaskData(this.data).then((data) => {
                    this.calcTaskCoordinate(data).then((dataArr) => {
                        if (dataArr.length > 0) {
                            dataArr.forEach(function (item, index) {
                                item.startY = index * ((_this.lineHeight - _this.cellHeight) / 2 + _this.cellHeight) + (_this.lineHeight - _this.cellHeight) / 2 + (index * (_this.lineHeight - _this.cellHeight) / 2);
                                item.endY = _this.cellHeight;
                                //计算任务的开始，结束坐标
                                _this.calcAdvanceOrDelay(item);
                            });
                        }
                        this.$nextTick(function () {
                            _this.initCanvas(dataArr);
                        });
                    });
                });
            },
            initCanvas(dataArr) {
                //初始化canvas 计算canvas宽高
                var canvasView = document.querySelector('.canvas-view');
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                this.canvasWidth = this.dateTime.length * this.cellWidth >= this.minWidth ? this.dateTime.length * this.cellWidth : this.minWidth;
                this.canvasHeight = dataArr.length <= 10 ? canvasView.offsetHeight : dataArr.length * this.lineHeight+1;
                canvas.height = this.canvasHeight;
                canvas.width = this.canvasWidth;
                this.$nextTick(function () {
                    this.drawTable(ctx, dataArr);
                    this.draw(ctx, dataArr);
                });
            },
            getElementPos(el, e) {
                //获取鼠标在元素上的坐标
                var rect = el.getBoundingClientRect();
                return {
                    x: (e.clientX - rect.left),
                    y: (e.clientY - rect.top)
                };
            },
            drawTable(ctx, dataArr) {
                //画格子
                let dateTime = this.dateTime;
                let dateArrLength = dateTime.length;
                let taskArrLength = dataArr.length;
                let _this = this;
                if (dateArrLength > 0) {
                    //竖线
                    for (let i = 0; i < dateArrLength; i++) {
                        ctx.save();
                        ctx.beginPath();
                        //画周末
                        if (dateTime[i].weeks === 6 || dateTime[i].weeks === 0) {
                            ctx.fillStyle = '#272A2B';
                            ctx.fillRect(i * _this.cellWidth, 0, _this.cellWidth, _this.canvasHeight);
                        }
                        //画竖线
                        // let X = i * _this.cellWidth - .5;
                        // ctx.moveTo(X, 0);
                        // ctx.lineTo(X, _this.canvasHeight);
                        // ctx.lineWidth = 1;
                        // ctx.strokeStyle = this.borderColor;
                        // ctx.stroke();
                    }


                    //横线
                    // for (let i = 0; i < taskArrLength + 1; i++) {
                    //     let Y = i * _this.lineHeight + .5;
                    //     ctx.save();
                    //     ctx.beginPath();
                    //     ctx.moveTo(0, Y);
                    //     ctx.lineTo(_this.canvasWidth, Y);
                    //     ctx.lineWidth = 1;
                    //     ctx.strokeStyle = this.borderColor;
                    //     ctx.stroke();
                    // }
                }
            },
            draw(ctx, dataArr) {
                var _this = this;
                if (dataArr && dataArr.length > 0) {
                    dataArr.forEach(function (item) {
                        var radius = _this.cellRadius;
                        if (item.nextTask) {
                            //画折线
                            _this.drawBrokenLine(ctx, item);
                        }
                        //画任务
                        if(item.status === 103 || item.status === 202 || item.status === 205 || item.status === 106){
                            _this.drawRoundedRect(ctx, item.startX, item.startY, item.endX, item.endY, radius, item.background, true, true);
                        }else if(item.status === 201 || item.status === 102){
                            _this.drawRoundedRect(ctx, item.startX, item.startY, item.endX, item.endY, radius, item.background, false, true);
                        }else {
                            _this.drawRoundedRect(ctx, item.startX, item.startY, item.endX, item.endY, radius, item.background, true, false);
                        }

                        //画提前和延期
                        // ctx.globalCompositeOperation="copy";
                        _this.drawAdvanceOrDelay(ctx, item);
                    });
                    this.$nextTick(function () {
                        this.canvasMouse(ctx);
                    });
                }
                //画今天
                this.drawToDay(ctx, dataArr);
            },
            scroll(e) {
                //滚动监听
                if (this.scrollTop !== e.target.scrollTop) {
                    // console.log('纵向');
                    this.scrollTop = e.target.scrollTop;
                    this.$emit('scrollTop', this.scrollTop);
                }
            },
            canvasMouse(ctx) {
                //判断鼠标坐标是否在任务上

                let canvas = ctx.canvas;
                let _this = this;
                let tempObj = {
                    flag: false,
                    startX: 0,
                    endX: 0,
                    startY: 0,
                    endY: 0,
                    info: null
                };

                canvas.addEventListener('mousemove', function (event) {
                    if (event) {
                        //根据鼠标坐标查找行号，根据行号确定任务，不用循环数组，大大节省开销
                        let taskArr = _this.coverTaskArr;
                        let mouse = _this.getElementPos(canvas, event);
                        let lineNumber = Math.floor(mouse.y / _this.lineHeight);
                        let currentTask = taskArr[lineNumber];
                        if (currentTask) {
                            let startX = currentTask.startX;
                            let endX = currentTask.endX;
                            let startY = currentTask.startY;
                            let endY = currentTask.endY;
                            if (!tempObj.flag) {
                                //找到任务后，不在继续比对，节省开销
                                if ((mouse.x >= startX) && (mouse.x <= startX + endX) && (mouse.y >= startY) && (mouse.y <= startY + endY)) {
                                    tempObj = {
                                        flag: true,
                                        startX: startX,
                                        endX: startX + endX,
                                        startY: startY,
                                        endY: startY + endY,
                                        info: currentTask
                                    };
                                }
                            } else {
                                if (mouse.x < tempObj.startX || mouse.x > tempObj.endX || mouse.y < tempObj.startY || mouse.y > tempObj.endY) {
                                    //鼠标已移出任务
                                    canvas.style.cursor = 'move';
                                    tempObj = {
                                        flag: false,
                                        startX: 0,
                                        endX: 0,
                                        startY: 0,
                                        endY: 0,
                                        info: null
                                    };
                                    _this.taskInfoObj = {
                                        flag: false,
                                        info: {
                                            id: null,
                                            name: null,
                                            member: null,
                                            firstTime: null,
                                            lastTime: null
                                        }
                                    };
                                } else {
                                    //在任务坐标内移动
                                    canvas.style.cursor = 'pointer';
                                    var margin = 30;
                                    var view = document.querySelector('.view-box');
                                    var viewWidth = view.offsetWidth;
                                    let el = document.querySelector('#task-info-box');
                                    var elWidth = el.offsetWidth + margin;
                                    var elHeight = el.offsetHeight + margin;
                                    var canvasView = document.querySelector('.canvas-view');
                                    var canvasViewHeight = canvasView.offsetHeight;
                                    var left, top;
                                    if (mouse.x + _this.translateX + elWidth + margin >= viewWidth) {
                                        left = viewWidth - elWidth - _this.translateX;
                                    } else {
                                        left = mouse.x + margin;
                                    }

                                    if (mouse.y + elHeight > canvasViewHeight + _this.scrollTop) {
                                        top = mouse.y - elHeight;
                                    } else {
                                        top = mouse.y + margin;
                                    }

                                    el.style.left = left + 'px';
                                    el.style.top = top + 'px';


                                    _this.$nextTick(function () {
                                        _this.taskInfoObj = {
                                            flag: true,
                                            info: tempObj.info
                                        };
                                        //点击获取当前任务信息
                                        canvas.onclick = function (ev) {
                                            if (tempObj.info) {
                                                _this.$emit('selectRow', Number(tempObj.info.uuid));
                                                // console.log(tempObj.info.name);
                                                // console.log(tempObj.info.uuid)
                                            }
                                        };
                                    });
                                }
                            }
                        }
                    }
                }, false);
                canvas.addEventListener('mouseout', function () {
                    _this.taskInfoObj = {
                        flag: false,
                        info: {
                            id: null,
                            name: null,
                            member: null,
                            firstTime: null,
                            lastTime: null
                        }
                    };
                }, false);
            },
            findStartIndex(startTime) {
                //查找任务开始位置
                var dateTime = this.dateTime;
                var startIndex = 0;
                if (dateTime && dateTime.length > 0) {
                    dateTime.forEach(function (item, index) {
                        if (Number(startTime) >= Number(item.begin)) {
                            startIndex = index;
                        }
                    });
                }
                return startIndex;
            },
            coverTaskData(taskData) {
                //封装数据
                var _this = this;
                return new Promise(function (reslove, reject) {
                    if (taskData && taskData.length > 0) {
                        taskData.forEach(function (item, index, arr) {
                            item.background = _this.coverBackground(item.status);
                            if ('children' in item) {
                                if (item.children && item.children.length > 0) {
                                    _this.coverTaskData(item.children);
                                }
                            } else {
                                var nextTask = arr[index + 1] ? arr[index + 1] : null;
                                nextTask = JSON.parse(JSON.stringify(nextTask));
                                item.nextTask = nextTask;
                            }
                        });
                    }
                    reslove(taskData);
                });
            },
            calcTaskCoordinate(dataArr) {
                //数据转换为数组
                let _this = this;
                return new Promise(function (reslove, reject) {
                    if (dataArr && dataArr.length > 0) {
                        dataArr.forEach(function (item) {
                            let tempsObj = {
                                schedule_start_time: item.schedule_start_time, //排期开始时间格式
                                schedule_end_time: item.schedule_end_time, //排期结束时间格式
                                schedule_start_time_unix: _this.coverDateTime(item.schedule_start_time_unix, 'start'),  //排期开始时间戳
                                schedule_end_time_unix: _this.coverDateTime(item.schedule_end_time_unix, 'end'),  //排期结束时间戳
                                start_time: item.start_time, //实际开始时间格式
                                end_time: item.end_time, //实际结束时间格式
                                start_time_unix: _this.coverDateTime(item.start_time_unix, 'start'),  //实际开始时间
                                end_time_unix: _this.coverDateTime(item.end_time_unix, 'end'),//实际结束时间

                                uuid: item.uuid,
                                cp_admin_name: item.cp_admin_name,
                                cp_admin_id: item.cp_admin_id,
                                create_user: item.create_user,
                                create_user_name: item.create_user_name,
                                cp_name: item.cp_name,
                                cp_id: item.cp_id,
                                name: item.name,
                                status: item.status,
                                background: item.background,
                            };
                            if ('children' in item) {
                                tempsObj.flag = item.flag;
                                _this.coverTaskArr.push(tempsObj);
                                if (item.flag) {
                                    _this.calcTaskCoordinate(item.children);
                                }
                            } else {
                                if (item.nextTask) {
                                    tempsObj.nextTask = item.nextTask;
                                }
                                _this.coverTaskArr.push(tempsObj);
                            }
                        });
                    }
                    reslove(_this.coverTaskArr);
                });
            },
            calcAdvanceOrDelay(item) {
                //计算任务开始、结束,提前、延期坐标
                let _this = this;
                let advanceStartDay = 0;//提前开始了几天
                let advanceEndDay = 0;//提前结束了几天
                let delayStartDay = 0; //延期开始了几天
                let delayEndDay = 0; //延期结束了几天
                let dateTime = this.dateTime;
                let dateLength = this.dateTime.length;
                let firstDate = dateTime[0].begin; //当前时间段第一个时间
                let lastDate = dateTime[dateLength - 1].end;//当前时间段最后一个时间
                if(Number(item.start_time_unix) <= Number(item.schedule_start_time_unix) && Number(item.end_time_unix) <= Number(item.schedule_start_time_unix)){
                    //实际开始时间小于排期开始时间
                    //实际结束时间小于排期开始时间
                    item.startX = _this.findStartIndex(item.start_time_unix) * _this.cellWidth;
                    item.endX = Math.ceil((((Number(item.end_time_unix) - Number(item.start_time_unix)) / 86400)) * _this.cellWidth);
                    item.stageType = 0;
                    item.stageTypeStr = '实际开始时间,实际结束时间,都小于排期开始时间';
                    item.firstTime = _this.coverDateTime(item.start_time_unix,'dateTime');
                    item.lastTime = _this.coverDateTime(item.end_time_unix,'dateTime');
                }else if (Number(item.start_time_unix) < Number(item.schedule_start_time_unix) && Number(item.end_time_unix) < Number(item.schedule_end_time_unix)) {
                    //提前开始,提前结束
                    if (Number(item.start_time_unix) > lastDate && Number(item.schedule_end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.schedule_end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    } else if (Number(item.start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - firstDate) / 86400;
                        advanceEndDay = (Number(item.schedule_end_time_unix) - Number(item.end_time_unix)) / 86400;
                    } else if (Number(item.start_time_unix) >= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.start_time_unix)) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - Number(item.start_time_unix)) / 86400;
                        advanceEndDay = (lastDate - Number(item.end_time_unix)) / 86400;
                    } else if (Number(item.start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //头超 尾超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - firstDate) / 86400;
                        advanceEndDay = (lastDate - Number(item.end_time_unix)) / 86400;
                    } else {
                        //都不超
                        item.startX = _this.findStartIndex(item.start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - Number(item.start_time_unix)) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - Number(item.start_time_unix)) / 86400;
                        advanceEndDay = (Number(item.schedule_end_time_unix) - Number(item.end_time_unix)) / 86400;
                    }

                    item.advanceStartX = advanceStartDay * _this.cellWidth;
                    item.advanceEndX = advanceEndDay * _this.cellWidth;
                    item.stageType = 1;
                    item.stageTypeStr = '提前开始,提前结束';
                    item.firstTime = _this.coverDateTime(item.start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.schedule_end_time_unix, 'dateTime');
                    // console.log(item);
                    // console.log('提前开始:'+advanceStartDay);
                    // console.log('提前结束:'+advanceEndDay);
                } else if (Number(item.start_time_unix) < Number(item.schedule_start_time_unix) && Number(item.end_time_unix) > Number(item.schedule_end_time_unix)) {
                    //提前开始,延期结束
                    if (Number(item.start_time_unix) > lastDate && Number(item.end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    } else if (Number(item.start_time_unix) <= firstDate && Number(item.end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - firstDate) / 86400;
                        delayEndDay = (Number(item.end_time_unix) - Number(item.schedule_end_time_unix)) / 86400;
                    } else if (Number(item.start_time_unix) >= firstDate && Number(item.end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.start_time_unix)) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - Number(item.start_time_unix)) / 86400;
                        delayEndDay = (lastDate - Number(item.schedule_end_time_unix)) / 86400;
                    } else if (Number(item.start_time_unix) <= firstDate && Number(item.end_time_unix) >= lastDate) {
                        //头超 尾超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - firstDate) / 86400;
                        delayEndDay = (lastDate - Number(item.schedule_end_time_unix)) / 86400;
                    } else {
                        //都超
                        item.startX = _this.findStartIndex(item.start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.end_time_unix) - Number(item.start_time_unix)) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - Number(item.start_time_unix)) / 86400;
                        delayEndDay = (Number(item.end_time_unix) - Number(item.schedule_end_time_unix)) / 86400;
                    }

                    item.advanceStartX = advanceStartDay * _this.cellWidth;
                    item.delayEndX = delayEndDay * _this.cellWidth;
                    item.stageType = 2;
                    item.stageTypeStr = '提前开始,延期结束';
                    item.firstTime = _this.coverDateTime(item.start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.end_time_unix, 'dateTime');
                    // console.log(item);
                    // console.log('提前开始:'+advanceStartDay);
                    // console.log('延期结束:'+delayEndDay);
                } else if (Number(item.start_time_unix) < Number(item.schedule_start_time_unix) && Number(item.end_time_unix) === Number(item.schedule_end_time_unix)) {
                    //提前开始，正常结束
                    if (Number(item.start_time_unix) > lastDate && Number(item.schedule_end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.schedule_end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    } else if (Number(item.start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - firstDate) / 86400;
                    } else if (Number(item.start_time_unix) >= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.start_time_unix)) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - Number(item.start_time_unix)) / 86400;
                    } else if (Number(item.start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //头超 尾超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - firstDate) / 86400;
                    } else {
                        //都不超
                        item.startX = _this.findStartIndex(item.start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - Number(item.start_time_unix)) / 86400)) * _this.cellWidth);
                        advanceStartDay = (Number(item.schedule_start_time_unix) - Number(item.start_time_unix)) / 86400;
                    }

                    item.advanceStartX = advanceStartDay * _this.cellWidth;
                    item.stageType = 3;
                    item.stageTypeStr = '提前开始,正常结束';
                    item.firstTime = _this.coverDateTime(item.start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.schedule_end_time_unix, 'dateTime');
                    // console.log(item);
                    // console.log('提前开始:'+advanceStartDay);
                } else if (Number(item.start_time_unix) > Number(item.schedule_start_time_unix) && Number(item.end_time_unix) > Number(item.schedule_end_time_unix)) {
                    //延期开始,延期结束
                    if (Number(item.schedule_start_time_unix) > lastDate && Number(item.end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.schedule_start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - firstDate) / 86400;
                        delayEndDay = (Number(item.end_time_unix) - Number(item.schedule_end_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) >= firstDate && Number(item.end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - Number(item.schedule_start_time_unix)) / 86400;
                        delayEndDay = (lastDate - Number(item.schedule_end_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.end_time_unix) >= lastDate) {
                        //头超 尾超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - firstDate) / 86400;
                        delayEndDay = (lastDate - Number(item.schedule_end_time_unix)) / 86400;
                    } else {
                        //都不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.end_time_unix) - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - Number(item.schedule_start_time_unix)) / 86400;
                        delayEndDay = (Number(item.end_time_unix) - Number(item.schedule_end_time_unix)) / 86400;
                    }

                    item.delayStartX = delayStartDay * _this.cellWidth;
                    item.delayEndX = delayEndDay * _this.cellWidth;
                    item.stageType = 4;
                    item.stageTypeStr = '延期开始,延期结束';
                    item.firstTime = _this.coverDateTime(item.schedule_start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.end_time_unix, 'dateTime');
                    // console.log(item);
                    // console.log('延期开始:'+delayStartDay);
                    // console.log('延期结束:'+delayEndDay);

                } else if (Number(item.start_time_unix) > Number(item.schedule_start_time_unix) && Number(item.end_time_unix) < Number(item.schedule_end_time_unix)) {
                    //延期开始,提前结束
                    if (Number(item.schedule_start_time_unix) > lastDate && Number(item.schedule_end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.schedule_start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.schedule_end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - firstDate) / 86400;
                        advanceEndDay = (Number(item.schedule_end_time_unix) - Number(item.end_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) >= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - Number(item.schedule_start_time_unix)) / 86400;
                        advanceEndDay = (lastDate - Number(item.end_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //头超 尾超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - firstDate) / 86400;
                        advanceEndDay = (lastDate - Number(item.end_time_unix)) / 86400;
                    } else {
                        //都超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - Number(item.schedule_start_time_unix)) / 86400;
                        advanceEndDay = (Number(item.schedule_end_time_unix) - Number(item.end_time_unix)) / 86400;
                    }

                    item.delayStartX = delayStartDay * _this.cellWidth;
                    item.advanceEndX = advanceEndDay * _this.cellWidth;
                    item.stageType = 5;
                    item.stageTypeStr = '延期开始,提前结束';
                    item.firstTime = _this.coverDateTime(item.schedule_start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.schedule_end_time_unix, 'dateTime');
                    // console.log(item);
                    // console.log('延期开始:'+delayStartDay);
                    // console.log('提前结束:'+advanceEndDay);
                } else if (Number(item.start_time_unix) > Number(item.schedule_start_time_unix) && Number(item.end_time_unix) === Number(item.schedule_end_time_unix)) {
                    //延期开始，正常结束
                    if (Number(item.schedule_start_time_unix) > lastDate && Number(item.schedule_end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.schedule_start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.schedule_end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    }else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - firstDate) / 86400;
                    } else if (Number(item.schedule_start_time_unix) >= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - Number(item.schedule_start_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //头超 尾超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - firstDate) / 86400;
                    } else {
                        //都不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        delayStartDay = (Number(item.start_time_unix) - Number(item.schedule_start_time_unix)) / 86400;
                    }

                    item.delayStartX = delayStartDay * _this.cellWidth;
                    item.stageType = 6;
                    item.stageTypeStr = '延期开始，正常结束';
                    item.firstTime = _this.coverDateTime(item.schedule_start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.schedule_end_time_unix, 'dateTime');
                    // console.log(item);
                    // console.log('延期开始:'+delayStartDay);
                } else if (Number(item.start_time_unix) === Number(item.schedule_start_time_unix) && Number(item.end_time_unix) < Number(item.schedule_end_time_unix)) {
                    //正常开始，提前结束
                    if (Number(item.schedule_start_time_unix) > lastDate && Number(item.schedule_end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.schedule_start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.schedule_end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    }else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                        advanceEndDay = (Number(item.schedule_end_time_unix) - Number(item.end_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) >= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        advanceEndDay = (lastDate - Number(item.end_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //头超 尾超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                        advanceEndDay = (lastDate - Number(item.end_time_unix)) / 86400;
                    } else {
                        //都不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        advanceEndDay = (Number(item.schedule_end_time_unix) - Number(item.end_time_unix)) / 86400;
                    }
                    // if(item.status === 203 || item.status === 104){
                    //     item.advanceEndX = 0;
                    // }else {
                        item.advanceEndX = advanceEndDay * _this.cellWidth;
                    // }

                    item.stageType = 7;
                    item.stageTypeStr = '正常开始，提前结束';
                    item.firstTime = _this.coverDateTime(item.schedule_start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.schedule_end_time_unix, 'dateTime');
                    // console.log(item);
                    // console.log('提前结束:'+advanceEndDay);
                } else if (Number(item.start_time_unix) === Number(item.schedule_start_time_unix) && Number(item.end_time_unix) > Number(item.schedule_end_time_unix)) {
                    //正常开始，延期结束
                    if (Number(item.schedule_start_time_unix) > lastDate && Number(item.end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.schedule_start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    }else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                        delayEndDay = (Number(item.end_time_unix) - Number(item.schedule_end_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) >= firstDate && Number(item.end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        delayEndDay = (lastDate - Number(item.schedule_end_time_unix)) / 86400;
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.end_time_unix) >= lastDate) {
                        //头超 尾超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                        delayEndDay = (lastDate - Number(item.schedule_end_time_unix)) / 86400;
                    } else {
                        //都不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.end_time_unix) - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                        delayEndDay = (Number(item.end_time_unix) - Number(item.schedule_end_time_unix)) / 86400;
                    }

                    item.delayEndX = delayEndDay * _this.cellWidth;
                    item.stageType = 8;
                    item.stageTypeStr = '正常开始，延期结束';
                    item.firstTime = _this.coverDateTime(item.schedule_start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.end_time_unix, 'dateTime');
                    // console.log(item);
                    // console.log('延期结束:'+delayEndDay);
                } else if (Number(item.start_time_unix) === Number(item.schedule_start_time_unix) && Number(item.end_time_unix) === Number(item.schedule_end_time_unix)) {
                    //正常开始，正常结束
                    if (Number(item.schedule_start_time_unix) > lastDate && Number(item.schedule_end_time_unix) > lastDate) {
                        //头尾都在最后时间外
                        let exceededStartDay = Math.ceil((Number(item.schedule_start_time_unix) - lastDate) / 86400);
                        let exceededEndDay = Math.ceil((Number(item.schedule_end_time_unix) - lastDate) / 86400);
                        item.startX = (_this.findStartIndex(lastDate) + exceededStartDay) * _this.cellWidth;
                        item.endX = (_this.findStartIndex(lastDate) + exceededEndDay) * _this.cellWidth;
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) <= lastDate) {
                        //头超 尾不超
                        item.startX = 0;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - firstDate) / 86400)) * _this.cellWidth);
                    } else if (Number(item.schedule_start_time_unix) >= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //尾超 头不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((lastDate - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                    } else if (Number(item.schedule_start_time_unix) <= firstDate && Number(item.schedule_end_time_unix) >= lastDate) {
                        //头尾都超
                        item.startX = 0;
                        item.endX = Math.ceil((((lastDate - firstDate) / 86400)) * _this.cellWidth);
                    } else {
                        //都不超
                        item.startX = _this.findStartIndex(item.schedule_start_time_unix) * _this.cellWidth;
                        item.endX = Math.ceil((((Number(item.schedule_end_time_unix) - Number(item.schedule_start_time_unix)) / 86400)) * _this.cellWidth);
                    }
                    item.stageType = 9;
                    item.stageTypeStr = '正常开始，正常结束';
                    item.firstTime = _this.coverDateTime(item.schedule_start_time_unix, 'dateTime');
                    item.lastTime = _this.coverDateTime(item.schedule_end_time_unix, 'dateTime');
                }
                if (item.nextTask) {
                    this.calcAdvanceOrDelay(item.nextTask);
                }
                return item;
            },
            coverBackground(status) {
                //根据状态渲染任务颜色
                var background = null;
                switch (status) {
                    case 103:
                    case 106:
                    case 107:
                    case 206:
                    case 202:
                    case 205:
                        background = this.underwayColor;
                        break;
                    case 209:
                    case 208:
                    case 109:
                    case 110:
                        background = this.advanceColor;
                        break;
                    case 203:
                    case 104:
                        background = this.stopColor;
                        break;
                    case 108:
                    case 207:
                        background = this.todayColor;
                        break;
                    default:
                        background = this.notStartedColor;
                        break;
                }
                return background;
            },
            coverDateTime(date, type) {
                //转换任务时间 方便比对
                if (date) {
                    var newDate = new Date(date * 1000);
                    var dateTime = null;
                    if (type === 'start') {
                        dateTime = newDate.setHours(0, 0, 0) / 1000;
                    } else if (type === 'end') {
                        dateTime = newDate.setHours(23, 59, 59) / 1000;
                    } else if (type === 'dateTime') {
                        let taskDate = new Date(date * 1000);
                        let year = taskDate.getFullYear();
                        let month = taskDate.getMonth() + 1 >= 10 ? taskDate.getMonth() + 1 : '0' + (taskDate.getMonth() + 1);
                        let day = taskDate.getDate() >= 10 ? taskDate.getDate() : '0' + taskDate.getDate();
                        dateTime = year + '/' + month + '/' + day;
                    }
                    return dateTime;
                }
            },
            drawRoundedRect(ctx, x, y, width, height, r, background, fill, stroke) {
                // ctx.globalCompositeOperation="destination-over";
                //画圆角矩形
                ctx.save();
                ctx.beginPath(); // draw top and top right corner
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + width, y, x + width, y + r, r); // draw right side and bottom right corner
                ctx.arcTo(x + width, y + height, x + width - r, y + height, r); // draw bottom and bottom left corner
                ctx.arcTo(x, y + height, x, y + height - r, r); // draw left and top left corner
                ctx.arcTo(x, y, x + r, y, r);
                if (fill) {
                    ctx.fillStyle = background;
                    ctx.fill();
                }
                if (stroke) {
                    ctx.strokeStyle = background;
                    ctx.stroke();
                }
                ctx.restore();
            },
            drawAdvanceOrDelay(ctx, item) {
                //画提前和延期
                if (item) {
                    var radius = this.cellRadius;
                    if (item.stageType === 1) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.advanceStartX, item.endY, radius, this.advanceColor, true, false);
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.advanceEndX, item.startY, item.advanceEndX, item.endY, radius, this.advanceColor, true, false);
                    } else if (item.stageType === 2) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.advanceStartX, item.endY, radius, this.advanceColor, true, false);
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.delayEndX, item.startY, item.delayEndX, item.endY, radius, this.delayColor, true, false);
                    } else if (item.stageType === 3) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.advanceStartX, item.endY, radius, this.advanceColor, true, false);
                    } else if (item.stageType === 4) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.delayStartX, item.endY, radius, this.delayColor, true, false);
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.delayEndX, item.startY, item.delayEndX, item.endY, radius, this.delayColor, true, false);
                    } else if (item.stageType === 5) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.delayStartX, item.endY, radius, this.delayColor, true, false);
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.advanceEndX, item.startY, item.advanceEndX, item.endY, radius, this.advanceColor, true, false);
                    } else if (item.stageType === 6) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.delayStartX, item.endY, radius, this.delayColor, true, false);
                    } else if (item.stageType === 7) {
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.advanceEndX, item.startY, item.advanceEndX, item.endY, radius, this.advanceColor, true, false);
                    } else if (item.stageType === 8) {
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.delayEndX, item.startY, item.delayEndX, item.endY, radius, this.delayColor, true, false);
                    }
                }
            },
            drawBrokenLine(ctx, item) {
                //画节点折线
                var X = item.startX + (item.endX / 2);
                var Y = item.startY + item.endY + this.lineHeight - (item.endY / 2);
                var endX = item.nextTask.startX - 10;
                //画曲线
                // ctx.beginPath();
                // ctx.lineWidth=1;
                // ctx.lineCap="round";
                // ctx.lineJoin="round";
                // ctx.strokeStyle = '#5c90d4';
                // ctx.moveTo(item.startX + (item.endX / 2), item.startY + item.endY);
                // ctx.lineTo(item.startX + (item.endX / 2),Y);
                // ctx.lineTo(endX,Y);
                // ctx.stroke();
                //贝塞尔画
                ctx.beginPath();
                ctx.moveTo(item.startX + (item.endX / 2), item.startY + item.endY);
                ctx.strokeStyle = this.bezierColor;
                ctx.bezierCurveTo(X, Y, X, Y, endX, Y);
                ctx.stroke();

                //画三角
                ctx.beginPath();
                ctx.moveTo(endX, Y - 5);
                ctx.lineTo(endX + 5, Y);
                ctx.lineTo(endX, Y + 5);
                ctx.fillStyle = this.bezierColor;
                ctx.fill();
            },
            dragMoveFun(event) {
                //左右拖动
                var _this = this;
                var parentW = document.querySelector('.view-box').offsetWidth;
                var el = document.querySelector('.drag-box');
                var startX = this.getElementPos(el, event).x;
                var endX = 0;
                var moveX = 0;
                var moveFun = function (e) {
                    if (_this.canvasWidth > parentW) {
                        endX = _this.getElementPos(el, e).x;
                        moveX = endX - startX + _this.translateX;
                        if (moveX >= 0) {
                            // console.log('left');
                            moveX = 0;
                        } else if (_this.canvasWidth + moveX - parentW <= 0) {
                            // console.log('right');
                            moveX = parentW - _this.canvasWidth;
                        }
                        _this.translateX = moveX;
                    }
                };
                var unMoveFun = function () {
                    document.removeEventListener('mousemove', moveFun, false);
                    document.removeEventListener('mouseup', unMoveFun, false);
                };
                document.addEventListener('mousemove', moveFun, false);
                document.addEventListener('mouseup', unMoveFun, false);
            },
            gotoTask(task) {
                //查看任务
                task.schedule_start_time_unix = this.coverDateTime(task.schedule_start_time_unix, 'start');
                task.schedule_end_time_unix = this.coverDateTime(task.schedule_end_time_unix, 'end');
                task.start_time_unix = this.coverDateTime(task.start_time_unix, 'start');
                task.end_time_unix = this.coverDateTime(task.end_time_unix, 'end');

                let calcTask = this.calcAdvanceOrDelay(task);
                let taskLeft = calcTask.startX;
                let taskWidth = calcTask.endX;
                let translateX = Math.abs(this.translateX);
                var view = document.querySelector('.view-box');
                var viewWidth = view.offsetWidth;

                if (translateX > taskLeft) {
                    let moveLeft = 0;
                    if (taskLeft > 0) {
                        moveLeft = translateX - (translateX - taskLeft) - this.cellWidth;
                    } else {
                        moveLeft = translateX - (translateX - taskLeft);
                    }
                    this.translateX = -moveLeft;
                } else if (taskLeft - translateX - viewWidth + taskWidth > 0) {

                    let moveLeft = 0;
                    let LeftTaskWidth = taskLeft + taskWidth;
                    let surplusWidth = this.canvasWidth - LeftTaskWidth;
                    if (surplusWidth > 0) {
                        moveLeft = translateX + (taskLeft - translateX - viewWidth + taskWidth) + this.cellWidth;
                    } else {
                        moveLeft = translateX + (taskLeft - translateX - viewWidth + taskWidth);
                    }
                    this.translateX = -moveLeft;
                }
            },
            coverWeek(index) {
                //转换星期
                return ['日', '一', '二', '三', '四', '五', '六'][index];
            },
            drawToDay(ctx, dataArr) {
                //画今天时间线
                let dateTime = this.dateTime;
                let len = dateTime.length;
                let lastDate = dateTime[len - 1].begin;
                let nowDay = new Date();
                let getTime = nowDay.getTime();
                let todaySecond = new Date(getTime).setHours(0, 0, 0, 0) / 1000;
                var view = document.querySelector('.view-box');
                var viewWidth = view.offsetWidth;
                if(this.canvasWidth >= viewWidth){
                    let left = 0;
                    if(lastDate >= todaySecond){
                        //如果今天在时间范围内
                        let index = this.findStartIndex(todaySecond);
                        let X = index * this.cellWidth;
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(X + (this.cellWidth / 2), 0);
                        ctx.lineTo(X + (this.cellWidth / 2),  this.canvasHeight);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = this.todayColor;
                        ctx.stroke();
                        if(this.canvasWidth - (index * this.cellWidth) >= viewWidth/2){
                            left = index * this.cellWidth - viewWidth / 2;
                            if(left <= 0){
                                this.translateX = 0;
                            }else {
                                this.translateX = -left;
                            }
                        }else {
                            left = this.canvasWidth - viewWidth;
                            this.translateX = -left;
                        }
                    }else {
                        left = this.canvasWidth - viewWidth - (this.canvasWidth - viewWidth)/2;
                        this.translateX = -left;
                    }
                }else {
                    this.translateX = 0;
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    @dateTimeHeight: 58px;
    @cellWidth: 55px;
    .gantt-box {
        width: 100%;
        height: 100%;

        .view-box {
            width: 100%;
            height: 100%;
            overflow: hidden;
            /*background: #2d2e32;*/
            /*background: url("../../../assets/images/gantt.png");*/
            box-sizing: border-box;

            .drag-box {
                height: 100%;
                box-sizing: border-box;
                cursor: move;

                > ul {
                    display: flex;
                    height: @dateTimeHeight;
                    background: @backGroundLightExtra;
                    border-top: 1px solid @borderColor;

                    li {
                        list-style: none;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;
                        width: @cellWidth;
                        color: @textLight;
                        padding: 5px 0;
                        &:last-child {
                            border-right: none;
                        }
                        &.today{
                            background: #4E7E96;
                        }
                        &.weekDay {
                            /*background: #292a2e;*/
                            /*<!--color: @error;-->*/
                        }

                        p {
                            font-size: 12px;
                            text-align: center;
                        }
                    }
                }

                .canvas-view {
                    position: relative;
                    height: calc(100% - 58px);
                    display: inline-block;
                    overflow: auto;

                    canvas {
                        display: block;
                        /*border-bottom: 1px solid transparent;*/
                    }

                    #task-info-box {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 200px;
                        height: 120px;
                        background: #fff;
                        border-radius: 4px;
                        padding: 5px;
                        opacity: .8;
                        overflow: hidden;
                        color: @black;
                        p {
                            font-size: 15px;
                        }

                        ul {
                            list-style: none;
                            margin-top: 10px;
                            font-size: 12px;

                            li {
                                margin-bottom: 5px;
                                display: flex;
                                justify-content: space-between;

                                &:first-child {
                                    font-weight: bold;
                                    .task-name{
                                        display: inline-block;
                                        max-width: 130px;
                                        text-overflow: ellipsis;
                                        overflow: hidden;
                                        white-space: nowrap;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>
