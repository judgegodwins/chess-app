import { WebsocketEvent } from "./events";

export default class WebsocketHandler {
  // @ts-ignore
  connection: WebSocket;
  callbacks: { [key: string]: (data: any) => any } = {};

  connectionAttempts = 0;

  constructor(public url: string, public protocols?: string[]) {
    // this.connect(this.url, this.protocols);
  }

  connect() {
    this.connectionAttempts += 1;
    console.log('connection', this.connection);
    console.log("connecting...", this.connectionAttempts);
    this.connection = new WebSocket(this.url, this.protocols);

    this.connection.onmessage = (evt: MessageEvent<any>) => {
      console.log("event", evt);
      const eventData = JSON.parse(evt.data);
      const event = new WebsocketEvent(eventData.type, eventData.payload);

      if (this.callbacks[event.type]) this.callbacks[event.type](event.payload);
    };

    this.connection.onclose = (e) => {
      // console.log('close', this.connectionAttempts);
      console.log('state:', this.connection.readyState);
      console.log('close code', e.code, 'reason:', e.reason, this.connectionAttempts);
      if (e.code === 1000) return;
      // console.log('setting timeout to reconnect', e.code)
      setTimeout(() => {
        console.log("Abrupt closure, retrying websocket connection", );
        this.connect();
      }, 1000);
    };

    this.connection.onerror = (e) => {
      console.log("websocket encountered error", e);
      // this.connection.close();
    };
  }

  sendEvent<T extends Record<any, any>>(type: string, payload: T) {
    const evt = new WebsocketEvent(type, payload);

    const str = JSON.stringify(evt);
    this.connection.send(str);
  }

  on<T>(type: string, callback: (payload: T) => any) {
    this.callbacks[type] = callback;
  }
}
