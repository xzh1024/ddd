import api from './api';
import Service from 'service';

export class TaskEntryRequest {
    // 甲方任务列表
    static getPartyAtaskList(data) {
        return Service.post(api.partyAtaskList, data);
    }
    // 乙方任务列表
    static getPartyBtaskList(data) {
        return Service.post(api.partyBtaskList, data);
    }
    // 甲方任务详情
    static getPartyAMainTaskInfos(data) {
        return Service.post(api.partyAtaskInfos, data);
    }
    // 乙方任务详情
    static getPartyBMainTaskInfos(data) {
        return Service.post(api.partyBtaskInfos, data);
    }
    
    static addBaseTaskInfoAdd(data) {
        return Service.post(api.baseTaskInfoAdd, data);
    }

    static getTaskCpManage(data) {
        return Service.post(api.taskCpManage, data);
    }

    static getTaskCreatePerson(data) {
        return Service.post(api.taskCreatePerson, data);
    }

    static getTaskWarnList(data) {
        return Service.post(api.taskWarnList, data);
    }

    static updateTaskWarnDay(data) {
        return Service.post(api.updateTaskWarnList, data);
    }

    static updateTaskInfosData(data) {
        return Service.post(api.updateTaskInfo, data);
    }

    static exportTaskData(data) {
        return Service.post(api.exportTask, data);
    }

    static getCPMaker(data) {
        return Service.post(api.cpMaker, data);
    }

    static supportDepConfirmQuotatePrice(data) {
        return Service.post(api.supportDepConfirmPrice, data);
    }

    static cpManageQuotedPrice(data) {
        return Service.post(api.cpQuotedPrice, data);
    }

    static updateQuotedPrice(data) {
        return Service.post(api.cpUpdateQuotedPrice, data);
    }

    static confirmQuotedPrice(data) {
        return Service.post(api.cpConfirmQuotedPrice, data);
    }

    static getLogsTableList(data) {
        return Service.post(api.taskLogsTableList, data);
    }

    static taskBatchInsert(data) {
        return Service.post(api.taskBatchInsert, data);
    }

    static taskBatchExec(data) {
        return Service.post(api.taskBatchExec, data);
    }

    static getProjectGroupData(data) {
        return Service.post(api.getProjectGroupData, data);
    }
}