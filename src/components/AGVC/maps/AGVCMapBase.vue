<template>
    <div class="" :id="mapId"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Map, Feature } from 'ol'
import { Point, LineString } from 'ol/geom'
import { Style, Circle, Fill, Stroke, Text, RegularShape, Icon } from 'ol/style'
import { createCustomMap, createLayerWithFeatures, addLayerToMap } from '@/utils/map-utils'
import type { MapModel } from '@/models/MapModel'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
const map = ref<Map >()
const vehicleLayer = ref<VectorLayer<VectorSource>>()
const props = defineProps<{
    mapId: string
    mapModel: MapModel
    showMode?: string
    pathUseStats?: any[]
}>()
const tooltip = document.createElement('div');
tooltip.style.position = 'fixed';
tooltip.style.pointerEvents = 'none';
tooltip.style.background = 'rgba(40,40,40,5)'; // 深灰色透明
tooltip.style.border = '1px solid #aaa';          // 灰色邊框
tooltip.style.color = '#fff';
tooltip.style.padding = '2px 8px';
tooltip.style.borderRadius = '4px';
tooltip.style.fontSize = '12px';
tooltip.style.display = 'none';
document.body.appendChild(tooltip);

// function throttle(fn: (...args: any[]) => void, delay: number) {
//     let last = 0
//     return function (...args: any[]) {
//         const now = Date.now()
//         if (now - last > delay) {
//             last = now
//             fn(...args)
//         }
//     }
// }

// const handlePointerMove = throttle((evt: any) => {
//     let found = false;
//     if (props.showMode === 'tagStopStats') {
//         map.value.forEachFeatureAtPixel(evt.pixel, (feature) => {
//             const info = feature.get('TagStopInfo');
//             if (info && info.avgdurationseconds != null) {
//                 tooltip.innerText = `停等時間: ${info.avgdurationseconds.toFixed(2)} 秒`;
//                 tooltip.style.fontSize = '16px';
//                 tooltip.style.left = evt.originalEvent.clientX + 10 + 'px';
//                 tooltip.style.top = evt.originalEvent.clientY + 10 + 'px';
//                 tooltip.style.display = 'block';
//                 found = true;
//             }
//         });
//     } else if (props.showMode === 'pathUseStats') {
//         map.value.forEachFeatureAtPixel(evt.pixel, (feature) => {
//             const info = feature.get('PathUseInfo');
//             if (info && info.count != null) {
//                 tooltip.innerText = `走行次數: ${info.count}`;
//                 tooltip.style.fontSize = '16px';
//                 tooltip.style.left = evt.originalEvent.clientX + 10 + 'px';
//                 tooltip.style.top = evt.originalEvent.clientY + 10 + 'px';
//                 tooltip.style.display = 'block';
//                 found = true;
//             }
//         });
//     }
//     if (!found) {
//         tooltip.style.display = 'none';
//     }
// }, 30); // 30ms 可依效能調整

let lastClickPos = { x: 0, y: 0 }
let tooltipVisible = false

const handleSingleClick = (evt: any) => {
    let found = false;
    lastClickPos = {
        x: evt.originalEvent.clientX,
        y: evt.originalEvent.clientY
    }
    if (props.showMode === 'tagStopStats') {
        map.value.forEachFeatureAtPixel(evt.pixel, (feature) => {
            const info = feature.get('TagStopInfo');
            if (info && info.avgdurationseconds != null) {
                tooltip.innerText = `停等時間: ${info.avgdurationseconds.toFixed(2)} 秒`;
                tooltip.style.fontSize = '16px';
                tooltip.style.left = lastClickPos.x + 10 + 'px';
                tooltip.style.top = lastClickPos.y + 10 + 'px';
                tooltip.style.display = 'block';
                tooltipVisible = true;
                found = true;
            }
        });
    } else if (props.showMode === 'pathUseStats') {
        map.value.forEachFeatureAtPixel(evt.pixel, (feature) => {
            const info = feature.get('PathUseInfo');
            if (info && info.count != null) {
                tooltip.innerText = `走行次數: ${info.count}`;
                tooltip.style.fontSize = '16px';
                tooltip.style.left = lastClickPos.x + 10 + 'px';
                tooltip.style.top = lastClickPos.y + 10 + 'px';
                tooltip.style.display = 'block';
                tooltipVisible = true;
                found = true;
            }
        });
    }
    if (!found) {
        tooltip.style.display = 'none';
        tooltipVisible = false;
    }
}

// 監聽 pointermove，移動超過 30px 關閉 tooltip
const handlePointerMoveForTooltip = (evt: any) => {
    if (!tooltipVisible) return;
    const dx = evt.originalEvent.clientX - lastClickPos.x;
    const dy = evt.originalEvent.clientY - lastClickPos.y;
    if (Math.sqrt(dx * dx + dy * dy) > 30) {
        tooltip.style.display = 'none';
        tooltipVisible = false;
    }
}

onMounted(() => {
    setTimeout(() => {
        map.value = createCustomMap(props.mapId, '', 272, 92)
        map.value.getLayers().clear()
        addPathLines();
        addPoints();
        initVehicleLayer()
        updateVehicleMarkers()

        if (map.value) {
            map.value.on('singleclick', handleSingleClick);
            map.value.on('pointermove', handlePointerMoveForTooltip);
            map.value.getViewport().addEventListener('pointerleave', () => {
                tooltip.style.display = 'none';
                tooltipVisible = false;
            });
        }
    }, 10)
})

// 初始化車輛圖層
function initVehicleLayer() {
    vehicleLayer.value = new VectorLayer({
        source: new VectorSource(),
        zIndex: 9999 // 提高 zIndex，確保車輛在最上層
    })
    if (map.value) {
        map.value.addLayer(vehicleLayer.value)
    }
}

// 動態更新車輛 marker
function updateVehicleMarkers() {
    if (!vehicleLayer.value) return
    const source = vehicleLayer.value.getSource()
    if (source instanceof VectorSource) {
        source.clear()
    }
    const vehicles = props.mapModel.Vehicles || []
    vehicles.forEach((vehicle: { id: string|number, x: number, y: number }) => {
        // 白光底層
        const glowFeature = new Feature({
            geometry: new Point([vehicle.x, vehicle.y])
        })
        glowFeature.setStyle(new Style({
            image: new Circle({
                radius: 22,
                fill: new Fill({ color: 'rgba(0,255,100,0.35)' }), // 綠色透明光
                stroke: new Stroke({ color: 'rgba(0,255,100,0.6)', width: 0 })
            }),
            zIndex: 2000,
        }))
        // icon 圖層
        const iconFeature = new Feature({
            geometry: new Point([vehicle.x, vehicle.y])
        })
        iconFeature.setStyle(new Style({
            image: new Icon({
                src: '/AGV.png',
                scale: 0.9
            }),
            text: new Text({
                text: String(vehicle.id),
                offsetY: -30,
                font: 'bold 14px Arial',
                fill: new Fill({ color: 'rgba(0,255,0,0.6)' }), // 透明綠色文字
                stroke: new Stroke({ color: '#333', width: 2 })
            }),
            zIndex: 999999,
        }))
        source.addFeature(glowFeature)
        source.addFeature(iconFeature)
    })
}

// 監聽車輛資料變動
watch(
    () => props.mapModel.Vehicles,
    () => {
        updateVehicleMarkers()
    },
    { deep: true }
)
// 監聽 pathUseStats 變動，動態重繪路線
watch(
  () => props.pathUseStats,
  () => {
    if (map.value) {
      // 清除舊路線圖層
      // 你可以用 getLayers().clear() 或只移除路線圖層
      map.value.getLayers().clear()
      addPathLines()
      addPoints()
      initVehicleLayer()
      updateVehicleMarkers()
    }
  },
  { deep: true }
)
const addPoints = () => {
    const features = createMapPointFeatures(props.mapModel)
    const layer = createLayerWithFeatures(features)
    layer.setZIndex(200)
    if (map.value) {
        addLayerToMap(map.value, layer)
    }
}

const createMapPointFeatures = (mapModel: MapModel) => {
    return Object.values(mapModel.Map.Points).map((point: any) => {
        const feature = new Feature({
            geometry: new Point([point.X, point.Y]),
        });
        
        const styles = []
        feature.set('TagStopInfo', point.TagStopInfo);
        // 外圈顏色
        if (props.showMode === 'tagStopStats') {
            styles.push(new Style({
                image: new Circle({
                    radius: 9,
                    fill: new Fill({ color: 'rgba(0,255,0,0.2)' }),
                    stroke: new Stroke({
                        color: point.TagStopColor,
                        width: 8
                    })
                })
            }))
        }


        styles.push(new Style({
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
        }))
        feature.setStyle(styles);
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
    layer.setZIndex(100)
    if (map.value) {
        addLayerToMap(map.value, layer)
    }
}

const createMapPathLineFeatures = (mapModel: MapModel) => {
    const pathUseStatsMap = props.pathUseStats || {};
    const points = mapModel.Map.Points;

    return mapModel.Map.Segments.map((segment: any) => {
        const tagA = points[segment.StartPtIndex]?.TagNumber;
        const tagB = points[segment.EndPtIndex]?.TagNumber;

        const feature = new Feature({
            geometry: new LineString([segment.StartCoordination, segment.EndCoordination])
        });

        // 算箭頭
        const dx = -(segment.EndCoordination[0] - segment.StartCoordination[0]);
        const dy = -(segment.EndCoordination[1] - segment.StartCoordination[1]);
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return feature;

        const offset = 0.05;
        const normalizedDx = (segment.EndCoordination[0] - segment.StartCoordination[0]) / length;
        const normalizedDy = (segment.EndCoordination[1] - segment.StartCoordination[1]) / length;
        const arrowX = segment.EndCoordination[0] - normalizedDx * offset;
        const arrowY = segment.EndCoordination[1] - normalizedDy * offset;

        // 預設底線顏色
        const baseColor = mapModel.Map.Options?.pathColor || '#e5e5e5';

        // 統計色（無視方向，排序 key）
        let overlayStyle = null;
        let arrowOverlayStyle = null;
        if (
            props.showMode === 'pathUseStats' &&
            tagA != null && tagB != null
        ) {
            const key = [tagA, tagB].sort((a, b) => a - b).join('-');
            const stat = pathUseStatsMap[key];
            const overlayColor = stat ? stat.color : 'rgba(0,0,0,0)';
            overlayStyle = new Style({
                stroke: new Stroke({
                    color: overlayColor,
                    width: 8,
                    lineCap: 'round'
                })
            });
            arrowOverlayStyle = new Style({
                geometry: new Point([arrowX, arrowY]),
                image: new RegularShape({
                    points: 3,
                    radius: 6,
                    rotation: -angle + Math.PI / 2,
                    angle: Math.PI / 3,
                    fill: new Fill({
                        color: overlayColor
                    })
                })
            });

            // ★★★ 加入走行次數資訊 ★★★
            if (stat && typeof stat.count !== 'undefined') {
                feature.set('PathUseInfo', { count: stat.count });
            }
        }

        // 組合 style
        const lineStyle = [
            // 底線
            new Style({
                stroke: new Stroke({
                    color: baseColor,
                    width: 2
                })
            }),
            // 箭頭底色
            new Style({
                geometry: new Point([arrowX, arrowY]),
                image: new RegularShape({
                    points: 3,
                    radius: 6,
                    rotation: -angle + Math.PI / 2,
                    angle: Math.PI / 3,
                    fill: new Fill({
                        color: baseColor
                    })
                })
            })
        ];
        // 如果是 pathUseStats 模式，加上統計色
        if (overlayStyle) lineStyle.push(overlayStyle);
        if (arrowOverlayStyle) lineStyle.push(arrowOverlayStyle);

        feature.setStyle(lineStyle);
        return feature;
    });
};

</script> ,
<style scoped></style>
