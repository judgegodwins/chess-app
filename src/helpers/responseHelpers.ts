import axios, { AxiosError, AxiosResponse } from "axios";
import { FailureResponse, SuccessResponse } from "../types/responses";
import { ApiError } from "./ApiError";

export const apiErrorParser = (e: Error | AxiosError<FailureResponse>) => {
  console.log('code:', (e as any).code, (e as any).response);
  if (axios.isAxiosError(e) && e.response) {
    throw new ApiError(e.response?.data.message, e.response);
  } else {
    throw e;
  }
}

export const commonSuccessRespFilter = <RType extends SuccessResponse>(
  response: AxiosResponse<RType>
) => {
  if (!response.data.success)
    throw new Error(response.data.message);

  return response;
}