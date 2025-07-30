<template>
    <AGVCMapBase :mapId="_mapId" :mapModel="mapModel" :showMode="'pathUseStats'" 
        :pathUseStats="data" />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import AGVCMapBase from './AGVCMapBase.vue'
import type { MapModel } from '@/models/MapModel'
import { realTimeStore } from '@/stores/realTime'

const realTimeData = realTimeStore()
const props = defineProps<{
    mapId: string
    mapModel: MapModel
    data: any
}>()

const _mapId = computed(() => {
    return props.mapId
})

</script>
<style scoped></style>