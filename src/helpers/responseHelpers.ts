import axios, { AxiosError, AxiosResponse } from "axios";
import { ApiError } from "./ApiError";
import { APIResponse } from "../types/responses";

export const apiErrorParser = (e: Error | AxiosError<APIResponse>) => {
  if (axios.isAxiosError(e) && e.response) {
    throw new ApiError(e.response?.data.message, e.response.status);
  } else {
    throw e;
  }
}

export const commonSuccessRespFilter = <RType extends APIResponse>(
  response: AxiosResponse<RType>
) => {
  if (response.data.status === "error")
    throw new ApiError(response.data.message, response.status);

  return response;
};
