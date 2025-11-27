/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { find, get, castArray, flatten } from 'lodash';

import { mapSelector } from './map';
import { getSelectedLayer } from './layers';
import { pathnameSelector } from './router';
import { DEFAULT_TARGET, DEPENDENCY_SELECTOR_KEY, WIDGETS_REGEX } from '../actions/widgets';
import { getWidgetsGroups, getWidgetDependency, getSelectedWidgetData, extractTraceData, canTableWidgetBeDependency } from '../utils/WidgetsUtils';
import { dashboardServicesSelector, isDashboardAvailable, isDashboardEditing } from './dashboard';
import { createSelector, createStructuredSelector } from 'reselect';
import { createShallowSelector } from '../utils/ReselectUtils';
import { getAttributesNames } from "../utils/FeatureGridUtils";


export const getEditorSettings = state => get(state, "widgets.builder.settings");
export const getDependenciesMap = s => get(s, "widgets.dependencies") || {};
export const getDependenciesKeys = s => Object.keys(getDependenciesMap(s)).map(k => getDependenciesMap(s)[k]);
export const getEditingWidget = state => get(state, "widgets.builder.editor");
export const getSelectedChartId = state => get(getEditingWidget(state), 'selectedChartId');
export const getEditingWidgetLayer = state => {
    const { layer, charts, selectedChartId, selectedTraceId } = getEditingWidget(state) || {};
    return charts ? extractTraceData({ selectedChartId, selectedTraceId, charts })?.layer : layer;
};
export const getWidgetLayer = createSelector(
    getEditingWidgetLayer,
    getSelectedLayer,
    state => isDashboardAvailable(state) && isDashboardEditing(state),
    (layer, selectedLayer, dashboardEditing) => layer || !dashboardEditing && selectedLayer
);
export const getChartWidgetLayers = (state) => getEditingWidget(state)?.charts?.map(c => c.layer) || [];

export const getSelectedLayoutId = state => {
    const selectedLayoutId = get(state, `widgets.containers[${DEFAULT_TARGET}].selectedLayoutId`);
    if (selectedLayoutId) return selectedLayoutId;

    const layouts = get(state, `widgets.containers[${DEFAULT_TARGET}].layouts`);
    return layouts?.[0]?.id;
};

export const getFloatingWidgets = state => get(state, `widgets.containers[${DEFAULT_TARGET}].widgets`);
export const getFloatingWidgetsPerView = createSelector(
    getFloatingWidgets,
    getSelectedLayoutId,
    getEditingWidget,
    (widgets = [], selectedLayoutId, editingWidget) => {
        if (editingWidget?.layoutId) {
            return widgets.filter(w => w.layoutId === editingWidget.layoutId);
        }
        if (selectedLayoutId) {
            return widgets.filter(w => w.layoutId === selectedLayoutId);
        }
        return widgets;
    }
);

export const getCollapsedState = state => get(state, `widgets.containers[${DEFAULT_TARGET}].collapsed`);
export const getMaximizedState = state => get(state, `widgets.containers[${DEFAULT_TARGET}].maximized`);
export const getVisibleFloatingWidgets = createSelector(
    getFloatingWidgets,
    getCollapsedState,
    getMaximizedState,
    (widgets, collapsed, maximized) => {
        if (widgets) {
            if (maximized?.widget) {
                return widgets.filter(({ id } = {}) => id === maximized.widget.id);
            } else if (collapsed) {
                return widgets.filter(({ id } = {}) => !collapsed[id]);
            }
        }
        return widgets;
    }
);
export const getWidgetAttributeFilter = (id, attributeName) => createSelector(
    getVisibleFloatingWidgets,
    (widgets) => {
        const widget = find(widgets, {id});
        return widget && widget.quickFilters && widget.options && find(getAttributesNames(widget.options?.propertyName), f => f === attributeName) && widget.quickFilters[attributeName] || {};
    });

export const getCollapsedIds = createSelector(
    getCollapsedState,
    (collapsed = {}) => Object.keys(collapsed)
);
export const getMapWidgets = state => (getFloatingWidgets(state) || []).filter(({ widgetType } = {}) => widgetType === "map");
export const getTableWidgets = state => (getFloatingWidgets(state) || []).filter(({ widgetType } = {}) => widgetType === "table");

export const getMapWidgetsPerView = state => (getFloatingWidgetsPerView(state) || []).filter(({ widgetType } = {}) => widgetType === "map");
export const getTableWidgetsPerView = state => (getFloatingWidgetsPerView(state) || []).filter(({ widgetType } = {}) => widgetType === "table");

/**
 * Find in the state the available dependencies to connect
 *
 * Note: table widgets are excluded from selection when viewer is present,
 * because there were conflict between map and other widgets
 * (the map contains other widgets)
 */
export const availableDependenciesSelector = createSelector(
    getMapWidgets,
    getTableWidgets,
    mapSelector,
    pathnameSelector,
    (ws = [], tableWidgets = [], map = [], pathname) => ({
        availableDependencies:
            flatten(ws
                .map(({id, maps = []}) => maps.map(({mapId} = {})=> `widgets[${id}].maps[${mapId}].map`)))
                .concat(castArray(map).map(() => "map"))
                .concat(castArray(tableWidgets).filter(() => pathname.indexOf("viewer") === -1).map(({id}) => `widgets[${id}]`))
    })
);
/**
 * this selector adds some more filtering on tables when a widget is in edit mode
 * and the table widgets does not share the same dataset (layername)
 */
export const availableDependenciesForEditingWidgetSelector = createSelector(
    getMapWidgetsPerView,
    getTableWidgetsPerView,
    mapSelector,
    pathnameSelector,
    getEditingWidget,
    (ws = [], tableWidgets = [], map = {}, pathname, editingWidget) => {
        return {
            availableDependencies:
                flatten(ws
                    .map(({id, maps = []}) => maps.map(({mapId} = {})=> `widgets[${id}].maps[${mapId}].map`)))
                    .concat(castArray(map).map(() => map ? "map" : null))
                    .filter(w => w)
                    .concat(
                        castArray(tableWidgets)
                            .filter(() => pathname.indexOf("viewer") === -1)
                            .filter((w) => canTableWidgetBeDependency(editingWidget, w))
                            .filter((w) => editingWidget && editingWidget.id !== w.id)
                            .map(({id}) => `widgets[${id}]`)
                    )
        };
    }
);
/**
 * returns if the dependency selector state
 * @param {object} state the state
 */
export const getDependencySelectorConfig = state => get(getEditorSettings(state), `${DEPENDENCY_SELECTOR_KEY}`);
/**
 * Determines if the dependencySelector is active
 * @param {object} state the state
 */
export const isWidgetSelectionActive = state => get(getDependencySelectorConfig(state), 'active');

export const getWidgetsDependenciesGroups = createSelector(
    getFloatingWidgets,
    widgets => getWidgetsGroups(widgets)
);
export const getFloatingWidgetsLayout = state => get(state, `widgets.containers[${DEFAULT_TARGET}].layouts`);
export const getFloatingWidgetsCurrentLayout = state => get(state, `widgets.containers[${DEFAULT_TARGET}].layout`);

export const getDashboardWidgets = state => get(state, `widgets.containers[${DEFAULT_TARGET}].widgets`);

export const isTrayEnabled = state => get(state, "widgets.tray");

// let's use the same container for the moment
export const dashboardHasWidgets = state => (getDashboardWidgets(state) || []).length > 0;
export const getDashboardWidgetsLayout = state => get(state, `widgets.containers[${DEFAULT_TARGET}].layouts`);
export const returnToFeatureGridSelector = (state) => get(state, "widgets.builder.editor.returnToFeatureGrid", false);
export const getEditingWidgetFilter = state => {
    const editingWidget = getSelectedWidgetData(getEditingWidget(state));
    return get(editingWidget, "filter");
};
export const dashBoardDependenciesSelector = () => ({}); // TODO dashboard dependencies
/**
 * transforms dependencies in the form `{ k1: "path1", k1, "path2" }` into
 * a map like `{k1: v1, k2: v2}` where `v1 = get("path1", state)`.
 * Dependencies paths map comes from getDependenciesMap.
 * map.... is a special path that brings to the map of mapstore.
 */
export const dependenciesSelector = createShallowSelector(
    getDependenciesMap,
    getDependenciesKeys,
    // produces the array of values of the keys in getDependenciesKeys
    state => getDependenciesKeys(state).map(k =>
        k.indexOf("map.") === 0
            ? get(mapSelector(state), k.slice(4))
            : k.match(WIDGETS_REGEX)
                ? getWidgetDependency(k, getFloatingWidgets(state), getMapWidgets(state))
                : get(state, k) ),
    // iterate the dependencies keys to set the dependencies values in a map
    (map, keys, values) => keys.reduce((acc, k, i) => ({
        ...acc,
        [Object.keys(map)[i]]: values[i]
    }), {})
);

export const widgetsConfig = createStructuredSelector({
    widgets: getFloatingWidgets,
    layouts: getFloatingWidgetsLayout,
    catalogs: dashboardServicesSelector
});


/**
 * Get editor change key for updating filter object
 * @param {object} state the state
 */
export const getWidgetFilterKey = (state) => {
    const { selectedChartId, charts = [],  selectedTraceId } = getEditingWidget(state) || {};
    if (!selectedChartId) {
        return 'filter';
    }
    const selectedTrace = extractTraceData({ selectedChartId, selectedTraceId, charts });
    // Set chart key if editor widget type is chart
    return `charts[${selectedChartId}].traces[${selectedTrace?.id}].filter`;
};

export const getTblWidgetZoomLoader = state => {
    let tableWidgets = (getFloatingWidgets(state) || []).filter(({ widgetType } = {}) => widgetType === "table");
    return tableWidgets?.find(t=>t.dependencies?.zoomLoader) ? true : false;
};

