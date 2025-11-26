/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/


import Rx from 'rxjs';
import { endsWith, has, get, includes, isEqual, omit, omitBy } from 'lodash';

import {
    EXPORT_CSV,
    INSERT,
    TOGGLE_CONNECTION,
    WIDGET_SELECTED,
    EDITOR_SETTING_CHANGE,
    onEditorChange,
    updateWidgetLayer,
    clearWidgets,
    loadDependencies,
    toggleDependencySelector,
    DEPENDENCY_SELECTOR_KEY,
    WIDGETS_REGEX,
    UPDATE_PROPERTY,
    replaceWidgets,
    WIDGETS_MAPS_REGEX,
    EDITOR_CHANGE,
    OPEN_FILTER_EDITOR,
    updateWidgetProperty
} from '../actions/widgets';

import { changeMapEditor } from '../actions/queryform';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { TOGGLE_CONTROL } from '../actions/controls';
import { queryPanelSelector } from '../selectors/controls';

import {
    availableDependenciesSelector,
    isWidgetSelectionActive,
    getDependencySelectorConfig,
    getFloatingWidgets,
    getWidgetLayer
} from '../selectors/widgets';
import { CHANGE_LAYER_PROPERTIES, LAYER_LOAD, LAYER_ERROR, UPDATE_NODE } from '../actions/layers';

import { getLayerFromId } from '../selectors/layers';
import { pathnameSelector } from '../selectors/router';
import { isDashboardEditing } from '../selectors/dashboard';
import { DASHBOARD_LOADED } from '../actions/dashboard';
import { LOCATION_CHANGE } from 'connected-react-router';
import { saveAs } from 'file-saver';
import {reprojectBbox} from '../utils/CoordinatesUtils';
import {json2csv} from 'json-2-csv';
import { defaultGetZoomForExtent } from '../utils/MapUtils';
import { updateDependenciesMapOfMapList, DEFAULT_MAP_SETTINGS } from "../utils/WidgetsUtils";
import { hide, SAVE } from '../actions/mapEditor';

const updateDependencyMap = (active, targetId, { dependenciesMap, mappings}) => {
    const tableDependencies = ["layer", "filter", "quickFilters", "options"];
    const mapDependencies = ["layers", "groups", "viewport", "zoom", "center"];
    const dimensionDependencies = ["dimension.currentTime", "dimension.offsetTime"];
    const id = (WIDGETS_REGEX.exec(targetId) || [])[1];
    const cleanDependenciesMap = omitBy(dependenciesMap, i => i.indexOf(id) === -1);

    const depToTheWidget = targetId.split(".maps")[0];
    const overrides = Object.keys(mappings).filter(k => mappings[k] !== undefined).reduce( (ov, k) => {
        if (includes(dimensionDependencies, k)) {
            return {
                ...ov,
                [k]: targetId === "map" ? `dimension.${mappings[k]}` : `${depToTheWidget}.${mappings[k]}`
            };
        }
        if (!endsWith(targetId, "map") && includes(tableDependencies, k)) {
            return {
                ...ov,
                [k]: `${targetId}.${mappings[k]}`
            };
        }
        if (endsWith(targetId, "map")) {
            if (includes(mapDependencies, k)) {
                return {
                    ...ov,
                    [k]: targetId === "map" ? mappings[k] : `${targetId.replace(/.map$/, "")}.${mappings[k]}`
                };
            }
            return {
                ...ov,
                [k]: `${depToTheWidget}.${mappings[k]}`
            };
        }
        return ov;
    }, {});
    return active
        ? { ...cleanDependenciesMap, ...overrides, ["dependenciesMap"]: `${depToTheWidget}.dependenciesMap`, ["mapSync"]: `${depToTheWidget}.mapSync`}
        : omit(cleanDependenciesMap, [Object.keys(mappings)]);
};

/**
 * Action flow to add/Removes dependencies for a widgets.
 * Trigger `mapSync` property of a widget and sets `dependenciesMap` object to map `dependency` prop onto widget props.
 * For instance if
 *  - `active = true`
 *  - `mappings` option is `{a: "b"}
 *  - `dependency = "x"`
 * then you will have dependencyMap set to : {a: "x.b"}.
 * It manages also special dependency "map" where mappings are applied directly (center...) .
 * If active = false the dependencies will be removed from dependencyMap.
 *
 * @param {boolean} active true if the connection must be activated
 * @param {string} dependency the dependency element id to add
 * @param {object} options dependency mapping options. Must contain `mappings` object
 */
const configureDependency = (active, dependency, options) =>
    Rx.Observable.of(
        onEditorChange("mapSync", active),
        onEditorChange('dependenciesMap',
            updateDependencyMap(active, dependency, options)
        )
    );


export const exportWidgetData = action$ =>
    action$.ofType(EXPORT_CSV)
        .do( ({data = [], title = "data"}) =>
            saveAs(new Blob([
                json2csv(data)
            ], {type: "text/csv"}), title + ".csv"))
        .filter( () => false);
/**
 * Intercepts changes to widgets to catch widgets that can share some dependencies.
 * Then re-configures the dependencies to it.
 */
export const alignDependenciesToWidgets = (action$, { getState = () => { } } = {}) =>
    action$.ofType(MAP_CONFIG_LOADED, DASHBOARD_LOADED, INSERT)
        .map(() => availableDependenciesSelector(getState()))
        .pluck('availableDependencies')
        .distinctUntilChanged( (oldMaps = [], newMaps = []) => isEqual([...oldMaps], [...newMaps]))
    // add dependencies for all map widgets (for the moment the only ones that shares dependencies)
    // and for main "map" dependency, the "viewport" and "center"
        .map((maps = []) => loadDependencies(maps.reduce( (deps, m) => {
            const depToTheWidget = m.split(".maps")[0];
            const depToTheMap = m.replace(/.map$/, "");
            if (!endsWith(m, "map")) {
                return {
                    ...deps,
                    [`${m}.filter`]: `${m}.filter`,
                    [`${m}.quickFilters`]: `${m}.quickFilters`,
                    [`${depToTheWidget}.dependenciesMap`]: `${depToTheWidget}.dependenciesMap`,
                    [`${depToTheWidget}.mapSync`]: `${depToTheWidget}.mapSync`,
                    [`${m}.layer`]: `${m}.layer`,
                    [`${m}.options`]: `${m}.options`,
                    [`dimension.currentTime`]: `dimension.currentTime`,
                    [`dimension.offsetTime`]: `dimension.offsetTime`
                };
            }
            return {
                ...deps,
                [`${depToTheWidget}.dependenciesMap`]: `${depToTheWidget}.dependenciesMap`,
                [`${depToTheWidget}.mapSync`]: `${depToTheWidget}.mapSync`,
                [m === "map" ? "viewport" : `${depToTheMap}.viewport`]: `${depToTheMap}.bbox`, // {viewport: "map.bbox"} or {"widgets[ID_W].maps[ID_M].viewport": "widgets[ID_W].maps[ID_M].bbox"}
                [m === "map" ? "center" : `${depToTheMap}.center`]: `${depToTheMap}.center`, // {center: "map.center"} or {"widgets[ID_W].maps[ID_M].center": "widgets[ID_W].maps[ID_M].center"}
                [m === "map" ? "zoom" : `${depToTheMap}.zoom`]: `${depToTheMap}.zoom`,
                [m === "map" ? "layers" : `${depToTheMap}.layers`]: m === "map" ? `layers.flat` : `${depToTheMap}.layers`,
                [m === "map" ? "groups" : `${depToTheMap}.groups`]: m === "map" ? `layers.groups` : `${depToTheMap}.groups`,
                [`dimension.currentTime`]: `dimension.currentTime`,
                [`dimension.offsetTime`]: `dimension.offsetTime`
            };
        }, {}))
        );
/**
 * Toggles the dependencies setup and widget selection for dependencies
 * (if more than one widget is available for connection)
 */
export const toggleWidgetConnectFlow = (action$, {getState = () => {}} = {}) =>
    action$.ofType(TOGGLE_CONNECTION).switchMap(({ active, availableDependencies = [], options}) =>
        (active && availableDependencies.length > 0)
            // activate flow
            ? availableDependencies.length === 1
                // case singleMap
                // In future may be necessary to pass active prop, if different from mapSync, in options object
                // also if connection is triggered for a different target (widget not in editing) we should change actions to trigger (onChange instead of onEditorChange)
                ? configureDependency(active, availableDependencies[0], options)
                // case of multiple map
                : Rx.Observable.of(toggleDependencySelector(active, {
                    availableDependencies
                })
                ).merge(
                    action$.ofType(WIDGET_SELECTED)
                        .filter(() => isWidgetSelectionActive(getState()))
                        .switchMap(({ widget }) => {
                            const ad = get(getDependencySelectorConfig(getState()), 'availableDependencies');
                            let deps = ad.filter(d => (WIDGETS_REGEX.exec(d) || [])[1] === widget.id);
                            if (widget.widgetType === 'map') {
                                deps = deps.filter(d => (WIDGETS_MAPS_REGEX.exec(d) || [])[2] === widget.selectedMapId);
                            }
                            return configureDependency(active, deps[0], options).concat(Rx.Observable.of(toggleDependencySelector(false, {})));
                        }).takeUntil(
                            action$.ofType(LOCATION_CHANGE)
                                .merge(action$.filter(({ type, key } = {}) => type === EDITOR_SETTING_CHANGE && key === DEPENDENCY_SELECTOR_KEY))
                        )
                )

            // deactivate flow
            : configureDependency(active, availableDependencies[0], options)
    );

export const clearWidgetsOnLocationChange = (action$, {getState = () => {}} = {}) =>
    action$.ofType(MAP_CONFIG_LOADED).switchMap( () => {
        const location = pathnameSelector(getState()).split('/');
        const locationDifference = location[location.length - 1];
        return action$.ofType(LOCATION_CHANGE)
            .filter( ({ payload }) => {
                const newLocation = pathnameSelector(getState()).split('/');
                const newLocationDifference = newLocation[newLocation.length - 1];
                return payload.action !== 'REPLACE' && newLocationDifference !== locationDifference;
            }).switchMap( ({payload = {}} = {}) => {
                if (payload && payload.location && payload.location.pathname) {
                    return Rx.Observable.of(clearWidgets());
                }
                return Rx.Observable.empty();
            });
    });

/**
 * Triggers updates of the layer property of widgets on layerFilter change
 * @memberof epics.widgets
 * @param {external:Observable} action$ manages `CHANGE_LAYER_PROPERTIES`
 * @return {external:Observable}
 */
export const updateLayerOnLayerPropertiesChange = (action$, store) =>
    action$.ofType(CHANGE_LAYER_PROPERTIES, UPDATE_NODE)
        .filter(({layer, newProperties, nodeType, options}) => {
            return (layer && newProperties) || (nodeType === "layers" && has(options, "layerFilter"));
        })
        .switchMap(({layer, newProperties, node, options}) => {
            const state = store.getState();
            const flatLayer = getLayerFromId(state, layer ?? node);
            const shouldUpdate = flatLayer && (has(newProperties ?? options, "layerFilter") || has(newProperties, "fields"));
            if (shouldUpdate) {
                return Rx.Observable.of(updateWidgetLayer(flatLayer));
            }
            return Rx.Observable.empty();
        });

/**
 * Triggers updates of the layer property of widgets on loading error state change
 * @memberof epics.widgets
 * @param {external:Observable} action$ manages `LAYER_LOAD, LAYER_ERROR`
 * @return {external:Observable}
 */
export const updateLayerOnLoadingErrorChange = (action$, store) =>
    action$.ofType(LAYER_LOAD, LAYER_ERROR)
        .groupBy(({layerId}) => layerId)
        .map(layerStream$ => layerStream$
            .switchMap(({layerId}) => {
                const state = store.getState();
                const flatLayer = getLayerFromId(state, layerId);
                return Rx.Observable.of(
                    ...(flatLayer && flatLayer.previousLoadingError !== flatLayer.loadingError ?
                        [updateWidgetLayer(flatLayer)] :
                        [])
                );
            })
        ).mergeAll();

export const updateDependenciesMapOnMapSwitch = (action$, store) =>
    action$.ofType(UPDATE_PROPERTY)
        .filter(({key}) => includes(["maps", "selectedMapId"], key))
        .switchMap(({id: widgetId, value}) => {
            let observable$ = Rx.Observable.empty();
            const selectedMapId = typeof value === "string" ? value : value?.mapId;
            if (selectedMapId) {
                const widgets = getFloatingWidgets(store.getState());
                const updatedWidgets = updateDependenciesMapOfMapList(widgets, widgetId, selectedMapId);
                if (!isEqual(widgets, updatedWidgets)) {
                    observable$ = Rx.Observable.of(replaceWidgets(updatedWidgets));
                }
            }
            return observable$;
        });

export const onWidgetCreationFromMap = (action$, store) =>
    action$.ofType(EDITOR_CHANGE)
        .filter(({key, value}) => key === 'widgetType' && value === 'chart' && !isDashboardEditing(store.getState()))
        .switchMap(() => {
            let observable$ = Rx.Observable.empty();
            const state = store.getState();
            const layer = getWidgetLayer(state);
            if (layer) {
                observable$ = Rx.Observable.of(
                    onEditorChange('chart-layers', [layer])
                );
            }
            return observable$;
        });


export const onOpenFilterEditorEpic = (action$, store) =>
    action$.ofType(OPEN_FILTER_EDITOR)
        .switchMap(() => {
            const state = store.getState();
            const layer = getWidgetLayer(state);
            const zoom = defaultGetZoomForExtent(reprojectBbox(layer.bbox.bounds, "EPSG:4326", "EPSG:3857"), DEFAULT_MAP_SETTINGS.size, 0, 21, 96, DEFAULT_MAP_SETTINGS.resolutions);
            const map = {
                ...DEFAULT_MAP_SETTINGS,
                zoom,
                center: {
                    crs: layer.bbox.crs,
                    x: (layer.bbox.bounds.maxx + layer.bbox.bounds.minx) / 2,
                    y: (layer.bbox.bounds.maxy + layer.bbox.bounds.miny) / 2
                }
            };
            const mapData = layer?.bbox ? map : null;
            return Rx.Observable.of( changeMapEditor(mapData) );
        });


export const onResetMapEpic = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter((type, control) => !queryPanelSelector(store.getState()) && control === "queryPanel" && isDashboardEditing(store.getState()))
        .switchMap(() => {
            return Rx.Observable.of(
                changeMapEditor(null)
            );
        });

export const onMapEditorOpenEpic = (action$) =>
    action$.ofType(SAVE)
        .filter(({map} = {}) => map?.widgetId)
        .switchMap(({map}) => {
            return Rx.Observable.of(
                updateWidgetProperty(map.widgetId, "maps", map, "merge"),
                hide("widgetInlineEditor")
            );
        });

export default {
    exportWidgetData,
    alignDependenciesToWidgets,
    toggleWidgetConnectFlow,
    clearWidgetsOnLocationChange,
    updateLayerOnLayerPropertiesChange,
    updateLayerOnLoadingErrorChange,
    updateDependenciesMapOnMapSwitch,
    onWidgetCreationFromMap,
    onOpenFilterEditorEpic,
    onResetMapEpic,
    onMapEditorOpenEpic
};
