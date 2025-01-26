<template>
  <div class="version-container d-flex flex-row">
    <div class="w-100 versions-view"> {{ versions }} <div
        class="w-100 mb-4"
        v-for="floor in Object.keys(groupedVersions)"
        :id="`floor-${floor}`"
        :key="floor">
        <div class="floor-number-container border-bottom text-start">
          <span>
            <el-icon color="orange">
              <Location />
            </el-icon> {{ floor }}F </span>
        </div>
        <el-table
          size="small"
          :data="groupedVersions[floor]"
          border
          :header-cell-style="tableHeaderStyle"
          :cell-style="tableCellStyle"
          style="width: 100%">
          <el-table-column prop="Name" label="場域名稱" width="180" />
          <el-table-column prop="Version" label="派車平台版本" width="180">
            <template #default="scope">
              <el-tag effect="dark" type="success" size="large">{{ scope.row.Version }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="vehiclesVersions" label="車輛版本">
            <template #default="scope">
              <el-table
                size="small"
                border
                :data="scope.row.vehiclesVersions"
                :header-cell-style="vehicleTableHeaderStyle"
                :cell-style="tableCellStyle">
                <el-table-column prop="Name" label="車輛名稱" width="180" />
                <el-table-column prop="Version" label="車輛版本">
                  <template #default="scope">
                    <el-tag effect="dark" type="info" size="large">{{ scope.row.Version }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
        </el-table>
        <!-- <div
          v-for="version in groupedVersions[floor]"
          :key="version.Name"
          >{{ version.Name }} - {{ version.Version }}</div>-->
      </div>
    </div>
    <div class="contents mx-2 align-self-start">
      <SimpleContent :class1HeaderNumber="class1HeaderNumber" :currentActiveValue="indexOfCurrentFloor">
        <template #content-data>
          <div class style="width:150px;">
            <div
              @click="handleFloorClick(floor)"
              class="w-100 mb-2 content-floor-item"
              :class="{ 'text-primary': currentFloor === floor }"
              v-for="floor in Object.keys(groupedVersions)"
              :key="floor">
              <div class="btext-start">
                <span>
                  <el-icon color="orange">
                    <Location />
                  </el-icon> {{ floor }}F </span>
              </div>
            </div>
          </div>
        </template>
      </SimpleContent>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Location, } from "@element-plus/icons-vue";
import { AGVSFieldVersionInfo } from '../models/Version/FieldVersionModels'
import { versionStore } from '../stores/index'

import SimpleContent from '../components/common/SimpleContent.vue'

const tableHeaderStyle = reactive({
  background: 'rgb(1, 1, 1)',
  color: '#ffffff',
})

const vehicleTableHeaderStyle = reactive({
  background: 'rgb(37 73 70)',
  color: '#ffffff',
})

const tableCellStyle = reactive({
  background: 'rgb(22, 22, 12)',
  color: '#ffffff',
})

const versions = ref([new AGVSFieldVersionInfo()])
var groupedVersions = reactive({})
const _versionStore = versionStore()
var currentFloor = ''

onMounted(async () => {
  const _versions = await _versionStore.fetchVersions()
  versions.value = _versions;
  groupedVersions = _versions.reduce((acc: any, version: AGVSFieldVersionInfo) => {
    acc[version.floor] = acc[version.floor] || [];
    acc[version.floor].push(version);
    return acc;
  }, {});;
  currentFloor = Object.keys(groupedVersions)[0];
})
const handleScroll = () => {
  const floors = Object.keys(groupedVersions)
  for (const floor of floors) {
    const element = document.getElementById(`floor-${floor}`)
    if (element) {
      const rect = element.getBoundingClientRect()
      // Check if element is in viewport
      if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
        currentFloor = floor
        break
      }
    }
  }
}


const versionsView = document.querySelector('.versions-view')
if (versionsView) {
  versionsView.addEventListener('scroll', handleScroll)
}

const class1HeaderNumber = computed(() => {
  return Object.keys(groupedVersions).length
})

const indexOfCurrentFloor = computed(() => {
  return Object.keys(groupedVersions).indexOf(currentFloor)
})

const handleFloorClick = (floor: string) => {
  currentFloor = floor
  const element = document.getElementById(`floor-${floor}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}
</script>
<style scoped lang="scss">
.version-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  //   background-color: #f0f0f0;
  .floor-number-container {
    font-size: 1.65rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .versions-view {
    height: calc(100vh - 100px);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .contents {
    padding-top: 2.3rem;

    .content-floor-item {
      background-color: black;
    }

    .content-floor-item:hover {
      background-color: #f0f0f0;
    }
  }
}
</style>