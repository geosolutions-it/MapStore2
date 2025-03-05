/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const TOGGLE_STYLE_EDITOR = 'STYLEEDITOR:TOGGLE_STYLE_EDITOR';
export const SELECT_STYLE_TEMPLATE = 'STYLEEDITOR:SELECT_STYLE_TEMPLATE';
export const UPDATE_TEMPORARY_STYLE = 'STYLEEDITOR:UPDATE_TEMPORARY_STYLE';
export const UPDATE_STATUS = 'STYLEEDITOR:UPDATE_STATUS';
export const RESET_STYLE_EDITOR = 'STYLEEDITOR:RESET_STYLE_EDITOR';
export const ADD_STYLE = 'STYLEEDITOR:ADD_STYLE';
export const CREATE_STYLE = 'STYLEEDITOR:CREATE_STYLE';
export const LOADING_STYLE = 'STYLEEDITOR:LOADING_STYLE';
export const LOADED_STYLE = 'STYLEEDITOR:LOADED_STYLE';
export const ERROR_STYLE = 'STYLEEDITOR:ERROR_STYLE';
export const UPDATE_STYLE_CODE = 'STYLEEDITOR:UPDATE_STYLE_CODE';
export const EDIT_STYLE_CODE = 'STYLEEDITOR:EDIT_STYLE_CODE';
export const DELETE_STYLE = 'STYLEEDITOR:DELETE_STYLE';
export const INIT_STYLE_SERVICE = 'STYLEEDITOR:INIT_STYLE_SERVICE';
export const SET_EDIT_PERMISSION = 'STYLEEDITOR:SET_EDIT_PERMISSION';
export const SET_DEFAULT_STYLE = 'STYLEEDITOR:SET_DEFAULT_STYLE';
export const UPDATE_EDITOR_METADATA = 'STYLEEDITOR:UPDATE_EDITOR_METADATA';

/**
* Toggle style editor, it triggers an epic to initialize or stop the style editor
* @memberof actions.styleeditor
* @param {object} layer
* @param {bool} enabled
* @return {object} of type `TOGGLE_STYLE_EDITOR` with layer and enabled params
*/
export function toggleStyleEditor(layer, enabled) {
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
export function updateStatus(status) {
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
export function selectStyleTemplate({ code, templateId, format, languageVersion, init } = {}) {
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
export function updateTemporaryStyle({ temporaryId, templateId, code, format, languageVersion, init } = {}) {
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
export function loadingStyle(status) {
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
export function loadedStyle() {
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
export function createStyle(settings) {
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
export function resetStyleEditor() {
    return {
        type: RESET_STYLE_EDITOR
    };
}

export function addStyle(add) {
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
export function errorStyle(status, error) {
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
export function updateStyleCode() {
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
export function editStyleCode(code) {
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
export function deleteStyle(styleName) {
    return {
        type: DELETE_STYLE,
        styleName
    };
}
/**
* Setup the style editor service
* @memberof actions.styleeditor
* @param {object} service style editor service
* @param {object} config configurations to be initialized for the style editor
* @return {object} of type `INIT_STYLE_SERVICE`
*/
export function initStyleService(service, config) {
    return {
        type: INIT_STYLE_SERVICE,
        service,
        config
    };
}
/**
* Enable/disable style editor in current session, after resetStyleEditor canEdit is true
* @memberof actions.styleeditor
* @param {bool} canEdit flag to enable/disable style editor in current session
* @return {object} of type `SET_EDIT_PERMISSION`
*/
export function setEditPermissionStyleEditor(canEdit) {
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
export function setDefaultStyle() {
    return {
        type: SET_DEFAULT_STYLE
    };
}


export function updateEditorMetadata(metadata) {
    return {
        type: UPDATE_EDITOR_METADATA,
        metadata
    };
}

/**
* Actions for styleeditor
* @name actions.styleeditor
*/
