/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { EDIT_NEW, INSERT, EDIT, UPDATE_PROPERTY, UPDATE_LAYER, DELETE, EDITOR_CHANGE, EDITOR_SETTING_CHANGE, CHANGE_LAYOUT, CLEAR_WIDGETS, DEFAULT_TARGET,
    ADD_DEPENDENCY, REMOVE_DEPENDENCY, LOAD_DEPENDENCIES, RESET_DEPENDENCIES, TOGGLE_COLLAPSE, TOGGLE_COLLAPSE_ALL, TOGGLE_TRAY, toggleCollapse} = require('../actions/widgets');
const {
    MAP_CONFIG_LOADED
} = require('../actions/config');
const {
    DASHBOARD_LOADED,
    DASHBOARD_RESET
} = require('../actions/dashboard');

const assign = require('object-assign');
const set = require('lodash/fp/set');
const { get, find, omit, mapValues, castArray} = require('lodash');
const {arrayUpsert, compose, arrayDelete} = require('../utils/ImmutableUtils');

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
        }, set("builder.settings.step",
            (action.widget && action.widget.widgetType || 'chart') === 'chart'
                ? 1
                : 0
            , state));
    }
    case EDITOR_CHANGE: {
        return set(`builder.editor.${action.key}`, action.value, state);
    }
    case INSERT:
        let tempState = arrayUpsert(`containers[${action.target}].widgets`, {
            id: action.id,
            ...action.widget,
            dataGrid: action.id && {y: 0, x: 0, w: 1, h: 1}
        }, {
            id: action.widget.id || action.id
        }, state);

        return tempState;
    case UPDATE_PROPERTY:
        // if "merge" update map by merging a partial map object coming from
        // onMapViewChanges handler for MapWidget
        // if "replace" update the widget setting the value to the existing object
        const oldWidget = find(get(state, `containers[${action.target}].widgets`), {
            id: action.id
        });
        return arrayUpsert(`containers[${action.target}].widgets`,
            set(
                action.key,
                action.mode === "merge" ? assign({}, oldWidget[action.key], action.value) : action.value,
                oldWidget,
            ), {
                id: action.id
            }, state);
    case UPDATE_LAYER: {
        if (action.layer) {
            const widgets = get(state, `containers[${DEFAULT_TARGET}].widgets`);
            if (widgets) {
                return set(`containers[${DEFAULT_TARGET}].widgets`,
                    widgets.map(w => get(w, "layer.id") === action.layer.id ? set("layer", action.layer, w) : w), state);
            }
        }
        return state;
    }
    case DELETE:
        return arrayDelete(`containers[${action.target}].widgets`, {
            id: action.widget.id
        }, state);
    case DASHBOARD_LOADED:
        const { data } = action;
        return set(`containers[${DEFAULT_TARGET}]`, {
            ...data
        }, state);
    case MAP_CONFIG_LOADED:
        const { widgetsConfig } = (action.config || {});
        return set(`containers[${DEFAULT_TARGET}]`, {
            ...widgetsConfig
        }, state);
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
    case TOGGLE_COLLAPSE:
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
    case TOGGLE_COLLAPSE_ALL: {
        // get widgets excluding static widgets
        const widgets = get(state, `containers[${action.target}].widgets`, [])
            .filter( w => !w.dataGrid || !w.dataGrid.static );
        const collapsedWidgets = widgets.filter(w => get(state, `containers[${action.target}].collapsed[${w.id}]`));
        const expandedWidgets = widgets.filter(w => !get(state, `containers[${action.target}].collapsed[${w.id}]`));
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
    default:
        return state;
    }
}

module.exports = widgetsReducer;
