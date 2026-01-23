/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { find, get, castArray, flatten } from 'lodash';

import { mapSelector } from './map';
import { getEffectivelyVisibleLayers, getSelectedLayer, layersSelector } from './layers';
import { generateRootTree } from '../utils/InteractionUtils';
import { pathnameSelector } from './router';
import { DEFAULT_TARGET, DEPENDENCY_SELECTOR_KEY, LAYERS_REGEX, WIDGETS_REGEX } from '../actions/widgets';
import { cleanPaths, getWidgetsGroups, getWidgetDependency, getSelectedWidgetData, extractTraceData, canTableWidgetBeDependency } from '../utils/WidgetsUtils';
import { dashboardServicesSelector, isDashboardAvailable, isDashboardEditing } from './dashboard';
import { createSelector, createStructuredSelector } from 'reselect';
import { createShallowSelector } from '../utils/ReselectUtils';
import { getAttributesNames } from "../utils/FeatureGridUtils";
import { getDerivedLayersVisibility } from '../utils/LayersUtils';


export const getEditorSettings = state => get(state, "widgets.builder.settings");
export const getDependenciesMap = s => get(s, "widgets.dependencies") || {};
export const getDependenciesKeys = s => Object.keys(getDependenciesMap(s)).map(k => getDependenciesMap(s)[k]);
export const getEditingWidget = state => get(state, "widgets.builder.editor");
export const getWidgetInteractionTree = state => get(state, 'widgets.widgetInteractionTree');
export const getSelectedChartId = state => get(getEditingWidget(state), 'selectedChartId');
export const getEditingWidgetLayer = state => {
    const editingWidget = getEditingWidget(state) || {};
    const { layer, charts, selectedChartId, selectedTraceId, widgetType, filters, selectedFilterId } = editingWidget;

    // Handle filter widgets
    if (widgetType === 'filter' && filters && selectedFilterId) {
        const selectedFilter = filters.find(f => f.id === selectedFilterId);
        return selectedFilter?.data?.layer;
    }

    // Handle chart widgets
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

/**
 * Generate widget interaction tree using generateRootTree
 * This selector generates the tree on-demand with access to full state
 * Includes the editing widget in the tree, removing it from main widgets by ID to avoid duplicates
 * @param {object} state - Redux state
 * @returns {object} The generated interaction tree
 */
export const getWidgetInteractionTreeGenerated = createSelector(
    getFloatingWidgetsPerView,
    getEditingWidget,
    layersSelector,
    isDashboardEditing,
    (widgets, editingWidget, mapLayers, dashboardEditing) => {
        const widgetsArray = widgets || [];
        let combinedWidgets = widgetsArray;

        // If editing widget exists, remove it from main widgets by ID and add it separately
        if (editingWidget?.id) {
            combinedWidgets = widgetsArray.filter(w => w?.id !== editingWidget.id);
            combinedWidgets = [...combinedWidgets, editingWidget];
        }

        // Don't pass mapLayers if dashboard editing is true
        const layersToUse = dashboardEditing ? undefined : mapLayers;
        return generateRootTree(combinedWidgets, layersToUse);
    }
);

/**
 * Selector for collapsed widgets.
 * @param {object} state
 * @returns {object} a map of {id_widget: boolean}, when teh boolean value is true if the widget is collapsed.
 */
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
    const editingWidget = getEditingWidget(state) || {};
    const { widgetType, filters, selectedFilterId, editingUserDefinedItemId } = editingWidget;

    // Handle filter widgets
    if (widgetType === 'filter' && filters && selectedFilterId) {
        const selectedFilter = filters.find(f => f.id === selectedFilterId);

        // If editing a user-defined item filter, return that specific item's filter
        if (editingUserDefinedItemId && selectedFilter?.data?.userDefinedItems) {
            const userDefinedItem = selectedFilter.data.userDefinedItems.find(item => item.id === editingUserDefinedItemId);
            return userDefinedItem?.filter;
        }

        // Otherwise return the layer-level filter
        return selectedFilter?.data?.filter;
    }

    // Default behavior for other widgets
    const selectedWidget = getSelectedWidgetData(editingWidget);
    return get(selectedWidget, "filter");
};
export const dashBoardDependenciesSelector = () => ({}); // TODO dashboard dependencies
/**
 * The selector creator for creating path-based selectors for interactions / dependencies
 * In general it can resolve paths for:
 * - map (main map object)
 * - map.center (main map center), or other map properties
 * - map.layers[<layerId>] (specific layer in the main map)
 * - widgets[<widgetId>] (floating widget)
 * - widgets[<widgetId>].layers[<layerId>] (specific layer in a floating map widget)
 * It can resolve also paths for general redux state, but those are not recommended for interactions / dependencies.
 * @param {string} path the path to resolve
 * @returns {function} the selector that returns the data pointed by the path
 */
export const createPathSelector = (path) => createSelector(
    mapSelector,
    layersSelector,
    getFloatingWidgets,
    getMapWidgets,
    state => get(state, path),
    (map, layers, floatingWidgets, mapWidgets, resolvedPath) => {
        return path.indexOf("map.") === 0
            ? path.indexOf("map.layers") === 0 && path.slice(4).match(LAYERS_REGEX)
                ? find(layers, {id: path.slice(4).match(LAYERS_REGEX)[1]})
                : get(map, path.slice(4))
            : path.match(WIDGETS_REGEX)
                ? getWidgetDependency(path, floatingWidgets, mapWidgets)
                : resolvedPath;
    }
);
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
    state => getDependenciesKeys(state).map(k => createPathSelector(k)(state)),
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
    const editingWidget = getEditingWidget(state) || {};
    const { selectedChartId, charts = [], selectedTraceId, widgetType, filters, selectedFilterId, editingUserDefinedItemId } = editingWidget;

    // Handle filter widgets
    if (widgetType === 'filter' && filters && selectedFilterId) {
        const filterIndex = filters.findIndex(f => f.id === selectedFilterId);
        if (filterIndex !== -1) {
            // If editing a user-defined item filter, return path to that specific item's filter
            if (editingUserDefinedItemId) {
                const selectedFilter = filters[filterIndex];
                const itemIndex = selectedFilter?.data?.userDefinedItems?.findIndex(item => item.id === editingUserDefinedItemId);
                if (itemIndex !== -1 && itemIndex !== undefined) {
                    return `filters[${filterIndex}].data.userDefinedItems[${itemIndex}].filter`;
                }
                // If item not found, return null to prevent saving to wrong location
                console.warn('User-defined item not found:', editingUserDefinedItemId);
                return null;
            }
            // Otherwise return path to layer-level filter (only when NOT editing user-defined item)
            return `filters[${filterIndex}].data.filter`;
        }
    }

    // Handle chart widgets
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

/**
 * Extracts interaction targets paths from the interaction tree
 * @param {object} state the state
 * @return {string[]} array of nodePath strings
 */
export const interactionsNodePathsSelector = createSelector(
    getWidgetInteractionTreeGenerated,
    (interactionTree) => {
        const targetsPaths = [];
        const traverseTree = (nodes) => {
            nodes.forEach((node) => {
                const nodePath = cleanPaths(node?.nodePath);
                if (nodePath) {
                    targetsPaths.push(nodePath);
                }
                if (node.children) {
                    traverseTree(node.children);
                }
                if (node?.interactionMetadata?.targets) {
                    traverseTree(node?.interactionMetadata?.targets);
                }
            });
        };

        traverseTree(interactionTree ? [interactionTree] : []);
        return targetsPaths;
    }
);

/**
 * Get interaction data from the node paths available in the interaction tree.
 * @param {object} state the state
 * @return {Map} a map of nodePath - object resolved targets.
 * Example:
 * ```json
 * {
 *  "map.layers[0]": LAYER_OBJECT, "widgets[widgetId]": WIDGET_OBJECT
 * }
 * ```
 */
export const interactionsNodesSelector = (state) => {
    // now getting data from all node paths a possible optimization is to reduce the number nodes
    // by using specific selectors only for current targets of interactions
    // given that we still need map object for layers to calculate visibility
    const paths = interactionsNodePathsSelector(state);
    const map = new Map();
    paths.forEach((path) => {
        const object = createPathSelector(path)(state);
        if (object) {
            map.set(path, object);
        }
    });
    return map;
};

export const interactionTargetVisibilitySelector = createSelector(
    [interactionsNodesSelector,
    // main map effectively visible layers
        getEffectivelyVisibleLayers,
        // visible widgets
        getVisibleFloatingWidgets],
    // getCollapsedState, // collapsed widgets
    (targetsData, visibleLayers, visibleWidgets) => {
        return targetsData.entries().reduce((acc, [path, value]) => {
            if (path.startsWith("map.layers[")) {
                acc[path] = visibleLayers.some(l => l.id === value.id);
            }
            if (path.startsWith("widgets[")) {
                // need to check visibility, and if contains layer, also effective visibility for the map
                // // TODO check for widget visibility
                const getWidgetIdFromPath = (pp) => {
                    const match = pp.match(/widgets\[(.*?)\]/);
                    return match ? match[1] : null;
                };
                if (visibleWidgets.some(w => w.id === getWidgetIdFromPath(path))) {
                    acc[path] = true;
                } else {
                    acc[path] = false;
                }
                if (path.includes(".layers[")) {
                    // for the moment we only support there is no path nesting beyond layers
                    const layerId = value.id;
                    // get map of the layer from the path and the targetsData
                    const mapPath = path.substring(0, path.indexOf(".layers["));
                    const mapObject = targetsData.get(mapPath);
                    getDerivedLayersVisibility(mapObject.layers, mapObject.groups).forEach(l => {
                        if (l.id === layerId) {
                            acc[path] = l.visibility === true;
                        }
                    });
                }

            }
            return acc;
        }, {});
    }
);
