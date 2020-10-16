export default {
    partyAtaskList: '/api/task-base-list-input', // 甲方任务录入列表
    partyBtaskList: '/api/task-cp-list-input', //  乙方任务录入列表
    partyAtaskInfos: '/api/task-base-info-input', // 甲方任务详情
    partyBtaskInfos: '/api/task-cp-info-input', // 乙方任务详情
    baseTaskInfoAdd: '/api/base-task-add',// 人物新增
    taskCpManage: '/api/get-enter-user', // CP管理
    taskCreatePerson: '/api/get-create-user', // 跟进人
    taskWarnList: '/api/task-warning-list',
    updateTaskWarnList: '/api/update-warning',
    updateTaskInfo: '/api/base-task-update',// 任务编辑
    exportTask: '/api/task-export-input',
    cpMaker: '/api/cp-maker',// CP制作列表
    supportDepConfirmPrice: '/api/base-confirm-price',// 确认报价（支持部门甲方）
    cpQuotedPrice: '/api/cp-task-price', // 任务报价（CP乙方）
    cpUpdateQuotedPrice: '/api/cp-task-update-price', // 任务报价修改（CP乙方）
    cpConfirmQuotedPrice: '/api/cp-confirm-price', // 任务报价确认（CP乙方）
    taskLogsTableList: '/api/base-task-update-log', // 日志记录
    taskBatchInsert: '/api/task-batch-insert', // 任务批量录入(检查)
    taskBatchExec: '/api/task-batch-exec', // 任务批量录入(检查并执行)
    getProjectGroupData: '/api/get-project-group-data', // 属于自己的项目的规范及管理员数据
}