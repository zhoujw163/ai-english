import router from '@/router';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import { refreshTokenApi } from './auth';

export const timeout = 50000;

// 服务器接口
export const serverApi = axios.create({
  baseURL: '/api/v1',
  timeout
});

// 存储失败的请求
let requestQueue: ((newAccessToken: string) => void)[] = []; //存储失败的请求
// 是否正在刷新token
let isRefreshing = false;

// 请求拦截器
serverApi.interceptors.request.use((config) => {
  const userStore = useUserStore();
  if (userStore.getAccessToken) {
    config.headers.Authorization = `Bearer ${userStore.getAccessToken}`;
  }
  return config;
});

// 响应拦截器
serverApi.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (error) => {
    if (error.response.status !== 401) {
      //其他code码就直接抛出异常
      return Promise.reject(error);
    }
    //下面的逻辑就是处理401的情况了
    const userStore = useUserStore();
    const accessToken = userStore.getAccessToken;
    const refreshToken = userStore.getRefreshToken;
    const originalRequest = error.config; //读取原始请求

    if (!accessToken || !refreshToken) {
      userStore.logout(); //清空user
      router.replace('/'); //跳转到首页
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push((newAccessToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(serverApi(originalRequest));
        });
      });
    }
    //刷新token调用接口
    isRefreshing = true;
    try {
      const newToken = await refreshTokenApi({ refreshToken: refreshToken });
      if (newToken.success) {
        //切换成功更新token到pinia中
        userStore.updateToken(newToken.data);
      } else {
        userStore.logout(); //清空user
        router.replace('/'); //跳转到首页
        return Promise.reject(error);
      }
      const newAccessToken = newToken.data.accessToken;
      requestQueue.forEach((callback) => callback(newAccessToken)); //执行存储的请求
      return serverApi(originalRequest);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      requestQueue = []; //清空队列
      isRefreshing = false; //重置刷新状态
    }
  }
);

// 刷新 token 接口
export const refreshApi = axios.create({
  baseURL: '/api/v1',
  timeout
});
refreshApi.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

// ai 服务接口
export const aiApi = axios.create({
  baseURL: '/api/ai/v1',
  timeout
});

aiApi.interceptors.response.use((res) => {
  return res.data;
});

export interface Response<T = any> {
  timestamp: string;
  path: string;
  message: string;
  code: number;
  success: boolean;
  data: T;
}
