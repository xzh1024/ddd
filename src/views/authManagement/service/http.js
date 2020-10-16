import Service from 'service';
import api from './api'
export class Request {
    static getUserList(data){
        return Service.post(api.staffList,data);
    }
    static getRoleList(data){
        return Service.post(api.roleList,data);
    }
    static getAuthList(data){
        return Service.post(api.authList,data);
    }
    static authChange(data){
        return Service.post(api.authChange,data);
    }
    static getUserInfoDetail(data){
        return Service.post(api.oneStaffList,data);
    }
    static updataStaffInfo(data){
        return Service.post(api.updataStaffInfo,data);
    }
    static deleteStaff(data){
        return Service.post(api.deleteStaff,data);
    }
    static addAuthGroup(data){
        return Service.post(api.addAuthGroup,data);
    }
    static deleteAuthGroup(data){
        return Service.post(api.deleteAuthGroup,data);
    }
    static editAuthGroup(data){
        return Service.post(api.editAuthGroup,data);
    }
    static accountAdd(data){
        return Service.post(api.accountAdd,data);
    }
}