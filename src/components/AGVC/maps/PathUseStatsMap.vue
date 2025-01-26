<template>
    <AGVCMapBase :mapId="mapId" />
</template>

<script setup lang="ts">
import AGVCMapBase from './AGVCMapBase.vue'
const props = defineProps<{
    mapId: string
}>()


</script>

<style scoped>

</style>