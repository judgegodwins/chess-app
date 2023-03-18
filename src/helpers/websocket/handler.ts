import { WebsocketEvent } from "./events";

export default class WebsocketHandler {
  // @ts-ignore
  connection: WebSocket;
  callbacks: { [key: string]: (data: any) => any } = {};

  activeTimeout?: NodeJS.Timeout;

  connectionAttempts = 0;

  destroyed = false;

  constructor(public url: string, public protocols?: string[]) {
    // this.connect(this.url, this.protocols);
  }

  connect() {
    // cancel timeout if another call to connect is made
    this.destroyed = false;
    if (this.activeTimeout !== undefined) {
      console.log('activeTimeout', this.activeTimeout);
      clearTimeout(this.activeTimeout);
    }

    this.connectionAttempts += 1;
    console.log("connecting...", this.connectionAttempts);
    this.connection = new WebSocket(this.url, this.protocols);

    console.log('connected', this.connection);

    setTimeout(() => console.log('connection after 1000', this.connection), 10000);

    this.connection.onmessage = (evt: MessageEvent<any>) => {
      console.log("event", evt);
      const eventData = JSON.parse(evt.data);
      const event = new WebsocketEvent(eventData.type, eventData.payload);

      if (this.callbacks[event.type]) this.callbacks[event.type](event.payload);
    };

    this.connection.onclose = (e) => {
      // console.log('close', this.connectionAttempts);
      // console.log('readystate:', this.connection.readyState);
      // console.log('close code', e.code, 'reason:', e.reason, this.connectionAttempts);
      
      console.log('destroyed', this.destroyed)
      if (e.code === 1000) return;

      this.activeTimeout = setTimeout(() => {
        console.log("Abrupt closure, retrying websocket connection", );
        if (this.destroyed) {
          console.log('stopping reconnection');
          return;
        }
        this.connect();
      }, 1000);
    };

    this.connection.onerror = (e) => {
      console.log('error from websocket', e)
      // this.connection.close();
    };
  }

  destroy() {
    this.destroyed = true;
    this.connection.close(1000, 'unmounting component');
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
