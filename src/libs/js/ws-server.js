const webSocket = require('ws');

const WebSocketServer = webSocket.Server;

const wss = new WebSocketServer({
    port: 8086
});

let count = 1;
wss.on('connection', ws => {
    console.log('[SERVER] connection');
    ws.on('message', (msg) => {
        console.log(`[SERVER] Received: ${msg}`);
        let data = {id: 1, title: `第${count}条消息内容第${count}条消息内容第${count}条消息内容第${count}条消息内容`};
        ws.send(JSON.stringify(data), err => {
            if (err) {
                console.log(`[SERVER] error: ${err}`);
            }
            console.log('Send successful');
        });
    });
});
