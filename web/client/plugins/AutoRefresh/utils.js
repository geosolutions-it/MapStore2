/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get } from 'lodash';
import { getDerivedLayersVisibility } from '../../utils/LayersUtils';
import { getLayerRefreshKey, getWidgetLayerPaths } from '../../utils/LayerRefreshUtils';
import { getMapLibraryFromVisualizationMode } from '../../utils/MapTypeUtils';
import { AUTOREFRESH_MAXIMUM_REFRESH_INTERVAL } from './constants';

export const SUPPORTED_LAYER_TYPES = ['wms', 'wfs', 'arcgis', 'arcgis-feature', 'wmts', 'tms', 'tileprovider', 'flatgeobuf', 'cog', '3dtiles', 'model'];
export const isRefreshSupported = layer => layer && layer.group !== 'background'
    && SUPPORTED_LAYER_TYPES.includes(layer.type)
    && !!(layer.url || layer.tileMapUrl || layer.provider || layer.sources?.length);
export const isValidInterval = interval => Number.isFinite(interval) && interval > 0 && interval <= AUTOREFRESH_MAXIMUM_REFRESH_INTERVAL;

const engines = {
    leaflet: ['wms', 'wfs', 'arcgis', 'wmts', 'tms', 'tileprovider'],
    openlayers: ['wms', 'wfs', 'arcgis', 'arcgis-feature', 'wmts', 'tms', 'tileprovider', 'flatgeobuf', 'cog'],
    cesium: ['wms', 'wfs', 'arcgis', 'arcgis-feature', 'wmts', 'tileprovider', 'flatgeobuf', 'cog', '3dtiles', 'model']
};

/** Collect instances separately from the unique dataset list used in the settings. */
export const collectLayerInstances = (layers = [], groups = [], containers = {}, dashboard = false, mapType = 'openlayers') => {
    const instances = dashboard ? [] : getDerivedLayersVisibility(layers, groups).map(layer => ({
        layer: layers.find(item => item.id === layer.id), visible: layer.visibility !== false, mapLayer: true,
        supported: engines[mapType]?.includes(layer.type)
    }));
    Object.keys(containers).forEach(target => {
        const container = containers[target];
        const selectedLayout = container.selectedLayoutId || container.layouts?.[0]?.id;
        (container.widgets || []).forEach(widget => {
            if (widget.widgetType === 'filter' || widget.widgetType === 'text') return;
            const visible = !container.collapsed?.[widget.id]
                && (!selectedLayout || !widget.layoutId || widget.layoutId === selectedLayout)
                && (!container.maximized?.widget || [].concat(container.maximized.widget).some(item => item.id === widget.id));
            getWidgetLayerPaths(widget).forEach(path => {
                const layer = get(widget, path);
                const map = path[0] === 'maps' ? widget.maps[path[1]] : path[0] === 'map' ? widget.map : null;
                const layerVisible = map ? getDerivedLayersVisibility(map.layers || [], map.groups || [])
                    .find(item => item.id === layer.id)?.visibility !== false : true;
                const activeMap = !map || !widget.selectedMapId || map.mapId === widget.selectedMapId;
                const activeChart = path[0] !== 'charts' || !widget.selectedChartId || widget.charts[path[1]].chartId === widget.selectedChartId;
                const supported = !map || engines[getMapLibraryFromVisualizationMode(map.visualizationMode)]?.includes(layer.type);
                instances.push({ layer, visible: visible && layerVisible && activeMap && activeChart, supported, target, widgetId: widget.id, path });
            });
        });
    });
    return instances.filter(({ layer, supported }) => supported !== false && isRefreshSupported(layer)).map(instance => ({
        ...instance, key: getLayerRefreshKey(instance.layer)
    }));
};

export const getEditedLayerKeys = (layers, featuregrid = {}, editor) => {
    const keys = new Set();
    if (featuregrid.mode === 'EDIT' || featuregrid.saving || featuregrid.drawing) {
        const layer = layers.find(item => item.id === featuregrid.selectedLayer);
        if (layer) keys.add(getLayerRefreshKey(layer));
    }
    if (editor) getWidgetLayerPaths(editor).forEach(path => keys.add(getLayerRefreshKey(get(editor, path))));
    return keys;
};
