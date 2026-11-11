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
import Control from 'ol/control/Control'
import { showTagOnly, hideVehicles, hideGrid } from './layoutDisplayOptions'
import { uiStatsStore } from '@/stores/UiStats'

const map = ref<Map | undefined>()
const vehicleLayer = ref<VectorLayer<VectorSource>>()
const pointLayer = ref<VectorLayer<VectorSource>>()
const pathLayer = ref<VectorLayer<VectorSource>>()
const taskPathLayer = ref<VectorLayer<VectorSource>>()
const gridLayer = ref<VectorLayer<VectorSource>>()
const props = defineProps<{
    mapId: string
    mapModel: any
    showMode?: string
    pathUseStats?: any[]
    taskPath?: number[]
}>()

// 即時監控的 AGVS Layout（birdView）字體稍大，其他地圖維持原樣
const isBirdView = props.showMode === 'birdView';
const labelFontSize = isBirdView ? 13 : 11;
const MAP_FONT_FAMILY = '"Sora", "Microsoft JhengHei", sans-serif';

// AGV 狀態 DOWN（與即時監控傳入的 state 相同：0 idle、1 run、2 down、3 charging）與錯誤標籤底色（白字對比 ≥ 4.5:1）
const AGV_STATE_DOWN = 2;
const AGV_ERROR_COLOR = '#d62828';

// 任務起訖站點的標示顏色
type TaskStationState = 'running' | 'charging' | 'waiting';
const TASK_STATION_COLORS: Record<TaskStationState, string> = {
    running: '#2f88ff',  // 執行中：藍色
    charging: '#2f88ff', // 充電中：與執行中同色，只換文字
    waiting: '#ffb020'   // 待執行：橘黃色
};
const TASK_STATION_TEXT: Record<TaskStationState, string> = {
    running: '執行中',
    charging: '充電中',
    waiting: '待執行'
};

// 黑暗主題的路線顏色
const uiStats = uiStatsStore();
const DARK_THEME_PATH_COLOR = '#ffffff';

// AGV 圖示：俯視的小車（車身為狀態色、白框、左右各兩個輪子、中間淺色載台），比點位略大；依顏色快取
const agvIconCache: Record<string, string> = {};
const getAgvIconSrc = (color: string) => {
    if (!agvIconCache[color]) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="22" viewBox="0 0 26 22">
            <rect x="0.5" y="3" width="4" height="6" rx="1.5" fill="#1f2329"/>
            <rect x="0.5" y="13" width="4" height="6" rx="1.5" fill="#1f2329"/>
            <rect x="21.5" y="3" width="4" height="6" rx="1.5" fill="#1f2329"/>
            <rect x="21.5" y="13" width="4" height="6" rx="1.5" fill="#1f2329"/>
            <rect x="3" y="1" width="20" height="20" rx="5" fill="${color}" stroke="#ffffff" stroke-width="2"/>
            <rect x="8" y="6" width="10" height="10" rx="2" fill="#ffffff" fill-opacity="0.85"/>
        </svg>`;
        agvIconCache[color] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    return agvIconCache[color];
};

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

    if (isBirdView) {
        gridLayer.value = new VectorLayer({
            source: new VectorSource(),
            style: GRID_STYLE,
            zIndex: 50,
            maxResolution: GRID_MAX_RESOLUTION,
            visible: !hideGrid.value
        });
        map.value.addLayer(gridLayer.value);
        vehicleLayer.value.setVisible(!hideVehicles.value);
        map.value.addControl(createLayoutToggleControl());
    }
}

// 即時監控 layout 的虛線網格：每格 1 公尺（地圖座標單位即為公尺），範圍為所有點位外加幾公尺邊界。
// 縮小到 1 公尺不足 4 px 時自動不畫，避免密成一片
const GRID_PADDING_M = 3;
const GRID_MAX_RESOLUTION = 0.25;
const GRID_MAX_LINES = 2000; // 防呆：座標單位若不是公尺（例如毫米）就不畫，避免產生大量線段
const GRID_STYLE = new Style({
    stroke: new Stroke({ color: 'rgba(140, 150, 170, 0.35)', width: 1, lineDash: [4, 4] })
});

const updateGridLines = (mapData: any) => {
    const source = gridLayer.value?.getSource();
    if (!source || !mapData.Points) return;
    source.clear();
    const coords = Object.values(mapData.Points).map((p: any) => [p.X ?? p.x ?? 0, p.Y ?? p.y ?? 0]);
    if (coords.length === 0) return;
    const [minX, minY, maxX, maxY] = boundingExtent(coords as [number, number][]);
    const x0 = Math.floor(minX) - GRID_PADDING_M, x1 = Math.ceil(maxX) + GRID_PADDING_M;
    const y0 = Math.floor(minY) - GRID_PADDING_M, y1 = Math.ceil(maxY) + GRID_PADDING_M;
    if ((x1 - x0) + (y1 - y0) > GRID_MAX_LINES) return;

    const lines: Feature[] = [];
    for (let x = x0; x <= x1; x++) lines.push(new Feature({ geometry: new LineString([[x, y0], [x, y1]]) }));
    for (let y = y0; y <= y1; y++) lines.push(new Feature({ geometry: new LineString([[x0, y], [x1, y]]) }));
    source.addFeatures(lines);
};

// 即時監控 layout：+/- 下方的 T（名稱只顯示 Tag ID）、H（隱藏 AGV 與任務站點提示）、G（隱藏網格）切換按鈕，按下時亮起
const toggleButtons: { button: HTMLButtonElement; state: typeof showTagOnly }[] = [];
const syncToggleButtons = () => {
    toggleButtons.forEach(({ button, state }) => button.setAttribute('aria-pressed', String(state.value)));
};
const createLayoutToggleControl = () => {
    const element = document.createElement('div');
    element.className = 'layout-toggle ol-unselectable ol-control';
    const addButton = (text: string, title: string, state: typeof showTagOnly) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = text;
        button.title = title;
        button.addEventListener('click', () => { state.value = !state.value; });
        element.appendChild(button);
        toggleButtons.push({ button, state });
    };
    addButton('T', '名稱只顯示 Tag ID', showTagOnly);
    addButton('H', '隱藏 AGV 與任務站點提示', hideVehicles);
    addButton('G', '隱藏網格', hideGrid);
    syncToggleButtons();
    return new Control({ element });
};

if (isBirdView) {
    watch(showTagOnly, () => {
        syncToggleButtons();
        const mapData = getMapData();
        if (mapData) updatePoints(mapData);
    });
    watch(hideVehicles, (hidden) => {
        syncToggleButtons();
        vehicleLayer.value?.setVisible(!hidden);
        // 任務站點提示（執行中／待執行）畫在點位層，需重畫
        const mapData = getMapData();
        if (mapData) updatePoints(mapData);
    });
    watch(hideGrid, (hidden) => {
        syncToggleButtons();
        gridLayer.value?.setVisible(!hidden);
    });
}

const renderMapAll = () => {
    if (!map.value) return;
    const mapData = getMapData();
    
    if (mapData) {
        if (isBirdView) updateGridLines(mapData);
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

        // 淡淡的狀態色光暈，讓車輛在點位之間容易找到
        const glowFeature = new Feature({ geometry: new Point([vX, vY]) })
        glowFeature.setStyle(new Style({
            image: new Circle({
                radius: 16,
                fill: new Fill({ color: hexToRgba(vehicleColor, 0.25) })
            }),
            zIndex: 2000,
        }))
        
        const iconFeature = new Feature({ geometry: new Point([vX, vY]) })
        iconFeature.setStyle(new Style({
            image: new Icon({ src: getAgvIconSrc(vehicleColor), scale: 1 }),
            text: new Text({
                text: String(vId),
                offsetY: -21,
                font: `700 ${labelFontSize + 1}px ${MAP_FONT_FAMILY}`,
                fill: new Fill({ color: vehicleColor }), 
                stroke: new Stroke({ color: '#111827', width: 3 })
            }),
            zIndex: 999999,
        }))
        source.addFeature(glowFeature)
        source.addFeature(iconFeature)

        // AGV 狀態為 DOWN（車身已是紅色）時，在車輛下方加上「AGV Error」標籤
        if (vehicle.state === AGV_STATE_DOWN) {
            const errorFeature = new Feature({ geometry: new Point([vX, vY]) })
            errorFeature.setStyle(new Style({
                text: new Text({
                    text: 'AGV Error',
                    offsetY: 16,
                    textBaseline: 'top',
                    font: `700 ${labelFontSize}px ${MAP_FONT_FAMILY}`,
                    fill: new Fill({ color: '#ffffff' }),
                    backgroundFill: new Fill({ color: AGV_ERROR_COLOR }),
                    backgroundStroke: new Stroke({ color: '#ffffff', width: 1 }),
                    padding: [2, 6, 2, 6]
                }),
                zIndex: 1000000,
            }))
            source.addFeature(errorFeature)
        }
    })
}

const clearAllLayers = () => {
    if (!map.value) return;
    pathLayer.value?.getSource()?.clear();
    pointLayer.value?.getSource()?.clear();
    vehicleLayer.value?.getSource()?.clear();
    taskPathLayer.value?.getSource()?.clear();
    gridLayer.value?.getSource()?.clear();
}

if (isBirdView) {
    // 即時監控每次 AGV／任務推播都會組出新的 mapModel，若整張重畫（路段、點位、車輛）會拖慢更新。
    // 改成只在圖資（點位、路段）換掉時整張重畫；任務站點有變才重畫點位層，車輛有變只重畫車輛層。
    watch(
        [() => getMapData()?.Points, () => getMapData()?.Segments],
        () => {
            if (getMapData()) {
                renderMapAll();
            } else {
                clearAllLayers();
            }
        },
        { immediate: true }
    )

    // 站點標示內容沒變（例如只有任務時間更新）就不重畫
    watch(
        () => JSON.stringify(props.mapModel?.TaskStations || {}),
        () => {
            const mapData = getMapData();
            if (mapData) updatePoints(mapData);
        }
    )

    watch(
        () => props.mapModel?.Vehicles || props.mapModel?.Map?.Vehicles,
        () => {
            updateVehicleMarkers()
        }
    )
} else {
    // 監聽完整地圖資料變動，觸發重繪（交管統計會直接改點位上的 TagStopColor，需要 deep）
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
}

watch(
  () => props.pathUseStats,
  () => {
    renderMapAll();
  },
  { deep: true }
)

// 切換黑暗／明亮主題時重畫路線（路線顏色依主題而不同）
watch(
  () => uiStats.theme,
  () => {
    const mapData = getMapData();
    if (mapData) updatePathLines(mapData);
  }
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
    const taskStations = props.mapModel?.TaskStations || {};
    return Object.values(mapData.Points).map((point: any) => {
        const pX = point.X ?? point.x ?? 0;
        const pY = point.Y ?? point.y ?? 0;
        const stationType = point.StationType ?? point.stationType ?? 0;
        const tagNumber = point.TagNumber ?? point.tagNumber;
        // 即時監控 layout 按下 T 時名稱只顯示 Tag ID
        const displayName = isBirdView && showTagOnly.value
            ? String(tagNumber ?? '')
            : (point.Graph?.Display ?? point.Name ?? point.name ?? '');
        // 未啟用的點位（Enable = false）畫成紅色叉叉；沒有這個欄位的視為啟用
        const isEnabled = (point.Enable ?? point.enable) !== false;
        const isVirtual = (point.IsVirtualPoint ?? point.isVirtualPoint) === true;
        // 任務起訖站點（由即時監控傳入）：執行中藍色、待執行橘黃色；按下 H 隱藏 AGV 時一併不標示
        const taskStation = isBirdView && hideVehicles.value ? undefined : taskStations[String(tagNumber ?? '')];

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

        if (taskStation) {
            const color = TASK_STATION_COLORS[taskStation.state as TaskStationState];
            const stateText = TASK_STATION_TEXT[taskStation.state as TaskStationState];
            styles.push(new Style({
                image: new Circle({
                    radius: 12,
                    fill: new Fill({ color: hexToRgba(color, 0.25) }),
                    stroke: new Stroke({ color, width: 3 })
                }),
                text: new Text({
                    // 執行中／充電中帶上負責的車號，待執行只寫狀態
                    text: taskStation.state !== 'waiting' && taskStation.agv ? `${stateText} ${taskStation.agv}` : stateText,
                    offsetY: 22,
                    font: `700 ${labelFontSize}px ${MAP_FONT_FAMILY}`,
                    fill: new Fill({ color }),
                    stroke: new Stroke({ color: '#111827', width: 3 })
                }),
                zIndex: 1
            }))
        }

        // 原本的點位顏色邏輯
        styles.push(new Style({
            image: isEnabled ? new Circle({
                radius: 6,
                fill: new Fill({
                    color: getPointColor(stationType, isVirtual)
                }),
                stroke: new Stroke({
                    color: '#ffffff',
                    width: 2
                })
            }) : createDisabledPointImage(),
            text: new Text({
                text: displayName,
                offsetY: isBirdView ? -17 : -15,
                font: isBirdView ? `600 ${labelFontSize}px ${MAP_FONT_FAMILY}` : undefined,
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

// 未啟用點位：紅色叉叉（四角星把內徑設為 0 即為十字，旋轉 45 度成 X）
const DISABLED_POINT_COLOR = '#ff3b30';
const createDisabledPointImage = () => new RegularShape({
    points: 4,
    radius: 8,
    radius2: 0,
    angle: Math.PI / 4,
    stroke: new Stroke({
        color: DISABLED_POINT_COLOR,
        width: 3,
        lineCap: 'round'
    })
});

// 站點類型顏色對應表（類型編號依 AGVS MapPoint.STATION_TYPE）；只有虛擬點位是灰色
const RACK_STATION_TYPES = [2, 6, 12, 22];  // STK、Charge_STK、STK_LD、STK_ULD
const CHARGE_STATION_TYPES = [3, 5];        // Charge、Charge_Buffer
const BUFFER_STATION_TYPES = [4, 41];       // Buffer、Buffer_EQ
const getPointColor = (stationType: number, isVirtual: boolean) => {
    if (isVirtual) return '#909399';                                    // 虛擬點位
    if (stationType === 0) return '#42b983';                            // 普通點位
    if (RACK_STATION_TYPES.includes(stationType)) return '#fadb14';     // Rack
    if (CHARGE_STATION_TYPES.includes(stationType)) return '#f56c6c';   // 充電站
    if (BUFFER_STATION_TYPES.includes(stationType)) return '#e6a23c';   // 緩衝站
    return '#409eff';                                                   // 工作站與其他設備
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

        // 路線底色：黑暗主題一律白色（避免與深色背景、灰色虛線網格混在一起），明亮主題沿用圖資設定的顏色
        const baseColor = uiStats.theme === 'dark'
            ? DARK_THEME_PATH_COLOR
            : (mapData.Options?.pathColor ?? mapData.options?.pathColor ?? '#e5e5e5');

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

/* T／H 切換按鈕：放在 +/- 正下方（與 OpenLayers 內建 zoom-extent 控制項同一位置），按下時亮起 */
.map-container :deep(.layout-toggle) {
    top: 4.643em;
    left: 0.5em;
}

.map-container :deep(.ol-touch .layout-toggle) {
    top: 5.5em;
}

.map-container :deep(.layout-toggle button) {
    line-height: 1.375em;
    cursor: pointer;
}

.map-container :deep(.layout-toggle button[aria-pressed="true"]) {
    background-color: var(--accent-fill);
    color: #fff;
}
</style>