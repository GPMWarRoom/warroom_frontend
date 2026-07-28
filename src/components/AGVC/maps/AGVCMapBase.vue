<template>
    <div class="map-container" :id="mapId"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Map, Feature } from 'ol'
import { Point, LineString } from 'ol/geom'
import { Style, Circle, Fill, Stroke, Text, RegularShape, Icon } from 'ol/style'
import { boundingExtent } from 'ol/extent'
import { createCustomMap, createLayerWithFeatures, addLayerToMap } from '@/utils/map-utils'
import type { MapModel } from '@/models/MapModel'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'

const map = ref<Map | undefined>()
const vehicleLayer = ref<VectorLayer<VectorSource>>()
const pointLayer = ref<VectorLayer<VectorSource>>()
const pathLayer = ref<VectorLayer<VectorSource>>()
const taskPathLayer = ref<VectorLayer<VectorSource>>()
const props = defineProps<{
    mapId: string
    mapModel: any
    showMode?: string
    pathUseStats?: any[]
    taskPath?: number[]
}>()

const tooltip = document.createElement('div');
tooltip.style.position = 'fixed';
tooltip.style.pointerEvents = 'none';
tooltip.style.background = 'rgba(40,40,40,0.85)'; // 深灰色透明
tooltip.style.border = '1px solid #aaa';      // 灰色邊框
tooltip.style.color = '#fff';
tooltip.style.padding = '4px 8px';
tooltip.style.borderRadius = '4px';
tooltip.style.fontSize = '12px';
tooltip.style.display = 'none';
tooltip.style.zIndex = '99999';
document.body.appendChild(tooltip);

let lastClickPos = { x: 0, y: 0 }
let tooltipVisible = false

// 自動判斷 JSON 是否包在 Map 物件內
const getMapData = () => {
    if (!props.mapModel) return null;
    return props.mapModel.Points ? props.mapModel : (props.mapModel.Map || null);
}

// 自動將鏡頭對準圖資範圍
const fitMapToData = (mapData: any) => {
    if (!map.value || !mapData.Points) return;
    const coords = Object.values(mapData.Points).map((p: any) => [
        p.X ?? p.x ?? 0,
        p.Y ?? p.y ?? 0
    ]);
    if (coords.length > 0) {
        const extent = boundingExtent(coords as [number, number][]);
        map.value.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 500 });
    }
}

const handleSingleClick = (evt: any) => {
    let found = false;
    lastClickPos = {
        x: evt.originalEvent.clientX,
        y: evt.originalEvent.clientY
    }
    if (props.showMode === 'tagStopStats') {
        map.value?.forEachFeatureAtPixel(evt.pixel, (feature) => {
            const info = feature.get('TagStopInfo');
            if (info && info.avgdurationseconds != null) {
                tooltip.innerText = `停等時間: ${info.avgdurationseconds.toFixed(2)} 秒`;
                tooltip.style.fontSize = '14px';
                tooltip.style.left = lastClickPos.x + 10 + 'px';
                tooltip.style.top = lastClickPos.y + 10 + 'px';
                tooltip.style.display = 'block';
                tooltipVisible = true;
                found = true;
            }
        });
    } else if (props.showMode === 'pathUseStats') {
        map.value?.forEachFeatureAtPixel(evt.pixel, (feature) => {
            const info = feature.get('PathUseInfo');
            if (info && info.count != null) {
                tooltip.innerText = `走行次數: ${info.count}`;
                tooltip.style.fontSize = '14px';
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

const handlePointerMoveForTooltip = (evt: any) => {
    if (!tooltipVisible) return;
    const dx = evt.originalEvent.clientX - lastClickPos.x;
    const dy = evt.originalEvent.clientY - lastClickPos.y;
    if (Math.sqrt(dx * dx + dy * dy) > 30) {
        tooltip.style.display = 'none';
        tooltipVisible = false;
    }
}

const initLayers = () => {
    if (!map.value) return;
    pathLayer.value = new VectorLayer({ source: new VectorSource(), zIndex: 100 });
    taskPathLayer.value = new VectorLayer({ source: new VectorSource(), zIndex: 101 });
    pointLayer.value = new VectorLayer({ source: new VectorSource(), zIndex: 200 });
    vehicleLayer.value = new VectorLayer({ source: new VectorSource(), zIndex: 9999 });
    
    map.value.addLayer(pathLayer.value);
    map.value.addLayer(taskPathLayer.value);
    map.value.addLayer(pointLayer.value);
    map.value.addLayer(vehicleLayer.value);
}

const renderMapAll = () => {
    if (!map.value) return;
    const mapData = getMapData();
    
    if (mapData) {
        updatePathLines(mapData);
        updatePoints(mapData);
        updateVehicleMarkers();
        if (props.taskPath && props.taskPath.length > 0) {
            updateTaskPath(props.taskPath);
        }
    } else {
        // 無有效地圖時清空圖層，避免殘留其他場域內容
        clearAllLayers();
        console.warn("無法解析地圖資料結構，請確認 JSON 格式", props.mapModel);
    }
}

onMounted(async () => {
    await nextTick();
    map.value = createCustomMap(props.mapId, '', 272, 92);
    initLayers();

    if (map.value) {
        const savedView = localStorage.getItem(`mapView_${props.mapId}`)
        if (savedView) {
            try {
                const { center, zoom } = JSON.parse(savedView)
                if (center && zoom !== undefined) {
                    map.value.getView().setCenter(center)
                    map.value.getView().setZoom(zoom)
                }
            } catch (e) {
                console.error('Failed to parse saved map view', e)
            }
        } else {
            const mapData = getMapData();
            if (mapData) {
                fitMapToData(mapData); // 初始對焦
            }
        }

        map.value.on('singleclick', handleSingleClick);
        map.value.on('pointermove', handlePointerMoveForTooltip);
        map.value.getViewport().addEventListener('pointerleave', () => {
            tooltip.style.display = 'none';
            tooltipVisible = false;
        });

        map.value.on('moveend', () => {
            if (!map.value) return;
            const view = map.value.getView();
            if (view) {
                const center = view.getCenter();
                const zoom = view.getZoom();
                localStorage.setItem(`mapView_${props.mapId}`, JSON.stringify({ center, zoom }));
            }
        });
    }
    // 確保地圖實例與圖層都建立後，再進行首次完整繪製
    // watch 的 immediate:true 會在 mounted 前觸發，但因 map.value 不存在會跳過
    renderMapAll();

    // 核心修正：延遲呼叫 updateSize，解決地圖容器在初始化時尺寸尚未確定導致的渲染問題。
    // 這可以修復重新整理後地圖區塊為空白，需要調整視窗大小後才出現的狀況。
    setTimeout(() => {
        if (map.value) {
            map.value.updateSize();
        }
    }, 200);
})

onUnmounted(() => {
    if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
    }
    if (map.value) {
        map.value.setTarget(undefined);
        map.value = undefined;
    }
})

const hexToRgba = (hex: any, alpha: number) => {
    if (!hex) return `rgba(144, 147, 153, ${alpha})`; 
    let colorStr = String(hex); 
    if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) return colorStr;
    
    colorStr = colorStr.replace('#', '');
    let r = 0, g = 0, b = 0;
    
    if (colorStr.length === 3) {
        r = parseInt(colorStr[0] + colorStr[0], 16);
        g = parseInt(colorStr[1] + colorStr[1], 16);
        b = parseInt(colorStr[2] + colorStr[2], 16);
    } else if (colorStr.length === 6) {
        r = parseInt(colorStr.substring(0, 2), 16);
        g = parseInt(colorStr.substring(2, 4), 16);
        b = parseInt(colorStr.substring(4, 6), 16);
    } else {
        return `rgba(144, 147, 153, ${alpha})`; 
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function updateVehicleMarkers() {
    if (!vehicleLayer.value) return
    const source = vehicleLayer.value.getSource()
    if (source instanceof VectorSource) {
        source.clear()
    }
    
    const vehicles = props.mapModel?.Vehicles || props.mapModel?.Map?.Vehicles || []
    
    vehicles.forEach((vehicle: any) => {
        const vehicleColor = vehicle.color || vehicle.Color || '#909399';
        const vX = vehicle.x ?? vehicle.X ?? 0;
        const vY = vehicle.y ?? vehicle.Y ?? 0;
        const vId = vehicle.id ?? vehicle.Id ?? vehicle.AGV_Name ?? 'Unknown';
        const vImg = vehicle.image ?? vehicle.img ?? '/AGV.png';

        const glowFeature = new Feature({ geometry: new Point([vX, vY]) })
        glowFeature.setStyle(new Style({
            image: new Circle({
                radius: 22,
                fill: new Fill({ color: hexToRgba(vehicleColor, 0.35) }), 
                stroke: new Stroke({ color: hexToRgba(vehicleColor, 0.6), width: 0 })
            }),
            zIndex: 2000,
        }))
        
        const iconFeature = new Feature({ geometry: new Point([vX, vY]) })
        iconFeature.setStyle(new Style({
            image: new Icon({ src: vImg, scale: 0.9 }),
            text: new Text({
                text: String(vId),
                offsetY: -30,
                font: 'bold 14px Arial',
                fill: new Fill({ color: vehicleColor }), 
                stroke: new Stroke({ color: '#333', width: 2 })
            }),
            zIndex: 999999,
        }))
        source.addFeature(glowFeature)
        source.addFeature(iconFeature)
    })
}

const clearAllLayers = () => {
    if (!map.value) return;
    pathLayer.value?.getSource()?.clear();
    pointLayer.value?.getSource()?.clear();
    vehicleLayer.value?.getSource()?.clear();
    taskPathLayer.value?.getSource()?.clear();
}

// 監聽完整地圖資料變動，觸發重繪
watch(
    () => props.mapModel,
    (newMapModel) => {
        const hasMapData = !!(newMapModel?.Map || newMapModel?.Points);
        if (hasMapData) {
            renderMapAll();
        } else {
            // 當地圖資料為 null 或空時，清除所有圖層，避免顯示舊地圖。
            clearAllLayers();
        }
    },
    { deep: true, immediate: true }
)

// 監聽車輛資料變動
watch(
    () => props.mapModel?.Vehicles || props.mapModel?.Map?.Vehicles,
    () => {
        updateVehicleMarkers()
    },
    { deep: true }
)

watch(
  () => props.pathUseStats,
  () => {
    renderMapAll();
  },
  { deep: true }
)

const updateTaskPath = (path: number[] | null) => {
    if (!taskPathLayer.value) return;
    const source = taskPathLayer.value.getSource();
    if (!source) return;
    source.clear();

    const mapData = getMapData();
    if (!path || path.length < 2 || !mapData || !mapData.Points) {
        return;
    }

    const pointsByTag = mapData.Points;
    const coords: [number, number][] = [];
    for (const tag of path) {
        const point = pointsByTag[tag];
        if (point) {
            coords.push([point.X ?? point.x, point.Y ?? point.y]);
        } else {
            console.warn(`Tag ${tag} not found in map data for task path.`);
        }
    }

    if (coords.length < 2) return;

    const pathFeature = new Feature({
        geometry: new LineString(coords)
    });

    pathFeature.setStyle(new Style({
        stroke: new Stroke({
            color: '#d500f9', // a bright purple/magenta
            width: 6,
            lineCap: 'round'
        })
    }));
    source.addFeature(pathFeature);
};

watch(() => props.taskPath, (newPath) => {
    updateTaskPath(newPath || null);
},
  { deep: true }
)

const updatePoints = (mapData: any) => {
    if (!mapData.Points || !pointLayer.value) return;
    const source = pointLayer.value.getSource();
    if (!source) return;
    source.clear();
    const features = createMapPointFeatures(mapData);
    source.addFeatures(features);
}

const createMapPointFeatures = (mapData: any) => {
    return Object.values(mapData.Points).map((point: any) => {
        const pX = point.X ?? point.x ?? 0;
        const pY = point.Y ?? point.y ?? 0;
        const stationType = point.StationType ?? point.stationType ?? 0;
        const displayName = point.Graph?.Display ?? point.Name ?? point.name ?? '';

        const feature = new Feature({
            geometry: new Point([pX, pY]),
        });
        
        const styles = []
        feature.set('TagStopInfo', point.TagStopInfo);
        
        // 交管統計的綠色外圈
        if (props.showMode === 'tagStopStats') {
            styles.push(new Style({
                image: new Circle({
                    radius: 9,
                    fill: new Fill({ color: 'rgba(0,255,0,0.2)' }),
                    stroke: new Stroke({
                        color: point.TagStopColor || '#ffffff',
                        width: 8
                    })
                })
            }))
        }

        // 原本的點位顏色邏輯
        styles.push(new Style({
            image: new Circle({
                radius: 6,
                fill: new Fill({
                    color: getPointColor(stationType)
                }),
                stroke: new Stroke({
                    color: '#ffffff',
                    width: 2
                })
            }),
            text: new Text({
                text: displayName,
                offsetY: -15,
                fill: new Fill({
                    color: getTextColor(stationType)
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

// 站點類型顏色對應表
const getPointColor = (stationType: number) => {
    switch (stationType) {
        case 0: return '#42b983'; // 普通點位
        case 1: return '#409eff'; // 工作站
        case 2: return '#e6a23c'; // 緩衝站
        case 3: return '#f56c6c'; // 充電站
        default: return '#909399';
    }
};

// 站點文字顏色
const getTextColor = (stationType: number) => {
    return stationType === 1 ? '#409eff' : '#333333';
};

const updatePathLines = (mapData: any) => {
    if (!mapData.Segments || !pathLayer.value) return;
    const source = pathLayer.value.getSource();
    if (!source) return;
    source.clear();
    const features = createMapPathLineFeatures(mapData);
    source.addFeatures(features);
}

const createMapPathLineFeatures = (mapData: any) => {
    const pathUseStatsMap = props.pathUseStats || {};
    const points = mapData.Points;

    const features = mapData.Segments.map((segment: any) => {
        const startPt = segment.StartPtIndex ?? segment.startPtIndex;
        const endPt = segment.EndPtIndex ?? segment.endPtIndex;
        const startCoord = segment.StartCoordination ?? segment.startCoordination;
        const endCoord = segment.EndCoordination ?? segment.endCoordination;

        if (!startCoord || !endCoord) return null;

        const tagA = points[startPt]?.TagNumber ?? points[startPt]?.tagNumber;
        const tagB = points[endPt]?.TagNumber ?? points[endPt]?.tagNumber;

        const feature = new Feature({
            geometry: new LineString([startCoord, endCoord])
        });

        // 算箭頭
        const dx = -(endCoord[0] - startCoord[0]);
        const dy = -(endCoord[1] - startCoord[1]);
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return feature;

        const offset = 0.05;
        const normalizedDx = (endCoord[0] - startCoord[0]) / length;
        const normalizedDy = (endCoord[1] - startCoord[1]) / length;
        const arrowX = endCoord[0] - normalizedDx * offset;
        const arrowY = endCoord[1] - normalizedDy * offset;

        // 原本的路線底色設定
        const baseColor = mapData.Options?.pathColor ?? mapData.options?.pathColor ?? '#e5e5e5';

        let overlayStyle = null;
        let arrowOverlayStyle = null;
        
        if (props.showMode === 'pathUseStats' && tagA != null && tagB != null) {
            const key = [tagA, tagB].sort((a, b) => a - b).join('-');
            const stat = pathUseStatsMap[key];
            const overlayColor = stat ? stat.color : 'rgba(0,0,0,0)';
            overlayStyle = new Style({
                stroke: new Stroke({ color: overlayColor, width: 8, lineCap: 'round' })
            });
            arrowOverlayStyle = new Style({
                geometry: new Point([arrowX, arrowY]),
                image: new RegularShape({
                    points: 3, radius: 6, rotation: -angle + Math.PI / 2, angle: Math.PI / 3,
                    fill: new Fill({ color: overlayColor })
                })
            });

            if (stat && typeof stat.count !== 'undefined') {
                feature.set('PathUseInfo', { count: stat.count });
            }
        }

        const lineStyle = [
            new Style({ stroke: new Stroke({ color: baseColor, width: 2 }) }),
            new Style({
                geometry: new Point([arrowX, arrowY]),
                image: new RegularShape({
                    points: 3, radius: 6, rotation: -angle + Math.PI / 2, angle: Math.PI / 3,
                    fill: new Fill({ color: baseColor })
                })
            })
        ];
        if (overlayStyle) lineStyle.push(overlayStyle);
        if (arrowOverlayStyle) lineStyle.push(arrowOverlayStyle);

        feature.setStyle(lineStyle);
        return feature;
    });
    return features.filter(f => f);
};
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 100%;
    min-height: 500px; /* 確保至少有高度 */
    position: relative;
    box-sizing: border-box;
    /* 如果背景看不清楚，可以加上這行輔助： */
    /* background-color: #f5f7fa; */ 
}
</style>