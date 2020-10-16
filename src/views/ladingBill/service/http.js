import Service from 'service';
export class Request {
    static billList(data){
        return Service.post('/api/commit-page',data);
    }
    static billSubmit(data){
        return Service.post('/api/commit-submit',data);
    }
    static billExport(data){
        return Service.post('/api/commit-export',data);
    }
}