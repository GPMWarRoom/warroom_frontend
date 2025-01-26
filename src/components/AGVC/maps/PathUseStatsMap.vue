<template>
    <AGVCMapBase :mapId="_mapId" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AGVCMapBase from './AGVCMapBase.vue'
const props = defineProps<{
    mapId: string
}>()

const _mapId = computed(() => {
    return props.mapId
})


</script>

<style scoped>

</style>