<template>
    <div class="d-flex gap-2" style="margin: 5px;">
        <el-select v-model="realTimeData.AGVC_TrafficEfficiency_Selector.source" placeholder="選擇搬運來源" 
            @change="handleChange" class="w-50 ">
            <el-option
                v-for="item in sourceList"
                :label="item.name"
                :value="item.name"
            />
        </el-select>
        <el-select v-model="realTimeData.AGVC_TrafficEfficiency_Selector.target" placeholder="選擇搬運目的地" 
            @change="handleChange" class="w-50">
            <el-option
                v-for="item in targetList"
                :label="item.name"
                :value="item.name"
            />
        </el-select>
    </div>
</template>

<script setup lang="ts">
import { realTimeStore } from '@/stores/realTime'

const emit = defineEmits(['selector-change'])
function handleChange() {
  emit('selector-change')
}

const realTimeData = realTimeStore()
const sourceList = [
    {name: 'AGV', value: 'AGV'},
    {name: 'MainEQ', value: 'MainEQ'},
    {name: 'Rack', value: 'Rack'},
]
const targetList = [
    {name: 'MainEQ', value: 'MainEQ'},
    {name: 'Rack', value: 'Rack'},
]

</script>