import { WebsocketEvent } from "./events";

export function newEvent<T>(type: string, payload: T) {
  return new WebsocketEvent(type, payload)
}