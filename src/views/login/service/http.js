import api from './api';
import Service from 'service';

export class SystemLoginRequest {
    static testLoginSystem(data) {
        return Service.post(api.testLoginPlatform, data);
    }
    
    static loginSystem(data) {
        return Service.post(api.loginPlatform, data);
    }
    
    static logoutSystem(data) {
        return Service.post(api.logoutPlatform, data);
    }
    
    static bindWxAccount(data) {
        return Service.post(api.bindWeChatAccount, data);
    }
}
