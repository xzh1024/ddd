import Service from 'service';
import api from './api'
export class DocumentService {
    static getDocumentList(params){
        return Service.post(api.getDocumentList, params);
    }
    static addDocument(params){
        return Service.post(api.addDocument, params);
    }
    static deleteDocument(params){
        return Service.post(api.deleteDocument, params);
    }
}

export class NoticeService {
    static getNoticeList(params){
        return Service.post(api.getNoticeList, params);
    }
    static getNoticeInfo(params){
        return Service.post(api.getNoticeInfo, params);
    }
    static addNotice(params){
        return Service.post(api.addNotice, params);
    }
    static editNotice(params){
        return Service.post(api.editNotice, params);
    }
    static deleteNotice(params){
        return Service.post(api.deleteNotice, params);
    }
}

export class CompanyService {
    static getCompanyList(params){
        return Service.post(api.getCompanyList, params);
    }
    static createCompany(params){
        return Service.post(api.createCompany, params);
    }
    static updateCompany(params){
        return Service.post(api.updateCompany, params);
    }
    static deleteCompany(params){
        return Service.post(api.deleteCompany, params);
    }
}

export class NodeService {
    static getProjectList(){
        return Service.post(api.getProjectList);
    }
    static getSysStandard(params){
        return Service.post(api.getSysStandard, params);
    }
    static getStandardNodes(params){
        return Service.post(api.getStandardNodes, params);
    }
    static applySysStandard(params){
        return Service.post(api.applySysStandard, params);
    }
    static createCustomStandard(params){
        return Service.post(api.createCustomStandard, params);
    }
    static updateStandard(params){
        return Service.post(api.updateStandard, params);
    }
    static deleteStandard(params){
        return Service.post(api.deleteStandard, params);
    }
    static createNode(params){
        return Service.post(api.createNode, params);
    }
    static updateNode(params){
        return Service.post(api.updateNode, params);
    }
    static deleteNode(params){
        return Service.post(api.deleteNode, params);
    }
}

export class WorkService {
    static getCategoryTree(){
        return Service.post(api.getCategoryTree);
    }
    static createCategory(params){
        return Service.post(api.createCategory, params);
    }
    static deleteCategory(params){
        return Service.post(api.deleteCategory, params);
    }
    static updateCategory(params){
        return Service.post(api.updateCategory, params);
    }
}