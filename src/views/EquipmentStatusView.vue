<template>
    <div style="width: 100%; height: 100%;">
        <AgvStatus v-if="type === 'agv'" />
        <RackStatus v-else-if="type === 'rack'" />
    </div>
</template>
<script setup lang="ts">
import AgvStatus from '@/components/EquipmentStatus/AGV/index.vue'
import RackStatus from '@/components/EquipmentStatus/Rack/index.vue'
import { useRoute } from 'vue-router'
import { watch, ref } from 'vue'

const route = useRoute()
const type = ref(route.params.type)

watch(
  () => route.params.type,
  (newType) => {
    type.value = newType
  }
)


</script>
<style scoped></style>