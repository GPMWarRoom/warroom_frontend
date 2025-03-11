// api/user.ts

import http from '../utils/http';

const api = {
    login: '/api/user/login',
    users: '/api/user/info'
}

export const userApi = {
    //登录
    login: async (params: LoginParams) => {
        return await http.post<LoginResponse>(api.login, params).then(res => res.data);
    },

    //获取用户信息
    getUserInfo: async () => {
        const token = localStorage.getItem('token');
        if (!token) return Promise.reject(new Error('用户未登录'));
        return await http.get(api.users).then(res => res.data);
    }
}

export interface LoginParams {
    username: string;
    password: string;
}

export interface LoginResponse {
    code: number;
    data: {
        token: string;
    };
}
