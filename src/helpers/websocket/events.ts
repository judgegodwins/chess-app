import { RoomResponse } from "../../types/responses";
import { v4 as uuidV4 } from "uuid";

export class WebsocketEvent<T> {
  trace_id: string
  constructor(
    public type: string,
    public payload: T,
  ){
    console.log("uuid", uuidV4())
    this.trace_id = uuidV4()
  }
}

export class Payload {}

export type RoomPayload = RoomResponse;
