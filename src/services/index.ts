import {
  apiErrorParser,
  commonSuccessRespFilter,
} from "../helpers/responseHelpers";
import { SuccessDataResponse, RoomResponse } from "../types/responses";
import axiosHttp from "../utils/axiosHttp";

export function createRoom() {
  return axiosHttp
    .post<SuccessDataResponse<RoomResponse>>("/rooms")
    .then(commonSuccessRespFilter)
    .then((r) => r.data.data)
    .catch(apiErrorParser);
}

export function checkRoom(id: string) {
  return axiosHttp
    .get<
      SuccessDataResponse<{
        id: string;
        full: boolean;
      }>
    >(`/rooms/${id}`)
    .then(commonSuccessRespFilter)
    .then((r) => r.data.data)
    .catch(apiErrorParser);
}
