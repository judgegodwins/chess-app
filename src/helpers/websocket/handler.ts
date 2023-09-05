import { WebsocketEvent } from "./events";

export default class WebsocketHandler {
  // @ts-ignore
  connection?: WebSocket;
  callbacks: { [key: string]: ((data: any) => any) | undefined } = {};

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
      clearTimeout(this.activeTimeout);
    }

    this.connectionAttempts += 1;
    this.connection = new WebSocket(this.url, this.protocols);

    // call .on("open") callback
    this.connection.onopen = (evt) => {
      const cb = this.callbacks["open"];
      if (cb) cb(evt);
    };

    this.connection.onmessage = (evt: MessageEvent<any>) => {
      const eventData = JSON.parse(evt.data);
      const event = new WebsocketEvent(eventData.type, eventData.payload);

      const cb = this.callbacks[event.type];
      if (cb) cb(event.payload);
    };

    this.connection.onclose = (e) => {
      const cb = this.callbacks["close"];
      if (cb) {
        cb(undefined);
      }

      if (e.code === 1000) return;

      this.activeTimeout = setTimeout(() => {
        console.log("Abrupt closure, retrying websocket connection");
        if (this.destroyed) {
          console.log("stopping reconnection");
          return;
        }
        console.log("---------about to reconnect-----------");
        this.connect();
      }, 1000);
    };

    this.connection.onerror = (e) => {
      console.log("error from websocket", e);
      // this.connection.close();
    };
  }

  destroy() {
    this.destroyed = true;
    if (this.connection) this.connection.close(1000, "unmounting component");
  }

  sendEvent<T extends Record<any, any>>(
    type: string,
    payload: T,
    callback?: (err: { message: string }) => any
  ) {
    if (!this.connection) return;
    const evt = new WebsocketEvent(type, payload);
    const str = JSON.stringify(evt);

    const traceEventName = `error_${evt.trace_id}`;

    // handle error returned for this event
    this.on(traceEventName, (payload: { message: string }) => {
      if (callback) callback(payload);
    });

    this.connection.send(str);
  }

  on<T>(type: string, callback: (payload: T) => any) {
    this.callbacks[type] = callback;
  }

  off(evtName: string) {
    delete this.callbacks[evtName];
  }
}
