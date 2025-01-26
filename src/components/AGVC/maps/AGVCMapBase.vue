<template>
    <div class="w-100 h-100" :id="mapId"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Map } from 'ol'
import { createCustomMap } from '../../../utils/map-utils'
const map = ref<Map | null>(null)
const props = defineProps<{
    mapId: string
}>()
onMounted(() => {
    map.value = createCustomMap(props.mapId, '', 272, 92)
    // addPoints()
})  

// const addPoints = ()=>{
//     const layer = createLayerWithFeatures([])
//     //addLayerToMap(map.value, layer)
// }

</script>

<style scoped>

</style>