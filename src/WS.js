import { AEvent } from "./AEvent";

class WS extends AEvent {
    constructor(url, protocols) {
        super();
        this.protocols = protocols;
        this._init(url)

        // 计数器
        this._counter = 0;

        this._event = {
            'close': [],
            'error': [],
            'message': [],
            'open': [],
            'reload': [],
            'faild': []
        }
    }

    _reload(data) {
        this._emit('reload', { num: this._counter })
        this._counter++
        if (this._counter > 5) {
            this._emit('faild', data)
            return false;
        }
        return this._init(this.url)
    }

    _init(url) {
        var protocol = (window.location.protocol == 'http:') ? 'ws:' : 'wss:';

        this.ws = new WebSocket(`${protocol}//${url}`, this.protocols);

        this.ws.onclose = data => {
            this.ws = null;
            this._reload(data);
            this._emit('close', data)
        }
        this.ws.onerror = data => {
            this._emit('error', data)
        }

        this.ws.onmessage = data => {
            this._emit('message', data)
        }

        this.ws.onopen = data => {
            this._counter = 0;
            this._emit('open', data)
        }

        this.url = url;
    }

    load() {
        this._counter = 0;
        this._init(this.url);
    }

    send(message) {
        if (this.ws) {
            this.ws.send(message);
            return true;
        }
        this._emit('error', { msg: 'please connect to the server first !!!' });
        return false;
    }

    close() {
        if (this.ws != undefined && this.ws != null) {
            this.ws.close();
        } else {
            this._emit('error', { msg: 'this socket is not available' });
        }
    }

}

export {
    WS
}