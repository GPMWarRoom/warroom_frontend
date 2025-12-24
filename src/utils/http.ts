import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ref } from 'vue'

const config = ref<{ API_URL?: string }>({})

// 載入設定檔的函式
async function loadConfig() {
  if (config.value.API_URL) return config.value
  try {
    const res = await fetch('/config.json')
    config.value = await res.json()
    return config.value
  } catch (err) {
    console.error('無法載入 config.json', err)
    return { API_URL: '/api' } // 備用方案
  }
}

// 基礎響應類型
interface BaseResponse<T = any> {
    code: number;
    data: T;
    message: string;
}

// 創建 axios 實例
const http: AxiosInstance = axios.create({
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 請求攔截器
http.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // 確保 config.json 已載入
        const cfg = await loadConfig();
        
        // 動態設定本次請求的 baseURL
        if (cfg.API_URL) {
            config.baseURL = cfg.API_URL;
        }

        // 統一加入 token
        const token = localStorage.getItem('token');
        if (token && config.headers) {
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