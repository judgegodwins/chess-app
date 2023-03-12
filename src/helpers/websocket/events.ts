
export class WebsocketEvent<T> {
  constructor(
    public type: string,
    public payload: T,
  ){}
}

export class Payload {}
