/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import uuidv1 from 'uuid/v1';
import {
    EDIT_NEW,
    INSERT,
    EDIT,
    UPDATE_PROPERTY,
    UPDATE_LAYER,
    DELETE,
    EDITOR_CHANGE,
    EDITOR_SETTING_CHANGE,
    INIT,
    CHANGE_LAYOUT,
    CLEAR_WIDGETS,
    DEFAULT_TARGET,
    ADD_DEPENDENCY,
    REMOVE_DEPENDENCY,
    LOAD_DEPENDENCIES,
    RESET_DEPENDENCIES,
    TOGGLE_COLLAPSE,
    TOGGLE_MAXIMIZE,
    TOGGLE_COLLAPSE_ALL,
    TOGGLE_TRAY,
    toggleCollapse,
    REPLACE,
    WIDGETS_REGEX,
    REPLACE_LAYOUT_VIEW,
    SET_SELECTED_LAYOUT_VIEW_ID
} from '../actions/widgets';
import { REFRESH_SECURITY_LAYERS, CLEAR_SECURITY } from '../actions/security';
import { MAP_CONFIG_LOADED } from '../actions/config';
import { DASHBOARD_LOADED, DASHBOARD_RESET } from '../actions/dashboard';
import set from 'lodash/fp/set';
import { get, find, omit, mapValues, castArray, isEmpty } from 'lodash';
import { arrayUpsert, compose, arrayDelete } from '../utils/ImmutableUtils';
import {
    convertDependenciesMappingForCompatibility as convertToCompatibleWidgets,
    editorChange
} from "../utils/WidgetsUtils";

const emptyState = {
    dependencies: {
        viewport: "map.bbox",
        center: "map.center",
        zoom: "map.zoom"
    },
    containers: {
        floating: {
            widgets: []
        }
    },
    builder: {
        map: null,
        settings: {
            step: 0
        }
    }
};


/**
 * Manages the state of the widgets
 * @prop {array} widgets version identifier
 *
 * @example
 *{
 *  widgets: {
 *    containers: {
 *       floating: {
 *          widgets: [{
 *              //...
 *          }]
 *       }
 *    }
 *  }
 *}
 * @memberof reducers
 */
function widgetsReducer(state = emptyState, action) {
    switch (action.type) {
    case INIT: {
        return set(`defaults`, action.cfg, state);
    }
    case EDITOR_SETTING_CHANGE: {
        return set(`builder.settings.${action.key}`, action.value, state);
    }
    case EDIT_NEW: {
        return set(`builder.editor`, action.widget,
            set("builder.settings", action.settings || emptyState.settings, state));
    }
    case EDIT: {
        return set(`builder.editor`, {
            ...action.widget,
            // for backward compatibility widgets without widgetType are charts
            widgetType: action.widget && action.widget.widgetType || 'chart'
        }, set("builder.settings.step", 0, state));
    }
    case EDITOR_CHANGE: {
        return editorChange(action, state);
    }
    case INSERT: {
        let widget = {...action.widget};
        if (widget.widgetType === 'chart') {
            widget = omit(widget, ["layer", "url"]);
        }
        const w = state?.defaults?.initialSize?.w ?? 1;
        const h = state?.defaults?.initialSize?.h ?? 1;
        const selectedLayoutId = get(state, `containers[${DEFAULT_TARGET}].selectedLayoutId`);
        const layouts = get(state, `containers[${DEFAULT_TARGET}].layouts`);
        const layoutId = selectedLayoutId || layouts?.[0]?.id;
        return arrayUpsert(`containers[${action.target}].widgets`, {
            id: action.id,
            ...widget,
            ...(layoutId ? { layoutId } : {}),
            dataGrid: action.id && {
                w,
                h,
                x: 0,
                y: 0
            }
        }, {
            id: action.widget.id || action.id
        }, state);
    }

    case REPLACE:
        const widgetsPath = `containers[${action.target}].widgets`;
        const widgets = get(state, widgetsPath);
        if (widgets) {
            return set(widgetsPath, action.widgets, state);
        }
        return state;
    case UPDATE_PROPERTY:
        // if "merge" update map by merging a partial map object coming from
        // onMapViewChanges handler for MapWidget
        // if "replace" update the widget setting the value to the existing object
        const oldWidget = find(get(state, `containers[${action.target}].widgets`), {
            id: action.id
        });
        let uValue = action.value;
        if (action.mode === "merge") {
            uValue = action.key === "maps"
                ? oldWidget?.maps?.map(m => m.mapId === action.value?.mapId ? {...m, ...action?.value} : m)
                : Object.assign({}, oldWidget[action.key], action.value);
        }
        return arrayUpsert(`containers[${action.target}].widgets`,
            set(action.key, uValue, oldWidget), { id: action.id },
            state
        );
    case UPDATE_LAYER: {
        if (action.layer) {
            const _widgets = get(state, `containers[${DEFAULT_TARGET}].widgets`);
            if (_widgets) {
                return set(`containers[${DEFAULT_TARGET}].widgets`,
                    _widgets.map(w => {
                        if (w.widgetType === "chart" && w?.charts) {
                            // every chart stores the layer object configuration
                            // so we need to loop around them to update correctly the layer properties
                            // including the layerFilter
                            let chartsCopy = w?.charts?.length ? [...w.charts] : [];
                            chartsCopy = chartsCopy.map(chart=>{
                                let chartItem = {...chart};
                                chartItem.traces = chartItem?.traces?.map(trace=>
                                    get(trace, "layer.id") === action.layer.id ? set("layer", action.layer, trace) : trace
                                );
                                return chartItem;
                            });
                            return set("charts", chartsCopy, w);
                        }
                        return get(w, "layer.id") === action.layer.id ? set("layer", action.layer, w) : w;
                    }), state);
            }
        }
        return state;
    }
    case DELETE:
        const path = `containers[${DEFAULT_TARGET}].widgets`;
        const updatedState = arrayDelete(`containers[${action.target}].widgets`, {
            id: action.widget.id
        }, state);
        const allWidgets = get(updatedState, path, []);
        return set(path, allWidgets.map(m => {
            if (m.dependenciesMap) {
                const [, dependentWidgetId] = WIDGETS_REGEX.exec((Object.values(m.dependenciesMap) || [])[0]) || [];
                if (dependentWidgetId) {
                    if (action.widget.id === dependentWidgetId) {
                        return {...omit(m, "dependenciesMap"), mapSync: false};
                    }
                }
            }
            return m;
        }), state);
    case DASHBOARD_LOADED:
        const { data } = action;
        return set(`containers[${DEFAULT_TARGET}]`, {
            ...data
        }, state);
    case REFRESH_SECURITY_LAYERS: {
        let newWidgets = state?.containers?.[DEFAULT_TARGET].widgets || [];
        newWidgets = newWidgets?.map(w => {
            const newMaps = w.maps?.map(map => {
                return {
                    ...map,
                    layers: map.layers?.map(l => {
                        return l.security ? {
                            ...l,
                            security: {
                                ...l.security,
                                rand: uuidv1()
                            }
                        } : l;
                    })
                };
            });
            return {...w, maps: newMaps};
        });
        const newMaps = state.builder?.editor?.maps?.map(map => {
            return {
                ...map,
                layers: map.layers.map(l => {
                    return l.security ? {
                        ...l,
                        security: {
                            ...l.security,
                            rand: uuidv1()
                        }
                    } : l;
                })
            };
        });
        return set(`containers[${DEFAULT_TARGET}].widgets`, newWidgets, set(`builder.editor.maps`, newMaps, state));}
    case CLEAR_SECURITY: {
        let newWidgets = state?.containers?.[DEFAULT_TARGET].widgets || [];
        newWidgets = newWidgets?.map(w => {
            const maps = w.maps?.map(map => {
                return {
                    ...map,
                    layers: map.layers.map(l => {
                        return l?.security?.sourceId === action.protectedId ? {
                            ...l,
                            security: undefined
                        } : l;
                    })
                };
            });
            return {...w, maps};
        });
        const maps = state.builder?.editor?.maps?.map(map => {
            return {
                ...map,
                layers: map.layers.map(l => {
                    return l?.security?.sourceId === action.protectedId ? {
                        ...l,
                        security: undefined
                    } : l;
                })
            };
        });
        return set(`containers[${DEFAULT_TARGET}].widgets`, newWidgets, set(`builder.editor.maps`, maps, state));
    }
    case MAP_CONFIG_LOADED:
        let { widgetsConfig } = (action.config || {});
        if (!isEmpty(widgetsConfig)) {
            widgetsConfig = convertToCompatibleWidgets(widgetsConfig);
            return set(`containers[${DEFAULT_TARGET}]`, {
                ...widgetsConfig
            }, state);
        }
        return state;
    case CHANGE_LAYOUT: {
        return set(`containers[${action.target}].layout`, action.layout)(set(`containers[${action.target}].layouts`, action.allLayouts, state));
    }
    case CLEAR_WIDGETS:
    case DASHBOARD_RESET: {
        return set(`containers[${DEFAULT_TARGET}]`, emptyState.containers[DEFAULT_TARGET], state);
    }
    case ADD_DEPENDENCY: {
        const {key, value} = action;
        return set(`dependencies[${key}]`, value, state);
    }
    case REMOVE_DEPENDENCY: {
        const {key} = action;
        return set(`dependencies[${key}]`, null, state);
    }
    case LOAD_DEPENDENCIES:
        const {dependencies} = action;
        return set(`dependencies`, dependencies, state);
    case RESET_DEPENDENCIES:
        return set('dependencies', emptyState.dependencies, state);
    case TOGGLE_COLLAPSE: {
        /*
             * Collapse functionality has been implemented keeping the widget unchanged, adding it's layout is added to a map of collapsed objects.
             * The widgets plugin filters out the collapsed widget from the widgets list to render
             * So the containers triggers a layout change that removes the layout.
             * So when we want to expand again the widget, we have to restore the original layout settings.
             * This allows to save (and restore) collapsed state of the widgets in one unique separated object.
             */
        const {widget = {}} = action;

        // locked widgets can not be collapsed
        if (widget.dataGrid && widget.dataGrid.static) {
            return state;
        }
        const widgetCollapsedState = get(state, `containers[${action.target}].collapsed[${widget.id}`);
        if (widgetCollapsedState) {
            // EXPAND

            const newLayoutValue = [
                ...get(state, `containers[${action.target}].layout`, []),
                ...castArray(
                    get(widgetCollapsedState, `layout`, [])
                ) // add stored old layout, if exists
            ];
            const updatedLayoutsMap = mapValues(
                get(state, `containers[${action.target}].layouts`, {}),
                (v = [], k) => ([
                    ...v,
                    ...castArray(
                        get(widgetCollapsedState, `layouts[${k}]`, [])
                    )
                ])
            );
            return omit(
                compose(
                    // restore original layout for the widget
                    set(
                        `containers[${action.target}].layout`,
                        newLayoutValue
                    ),
                    // restore original layout for each break point
                    set(
                        `containers[${action.target}].layouts`,
                        updatedLayoutsMap
                    )
                    // restore original layout for each breakpoint (md, xs, ...) for the widget
                )(state),
                `containers[${action.target}].collapsed[${widget.id}]`);
        }

        return set(`containers[${action.target}].collapsed[${widget.id}]`, {
            // COLLAPSE

            // NOTE: when the collapse is toggled, the widget is not visible anymore
            // because it is filtered out from the view ( by the selector)
            // this causes a second action CHANGE_LAYOUT, automatically triggered
            // by react-grid-layout that removes the layout objects from the
            // `layout` and `layouts` state parts

            // get layout object for each k for the widget
            layout: find(
                get(state, `containers[${action.target}].layout`, []),
                { i: widget.id }
            ),
            // get layout object for each breakpoint (md, xs...) for the widget
            layouts: mapValues(
                get(state, `containers[${action.target}].layouts`, {}),
                v => find(v, {i: widget.id})
            )
        }, state);
    }
    case TOGGLE_MAXIMIZE: {
        const widget = action.widget;
        const maximized = state?.containers?.[action.target]?.maximized;

        if (!widget || widget.dataGrid?.static) {
            return state;
        }

        const layouts = state?.containers?.[action.target]?.layouts;
        const selectedLayoutId = state?.containers?.[action.target]?.selectedLayoutId || layouts?.[0]?.id;
        const isLayoutArray = Array.isArray(layouts);

        const isWidgetArray = maximized?.widget ? Array.isArray(maximized.widget) : false;
        const isIncluded = isWidgetArray ? maximized.widget.find(w => w.id === widget.id) : widget;

        if (isIncluded && maximized?.widget && maximized?.widget?.length > 1) {
            const maximizedState = { ...maximized, widget: maximized.widget.filter(w => w.id !== widget.id) };
            const updatedLayouts = layouts.map(l => l.id === widget.layoutId
                ? { ...maximized.layouts.find(ml => ml.id === widget.layoutId) }
                : { ...l }
            );
            return compose(
                set(`containers[${action.target}].maximized`, maximizedState),
                set(`containers[${action.target}].layout`, updatedLayouts.find(l => l.id === widget.layoutId)?.md),
                set(`containers[${action.target}].layouts`, updatedLayouts),
                set(`containers[${action.target}].widgets`, state?.containers?.[action.target]?.widgets?.map(w => w.id === widget.id ?
                    {
                        ...w,
                        dataGrid: {
                            ...w.dataGrid,
                            isDraggable: true,
                            isResizable: true
                        }
                    } : w)
                )
            )(state);
        } else if (isIncluded && maximized?.widget) {
            return compose(
                set(`containers[${action.target}].layout`, maximized.layout),
                set(`containers[${action.target}].layouts`, maximized.layouts),
                set(`containers[${action.target}].maximized`, {}),
                set(`containers[${action.target}].widgets`, state?.containers?.[action.target]?.widgets?.map(w => w.id === maximized.widget.id ?
                    {
                        ...w,
                        dataGrid: {
                            ...w.dataGrid,
                            isDraggable: true,
                            isResizable: true
                        }
                    } : w)
                )
            )(state);
        }

        if (state?.containers?.[action.target]?.collapsed?.[widget.id]) {
            return state;
        }

        // we assume that react-grid-layout has just one cell with one xxs breakpoint at 0, that is covering
        // the area that is supposed to be taken by maximized widget, when maximized state is present
        const newLayoutValues = {
            x: 0,
            y: 0,
            w: 1,
            h: 1
        };
        const oldLayoutValue = find(state?.containers?.[action.target]?.layout, {i: widget.id});
        const newLayoutValue = {
            ...oldLayoutValue,
            ...newLayoutValues
        };

        const updatedLayout = isLayoutArray
            ? layouts.map(l =>
                l.id === selectedLayoutId
                    ? { ...l, xxs: [newLayoutValue], md: [] }
                    : { ...l }
            )
            : { xxs: [newLayoutValue] };

        return compose(
            set(`containers[${action.target}].maximized`, {
                widget: isLayoutArray ? [...(maximized?.widget || []), widget] : widget,
                layout: maximized?.layout || state?.containers?.[action.target]?.layout,
                layouts: maximized?.layouts || state?.containers?.[action.target]?.layouts
            }),
            set(`containers[${action.target}].layout`, [newLayoutValue]),
            set(`containers[${action.target}].layouts`, updatedLayout),
            set(`containers[${action.target}].widgets`, state?.containers?.[action.target]?.widgets?.map(w => w.id === widget.id ?
                {
                    ...w,
                    dataGrid: {
                        ...w.dataGrid,
                        isDraggable: false,
                        isResizable: false
                    }
                } : w)
            )
        )(state);
    }
    case TOGGLE_COLLAPSE_ALL: {
        // get widgets excluding static widgets
        const widgetsStatic = get(state, `containers[${action.target}].widgets`, [])
            .filter( w => !w.dataGrid || !w.dataGrid.static );
        const collapsedWidgets = widgetsStatic.filter(w => get(state, `containers[${action.target}].collapsed[${w.id}]`));
        const expandedWidgets = widgetsStatic.filter(w => !get(state, `containers[${action.target}].collapsed[${w.id}]`));
        const shouldExpandAll = expandedWidgets.length === 0;
        if (shouldExpandAll) {
            return collapsedWidgets.reduce((acc, w) => widgetsReducer(
                acc,
                toggleCollapse(w)
            ), state);
        } else if (expandedWidgets.length > 0) {
            return expandedWidgets.reduce((acc, w) => widgetsReducer(
                acc,
                toggleCollapse(w)
            ), state);
        }
        return state;
    }
    case TOGGLE_TRAY: {
        return set('tray', action.value, state);
    }
    case REPLACE_LAYOUT_VIEW: {
        return set(`containers[${action.target}].layouts`, action.layouts, state);
    }
    case SET_SELECTED_LAYOUT_VIEW_ID: {
        return set(`containers[${action.target}].selectedLayoutId`, action.viewId, state);
    }
    default:
        return state;
    }
}

export default widgetsReducer;
