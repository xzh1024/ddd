<template>
    <div class="gantt-box">
        <div class="view-box">
            <div class="drag-box" :style="{minWidth:minWidth+'px',width:dateTime.length * cellWidth +'px',transform:'translateX('+(translateX)+'px)'}" @mousedown="dragMoveFun">
                <ul >
                    <li v-for="item in dateTime">
                        <p class="year" v-if="item.yearShow ===1">{{item.m}}月</p>
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
                                <span>{{taskInfoObj.info.cp_name}}</span>
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
        name: "month2",
        props:{
            data:{
                type:Array,
                required: true,
                default:[]
            },
            scrollY:{
                type:Number,
                required: true,
                default:0
            },
            dateTime:{
                type:Array,
                required:true,
                default:[]
            },
            currentDateTime:{
                type: Object,
                required: true
            }
        },
        watch:{
            scrollY(top){
                this.scrollTop = top;
                this.$refs.fixedWrap.scrollTop = top;
            }
        },
        data(){
            return{
                tableData:[
                    {
                        "uuid": "1301444322171817984",
                        "task_id": "1301444322171817984",
                        "name": "正常开始，正常结束",
                        "schedule_start_time": "2020-09-04 00:00:00",
                        "schedule_end_time": "2020-09-15 23:59:59",
                        "schedule_start_timestamp": 1599148800,
                        "schedule_end_timestamp": 1600185599,
                        "start_timestamp": 1599198213,
                        "end_timestamp": 1600185599,
                        "cp_admin_name": "饶饶乙方",
                        "cp_admin_id": 20002,
                        "cp_id": 32,
                        "cp_name": "怡宝",
                        "status": 2,
                        "start_time": "2020-09-04 13:43:33",
                        "end_time": "2020-09-15 23:59:59",
                        "standard_id": 346,
                        "standard_name": "UI",
                        "FollowUser": [
                            10006
                        ],
                        "follow_user_name": "饶饶甲方",
                        "is_main_task": true,
                        "flag":true,
                        "node": [
                            {
                                "uuid": "1301444545858244608",
                                "task_id": "1301444322171817984",
                                "name": "正常开始,提前结束",
                                "schedule_start_time": "2020-09-04 00:00:00",
                                "schedule_end_time": "2020-09-15 23:59:59",
                                "schedule_start_timestamp": 1599148800,
                                "schedule_end_timestamp": 1600185599,
                                "create_user": 20002,
                                "create_user_name": "",
                                "status": 103,
                                "start_time": "2020-09-04 13:43:33",
                                "end_time": "2020/9/10 23:59:59",
                                "start_timestamp": 1599198213,
                                "end_timestamp": 1599753599,
                                "cp_admin_name": "饶饶乙方",
                                "cp_admin_id": 0,
                                "standard_id": 346,
                                "standard_name": "UI",
                                "audit_remark": "",
                                "is_origin": 1,
                                "is_main_task": false,
                                "flag":true,
                                "node": [
                                    {
                                        "uuid": 498,
                                        "name": "正常开始,延期结束",
                                        "schedule_start_time": "2020-09-04 00:00:00",
                                        "schedule_end_time": "2020-09-07 23:59:59",
                                        "schedule_start_timestamp": 1599148800,
                                        "schedule_end_timestamp": 1599494399,
                                        "create_user": 0,
                                        "create_user_name": "",
                                        "start_time": "2020-09-04 00:00:00",
                                        "end_time": "2020/9/9 23:59:59",
                                        "start_timestamp": 1599148800,
                                        "end_timestamp": 1599667199,
                                        "status": 106,
                                        "is_main_task": false,
                                        "cp_admin_name": [
                                            "饶饶乙方"
                                        ],
                                        "task_id": "1301444322171817984",
                                        "cp_admin_id": [
                                            20002
                                        ]
                                    },
                                    {
                                        "uuid": 499,
                                        "name": "提前开始,正常结束",
                                        "schedule_start_time": "2020-09-08 00:00:00",
                                        "schedule_end_time": "2020-09-11 23:59:59",
                                        "schedule_start_timestamp": 1599494400,
                                        "schedule_end_timestamp": 1599839999,
                                        "create_user": 0,
                                        "create_user_name": "",
                                        "start_time": "2020/9/5 0:0:0",
                                        "end_time": "2020-09-11 23:59:59",
                                        "start_timestamp": 1599235200,
                                        "end_timestamp": 1599839999,
                                        "status": 201,
                                        "is_main_task": false,
                                        "cp_admin_name": [
                                            "饶饶乙方"
                                        ],
                                        "task_id": "1301444322171817984",
                                        "cp_admin_id": [
                                            20002
                                        ]
                                    },
                                    {
                                        "uuid": 500,
                                        "name": "提前开始,提前结束",
                                        "schedule_start_time": "2020-09-12 00:00:00",
                                        "schedule_end_time": "2020-09-15 23:59:59",
                                        "schedule_start_timestamp": 1599840000,
                                        "schedule_end_timestamp": 1600185599,
                                        "create_user": 0,
                                        "create_user_name": "",
                                        "start_time": "2020/9/10 0:0:0",
                                        "end_time": "2020/9/13 23:59:59",
                                        "start_timestamp": 1599667200,
                                        "end_timestamp": 1600012799,
                                        "status": 201,
                                        "is_main_task": false,
                                        "cp_admin_name": [
                                            "饶饶乙方"
                                        ],
                                        "task_id": "1301444322171817984",
                                        "cp_admin_id": [
                                            20002
                                        ]
                                    },
                                    {
                                        "uuid": 501,
                                        "name": "提前开始,延期结束",
                                        "schedule_start_time": "2020-09-17 00:00:00",
                                        "schedule_end_time": "2020-09-20 23:59:59",
                                        "schedule_start_timestamp": 1600358399,
                                        "schedule_end_timestamp": 1600617599,
                                        "create_user": 0,
                                        "create_user_name": "",
                                        "start_time": "2020/9/15 00:00:00",
                                        "end_time": "2020-09-23 23:59:59",
                                        "start_timestamp": 1600128000,
                                        "end_timestamp": 1600876799,
                                        "status": 201,
                                        "is_main_task": false,
                                        "cp_admin_name": [
                                            "饶饶乙方"
                                        ],
                                        "task_id": "1301444322171817984",
                                        "cp_admin_id": [
                                            20002
                                        ]
                                    },
                                    {
                                        "uuid": 502,
                                        "name": "延期开始,正常结束",
                                        "schedule_start_time": "2020-09-25 00:00:00",
                                        "schedule_end_time": "2020/10/1 23:59:59",
                                        "schedule_start_timestamp": 1600963200,
                                        "schedule_end_timestamp": 1601567999,
                                        "create_user": 0,
                                        "create_user_name": "",
                                        "start_time": "2020/9/28 0:0:0",
                                        "end_time": "2020/10/1 23:59:59",
                                        "start_timestamp": 1601222400,
                                        "end_timestamp": 1601567999,
                                        "status": 201,
                                        "is_main_task": false,
                                        "cp_admin_name": [
                                            "饶饶乙方"
                                        ],
                                        "task_id": "1301444322171817984",
                                        "cp_admin_id": [
                                            20002
                                        ]
                                    },
                                    {
                                        "uuid": 503,
                                        "name": "延期开始,提前结束",
                                        "schedule_start_time": "2020/10/3 00:00:00",
                                        "schedule_end_time": "2020/10/10 23:59:59",
                                        "schedule_start_timestamp": 1601654400,
                                        "schedule_end_timestamp": 1602345599,
                                        "create_user": 0,
                                        "create_user_name": "",
                                        "start_time": "2020/10/5 0:0:0",
                                        "end_time": "2020/10/8 23:59:59",
                                        "start_timestamp": 1601827200,
                                        "end_timestamp": 1602172799,
                                        "status": 201,
                                        "is_main_task": false,
                                        "cp_admin_name": [
                                            "饶饶乙方"
                                        ],
                                        "task_id": "1301444322171817984",
                                        "cp_admin_id": [
                                            20002
                                        ]
                                    },
                                    {
                                        "uuid": 504,
                                        "name": "延期开始,延期结束",
                                        "schedule_start_time": "2020/10/13 00:00:00",
                                        "schedule_end_time": "2020/10/20 23:59:59",
                                        "schedule_start_timestamp": 1602518400,
                                        "schedule_end_timestamp": 1603209599,
                                        "create_user": 0,
                                        "create_user_name": "",
                                        "start_time": "2020/10/15 0:0:0",
                                        "end_time": "2020/10/23 23:59:59",
                                        "start_timestamp": 1602691200,
                                        "end_timestamp": 1603468799,
                                        "status": 201,
                                        "is_main_task": false,
                                        "cp_admin_name": [
                                            "饶饶乙方"
                                        ],
                                        "task_id": "1301444322171817984",
                                        "cp_admin_id": [
                                            20002
                                        ]
                                    },
                                    {
                                        "uuid": 505,
                                        "name": "延期开始",
                                        "schedule_start_time": "2020/9/5 00:00:00",
                                        "schedule_end_time": "2020/9/5 23:59:59",
                                        "schedule_start_timestamp": 1599235200,
                                        "schedule_end_timestamp": 1599321599,
                                        "create_user": 0,
                                        "create_user_name": "",
                                        "start_time": "2020/9/7 0:0:0",
                                        "end_time": "2020/9/30 23:59:59",
                                        "start_timestamp": 1599408000,
                                        "end_timestamp": 1601481599,
                                        "status": 106,
                                        "is_main_task": false,
                                        "cp_admin_name": [
                                            "饶饶乙方"
                                        ],
                                        "task_id": "1301444322171817984",
                                        "cp_admin_id": [
                                            20002
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                ],
                coverTaskArr:[],
                dayWidth: 65 / 7,
                cellWidth:65,
                cellHeight:20,
                cellRadius:0,
                lineHeight:50,
                advanceColor: 'rgba(102, 187, 106, 0.8)',
                delayColor: 'rgba(239, 91, 88, 0.8)',
                stopColor: '#FFA726',
                underwayColor:'rgba(0, 168, 255, 0.4)',
                notStartedColor: 'rgba(158, 158, 158, 0.8)',
                backGroundLight: '#282B2D',
                borderColor:'#3B3F41',
                todayColor:'#4E7E96',
                translateX:0,
                scrollTop:0,
                canvasWidth:0,
                canvasHeight:0,
                taskInfoObj:{
                    flag:false,
                    info:{
                        name:null,
                        member:null,
                        firstTime:null,
                        lastTime:null
                    }
                },
                minWidth:0
            }
        },
        methods:{
            init(flag){
                //组装数据
                var _this = this;
                var view = document.querySelector('.view-box');
                this.minWidth = view.offsetWidth;
                this.coverTaskArr = [];
                this.coverTaskData(this.data).then((data)=>{
                    this.calcTaskCoordinate(data).then((dataArr)=>{
                        if(dataArr.length > 0){
                            dataArr.forEach(function (item,index) {
                                item.startY = index*((_this.lineHeight-_this.cellHeight)/2+_this.cellHeight)+(_this.lineHeight-_this.cellHeight)/2 + (index * (_this.lineHeight-_this.cellHeight)/2);
                                item.endY = _this.cellHeight;
                                //计算任务的开始，结束坐标
                                _this.calcAdvanceOrDelay(item);
                            });
                        }
                        this.$nextTick(function () {
                            _this.initCanvas(dataArr,flag);
                        });
                    })
                });
            },
            initCanvas(dataArr,flag){
                var canvasView = document.querySelector('.canvas-view');
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                this.canvasWidth = this.dateTime.length * this.cellWidth >= this.minWidth ? this.dateTime.length * this.cellWidth : this.minWidth;
                this.canvasHeight = dataArr.length <= 10 ? canvasView.offsetHeight : dataArr.length * this.lineHeight+1;
                canvas.height = this.canvasHeight;
                canvas.width = this.canvasWidth;
                this.$nextTick(function () {
                    this.drawTable(ctx,dataArr);
                    this.draw(ctx,dataArr);
                    //画今天
                    this.drawToDay(ctx,flag);
                });
            },
            getElementPos(el,e){
                //获取鼠标在canvas上的坐标
                var rect = el.getBoundingClientRect();
                return {
                    x: (e.clientX - rect.left),
                    y: (e.clientY - rect.top)
                };
            },
            drawTable(ctx,dataArr){
                var dateArrLength = this.dateTime.length;
                var taskArrLength = dataArr.length;
                var _this = this;
                if(dateArrLength > 0){
                    //竖线
                    // for(let i=0;i<dateArrLength+1;i++){
                    //     let X = i*_this.cellWidth-.5;
                    //     ctx.save();
                    //     ctx.beginPath();
                    //     ctx.moveTo(X,0);
                    //     ctx.lineTo(X, taskArrLength*_this.lineHeight);
                    //     ctx.lineWidth=1;
                    //     ctx.strokeStyle=this.borderColor;
                    //     ctx.stroke();
                    // }
                    //横线
                    for(let i=0;i<taskArrLength+1;i++){
                        let Y = i*_this.lineHeight+.5;
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(0,Y);
                        ctx.lineTo(_this.canvasWidth,Y);
                        ctx.lineWidth=1;
                        ctx.strokeStyle=this.borderColor;
                        ctx.stroke();
                    }
                }
            },
            draw(ctx,dataArr){
                var _this = this;
                if(dataArr && dataArr.length > 0){
                    dataArr.forEach(function (item) {
                        var radius = _this.cellRadius;
                        var rectFill = false;
                        var rectStroke = false;
                        var taskRectFill = true;
                        var taskRectStroke = false;

                        switch (item.status){
                            case 102:
                            case 201:
                                rectFill = false;
                                rectStroke = true;
                                taskRectFill = false;
                                taskRectStroke = false;
                                break;
                            case 103:
                            case 106:
                            case 205:
                            case 107:
                            case 206:
                                rectFill = false;
                                rectStroke = false;
                                taskRectFill = true;
                                taskRectStroke = true;
                                break;
                            default: taskRectStroke = false;break;
                        }
                        //画任务
                        _this.drawRoundedRect(ctx, item.startX, item.startY, item.endX, item.endY, radius, item.background, rectFill, rectStroke);
                        _this.drawRoundedRect(ctx, item.taskStartX, item.startY, item.taskEndX, item.endY, radius, item.background, taskRectFill, taskRectStroke);

                        //画提前和延期
                        _this.drawAdvanceOrDelay(ctx, item);
                    });
                    this.$nextTick(function () {
                        this.canvasMouse(ctx);
                    });
                }
            },
            scroll(e){
                if (this.scrollTop !== e.target.scrollTop) {
                    // console.log('纵向');
                    this.scrollTop = e.target.scrollTop;
                    this.$emit('scrollTop', this.scrollTop);
                }
            },
            canvasMouse(ctx){
                let canvas = ctx.canvas;
                let _this = this;
                let tempObj = {
                    flag:false,
                    startX:0,
                    endX:0,
                    startY:0,
                    endY:0,
                    info:null
                };

                canvas.addEventListener('mousemove',function (event) {
                    if(event){
                        //根据鼠标坐标查找行号，根据行号确定任务，不用循环数组，大大节省开销
                        let taskArr = _this.coverTaskArr;
                        let mouse = _this.getElementPos(canvas,event);
                        let lineNumber = Math.floor(mouse.y / _this.lineHeight);
                        let currentTask = taskArr[lineNumber];
                        if(currentTask){
                            let startX = currentTask.startX;
                            let endX = currentTask.endX;
                            let startY = currentTask.startY;
                            let endY = currentTask.endY;
                            if(!tempObj.flag){
                                //找到任务后，不在继续比对，节省开销
                                if((mouse.x >= startX) && (mouse.x <= startX + endX) && (mouse.y >= startY) && (mouse.y <= startY + endY)){
                                    tempObj = {
                                        flag:true,
                                        startX:startX,
                                        endX:startX + endX,
                                        startY:startY,
                                        endY:startY + endY,
                                        info:currentTask
                                    };
                                }
                            }else {
                                if(mouse.x < tempObj.startX || mouse.x > tempObj.endX || mouse.y < tempObj.startY || mouse.y > tempObj.endY){
                                    //鼠标已移出任务
                                    canvas.style.cursor = 'move';
                                    tempObj = {
                                        flag:false,
                                        startX:0,
                                        endX:0,
                                        startY:0,
                                        endY:0,
                                        info:null
                                    };
                                    _this.taskInfoObj = {
                                        flag:false,
                                        info:{
                                            id:null,
                                            name:null,
                                            member:null,
                                            firstTime:null,
                                            lastTime:null
                                        }
                                    };
                                }else {
                                    //在任务坐标内移动
                                    canvas.style.cursor = 'pointer';
                                    var margin = 30;
                                    var view = document.querySelector('.view-box');
                                    var viewWidth = view.offsetWidth;
                                    var el = document.querySelector('#task-info-box');
                                    var elWidth = el.offsetWidth + margin;
                                    var elHeight = el.offsetHeight + margin;
                                    var canvasView = document.querySelector('.canvas-view');
                                    var canvasViewHeight = canvasView.offsetHeight;
                                    var left,top;
                                    if(mouse.x + _this.translateX + elWidth + margin >= viewWidth){
                                        left = viewWidth - elWidth -_this.translateX;
                                    }else {
                                        left = mouse.x + margin;
                                    }

                                    if(mouse.y + elHeight > canvasViewHeight + _this.scrollTop ){
                                        top = mouse.y - elHeight;
                                    }else {
                                        top = mouse.y + margin;
                                    }

                                    el.style.left = left +'px';
                                    el.style.top = top +'px';

                                    _this.$nextTick(function () {
                                        _this.taskInfoObj = {
                                            flag:true,
                                            info:tempObj.info
                                        };
                                        //点击获取当前任务信息
                                        canvas.onclick = function (ev) {
                                            if(tempObj.info){
                                                _this.$emit('selectRow',Number(tempObj.info.id));
                                                // console.log(tempObj.info.name);
                                                // console.log(tempObj.info.uuid)
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                }, false);
                canvas.addEventListener('mouseout', function () {
                    _this.taskInfoObj = {
                        flag:false,
                        info:{
                            id:null,
                            name:null,
                            member:null,
                            firstTime:null,
                            lastTime:null
                        }
                    };
                }, false);
            },
            findStartIndex(startTime){
                var dateTime = this.dateTime;
                var startIndex = 0;
                if(dateTime && dateTime.length > 0){
                    dateTime.forEach(function (item,index) {
                        if(Number(startTime) >= Number(item.begin)){
                            startIndex = index;
                        }
                    })
                }
                return startIndex;
            },
            coverTaskData(taskData,name){
                var _this = this;
                return new Promise(function (reslove,reject) {
                    if(taskData && taskData.length > 0){
                        taskData.forEach(function (item,index,arr) {
                            if('node' in item ){
                                if(item.node.length > 0){
                                    _this.coverTaskData(item.node,item.name);
                                }
                            }else {
                                //没有实际开始时间 用排期开始时间进行计算
                                if(!Boolean(item.start_timestamp)){
                                    item.start_timestamp = item.schedule_start_timestamp;
                                    item.start_time = item.schedule_start_time;
                                }
                                if(!Boolean(item.end_timestamp)){
                                    if(item.status === 106 || item.status === 205){
                                        if (item.schedule_end_timestamp >= _this.currentDateTime.timeStamp) {
                                            item.end_timestamp = item.schedule_end_timestamp;
                                            item.end_time = item.schedule_end_time;
                                        } else {
                                            //状态为已逾期的 用后端服务器时间计算
                                            item.end_timestamp = _this.currentDateTime.timeStamp;
                                            item.end_time = _this.currentDateTime.dateTime  ;
                                        }
                                    }else {
                                        //如果没有实际结束时间 那么就用排期结束时间 进行计算
                                        item.end_timestamp = item.schedule_end_timestamp;
                                        item.end_time = item.schedule_end_time;
                                    }
                                }
                                //任务状态为已完成的  按实际时间计算
                                if(item.status === 110 || item.status === 209){
                                    item.schedule_start_timestamp = item.start_timestamp;
                                    item.schedule_end_timestamp = item.end_timestamp;
                                }
                                //已暂停和已终止
                                if(item.status === 203 || item.status === 104 || item.status === 204 || item.status === 105){
                                    item.start_timestamp = item.schedule_start_timestamp;
                                    item.start_time = item.schedule_start_time;
                                    item.end_timestamp = item.schedule_end_timestamp;
                                    item.end_time = item.schedule_end_time;
                                }
                                item.cp_name = name;
                                item.background =_this.coverBackground(item.status);
                            }
                        });
                    }
                    reslove(taskData);
                });
            },
            calcTaskCoordinate(dataArr){
                //数据转换为数组
                let _this = this;
                return new Promise(function (reslove,reject) {
                    if(dataArr && dataArr.length > 0){
                        let tempObj = null;
                        dataArr.forEach(function (item) {
                            if('node' in item){
                                tempObj = {
                                    id: item.id,
                                    company: item.company,
                                    mobile: item.mobile,
                                    name: item.name,
                                    position: item.position,
                                    status: item.status,
                                    flag: item.flag
                                };
                                _this.coverTaskArr.push(tempObj);
                                if(item.flag){
                                    _this.calcTaskCoordinate(item.node)
                                }
                            }else {
                                tempObj = {
                                    id: item.id,
                                    name: item.name,
                                    cp_name: item.cp_name,
                                    status: item.status,
                                    schedule_end_timestamp: _this.coverDateTime(item.schedule_end_timestamp,'end'),
                                    schedule_end_time: item.schedule_end_time,
                                    schedule_start_timestamp: _this.coverDateTime(item.schedule_start_timestamp,'start'),
                                    schedule_start_time: item.schedule_start_time,
                                    start_timestamp: _this.coverDateTime(item.start_timestamp,'start'),
                                    start_time: item.start_time,
                                    end_timestamp: _this.coverDateTime(item.end_timestamp,'end'),
                                    end_time: item.end_time,
                                    background: _this.coverBackground(item.status)
                                };
                                _this.coverTaskArr.push(tempObj);
                            }
                        });
                    }
                    reslove(_this.coverTaskArr);
                })
            },
            calcTimeFrame(time,type){
                const dateTime = this.dateTime;
                const dateLength = this.dateTime.length;
                const firstDate = dateTime[0].begin; //当前时间段第一个时间
                const lastDate = dateTime[dateLength - 1].end + (6*86400);//当前时间段最后一个时间 + 6天的时间 因为是已周为刻度
                let temp = null;
                if(type === 'start'){
                    if(time < firstDate){
                        temp = firstDate;
                    }else {
                        temp = time;
                    }
                }else if(type === 'end'){
                    if(time > lastDate){
                        temp = lastDate;
                    }else {
                        temp = time;
                    }
                }
                return temp;
            },
            calcAdvanceOrDelay(item){
                const dateTime = this.dateTime;
                const dateLength = this.dateTime.length;
                const firstDate = dateTime[0].begin; //当前时间段第一个时间
                const lastDate = dateTime[dateLength - 1].end + (6*86400);//当前时间段最后一个时间 + 6天的时间 因为是已周为刻度

                //计算任务开始、结束,提前、延期坐标
                if(Number(item.schedule_start_timestamp) < firstDate && Number(item.schedule_end_timestamp) < firstDate){
                    item.startX = 0;
                    item.endX = 0;
                    item.taskStartX = 0;
                    item.taskEndX = 0;
                }else if(Number(item.schedule_start_timestamp) > lastDate && Number(item.schedule_end_timestamp) > lastDate){
                    let exceededStartDay = Math.ceil((Number(item.schedule_start_timestamp) - lastDate) / 86400);
                    let exceededEndDay = Math.ceil((Number(item.schedule_end_timestamp) - lastDate) / 86400);
                    item.startX = (this.findStartIndex(lastDate) + exceededStartDay) * this.dayWidth;
                    item.endX = (this.findStartIndex(lastDate) + exceededEndDay) * this.dayWidth;
                    item.taskStartX = 0;
                    item.taskEndX = 0;
                }else if(Number(item.schedule_start_timestamp) === Number(item.start_timestamp)){
                    //正常开始
                    let startIndex = this.findStartIndex(Number(this.calcTimeFrame(item.schedule_start_timestamp,'start')));
                    let startDay = this.dateTime[startIndex].begin;
                    let afterDay = Math.ceil((Number(this.calcTimeFrame(item.schedule_start_timestamp,'start')) - startDay)/86400);

                    item.startX = (startIndex * this.cellWidth) + (afterDay * this.dayWidth);
                    item.taskStartX = (startIndex * this.cellWidth) + (afterDay * this.dayWidth);
                    if(Number(item.schedule_end_timestamp) === Number(item.end_timestamp)){
                        //正常结束
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.firstTime = this.coverDateTime(item.schedule_start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.schedule_end_timestamp,'dateTime');
                    }else if(Number(item.end_timestamp) < Number(item.schedule_end_timestamp)){
                        //提前结束
                        item.stageType = 1;
                        item.stageTypeStr = '正常开始,提前结束';
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.advanceEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.end_timestamp,'end'))) / 86400) * this.dayWidth;
                        item.firstTime = this.coverDateTime(item.schedule_start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.schedule_end_timestamp,'dateTime');
                    }else if(Number(item.end_timestamp) > Number(item.schedule_end_timestamp)){
                        //延期结束
                        item.stageType = 2;
                        item.stageTypeStr = '正常开始,延期结束';
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.delayEndX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_end_timestamp,'end'))) / 86400) * this.dayWidth;
                        item.firstTime = this.coverDateTime(item.schedule_start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.end_timestamp,'dateTime');
                    }
                }else if(Number(item.start_timestamp) < Number(item.schedule_start_timestamp)){
                    //提前开始
                    let startIndex = this.findStartIndex(Number(this.calcTimeFrame(item.start_timestamp,'start')));
                    let startDay = this.dateTime[startIndex].begin;
                    let afterDay = (Number(this.calcTimeFrame(item.start_timestamp,'start')) - startDay)/86400;
                    let taskStartAfterDay = (Number(this.calcTimeFrame(item.schedule_start_timestamp,'start')) - Number(this.calcTimeFrame(item.start_timestamp,'start'))) / 86400;
                    let startX = Math.ceil((startIndex * this.cellWidth) + (afterDay * this.dayWidth));

                    item.startX = startX;
                    item.taskStartX = startX + (taskStartAfterDay * this.dayWidth);
                    item.advanceStartX = taskStartAfterDay * this.dayWidth;

                    if(Number(item.schedule_end_timestamp) === Number(item.end_timestamp)){
                        //正常结束
                        item.stageType = 3;
                        item.stageTypeStr = '提前开始,正常结束';
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.firstTime = this.coverDateTime(item.start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.schedule_end_timestamp,'dateTime');
                    }else if(Number(item.end_timestamp) < Number(item.schedule_end_timestamp)){
                        //提前结束
                        item.stageType = 4;
                        item.stageTypeStr = '提前开始,提前结束';
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.advanceEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.end_timestamp,'end'))) / 86400) * this.dayWidth;
                        item.firstTime = this.coverDateTime(item.start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.schedule_end_timestamp,'dateTime');
                    }else if(Number(item.end_timestamp) > Number(item.schedule_end_timestamp)){
                        //延期结束
                        item.stageType = 5;
                        item.stageTypeStr = '提前开始,延期结束';
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.delayEndX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_end_timestamp,'end'))) / 86400) * this.dayWidth;
                        item.firstTime = this.coverDateTime(item.start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.end_timestamp,'dateTime');
                    }
                }else if(Number(item.start_timestamp) > Number(item.schedule_start_timestamp)){
                    //延期开始
                    let startIndex = this.findStartIndex(Number(this.calcTimeFrame(item.schedule_start_timestamp,'start')));
                    let startDay = this.dateTime[startIndex].begin;
                    let afterDay = Math.ceil((Number(this.calcTimeFrame(item.schedule_start_timestamp,'start')) - startDay)/86400);
                    let taskStartAfterDay = (Number(this.calcTimeFrame(item.start_timestamp,'start')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400;
                    let startX = Math.ceil((startIndex * this.cellWidth) + (afterDay * this.dayWidth));

                    item.startX = startX;
                    item.taskStartX = startX + (taskStartAfterDay * this.dayWidth);
                    item.delayStartX = taskStartAfterDay *this.dayWidth;

                    if(Number(item.schedule_end_timestamp) === Number(item.end_timestamp)){
                        //正常结束
                        item.stageType = 6;
                        item.stageTypeStr = '延期开始,正常结束';
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.firstTime = this.coverDateTime(item.schedule_start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.schedule_end_timestamp,'dateTime');
                    }else if(Number(item.end_timestamp) < Number(item.schedule_end_timestamp)){
                        //提前结束
                        item.stageType = 7;
                        item.stageTypeStr = '延期开始,提前结束';
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.start_timestamp,'start'))) / 86400) * this.dayWidth;
                        item.advanceEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.end_timestamp,'end'))) / 86400) * this.dayWidth;
                        item.firstTime = this.coverDateTime(item.schedule_start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.schedule_end_timestamp,'dateTime');
                    }else if(Number(item.end_timestamp) > Number(item.schedule_end_timestamp)){
                        //延期结束
                        item.stageType = 8;
                        item.stageTypeStr = '延期开始,延期结束';
                        item.endX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_start_timestamp,'start'))) / 86400) * this.dayWidth;
                        //如果实际开始时间 大于排期结束时间
                        if(Number(item.start_timestamp) >= Number(item.schedule_end_timestamp)){
                            item.taskEndX = 0;
                            item.delayEndX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.start_timestamp,'start'))) / 86400) * this.dayWidth;
                        }else {
                            item.taskEndX = Math.ceil((Number(this.calcTimeFrame(item.schedule_end_timestamp,'end')) - Number(this.calcTimeFrame(item.start_timestamp,'start'))) / 86400) * this.dayWidth;
                            item.delayEndX = Math.ceil((Number(this.calcTimeFrame(item.end_timestamp,'end')) - Number(this.calcTimeFrame(item.schedule_end_timestamp,'end'))) / 86400) * this.dayWidth;
                        }
                        item.firstTime = this.coverDateTime(item.schedule_start_timestamp,'dateTime');
                        item.lastTime = this.coverDateTime(item.end_timestamp,'dateTime');
                    }
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
                }
                return background;
            },
            coverDateTime(date,type) {
                if(date){
                    var newDate = new Date(date*1000);
                    var dateTime = null;
                    if(type === 'start'){
                        dateTime = newDate.setHours(0,0,0)/1000;
                    }else if(type === 'end'){
                        dateTime = newDate.setHours(23,59,59)/1000;
                    }else if(type === 'dateTime'){
                        let taskDate = new Date(date*1000);
                        let year = taskDate.getFullYear();
                        let month = taskDate.getMonth()+1 > 10 ? taskDate.getMonth()+1 : '0'+(taskDate.getMonth()+1);
                        let day = taskDate.getDate() > 10 ? taskDate.getDate() : '0'+taskDate.getDate();
                        dateTime = year+'/'+month+'/'+day;
                    }
                    return dateTime;
                }
            },
            drawRoundedRect(ctx, x, y, width, height, r, background, fill, stroke) {
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
            drawAdvanceOrDelay(ctx,item){
                //画提前和延期
                let rectFill = true;
                let rectStroke = false;
                let delayColor = this.delayColor;
                if(item.status === 106 || item.status === 205){
                    rectFill = true;
                    rectStroke = true;
                    delayColor = 'rgba(239, 91, 88, 0.4)';
                }
                if (item) {
                    var radius = this.cellRadius;
                    if (item.stageType === 1) {
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.advanceEndX, item.startY, item.advanceEndX, item.endY, radius, this.advanceColor, rectFill, rectStroke);
                    } else if (item.stageType === 2) {
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.delayEndX, item.startY, item.delayEndX, item.endY, radius, delayColor, rectFill, rectStroke);
                    } else if (item.stageType === 3) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.advanceStartX, item.endY, radius, this.advanceColor, rectFill, rectStroke);
                    } else if (item.stageType === 4) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.advanceStartX, item.endY, radius, this.advanceColor, rectFill, rectStroke);
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.advanceEndX, item.startY, item.advanceEndX, item.endY, radius, this.advanceColor, rectFill, rectStroke);
                    } else if (item.stageType === 5) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.advanceStartX, item.endY, radius, this.advanceColor, rectFill, rectStroke);
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.delayEndX, item.startY, item.delayEndX, item.endY, radius, delayColor, rectFill, rectStroke);
                    } else if (item.stageType === 6) {
                        this.drawRoundedRect(ctx, item.startX, item.startY, item.delayStartX, item.endY, radius, this.delayColor, rectFill, rectStroke);
                    } else if (item.stageType === 7) {
                        this.drawRoundedRect(ctx, item.startX , item.startY, item.delayStartX, item.endY, radius, this.delayColor, rectFill, rectStroke);
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.advanceEndX, item.startY, item.advanceEndX, item.endY, radius, this.advanceColor, rectFill, rectStroke);
                    } else if (item.stageType === 8) {
                        this.drawRoundedRect(ctx, item.startX , item.startY, item.delayStartX, item.endY, radius, this.delayColor, rectFill, rectStroke);
                        this.drawRoundedRect(ctx, item.startX + item.endX - item.delayEndX, item.startY, item.delayEndX, item.endY, radius, delayColor, rectFill, rectStroke);
                    }
                }
            },
            dragMoveFun(event){
                var _this = this;
                var parentW = document.querySelector('.view-box').offsetWidth;
                var el = document.querySelector('.drag-box');
                var startX = this.getElementPos(el,event).x;
                var endX = 0;
                var moveX = 0;
                var moveFun = function (e) {
                    if(_this.canvasWidth > parentW){
                        endX = _this.getElementPos(el,e).x;
                        moveX = endX - startX + _this.translateX;
                        if(moveX >= 0){
                            moveX = 0;
                        } else if(_this.canvasWidth + moveX - parentW <= 0){
                            moveX = parentW-_this.canvasWidth;
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
            gotoTask(task){
                let dateTime = this.dateTime;
                let len = dateTime.length;
                let lastDate = dateTime[len - 1].begin;
                var view = document.querySelector('.view-box');
                var viewWidth = view.offsetWidth;

                task.schedule_start_timestamp = this.coverDateTime(task.schedule_start_timestamp,'start');
                task.schedule_end_timestamp = this.coverDateTime(task.schedule_end_timestamp,'end');
                task.start_timestamp = this.coverDateTime(task.start_timestamp,'start');
                task.end_timestamp = this.coverDateTime(task.end_timestamp,'end');

                if(task.start_timestamp > lastDate){
                    this.translateX = - (this.canvasWidth - viewWidth);
                }else {
                    let calcTask = this.calcAdvanceOrDelay(task);
                    let taskLeft = calcTask.startX;
                    let taskWidth = calcTask.endX;
                    let translateX = Math.abs(this.translateX);

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
                }
            },
            drawToDay(ctx,flag){
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
                        let index = this.findStartIndex(todaySecond);
                        let dateTimeIndexInfo = this.dateTime[index];
                        let toDayX = (todaySecond - dateTimeIndexInfo.begin) / 86400;
                        let X = index*this.cellWidth;
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(X + toDayX*this.dayWidth + (this.dayWidth/2),0);
                        ctx.lineTo(X + toDayX*this.dayWidth + (this.dayWidth/2), this.canvasHeight);
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = this.todayColor;
                        ctx.stroke();
                        if(flag){
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
                        }
                    }else {
                        if(flag){
                            left = this.canvasWidth - viewWidth - (this.canvasWidth - viewWidth)/2;
                            this.translateX = -left;
                        }
                    }
                }else {
                    if(flag){
                        this.translateX = 0;
                    }
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    @dateTimeHeight:58px;
    @cellWidth:65px;
    .gantt-box{
        width: 100%;
        height: 100%;
        .view-box{
            width: 100%;
            height: 100%;
            overflow: hidden;
            /*background: #2d2e32;*/
            /*background: url("../../../assets/images/gantt.png");*/
            box-sizing: border-box;
            .drag-box{
                height: 100%;
                box-sizing: border-box;
                cursor: move;
                >ul{
                    display: flex;
                    height: @dateTimeHeight;
                    background: @backGroundLightExtra;
                    border-top: 1px solid @borderColor;
                    li{
                        list-style: none;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        width: @cellWidth;
                        color: @textLight;
                        &:last-child{
                            border-right: none;
                        }
                        p{
                            font-size: 12px;
                            text-align: center;
                        }
                    }
                }
                .canvas-view{
                    position: relative;
                    height: calc(100% - 58px);
                    display: inline-block;
                    overflow: auto;
                    canvas{
                        display: block;
                        /*border-bottom: 1px solid transparent;*/
                    }
                    #task-info-box{
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
                        p{
                            font-size: 15px;
                        }
                        ul{
                            list-style: none;
                            margin-top: 10px;
                            font-size: 12px;
                            li{
                                margin-bottom: 5px;
                                display: flex;
                                justify-content: space-between;
                                &:first-child{
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
