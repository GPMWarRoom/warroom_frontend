import { defineStore } from 'pinia'
import { login } from '../api/user'

export const userStore = defineStore('user', {
    state: () => ({
        name: 'Visitor',
        role: 'visitor',
        token: '',
        password: '',
    }),
    getters: {
        getToken: (state) => state.token,
        getIsLogin: (state) => state.role !== 'visitor'
    },
    actions: {
        async login(username: string, password: string) {
            const res = await login({
                username: username,
                password: password
            })
            if (res.code === 200) {
                this.name = username
                this.role = 'admin'
                this.token = '1234567890'
                this.password = password
            }

            return res
        }
    }
})
