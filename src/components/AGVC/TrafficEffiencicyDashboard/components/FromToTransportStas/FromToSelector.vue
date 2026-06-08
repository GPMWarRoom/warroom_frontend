<template>
    <div class="d-flex gap-2" style="margin: 5px;">
        <el-select v-model="realTimeData.AGVC_TrafficEfficiency_Selector.source" placeholder="選擇搬運來源" 
            @change="handleChange" class="w-50 ">
            <el-option
                v-for="item in sourceList"
                :label="item.name"
                :value="item.value"
            />
        </el-select>
        <el-select v-model="realTimeData.AGVC_TrafficEfficiency_Selector.target" placeholder="選擇搬運目的地" 
            @change="handleChange" class="w-50">
            <el-option
                v-for="item in targetList"
                :label="item.name"
                :value="item.value"
            />
        </el-select>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { realTimeStore } from '@/stores/realTime'

const emit = defineEmits(['selector-change'])
function handleChange() {
  emit('selector-change')
}

const realTimeData = realTimeStore()

const eqLists = computed(() => {
    const sourceEqs = new Set<string>();
    const targetEqs = new Set<string>();
    const data = realTimeData.AGVC_TrafficEfficiency_CarryStaticsByPath || [];

    const checkIsRack = (name: string) => {
        if (!name) return false;
        if (name.includes('轉換站')) return false;
        return /^WIP[\d\-_]*/i.test(name) || name.toUpperCase().includes('RACK');
    };

    const checkIsAGV = (name: string) => {
        if (!name) return false;
        return name.toUpperCase().includes('AGV');
    };

    data.forEach((item: any) => {
        let fromName = item.FromName;
        let toName = item.ToName;

        if (!fromName && !toName && item.Path) {
            if (item.Path.includes('->')) {
                const parts = item.Path.split('->');
                fromName = parts[0].trim();
                toName = parts[1].trim();
            } else if (item.Path.includes('-')) {
                const parts = item.Path.split('-');
                if (parts.length === 2) {
                    fromName = parts[0].trim();
                    toName = parts[1].trim();
                }
            }
        }

        if (fromName && !checkIsRack(fromName) && !checkIsAGV(fromName)) {
            sourceEqs.add(fromName);
        }
        if (toName && !checkIsRack(toName) && !checkIsAGV(toName)) {
            targetEqs.add(toName);
        }
    });

    return {
        sourceList: Array.from(sourceEqs).map(name => ({name, value: name})).sort((a, b) => a.name.localeCompare(b.name)),
        targetList: Array.from(targetEqs).map(name => ({name, value: name})).sort((a, b) => a.name.localeCompare(b.name))
    };
});

const sourceList = computed(() => {
    return [
        {name: 'AGV', value: 'AGV'},
        {name: 'Rack', value: 'Rack'},
        ...eqLists.value.sourceList
    ]
})

const targetList = computed(() => {
    return [
        {name: '所有設備', value: ''},
        {name: 'Rack', value: 'Rack'},
        ...eqLists.value.targetList
    ]
})

</script>