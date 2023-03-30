import {
  apiErrorParser,
  commonSuccessRespFilter,
} from "../helpers/responseHelpers";
import { SuccessDataResponse, RoomResponse, SuccessResponse } from "../types/responses";
import axiosHttp from "../utils/axiosHttp";

export default class Service {
  static http = axiosHttp;

  static createRoom() {
    return Service.http
      .post<SuccessDataResponse<RoomResponse>>("/rooms")
      .then(commonSuccessRespFilter)
      .catch(apiErrorParser);
  }

  static checkRoom(id: string) {
    return Service.http
      .post<SuccessResponse>("/rooms/verify", null, { params: { id } })
      .then(commonSuccessRespFilter)
      .catch(apiErrorParser);
  }
}
