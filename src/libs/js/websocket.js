import {Env} from '@libs/js/utils';

const env = Env();
let socket;
let lockReconnect = false;
const url = env.ws;
// const url = 'ws://127.0.0.1:8086/';
const createWebSocket = (vm) => {
    try {
        socket = new WebSocket(url);
        window.socket = socket;
        if (localStorage.token && socket) {
            initHandle(vm);
        } else {
            socket.close();
            socket = null;
        }
    } catch (e) {
        reconnect(vm);
    }
};

const initHandle = (vm) => {
    socket.onclose = () => {
        console.log('WebSocket closed');
        if (localStorage.token && socket) {
            console.log('WebSocket restarting');
            reconnect(vm);
        }
    };
    socket.onerror = () => {
        console.log('WebSocket error');
        reconnect(vm);
    };
    socket.onopen = () => {
        console.log('WebSocket opened');
        socket.send(JSON.stringify({action: 'login', data: localStorage.token}));
    };
    socket.onmessage = msg => {
        console.log(msg.data);
        const h = vm.$createElement;
        if (msg.data) {
            const data = JSON.parse(msg.data);
            if (data.notice_id) {
                setTimeout(() => {
                    const instance = vm.$notify({
                        // title: data.title,
                        message: h('a', {style: 'color: #00A8FF'}, data.title),
                        duration: 5000,
                        offset: 70,
                        onClick: () => {
                            if (Number(data.type) !== 0) {
                                let route = '/message';
                                if (Number(data.type) === 3) {
                                    route = '/document';
                                }
                                vm.$router.push({path: route, query: data});
                            }
                            instance.close();
                        }
                    });
                });
            }
        }
    };
};

const reconnect = (vm) => {
    if (lockReconnect) {
        return;
    }
    lockReconnect = true;
    setTimeout(() => {
        lockReconnect = false;
        createWebSocket(vm);
    }, 5000);
};

export default {createWebSocket};
