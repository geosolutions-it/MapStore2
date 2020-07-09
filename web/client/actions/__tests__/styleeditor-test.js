/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {
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
} = require('../styleeditor');

describe('Test the styleeditor actions', () => {

    it('updateTemporaryStyle', () => {
        const temporaryId = '3214';
        const templateId = '4567';
        const code = '* { stroke: #333333; }';
        const format = 'css';
        const init = true;
        const languageVersion = { version: '1.0.0' };
        const retval = updateTemporaryStyle({
            temporaryId,
            templateId,
            code,
            format,
            init,
            languageVersion
        });
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_TEMPORARY_STYLE);
        expect(retval.temporaryId).toBe(temporaryId);
        expect(retval.templateId).toBe(templateId);
        expect(retval.code).toBe(code);
        expect(retval.format).toBe(format);
        expect(retval.init).toBe(init);
        expect(retval.languageVersion).toEqual(languageVersion);
    });
    it('updateStatus', () => {
        const status = 'edit';
        const retval = updateStatus(status);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_STATUS);
        expect(retval.status).toBe(status);
    });
    it('toggleStyleEditor', () => {
        const layer = {id: 'layerId', name: 'layerName'};
        const enabled = true;
        const retval = toggleStyleEditor(layer, enabled);
        expect(retval).toExist();
        expect(retval.type).toBe(TOGGLE_STYLE_EDITOR);
        expect(retval.layer).toBe(layer);
        expect(retval.enabled).toBe(enabled);
    });
    it('resetStyleEditor', () => {
        const retval = resetStyleEditor();
        expect(retval).toExist();
        expect(retval.type).toBe(RESET_STYLE_EDITOR);
    });
    it('selectStyleTemplate', () => {
        const templateId = '4567';
        const code = '* { stroke: #333333; }';
        const format = 'css';
        const init = true;
        const languageVersion = { version: '1.0.0' };
        const retval = selectStyleTemplate({ code, templateId, format, init, languageVersion });
        expect(retval).toExist();
        expect(retval.type).toBe(SELECT_STYLE_TEMPLATE);
        expect(retval.templateId).toBe(templateId);
        expect(retval.code).toBe(code);
        expect(retval.format).toBe(format);
        expect(retval.init).toBe(init);
        expect(retval.languageVersion).toEqual(languageVersion);
    });
    it('createStyle', () => {
        const settings = { title: 'Title', _abstract: ''};
        const retval = createStyle(settings);
        expect(retval).toExist();
        expect(retval.type).toBe(CREATE_STYLE);
        expect(retval.settings).toBe(settings);
    });
    it('loadingStyle', () => {
        const status = 'edit';
        const retval = loadingStyle(status);
        expect(retval).toExist();
        expect(retval.type).toBe(LOADING_STYLE);
        expect(retval.status).toBe(status);
    });
    it('loadedStyle', () => {
        const retval = loadedStyle();
        expect(retval).toExist();
        expect(retval.type).toBe(LOADED_STYLE);
    });
    it('addStyle', () => {
        const add = true;
        const retval = addStyle(add);
        expect(retval).toExist();
        expect(retval.type).toBe(ADD_STYLE);
        expect(retval.add).toBe(add);
    });
    it('errorStyle', () => {
        const status = 'edit';
        const error = { statusText: 'Not found', status: 404 };
        const retval = errorStyle(status, error);
        expect(retval).toExist();
        expect(retval.type).toBe(ERROR_STYLE);
        expect(retval.status).toBe(status);
        expect(retval.error).toBe(error);
    });
    it('updateStyleCode', () => {
        const retval = updateStyleCode();
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_STYLE_CODE);
    });
    it('editStyleCode', () => {
        const code = '* { stroke: #ff0000; }';
        const retval = editStyleCode(code);
        expect(retval).toExist();
        expect(retval.type).toBe(EDIT_STYLE_CODE);
        expect(retval.code).toBe(code);
    });
    it('deleteStyle', () => {
        const styleName = 'name';
        const retval = deleteStyle(styleName);
        expect(retval).toExist();
        expect(retval.type).toBe(DELETE_STYLE);
        expect(retval.styleName).toBe(styleName);
    });
    it('initStyleService', () => {
        const service = { baseUrl: '/geoserver/' };
        const canEdit = true;
        const retval = initStyleService(service, canEdit);
        expect(retval).toExist();
        expect(retval.type).toBe(INIT_STYLE_SERVICE);
        expect(retval.service).toBe(service);
        expect(retval.canEdit).toBe(canEdit);
    });
    it('setEditPermissionStyleEditor', () => {
        const canEdit = true;
        const retval = setEditPermissionStyleEditor(canEdit);
        expect(retval).toExist();
        expect(retval.type).toBe(SET_EDIT_PERMISSION);
        expect(retval.canEdit).toBe(canEdit);
    });
    it('setDefaultStyle', () => {
        const retval = setDefaultStyle();
        expect(retval).toExist();
        expect(retval.type).toBe(SET_DEFAULT_STYLE);
    });
    it('updateEditorMetadata', () => {
        const metadata = {
            styleJSON: '{}',
            editorType: 'visual' // textarea
        };
        const retval = updateEditorMetadata(metadata);
        expect(retval).toExist();
        expect(retval.type).toBe(UPDATE_EDITOR_METADATA);
        expect(retval.metadata).toBe(metadata);
    });
});
