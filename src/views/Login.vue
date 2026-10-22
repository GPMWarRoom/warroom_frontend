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
import { userStore } from '../stores/user'
const router = useRouter()
const user = userStore()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
    try {
        errorMessage.value = ''
        isLoading.value = true

        const result = await user.login(username.value, password.value)
        if (result.code === 200) {
            if (rememberMe.value) {
                localStorage.setItem('username', username.value)
            }

            router.push('/overview')
        } else {
            errorMessage.value = 'Login failed'
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
    background: transparent;
    /* 背景沿用全域漸層 */
}

.login-box {
    background: var(--card-bg);
    /* 深色卡片背景 */
    padding: 2rem;
    border-radius: var(--radius-card);
    box-shadow: var(--glass-shadow);
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--card-border-color);
    backdrop-filter: var(--glass-blur);
    /* 添加邊框 */
}

h1 {
    margin-bottom: 1.5rem;
    color: var(--text-color);
    /* 白色標題 */
    text-align: center;
}

.form-group {
    margin-bottom: 1.25rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-muted);
    /* 淺灰色標籤 */
    font-size: 0.9rem;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-strong);
    /* 深色邊框 */
    border-radius: var(--radius-control);
    font-size: 1rem;
    background-color: var(--el-fill-color-blank);
    /* 輸入框深色背景 */
    color: var(--text-color);
    /* 輸入文字顏色 */
}

input::placeholder {
    color: var(--el-text-color-placeholder);
    /* 佔位符顏色 */
}

input:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-color) 25%, transparent);
}

.options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    color: var(--text-muted);
    /* 選項文字顏色 */
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.forgot-password {
    color: var(--accent-color);
    text-decoration: none;
    font-size: 0.9rem;
}

.forgot-password:hover {
    text-decoration: underline;
}

button {
    width: 100%;
    padding: 0.75rem;
    background: var(--accent-gradient);
    color: white;
    border: none;
    border-radius: var(--radius-pill);
    font-size: 1rem;
    cursor: pointer;
    box-shadow: var(--accent-glow);
    transition: filter 0.2s;
}

button:hover {
    filter: brightness(1.12);
}

button:disabled {
    filter: saturate(0.4) brightness(0.8);
    cursor: not-allowed;
}

/* 複選框樣式 */
input[type="checkbox"] {
    width: auto;
    margin-right: 0.5rem;
    accent-color: var(--accent-fill);
}

.error-message {
    color: var(--el-color-danger);
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
}
</style>
