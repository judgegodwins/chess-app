import { RoomResponse } from "../../types/responses";

export class WebsocketEvent<T> {
  constructor(
    public type: string,
    public payload: T,
  ){}
}

export class Payload {}

export type RoomPayload = RoomResponse;
