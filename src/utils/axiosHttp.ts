import axios, { InternalAxiosRequestConfig } from "axios";

const axiosHttp = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosHttp.interceptors.request.use(function (config) {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  } as InternalAxiosRequestConfig<any>;
});

export default axiosHttp;
