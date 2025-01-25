import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

// 創建 axios 實例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
// instance.interceptors.request.use(
//   (config: AxiosRequestConfig) => {
//     // 在發送請求之前做些什麼
//     const token = localStorage.getItem('token')
//     if (token) {
//       config.headers = {
//         ...config.headers,
//         Authorization: `Bearer ${token}`
//       }
//     }
//     return config
//   },
//   (error: any) => {
//     // 對請求錯誤做些什麼
//     return Promise.reject(error)
//   }
// )

// 響應攔截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 對響應數據做點什麼
    return response.data
  },
  (error: any) => {
    // 對響應錯誤做點什麼
    if (error.response?.status === 401) {
      // 處理未授權的情況
      localStorage.removeItem('token')
      // 可以在這裡添加重定向到登入頁面的邏輯
    }
    return Promise.reject(error)
  }
)

export default instance 