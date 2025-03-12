<template>
    <div class="alarm-message d-flex align-items-center">
        <Icon class="" height="20px" icon="mdi:alert-circle" />
        <div class="message-container mx-2 d-flex flex-row align-items-center w-100">
            <span>4F-MECff</span>
            <Icon class="" height="30px" icon="material-symbols:arrow-right-rounded" />
            <div class="mx-1"> {{ messageShow }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { alarmStore } from '../../stores/alarms';
const alarmsStore = alarmStore();
const currentAlarms = computed(() => alarmsStore.getAlarms);
const messageShow = ref('');

onMounted(() => {
    let currentIndex = 0;
    setInterval(() => {
        if (currentAlarms.value.length > 0) {
            messageShow.value = currentAlarms.value[currentIndex].message;
            currentIndex = (currentIndex + 1) % currentAlarms.value.length;
        } else {
            messageShow.value = '目前無警報';
        }
    }, 3000);
});
</script>
<style lang="scss" scoped>
.alarm-message {
    width: 100%;
    height: 80%;
    background-color: #ff0000;
    display: flex;
    align-items: center;
    color: rgb(255, 255, 255);
    padding-inline: 10px;
    font-weight: bold;
    border-radius: 4px;
    border: 1px solid rgb(255, 255, 255);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>