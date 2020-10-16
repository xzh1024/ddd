import api from './api';
import Service from 'service';

export class ProjectGroupRequest {
    static getProjectList(data) {
        return Service.post(api.projectList, data);
    }
    
    static addNewProject(data) {
        return Service.post(api.addProject, data);
    }
    
    static deleteProject(data) {
        return Service.post(api.deleteProject, data);
    }
    
    static getProjectInfo(data) {
        return Service.post(api.projectInfo, data);
    }
}
