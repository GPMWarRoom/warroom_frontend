// api/user.ts

import { get, post } from '../utils/axios';

const api = {
    login: '/api/user/login',
    users: '/api/user/info'
}

//登录
export const login = (params: any) => {
    return post(api.login, params).then((res: any) => {
        if (res.code === 200) {
            localStorage.setItem('token', res.data.token);
        }
        return Promise.resolve(res);
    })
}


//获取用户信息
export const getUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject(new Error('用户未登录'));
    return get(api.users);
}
