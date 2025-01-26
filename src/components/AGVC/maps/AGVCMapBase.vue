<template>
    <div class="" :id="mapId"></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Map, Feature } from 'ol'
import { Point, LineString } from 'ol/geom'
import { Style, Circle, Fill, Stroke, Text, RegularShape } from 'ol/style'
import { createCustomMap, createLayerWithFeatures, addLayerToMap } from '../../../utils/map-utils'
import type { MapModel } from '../../../models/MapModel'
const map = ref<Map | null>(null)
const props = defineProps<{
    mapId: string
    mapModel: MapModel
}>()
onMounted(() => {
    setTimeout(() => {
        map.value = createCustomMap(props.mapId, '', 272, 92)
        addPathLines();
        addPoints();
    }, 1000)
})

const addPoints = () => {
    const features = createMapPointFeatures(props.mapModel)
    const layer = createLayerWithFeatures(features)
    addLayerToMap(map.value, layer)
}

const createMapPointFeatures = (mapModel: MapModel) => {
    return Object.values(mapModel.Map.Points).map((point: any) => {
        const feature = new Feature({
            geometry: new Point([point.X, point.Y]),
        });

        // 创建点位样式
        const pointStyle = new Style({
            // 点位圆圈
            image: new Circle({
                radius: 6,
                fill: new Fill({
                    color: getPointColor(point.StationType)
                }),
                stroke: new Stroke({
                    color: '#ffffff',
                    width: 2
                })
            }),
            // 文字标签
            text: new Text({
                text: point.Graph.Display || point.Name,
                offsetY: -15,
                fill: new Fill({
                    color: getTextColor(point.StationType)
                }),
                stroke: new Stroke({
                    color: '#ffffff',
                    width: 3
                })
            })
        });

        feature.setStyle(pointStyle);
        return feature;
    });
};

// 根据站点类型获取颜色
const getPointColor = (stationType: number) => {
    switch (stationType) {
        case 0: // 普通点位
            return '#42b983';
        case 1: // 工作站
            return '#409eff';
        case 2: // 缓冲站
            return '#e6a23c';
        case 3: // 充电站
            return '#f56c6c';
        default:
            return '#909399';
    }
};

// 获取文字颜色
const getTextColor = (stationType: number) => {
    return stationType === 1 ? '#409eff' : '#333333';
};

const addPathLines = () => {
    const features = createMapPathLineFeatures(props.mapModel)
    const layer = createLayerWithFeatures(features)
    addLayerToMap(map.value, layer)
}

const createMapPathLineFeatures = (mapModel: MapModel) => {
    return mapModel.Map.Segments.map((segment: any) => {
        const feature = new Feature({
            geometry: new LineString([segment.StartCoordination, segment.EndCoordination])
        });

        // 计算方向向量（X轴和Y轴都反转）
        const dx = -(segment.EndCoordination[0] - segment.StartCoordination[0]); // 反转X轴
        const dy = -(segment.EndCoordination[1] - segment.StartCoordination[1]); // 反转Y轴
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return feature;

        // 计算箭头位置（使用原始坐标差值）
        const offset = 0.05;
        const normalizedDx = (segment.EndCoordination[0] - segment.StartCoordination[0]) / length;
        const normalizedDy = (segment.EndCoordination[1] - segment.StartCoordination[1]) / length;
        const arrowX = segment.EndCoordination[0] - normalizedDx * offset;
        const arrowY = segment.EndCoordination[1] - normalizedDy * offset;

        const lineStyle = [
            new Style({
                stroke: new Stroke({
                    color: mapModel.Map.Options.pathColor || '#e5e5e5',
                    width: 2
                })
            }),
            new Style({
                geometry: new Point([arrowX, arrowY]),
                image: new RegularShape({
                    points: 3,
                    radius: 6,
                    rotation: -angle + Math.PI / 2,
                    angle: Math.PI / 3,
                    fill: new Fill({
                        color: mapModel.Map.Options.pathColor || '#e5e5e5'
                    })
                })
            })
        ];

        feature.setStyle(lineStyle);
        return feature;
    });
};

</script> ,
<style scoped></style>
