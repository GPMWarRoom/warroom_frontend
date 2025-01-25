import axios from '../utils/axios'

export interface User {
  id: number
  name: string
  email: string
}

export const userApi = {
  getUsers() {
    return axios.get<User[]>('/users')
  },
  
  getUserById(id: number) {
    return axios.get<User>(`/users/${id}`)
  },
  
  createUser(user: Omit<User, 'id'>) {
    return axios.post<User>('/users', user)
  }
} 