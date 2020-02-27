/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

const {
    setCreationStep, SET_CREATION_STEP,
    clearContextCreator, CLEAR_CONTEXT_CREATOR,
    changeAttribute, CHANGE_ATTRIBUTE,
    contextSaved, CONTEXT_SAVED,
    saveNewContext, SAVE_CONTEXT,
    enableUploadPlugin, ENABLE_UPLOAD_PLUGIN,
    uploadPlugin, UPLOAD_PLUGIN,
    uploadPluginError, UPLOAD_PLUGIN_ERROR,
    pluginUploaded, PLUGIN_UPLOADED,
    pluginUploading, UPLOADING_PLUGIN,
    showBackToPageConfirmation, BACK_TO_PAGE_SHOW_CONFIRMATION
} = require('../contextcreator');

describe('contextcreator actions', () => {
    it('setCreationStep', () => {
        const retval = setCreationStep('test');
        expect(retval).toExist();
        expect(retval.stepId).toBe('test');
        expect(retval.type).toBe(SET_CREATION_STEP);
    });
    it('clearContextCreator', () => {
        const retval = clearContextCreator();
        expect(retval).toExist();
        expect(retval.type).toBe(CLEAR_CONTEXT_CREATOR);
    });
    it('changeAttribute', () => {
        const retval = changeAttribute('key', 0);
        expect(retval).toExist();
        expect(retval.key).toBe('key');
        expect(retval.value).toBe(0);
        expect(retval.type).toBe(CHANGE_ATTRIBUTE);
    });
    it('contextSaved', () => {
        const retval = contextSaved();
        expect(retval).toExist();
        expect(retval.type).toBe(CONTEXT_SAVED);
    });
    it('saveNewContext', () => {
        const retval = saveNewContext();
        expect(retval).toExist();
        expect(retval.type).toBe(SAVE_CONTEXT);
    });
    it('enableUploadPlugin', () => {
        const retval = enableUploadPlugin(true);
        expect(retval).toExist();
        expect(retval.type).toBe(ENABLE_UPLOAD_PLUGIN);
        expect(retval.enable).toBe(true);
    });
    it('uploadPlugin', () => {
        const retval = uploadPlugin([{}]);
        expect(retval).toExist();
        expect(retval.type).toBe(UPLOAD_PLUGIN);
        expect(retval.files.length).toBe(1);
    });
    it('uploadPluginError', () => {
        const retval = uploadPluginError([{}]);
        expect(retval).toExist();
        expect(retval.type).toBe(UPLOAD_PLUGIN_ERROR);
        expect(retval.files.length).toBe(1);
    });
    it('pluginUploading', () => {
        const retval = pluginUploading(true, [{}]);
        expect(retval).toExist();
        expect(retval.type).toBe(UPLOADING_PLUGIN);
        expect(retval.status).toBe(true);
        expect(retval.plugins.length).toBe(1);
    });
    it('pluginUploaded', () => {
        const retval = pluginUploaded([{}]);
        expect(retval).toExist();
        expect(retval.type).toBe(PLUGIN_UPLOADED);
        expect(retval.plugins.length).toBe(1);
    });
    it('showBackToPageConfirmation', () => {
        const retval = showBackToPageConfirmation(true);
        expect(retval).toExist();
        expect(retval.show).toBe(true);
        expect(retval.type).toBe(BACK_TO_PAGE_SHOW_CONFIRMATION);
    });
});
