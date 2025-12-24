// utils/request.ts
import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ref } from 'vue';

const appConfig = ref<{ API_URL?: string }>({});

// 載入設定檔的函式
async function loadConfig() {
    if (appConfig.value.API_URL) return appConfig.value;
    try {
        const res = await fetch('/config.json');
        appConfig.value = await res.json();
        return appConfig.value;
    } catch (err) {
        console.error('無法載入 config.json', err);
        return { API_URL: import.meta.env.VITE_API_URL || '' };
    }
}

// 建立一個 axios 實例
const request: AxiosInstance = axios.create({
    timeout: 20000,
});


request.interceptors.request.use(
    async function (config: InternalAxiosRequestConfig) {
        // 1. 動態注入 baseURL
        const cfg = await loadConfig();
        config.baseURL = cfg.API_URL;

        // 2. 請求地址攜帶時間戳 (修正拼接邏輯)
        const _t = new Date().getTime();
        if (config.url) {
            config.url += (config.url.includes('?') ? '&' : '?') + `t=${_t}`;
        }

        // 3. 請求頭攜帶 token
        config.headers['token'] = localStorage.getItem('token') || '';

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// 添加響應攔截器
request.interceptors.response.use(
    function (response: AxiosResponse) {
        // 特別處理：如果是二進位檔案 (Blob)，直接回傳整個 response
        // 這樣你在 csvExport 才能拿到 headers 裡的檔名
        if (response.config.responseType === 'blob') {
            return response;
        }

        if (response.status === 200) {
            return response.data; // 正常 JSON 請求回傳 data
        } else {
            return Promise.reject(response);
        }
    },
    function (error) {
        if (error && error.response) {
            switch (error.response.status) {
                case 400: error.message = '錯誤請求'; break;
                case 401: error.message = '未授權，請重新登錄'; break;
                case 404: error.message = '請求錯誤,未找到該資源'; break;
                case 500: error.message = '伺服器端出錯'; break;
                default: error.message = `未知錯誤${error.response.status}`;
            }
        } else {
            error.message = "連接到伺服器失敗";
        }
        return Promise.reject(error);
    }
);

/**
 * 封裝請求方法
 */
export function get<T = any>(url: string, params = {}, config = {}): Promise<T> {
    return request.get(url, { params, ...config });
}

export function post<T = any>(url: string, data = {}, config = {}): Promise<T> {
    return request.post(url, data, config);
}



export default { get, post };
