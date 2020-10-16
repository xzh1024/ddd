import api from './api';
import Service from 'service';

export class DocumentNotifyRequest {
    static getMessageLists(data) {
        return Service.post(api.messageList, data);
    }
    
    static getMessageDetails(data) {
        return Service.post(api.messageDetails, data);
    }
    
    static getDocumentList(data) {
        return Service.post(api.documentList, data);
    }

    static delMessageListsItem(data) {
        return Service.post(api.deleteMessageListsItem, data);
    }
}
