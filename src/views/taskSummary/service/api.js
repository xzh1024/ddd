export default {
    taskBaseListGeneral:'/api/task-base-list-general',//甲方任务列表
    taskCPListGeneral:'/api/task-cp-list-general',//乙方任务列表
    taskCPListGeneralSubmit:'/api/task-cp-list-general-submit',//乙方制作人任务列表
    getProjectTimeFrame:'/api/task-time-range', //根据项目ID获取项目时间段
    getEnterUser: '/api/get-enter-user', //CP制作人
    updateMakeuser: '/api/update-makeuser', //修改制作人
    updateFollowUser: '/api/base-task-update-follow-user', //修改跟进人
    taskInfoBase: '/api/task-base-info-general', //任务详情-甲方
    taskInfoCp: '/api/task-cp-info-general', //任务详情-乙方
    taskActive: '/api/active-task', //激活子任务
    taskCommit: '/api/taskchild-commit', //子任务提交
    taskAudit: '/api/taskchild-audit', //子任务审核
    taskPause: '/api/task-pause', //任务暂停
    taskRecover: '/api/task-recover', //任务中止暂停
    taskTermination: '/api/termination-task', //任务终止
    taskBalance: '/api/balance-task', //结算任务
    nodeCommit: '/api/node-commit', //节点提交
    nodeAudit: '/api/node-audit', //节点审核
    exportExcelGeneral: '/api/task-export-general',

    getPriceChangeStatu: '/api/get-price-edit', //获取报价修改状态
    getNoteChangeStatu: '/api/get-schedule-edit', //获取节点修改状态
    priceChange: '/api/base-task-price-edit', //报价修改
    noteChange: '/api/base-task-schedule-edit', //节点修改
    getChangeHistroy: '/api/task-general-update-log', //获取修改历史
    auditChangeList: '/api/cp-update-audit-list',//获取审核列表
    auditChange: '/api/cp-update-audit',//审核变更
    updateRemark: '/api/update-remark', //修改制作备注
};
