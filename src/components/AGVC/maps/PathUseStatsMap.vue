<template>
    <AGVCMapBase :mapId="_mapId" :mapModel="mapModel" />
</template>
<script setup lang="ts">
import { computed } from 'vue';
import AGVCMapBase from './AGVCMapBase.vue'
import type { MapModel } from '../../../models/MapModel'
const props = defineProps<{
    mapId: string
    mapModel: MapModel
}>()

const _mapId = computed(() => {
    return props.mapId
})

</script>
<style scoped></style>