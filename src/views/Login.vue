<template>
    <div class="login-container">
        <div class="login-box">
            <h1>Login</h1>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input
                        id="username"
                        v-model="username"
                        type="text"
                        required
                        placeholder="Enter your username">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        required
                        placeholder="Enter your password">
                </div>
                <div class="options">
                    <label class="remember-me">
                        <input type="checkbox" v-model="rememberMe"> Remember me </label>
                    <a href="#" class="forgot-password">Forgot Password?</a>
                </div>
                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <button type="submit" :disabled="isLoading"> {{ isLoading ? 'Logging in...' : 'Log In' }} </button>
            </form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/user'

const router = useRouter()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
    try {
        errorMessage.value = ''
        isLoading.value = true

        const res = await login({
            username: username.value,
            password: password.value
        })

        if (res.code === 200) {
            if (rememberMe.value) {
                localStorage.setItem('username', username.value)
            }
            router.push('/')
        } else {
            errorMessage.value = res.message || 'Login failed'
        }
    } catch (error: any) {
        console.error('Login failed:', error)
        errorMessage.value = error.message || 'Login failed. Please try again.'
    } finally {
        isLoading.value = false
    }
}
</script>
<style scoped>
.login-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
    /* 微妙的深色漸層背景 */
}

.login-box {
    background: #2a2a2a;
    /* 深色卡片背景 */
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 400px;
    border: 1px solid #333;
    /* 添加邊框 */
}

h1 {
    margin-bottom: 1.5rem;
    color: #fff;
    /* 白色標題 */
    text-align: center;
}

.form-group {
    margin-bottom: 1.25rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #ccc;
    /* 淺灰色標籤 */
    font-size: 0.9rem;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #444;
    /* 深色邊框 */
    border-radius: 4px;
    font-size: 1rem;
    background-color: #333;
    /* 輸入框深色背景 */
    color: #fff;
    /* 輸入文字顏色 */
}

input::placeholder {
    color: #666;
    /* 佔位符顏色 */
}

input:focus {
    outline: none;
    border-color: #42b983;
    /* Vue綠色 */
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    color: #ccc;
    /* 選項文字顏色 */
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.forgot-password {
    color: #42b983;
    /* Vue綠色 */
    text-decoration: none;
    font-size: 0.9rem;
}

.forgot-password:hover {
    text-decoration: underline;
}

button {
    width: 100%;
    padding: 0.75rem;
    background-color: #42b983;
    /* Vue綠色 */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #3aa876;
    /* 深一點的Vue綠色 */
}

button:disabled {
    background-color: #2c745a;
    /* 更深的Vue綠色 */
    cursor: not-allowed;
}

/* 複選框樣式 */
input[type="checkbox"] {
    width: auto;
    margin-right: 0.5rem;
    accent-color: #42b983;
    /* Vue綠色 */
}

.error-message {
    color: #ff6b6b;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
}
</style>
