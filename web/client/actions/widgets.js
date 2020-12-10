/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import uuid from 'uuid/v1';

export const INSERT = "WIDGETS:INSERT";
export const NEW = "WIDGETS:NEW";
export const EDIT = "WIDGETS:EDIT";
export const EDIT_NEW = "WIDGETS:EDIT_NEW";
export const EDITOR_CHANGE = "WIDGETS:EDITOR_CHANGE";
export const EDITOR_SETTING_CHANGE = "WIDGETS:EDITOR_SETTING_CHANGE";
export const UPDATE = "WIDGETS:UPDATE";
export const UPDATE_PROPERTY = "WIDGETS:UPDATE_PROPERTY";
export const UPDATE_LAYER = "WIDGETS:UPDATE_LAYER";
export const CHANGE_LAYOUT = "WIDGETS:CHANGE_LAYOUT";
export const DELETE = "WIDGETS:DELETE";
export const CLEAR_WIDGETS = "WIDGETS:CLEAR_WIDGETS";
export const ADD_DEPENDENCY = "WIDGETS:ADD_DEPENDENCY";
export const REMOVE_DEPENDENCY = "WIDGETS:REMOVE_DEPENDENCY";
export const LOAD_DEPENDENCIES = "WIDGETS:LOAD_DEPENDENCIES";
export const RESET_DEPENDENCIES = "WIDGETS:RESET_DEPENDENCIES";
export const TOGGLE_CONNECTION = "WIDGETS:TOGGLE_CONNECTION";

export const OPEN_FILTER_EDITOR = "WIDGETS:OPEN_FILTER_EDITOR";
export const EXPORT_CSV = "WIDGETS:EXPORT_CSV";
export const EXPORT_IMAGE = "WIDGETS:EXPORT_IMAGE";
export const WIDGET_SELECTED = "WIDGETS:WIDGET_SELECTED";
export const NEW_CHART = "WIDGETS:NEW_CHART";
export const DEFAULT_TARGET = "floating";
export const DEPENDENCY_SELECTOR_KEY = "dependencySelector";
export const WIDGETS_REGEX = /^widgets\["?([^"\]]*)"?\]\.?(.*)$/;

export const TOGGLE_COLLAPSE = "WIDGET:TOGGLE_COLLAPSE";
export const TOGGLE_COLLAPSE_ALL = "WIDGET:TOGGLE_COLLAPSE_ALL";
export const TOGGLE_MAXIMIZE = "WIDGET:TOGGLE_MAXIMIZE";
export const TOGGLE_TRAY = "WIDGET:TOGGLE_TRAY";

/**
 * Intent to create a new Widgets
 * @param  {object} widget The widget template to start with
 * @return {object}        action with type `WIDGETS:NEW`and the widget
 */
export const createWidget = (widget) => ({
    type: NEW,
    widget
});

/**
 * Intent to create a new chart Widget
 * @return {object}        action with type `WIDGETS:NEW_CHART`
 */
export const createChart = () => ({
    type: NEW_CHART
});

/**
 * Add a new widget to the target
 * @param  {object} widget The widget template to start with
 * @param {string} [target=floating] the target container of the widget
 * @return {object}        action with type `WIDGETS:INSERT`, the widget and the target
 */
export const insertWidget = (widget, target = DEFAULT_TARGET) => ({
    type: INSERT,
    target,
    id: uuid(),
    widget
});

/**
 * Update a widget in the provided target
 * @param  {object} widget The widget template to start with
 * @param {string} [target=floating] the target container of the widget
 * @return {object}        action with type `WIDGETS:UPDATE`, the widget and the target
 */
export const updateWidget = (widget, target = DEFAULT_TARGET) => ({
    type: UPDATE,
    target,
    widget
});
/**
 * Update a widget property in the provided target
 * @param  {string} id The widget id to update
 * @param  {string} key The widget property name or path to update
 * @param {any} value the widget value to update
 * @param {string} [mode="replace"] replace or merge, replace is default and it replace the value for the key,
 * merge only merges new props coming from the value
 * @return {object}  action with type `WIDGETS:UPDATE_PROPERTY`, the widget and the target
 */
export const updateWidgetProperty = (id, key, value, mode = "replace", target = DEFAULT_TARGET) => ({
    type: UPDATE_PROPERTY,
    id,
    target,
    key,
    value,
    mode
});
/**
 * Update a layer property of all widgets with that layer
 * @param {object} layer New layer object
 * @return {object} action with type `WIDGETS:UPDATE_LAYER`
 */
export const updateWidgetLayer = (layer) => ({
    type: UPDATE_LAYER,
    layer
});
/**
 * Deletes a widget from the passed target
 * @param  {object} widget The widget template to start with
 * @param {string} [target=floating] the container of the widget
 * @return {object} action with type `WIDGETS:DELETE`, the widget and the target
 */
export const deleteWidget = (widget, target = DEFAULT_TARGET) => ({
    type: DELETE,
    target,
    widget
});

/**
 * Removes all the widget from the containers
 * @return {object}   action of type CLEAR_WIDGETS
 */
export const clearWidgets = () => ({
    type: CLEAR_WIDGETS
});

/**
 * Change the layout of the widgets view
 * @param  {object} layout layout object
 * @param  {object} cols   the columns of the layout
 * @param  {string} target layout target
 * @return {object}        action of type `CHANGE_LAYOUT`
 */
export const changeLayout = (layout, allLayouts, target = DEFAULT_TARGET) => ({ type: CHANGE_LAYOUT, allLayouts, layout, target});


/**
 * Edit an existing widget
 * @param  {object} widget The widget
 * @return {object}        the action of type `WIDGETS:EDIT` and the widget
 */
export const editWidget = (widget) => ({
    type: EDIT,
    widget
});

/**
 * Edit new widget. Initializes the widget builder properly
 * @param  {object} widget The widget template
 * @param  {object} settings The settings for the template
 * @return {object} the action of type `WIDGETS:EDIT_NEW`
 */
export const editNewWidget = (widget, settings) => ({
    type: EDIT_NEW,
    widget,
    settings
});

/**
 * Changes an entry in the widget editor
 * @param  {string} key   the key of the value to set. even a path is allowed
 * @param  {any} value the new value
 * @return {object}       The action of type `WIDGETS:EDITOR_CHANGE` with key and value
 */
export const onEditorChange = (key, value) => ({
    type: EDITOR_CHANGE,
    key,
    value
});

/**
 * Changes a setting of the editor (e.g. the page)
 * @param  {string} key   the key of the value to set. even a path is allowed
 * @param  {any} value the new value
 * @return {object}       The action of type `WIDGETS:EDITOR_SETTING_CHANGE` with key and value
 */
export const changeEditorSetting = (key, value) => ({
    type: EDITOR_SETTING_CHANGE,
    key,
    value
});

export const addDependency = (key, value) => ({
    type: ADD_DEPENDENCY,
    key,
    value
});

export const removeDependency = (key) => ({
    type: REMOVE_DEPENDENCY,
    key
});

export const resetDependencies = () => ({
    type: RESET_DEPENDENCIES
});
export const loadDependencies = (dependencies) => ({
    type: LOAD_DEPENDENCIES,
    dependencies
});

/**
 * Action triggered to start the connection flow. Typically starts the connection flow
 * @param {array} availableDependencies Array of available dependency keys
 * @param {object} the map of available dependencies where to choose.
 * @param {object} options a map of connections to apply when the dependencies has been resolved. E.g. mappings for dependenciesMap
 * @param {string} target target of the connection. If not present we assume is the current editing widget (not yet supported)
 */
export const toggleConnection = (active, availableDependencies, options, target) => ({
    type: TOGGLE_CONNECTION,
    active,
    availableDependencies,
    options,
    target
});
/**
 * Change the page setting of the editor
 * @param  {number} step the page number
 * @return {object}      action of type `WIDGETS:EDITOR_SETTING_CHANGE` with the step
 */
export const setPage = (step) => changeEditorSetting("step", step);

/**
 * ex
 * @return {[type]} [description]
 */
export const exportCSV = ({data = [], title = "export"}) => ({
    type: EXPORT_CSV,
    data,
    title
});

export const selectWidget = (widget, opts) => ({
    type: WIDGET_SELECTED,
    widget,
    opts
});
export const exportImage = ({widgetDivId}) => ({
    type: EXPORT_IMAGE,
    widgetDivId
});
/**
 * Triggers the filter editor opening
 */
export const openFilterEditor = () => ({type: OPEN_FILTER_EDITOR});
/**
 * Changes the setup of the dependency selector, that allow to select a dependent widget
 * @param {object} setup the initial setup of the dependency selector
 */
export const setupDependencySelector = (setup) => changeEditorSetting(`${DEPENDENCY_SELECTOR_KEY}`, setup);
/**
 * Sets a value in the configuration of the dependency selector
 * @param {string} key the configuration of the dependency selector to change
 * @param {any} value the value to assign to the key
 */
export const changeDependencySelector = (key, value) => changeEditorSetting(`${DEPENDENCY_SELECTOR_KEY}[${key}]`, value);
/**
 * Activate/deactivate the dependency selector with an initial setup
 * @param {boolean} active active flag of the dependency selector
 * @param {object} settings initial setup
 */
export const toggleDependencySelector = (active, settings) => setupDependencySelector({
    active,
    ...settings
});
/**
 * Collapse/Expand the widget
 * @param {object} widget the widget to collapse
 */
export const toggleCollapse = (widget, target = DEFAULT_TARGET) => ({
    type: TOGGLE_COLLAPSE,
    widget,
    target
});

/**
 * Collapse/Expand all the widgets
 */
export const toggleCollapseAll = (target = DEFAULT_TARGET) => ({
    type: TOGGLE_COLLAPSE_ALL,
    target
});

/**
 * Toggles a widget to fill the whole available grid, or reverts to previous state
 * @param {object} widget widget to maximize
 */
export const toggleMaximize = (widget, target = DEFAULT_TARGET) => ({
    type: TOGGLE_MAXIMIZE,
    widget,
    target
});

/**
 * Toggles the presence of the widgets tray.
 * @param {boolean} value true the tray is present, false if it is not present
 */
export const toggleTray = value => ({ type: TOGGLE_TRAY, value});
