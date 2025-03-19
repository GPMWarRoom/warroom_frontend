import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteMockServe } from 'vite-plugin-mock';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        viteMockServe({
            mockPath: 'mock',
            enable: true,
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@api': path.resolve(__dirname, './src/api'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@views': path.resolve(__dirname, './src/views'),
        }
    }
});
