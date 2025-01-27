<template>
    <div class="utilization-dashboard d-flex flex-column pt-2">
        <el-row class="" :gutter="8">
            <el-col :lg="8" :md="12" :sm="24">
                <div class="card">
                    <h3>設備稼動</h3>
                    <div class="content">
                        <LineChart class="w-100" :data="[1,2,3,4,5,6,7,8,9,10]" />
                    </div>
                </div>
            </el-col>
            <el-col :lg="8" :md="12" :sm="24"> <div class="card">
                    <h3>設備稼動</h3>
                    <div class="content">
                        <LineChart class="w-100" :data="[1,2,3,4,5,6,7,8,9,10]" />
                    </div>
                </div></el-col>
            <el-col :lg="8" :md="12" :sm="24">
                <div class="card">
                    <h3>設備稼動</h3>
                    <div class="content">
                        <LineChart class="w-100" :data="[1,2,3,4,5,6,7,8,9,10]" />
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="my-2" :gutter="8">
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3>設備稼動</h3>
                    <div class="content">
                        <LineChart class="w-100" :data="[1,2,3,4,5,6,7,8,9,10]" />
                    </div>
                </div></el-col>
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3>設備稼動</h3>
                    <div class="content">
                        <LineChart class="w-100" :data="[1,2,3,4,5,6,7,8,9,10]" />
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="" :gutter="8">
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3>設備稼動</h3>
                    <div class="content">
                        <LineChart class="w-100" :data="[1,2,3,4,5,6,7,8,9,10]" />
                    </div>
                </div></el-col>
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3>設備稼動</h3>
                    <div class="content">
                        <LineChart class="w-100" :data="[1,2,3,4,5,6,7,8,9,10]" />
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import LineChart from '../../common/charts/LineChart.vue'
</script>

<style lang="scss" scoped>
.utilization-dashboard {
    height: 100%;
    width: 100%;
    .el-row{
        height:33.33%;
    }
    @media (max-width: 768px) {
        .el-col {
            width: 100%;
            height: 200px;
        }
    }
}
</style>
