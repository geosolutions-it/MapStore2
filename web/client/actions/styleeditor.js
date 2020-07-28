/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const TOGGLE_STYLE_EDITOR = 'STYLEEDITOR:TOGGLE_STYLE_EDITOR';
const SELECT_STYLE_TEMPLATE = 'STYLEEDITOR:SELECT_STYLE_TEMPLATE';
const UPDATE_TEMPORARY_STYLE = 'STYLEEDITOR:UPDATE_TEMPORARY_STYLE';
const UPDATE_STATUS = 'STYLEEDITOR:UPDATE_STATUS';
const RESET_STYLE_EDITOR = 'STYLEEDITOR:RESET_STYLE_EDITOR';
const ADD_STYLE = 'STYLEEDITOR:ADD_STYLE';
const CREATE_STYLE = 'STYLEEDITOR:CREATE_STYLE';
const LOADING_STYLE = 'STYLEEDITOR:LOADING_STYLE';
const LOADED_STYLE = 'STYLEEDITOR:LOADED_STYLE';
const ERROR_STYLE = 'STYLEEDITOR:ERROR_STYLE';
const UPDATE_STYLE_CODE = 'STYLEEDITOR:UPDATE_STYLE_CODE';
const EDIT_STYLE_CODE = 'STYLEEDITOR:EDIT_STYLE_CODE';
const DELETE_STYLE = 'STYLEEDITOR:DELETE_STYLE';
const INIT_STYLE_SERVICE = 'STYLEEDITOR:INIT_STYLE_SERVICE';
const SET_EDIT_PERMISSION = 'STYLEEDITOR:SET_EDIT_PERMISSION';
const SET_DEFAULT_STYLE = 'STYLEEDITOR:SET_DEFAULT_STYLE';
const UPDATE_EDITOR_METADATA = 'STYLEEDITOR:UPDATE_EDITOR_METADATA';

/**
* Toggle style editor, it triggers an epic to initialize or stop the style editor
* @memberof actions.styleeditor
* @param {object} layer
* @param {bool} enabled
* @return {object} of type `TOGGLE_STYLE_EDITOR` with layer and enabled params
*/
function toggleStyleEditor(layer, enabled) {
    return {
        type: TOGGLE_STYLE_EDITOR,
        layer,
        enabled
    };
}
/**
* Update status of style editor
* @memberof actions.styleeditor
* @param {object} status
* @return {object} of type `UPDATE_STATUS` with status
*/
function updateStatus(status) {
    return {
        type: UPDATE_STATUS,
        status
    };
}
/**
* Update template style data sending a request to the service
* @memberof actions.styleeditor
* @param {object} styleProps { code, templateId, format, init } init set initialCode
* @return {object} of type `SELECT_STYLE_TEMPLATE` styleProps
*/
function selectStyleTemplate({ code, templateId, format, languageVersion, init } = {}) {
    return {
        type: SELECT_STYLE_TEMPLATE,
        code,
        templateId,
        format,
        init,
        languageVersion
    };
}
/**
* Store all temporary style information if request of create a temporary style has success
* @memberof actions.styleeditor
* @param {object} styleProps { temporaryId, templateId, code, format, init } init set initialCode
* @return {object} of type `UPDATE_TEMPORARY_STYLE` styleProps
*/
function updateTemporaryStyle({ temporaryId, templateId, code, format, languageVersion, init } = {}) {
    return {
        type: UPDATE_TEMPORARY_STYLE,
        temporaryId,
        templateId,
        code,
        format,
        init,
        languageVersion
    };
}
/**
* Start loading state of style editor
* @memberof actions.styleeditor
* @param {string|bool} status
* @return {object} of type `LOADING_STYLE` with status
*/
function loadingStyle(status) {
    return {
        type: LOADING_STYLE,
        status
    };
}
/**
* Stop loading state of style editor
* @memberof actions.styleeditor
* @return {object} of type `LOADED_STYLE`
*/
function loadedStyle() {
    return {
        type: LOADED_STYLE
    };
}
/**
* Send settings to epic to create a new style
* @memberof actions.styleeditor
* @param {object} settings { title: '', _abstract: '' }
* @return {object} of type `CREATE_STYLE`
*/
function createStyle(settings) {
    return {
        type: CREATE_STYLE,
        settings
    };
}
/**
* Reset style editor state
* @memberof actions.styleeditor
* @return {object} of type `RESET_STYLE_EDITOR`
*/
function resetStyleEditor() {
    return {
        type: RESET_STYLE_EDITOR
    };
}

function addStyle(add) {
    return {
        type: ADD_STYLE,
        add
    };
}
/**
* Set error of style editor
* @memberof actions.styleeditor
* @param {string} status { title: '', _abstract: '' }
* @param {object} error error object
* @return {object} of type `ERROR_STYLE`
*/
function errorStyle(status, error) {
    return {
        type: ERROR_STYLE,
        status,
        error
    };
}
/**
* Update and save original style in editing
* @memberof actions.styleeditor
* @return {object} of type `UPDATE_STYLE_CODE`
*/
function updateStyleCode() {
    return {
        type: UPDATE_STYLE_CODE
    };
}
/**
* Triggers an epic to update current code in editing (temporary style) by sending a request to the service
* @memberof actions.styleeditor
* @param {string} code edited code
* @return {object} of type `EDIT_STYLE_CODE`
*/
function editStyleCode(code) {
    return {
        type: EDIT_STYLE_CODE,
        code
    };
}
/**
* Delete a style
* @memberof actions.styleeditor
* @param {string} styleName name of style
* @return {object} of type `DELETE_STYLE`
*/
function deleteStyle(styleName) {
    return {
        type: DELETE_STYLE,
        styleName
    };
}
/**
* Setup the style editor service
* @memberof actions.styleeditor
* @param {object} service style editor service
* @param {bool} canEdit flag to enable/disable style editor in current session
* @return {object} of type `INIT_STYLE_SERVICE`
*/
function initStyleService(service, canEdit) {
    return {
        type: INIT_STYLE_SERVICE,
        service,
        canEdit
    };
}
/**
* Enable/disable style editor in current session, after resetStyleEditor canEdit is true
* @memberof actions.styleeditor
* @param {bool} canEdit flag to enable/disable style editor in current session
* @return {object} of type `SET_EDIT_PERMISSION`
*/
function setEditPermissionStyleEditor(canEdit) {
    return {
        type: SET_EDIT_PERMISSION,
        canEdit
    };
}
/**
* Set default style of the current selected layer
* @memberof actions.styleeditor
* @return {object} of type `SET_DEFAULT_STYLE`
*/
function setDefaultStyle() {
    return {
        type: SET_DEFAULT_STYLE
    };
}


function updateEditorMetadata(metadata) {
    return {
        type: UPDATE_EDITOR_METADATA,
        metadata
    };
}

/**
* Actions for styleeditor
* @name actions.styleeditor
*/
module.exports = {
    UPDATE_TEMPORARY_STYLE,
    UPDATE_STATUS,
    TOGGLE_STYLE_EDITOR,
    RESET_STYLE_EDITOR,
    SELECT_STYLE_TEMPLATE,
    CREATE_STYLE,
    LOADING_STYLE,
    LOADED_STYLE,
    ADD_STYLE,
    ERROR_STYLE,
    UPDATE_STYLE_CODE,
    EDIT_STYLE_CODE,
    DELETE_STYLE,
    INIT_STYLE_SERVICE,
    SET_EDIT_PERMISSION,
    SET_DEFAULT_STYLE,
    UPDATE_EDITOR_METADATA,
    updateTemporaryStyle,
    updateStatus,
    toggleStyleEditor,
    resetStyleEditor,
    selectStyleTemplate,
    createStyle,
    loadingStyle,
    loadedStyle,
    addStyle,
    errorStyle,
    updateStyleCode,
    editStyleCode,
    deleteStyle,
    initStyleService,
    setEditPermissionStyleEditor,
    setDefaultStyle,
    updateEditorMetadata
};
