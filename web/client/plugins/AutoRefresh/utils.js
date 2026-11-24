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

/**
 * Dataset discovery and editing guards for automatic refreshes.
 * @memberof utils
 * @static
 * @name AutoRefreshUtils
 */

export const SUPPORTED_LAYER_TYPES = ['wms', 'wfs', 'arcgis', 'arcgis-feature', 'wmts', 'tms', 'tileprovider', 'flatgeobuf', 'cog', '3dtiles', 'model'];
/**
 * Check whether a non-background layer has a supported type and a data source.
 * Engine-specific support is checked separately by collectLayerInstances.
 * @function isRefreshSupported
 * @param {object} layer MapStore layer configuration.
 * @returns {boolean|undefined|null} Whether refresh is supported; an absent layer is returned unchanged.
 * @memberof utils.AutoRefreshUtils
 */
export const isRefreshSupported = layer => layer && layer.group !== 'background'
    && SUPPORTED_LAYER_TYPES.includes(layer.type)
    && !!(layer.url || layer.tileMapUrl || layer.provider || layer.sources?.length);
/**
 * Check that an interval is finite, positive and within the timer limit of 2147483647 ms.
 * The configured minimum is enforced separately by the configuration epic and scheduler selector.
 * @function isValidInterval
 * @param {number} interval Refresh interval in milliseconds.
 * @returns {boolean} Whether the interval is valid.
 * @memberof utils.AutoRefreshUtils
 */
export const isValidInterval = interval => Number.isFinite(interval) && interval > 0 && interval <= AUTOREFRESH_MAXIMUM_REFRESH_INTERVAL;

const engines = {
    leaflet: ['wms', 'wfs', 'arcgis', 'wmts', 'tms', 'tileprovider'],
    openlayers: ['wms', 'wfs', 'arcgis', 'arcgis-feature', 'wmts', 'tms', 'tileprovider', 'flatgeobuf', 'cog'],
    cesium: ['wms', 'wfs', 'arcgis', 'arcgis-feature', 'wmts', 'tileprovider', 'flatgeobuf', 'cog', '3dtiles', 'model']
};

/**
 * Collect supported map and widget layer instances, retaining copies of the same dataset.
 * Visibility accounts for layer groups, selected maps/charts, layouts, collapsed widgets and maximization.
 * @function collectLayerInstances
 * @param {object[]} [layers=[]] Main map layers.
 * @param {object[]} [groups=[]] Main map layer groups.
 * @param {object} [containers={}] Widget containers indexed by target.
 * @param {boolean} [dashboard=false] Exclude main map layers when collecting dashboard instances.
 * @param {string} [mapType='openlayers'] Main map engine; widget maps use their own visualization mode.
 * @returns {object[]} Instances with layer, dataset key, visibility and support flags. Map instances
 * have mapLayer=true; widget instances have target, widgetId and a path relative to the widget.
 * @memberof utils.AutoRefreshUtils
 */
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

/**
 * Find datasets being edited in the feature grid or the current widget builder.
 * @function getEditedLayerKeys
 * @param {object[]} layers Main map layers used to resolve the feature grid's selected layer.
 * @param {object} [featuregrid={}] Feature grid state, including mode, saving, drawing and selectedLayer.
 * @param {object} [editor] Widget configuration currently being edited.
 * @returns {Set<string>} Dataset keys to exclude from refreshes while editing.
 * @memberof utils.AutoRefreshUtils
 */
export const getEditedLayerKeys = (layers, featuregrid = {}, editor) => {
    const keys = new Set();
    if (featuregrid.mode === 'EDIT' || featuregrid.saving || featuregrid.drawing) {
        const layer = layers.find(item => item.id === featuregrid.selectedLayer);
        if (layer) keys.add(getLayerRefreshKey(layer));
    }
    if (editor) getWidgetLayerPaths(editor).forEach(path => keys.add(getLayerRefreshKey(get(editor, path))));
    return keys;
};
