import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosHttp from "../utils/axiosHttp";
import {
  apiErrorParser,
  commonSuccessRespFilter,
} from "../helpers/responseHelpers";
import { SuccessDataResponse, VerifyTokenResponse } from "../types/responses";

export interface AuthState {
  id: string;
  username: string;
  token: string;
  status: "unverified" | "verifying" | "verified";
}

const initialState: AuthState = {
  id: "",
  username: "",
  token: "",
  status: "unverified",
};

export const verifyToken = createAsyncThunk("tokens/verify", async () => {
  const token = localStorage.getItem("token")

  if (!token) throw new Error('token not found');

  const response = await axiosHttp
    .post<SuccessDataResponse<VerifyTokenResponse>>("/token/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(commonSuccessRespFilter)
    .catch(apiErrorParser);

  return { ...response.data.data, token };
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuth: (state, action: PayloadAction<AuthState>) => {
      state.id = action.payload.id;
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(verifyToken.fulfilled, (state, action) => {
      state.username = action.payload.username;
      state.id = action.payload.id;
      state.token = action.payload.token;
      state.status = "verified";
    });
    builder.addCase(verifyToken.rejected, (state, action) => {
      state.status = "unverified";
    });
    builder.addCase(verifyToken.pending, (state, action) => {
      state.status = "verifying";
    });
  },
});

export const { updateAuth } = authSlice.actions;

export default authSlice.reducer;
