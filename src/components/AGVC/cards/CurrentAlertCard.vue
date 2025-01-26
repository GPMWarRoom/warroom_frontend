<template>
    <el-card class="">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>當前警報訊息</span>
            </div>
        </template>
        <div class="alert-message text-danger">
            <span>AGV-001 發生故障</span>
        </div>
    </el-card>
</template> 

<script setup lang="ts">

</script>

<style scoped>
.alert-message {
    border: 1px solid #333;
}
</style>