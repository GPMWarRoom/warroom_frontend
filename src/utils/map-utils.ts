import Map from 'ol/Map';
import View from 'ol/View';
import ImageLayer from 'ol/layer/Image';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import { getCenter } from 'ol/extent';
import Layer from 'ol/layer/Layer';
import Feature from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';


// 建立自訂地圖
export function createCustomMap(target: string, imageUrl: string, imageWidth: number, imageHeight: number) {
  // 定義投影範圍 [minX, minY, maxX, maxY]
  const extent = [0, 0, imageWidth, imageHeight];

  // 建立自訂投影
  const projection = new Projection({
    code: 'custom-image',
    units: 'pixels',
    extent: extent
  });

  // 建立圖層
  const imageLayer = new ImageLayer({
    source: new Static({
      url: imageUrl,
      projection: projection,
      imageExtent: extent
    })
  });

  // 建立地圖
  const map = new Map({
    target: target,
    layers: [imageLayer],
    view: new View({
      projection: projection,
      center: getCenter(extent),
      zoom: 1,
      maxZoom: 8
    })
  });
  return map;
}

export function createLayerWithFeatures(features: Feature[]) {
  const source = new VectorSource({
    features: features
  });
  const layer = new VectorLayer({
    source: source
  });
  return layer;
}

export function addLayerToMap(map: Map, layer: Layer) {
  map.addLayer(layer);
  map.renderSync();
}

export function removeLayerFromMap(map: Map, layer: Layer) {
  map.removeLayer(layer);
  map.render();
}

export function setView(map: Map, center: [number, number], zoom: number) {
  map.getView().setCenter(center);
  map.getView().setZoom(zoom);
  map.render();
}

