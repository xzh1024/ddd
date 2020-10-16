import Service from 'service';
import api from './api'
export class Request {
    static getBaseTaskList(data){
        return Service.post(api.taskBaseListGeneral,data);
    }

    static getCPTaskList(data){
        return Service.post(api.taskCPListGeneral,data);
    }

    static getTaskCPGeneralSubmitList(data){
        return Service.post(api.taskCPListGeneralSubmit,data);
    }

    static  exportExcelGeneral(data){
        return Service.post(api.exportExcelGeneral,data);
    }
    static getProjectTimeFrame(data){
        return Service.post(api.getProjectTimeFrame,data);
    }
    static getPriceChangeStatu(data){                      //获取报价修改状态
        return Service.post(api.getPriceChangeStatu,data);
    }
    static getNoteChangeStatu(data){                      //获取节点修改状态
        return Service.post(api.getNoteChangeStatu,data);
    }
    static priceChange(data){                             //报价修改
        return Service.post(api.priceChange,data);
    }
    static noteChange(data){                              //节点修改
        return Service.post(api.noteChange,data);
    }
    static getChangeHistroy(data){                     //获取修改历史
        return Service.post(api.getChangeHistroy,data);
    }
    static auditChangeList(data){                              //获取审核列表
        return Service.post(api.auditChangeList,data);
    }
    static auditChange(data){                                  //审核变更
        return Service.post(api.auditChange,data);
    }
}

export class TaskService {
    static getEnterUser(data) {
        return Service.post(api.getEnterUser, data);
    }
    static updateMakeuser(data) {
        return Service.post(api.updateMakeuser, data);
    }
    static updateFollowUser(data) {
        return Service.post(api.updateFollowUser, data);
    }
    static getTaskInfoBase(data) {
        return Service.post(api.taskInfoBase, data);
    }
    static getTaskInfoCp(data) {
        return Service.post(api.taskInfoCp, data);
    }
    static taskActive(data) {
        return Service.post(api.taskActive, data);
    }
    static taskCommit(data) {
        return Service.post(api.taskCommit, data);
    }
    static taskAudit(data) {
        return Service.post(api.taskAudit, data);
    }
    static taskPause(data) {
        return Service.post(api.taskPause, data);
    }
    static taskRecover(data) {
        return Service.post(api.taskRecover, data);
    }
    static taskTermination(data) {
        return Service.post(api.taskTermination, data);
    }
    static taskBalance(data) {
        return Service.post(api.taskBalance, data);
    }
    static nodeCommit(data) {
        return Service.post(api.nodeCommit, data);
    }
    static nodeAudit(data) {
        return Service.post(api.nodeAudit, data);
    }
    static updateRemark(data) {
        return Service.post(api.updateRemark, data);
    }
}
