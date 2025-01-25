<template>
    <div class="about">
        <h1>About Page</h1>
        <p>This is an about page</p>
        <el-tag>TEST</el-tag>
        <el-select v-model="value" placeholder="Select">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' }
]
const value = ref('')
</script>