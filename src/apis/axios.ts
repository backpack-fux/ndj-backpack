import axios from 'axios';

export const AxiosInstance = axios.create();

AxiosInstance.interceptors.request.use(
  async config => {
    // const token = await getAuthToken();
    // if (token) {
    //   config.headers.Authorization = 'Bearer ' + token;
    // }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
