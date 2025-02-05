import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 基礎響應類型
interface BaseResponse<T = any> {
    code: number;
    data: T;
    message: string;
}

// 創建 axios 實例
const http: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 請求攔截器
http.interceptors.request.use(
    (config) => {
        // 可以在這裡統一加入 token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 響應攔截器
http.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 統一錯誤處理
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 處理未授權
                    break;
                case 403:
                    // 處理禁止訪問
                    break;
                case 404:
                    // 處理未找到
                    break;
                default:
                    // 處理其他錯誤
                    break;
            }
        }
        return Promise.reject(error);
    }
);

// 封裝 GET 請求
export function get<T = any>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
): Promise<BaseResponse<T>> {
    return http.get(url, { params, ...config }).then(response => response.data);
}

// 封裝 POST 請求
export function post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<BaseResponse<T>> {
    return http.post(url, data, config).then(response => response.data);
}

// 封裝 PUT 請求
export function put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<BaseResponse<T>> {
    return http.put(url, data, config).then(response => response.data);
}

// 封裝 DELETE 請求
export function del<T = any>(
    url: string,
    config?: AxiosRequestConfig
): Promise<BaseResponse<T>> {
    return http.delete(url, config).then(response => response.data);
}

// 導出實例
export default http; 