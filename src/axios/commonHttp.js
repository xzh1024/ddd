import api from './commonApi';
import Service from 'service';

export class SystemGlobalRequest {
    static getVerifyUploadedFile(data) {
        return Service.post(api.uploadedFileVerify, data);
    }
    
    static getAuthorityDetails(data) {
        return Service.post(api.authorityDetails, data);
    }

    static getProjectProductionTypeList(data) {
        return Service.post(api.getProjectProductionTypeList, data);
    }

    static getCalendarList(data){
        return Service.post(api.getCalendarList,data);
    }

    static getMyProjectList(){
        return Service.post(api.get_my_project_list);
    }

    static getTodoTaskList(data) {
        return Service.post(api.getTodoTaskList, data);
    }

    static getCpMakerList(data = {}){
        return Service.post(api.getCpMakerList, data);
    }

    static getProjectCPList(data){
        return Service.post(api.getProjectCPList, data);
    }

    static getCreateUserList(data){
        return Service.post(api.createUserList, data);
    }

    static getSimpleProjectList() {
        return Service.post(api.simpleProjectList);
    }

    static getSimpleCompanyList() {
        return Service.post(api.simpleCompanyList);
    }
    
    static getStudioList() {
        return Service.post(api.studioList);
    }
}
