import Service from 'service';
import api from './api'
export class Request {
    static getRankList(data){
        return Service.post(api.rankList,data);
    }
    static getPositionList(data){
        return Service.post(api.positionList,data);
    }
    static humanAdd(data){
        return Service.post(api.humanAdd,data);
    }
    static getUserList(data){
        return Service.post(api.staffList,data);
    }
    static getHumanList(data){
        return Service.post(api.humanList,data);
    }
    static humanDetail(data){
        return Service.post(api.humanDetail,data);
    }
    static bindHuman(data){
        return Service.post(api.bindHuman,data);
    }
    static auditList(data){
        return Service.post(api.auditList,data);
    }
    static auditHuman(data){
        return Service.post(api.auditHuman,data);
    }
    static exportList(data){
        return Service.post(api.exportList,data);
    }
}