/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const uuid = require('uuid/v1');
const INSERT = "WIDGETS:INSERT";
const NEW = "WIGETS:NEW";
const EDIT = "WIDGETS:EDIT";
const EDIT_NEW = "WIDGETS:EDIT_NEW";
const EDITOR_CHANGE = "WIDGETS:EDITOR_CHANGE";
const EDITOR_SETTING_CHANGE = "WIGETS:EDITOR_SETTING_CHANGE";
const UPDATE = "WIDGETS:UPDATE";
const CHANGE_LAYOUT = "WIDGETS:CHANGE_LAYOUT";
const DELETE = "WIDGETS:DELETE";
const CLEAR_WIDGETS = "WIDGETS:CLEAR_WIDGETS";
const OPEN_FILTER_EDITOR = "WIDGETS:OPEN_FILTER_EDITOR";
const EXPORT_CSV = "WIDGETS:EXPORT_CSV";
const EXPORT_IMAGE = "WIDGETS:EXPORT_IMAGE";
const DEFAULT_TARGET = "floating";


/**
 * Intent to create a new Widgets
 * @param  {object} widget The widget template to start with
 * @return {object}        action with type `WIDGETS:NEW`and the widget
 */
const createWidget = (widget) => ({
    type: NEW,
    widget
});

/**
 * Add a new widget to the target
 * @param  {object} widget The widget template to start with
 * @param {string} [target=floating] the target container of the widget
 * @return {object}        action with type `WIDGETS:INSERT`, the widget and the target
 */
const insertWidget = (widget, target = DEFAULT_TARGET) => ({
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
const updateWidget = (widget, target = DEFAULT_TARGET) => ({
    type: UPDATE,
    target,
    widget
});
/**
 * Deletes a widget from the passed target
 * @param  {object} widget The widget template to start with
 * @param {string} [target=floating] the container of the widget
 * @return {object} action with type `WIDGETS:DELETE`, the widget and the target
 */
const deleteWidget = (widget, target = DEFAULT_TARGET) => ({
    type: DELETE,
    target,
    widget
});

/**
 * Removes all the widget from the containers
 * @return {object}   action of type CLEAR_WIDGETS
 */
const clearWidgets = () => ({
    type: CLEAR_WIDGETS
});

/**
 * Change the layout of the widgets view
 * @param  {object} layout layout object
 * @param  {object} cols   the columns of the layout
 * @param  {string} target layout target
 * @return {object}        action of type `CHANGE_LAYOUT`
 */
const changeLayout = (layout, allLayouts, target = DEFAULT_TARGET) => ({ type: CHANGE_LAYOUT, allLayouts, layout, target});


/**
 * Edit an existing widget
 * @param  {object} widget The widget
 * @return {object}        the action of type `WIDGETS:EDIT` and the widget
 */
const editWidget = (widget) => ({
    type: EDIT,
    widget
});

/**
 * Edit new widget. Initializes the widget builder properly
 * @param  {object} widget The widget template
 * @param  {object} settings The settings for the template
 * @return {object}        the action of type `WIGETS:EDIT_NEW`
 */
const editNewWidget = (widget, settings) => ({
    type: EDIT_NEW,
    widget,
    settings
});

/**
 * Changes an entry in the widget editor
 * @param  {string} key   the key of the value to set. even a path is allowed
 * @param  {any} value the new value
 * @return {object}       The action of type `WIGETS:EDITOR_CHANGE` with key and value
 */
const onEditorChange = (key, value) => ({
    type: EDITOR_CHANGE,
    key,
    value
});

/**
 * Changes a setting of the editor (e.g. the page)
 * @param  {string} key   the key of the value to set. even a path is allowed
 * @param  {any} value the new value
 * @return {object}       The action of type `WIGETS:EDITOR_SETTING_CHANGE` with key and value
 */
const changeEditorSetting = (key, value) => ({
    type: EDITOR_SETTING_CHANGE,
    key,
    value
});
/**
 * Change the page setting of the editor
 * @param  {number} step the page number
 * @return {object}      action of type `WIGETS:EDITOR_SETTING_CHANGE` with the step
 */
const setPage = (step) => changeEditorSetting("step", step);

/**
 * ex
 * @return {[type]} [description]
 */
const exportCSV = ({data= [], title = "export"}) => ({
    type: EXPORT_CSV,
    data,
    title
});

const exportImage = ({widgetDivId}) => ({
    type: EXPORT_IMAGE,
    widgetDivId
});
const openFilterEditor = () => ({type: OPEN_FILTER_EDITOR});
module.exports = {
    NEW,
    INSERT,
    UPDATE,
    DELETE,
    CLEAR_WIDGETS,
    CHANGE_LAYOUT,
    EDIT,
    EDIT_NEW,
    EDITOR_CHANGE,
    EDITOR_SETTING_CHANGE,
    DEFAULT_TARGET,
    OPEN_FILTER_EDITOR,
    EXPORT_CSV,
    EXPORT_IMAGE,
    exportCSV,
    exportImage,
    openFilterEditor,
    createWidget,
    insertWidget,
    updateWidget,
    deleteWidget,
    clearWidgets,
    changeLayout,
    editWidget,
    editNewWidget,
    onEditorChange,
    changeEditorSetting,
    setPage
};
