/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import styleeditor from '../styleeditor';

import {
    initStyleService,
    setEditPermissionStyleEditor,
    updateTemporaryStyle,
    updateStatus,
    resetStyleEditor,
    addStyle,
    loadingStyle,
    loadedStyle,
    errorStyle,
    updateEditorMetadata
} from '../../actions/styleeditor';

describe('Test styleeditor reducer', () => {
    it('test initStyleService', () => {
        const service = {
            baseUrl: '/geoserver'
        };
        const config = {
            editingAllowedRoles: ['ADMIN'],
            editingAllowedGroups: ['test'],
            enableEditDefaultStyle: true
        };
        const state = styleeditor({}, initStyleService(service, config));
        expect(state).toEqual({
            service,
            ...config
        });
    });
    it('test setEditPermissionStyleEditor', () => {
        const canEdit = true;
        const state = styleeditor({}, setEditPermissionStyleEditor(canEdit));
        expect(state).toEqual({
            canEdit: true
        });
    });
    it('test updateTemporaryStyle', () => {
        const temporaryId = 'temporaryId';
        const templateId = 'templateId';
        const code = '* { stroke: #ff0000; }';
        const format = 'css';
        const init = true;
        const languageVersion = { version: '1.0.0' };
        const state = styleeditor({}, updateTemporaryStyle({ temporaryId, templateId, code, format, init, languageVersion }));
        expect(state).toEqual({
            temporaryId,
            templateId,
            code,
            format,
            error: null,
            initialCode: code,
            languageVersion
        });
    });
    it('test updateStatus', () => {
        let state = styleeditor({ }, updateStatus('edit'));
        expect(state).toEqual({
            status: 'edit'
        });

        state = styleeditor({}, updateStatus(''));
        expect(state).toEqual({
            status: '',
            code: '',
            templateId: '',
            initialCode: '',
            addStyle: false,
            error: {}
        });
    });
    it('test resetStyleEditor', () => {
        const state = styleeditor({
            canEdit: true,
            loading: true}, resetStyleEditor());
        expect(state).toEqual({
            service: {},
            canEdit: true,
            loading: true
        });
    });
    it('test addStyle', () => {
        const state = styleeditor({}, addStyle(true));
        expect(state).toEqual({
            addStyle: true
        });
    });
    it('test loadingStyle', () => {
        const state = styleeditor({}, loadingStyle(true));
        expect(state).toEqual({
            loading: true
        });
    });
    it('test loadedStyle', () => {
        const state = styleeditor({}, loadedStyle(true));
        expect(state).toEqual({
            loading: false,
            enabled: true
        });
    });

    it('test errorStyle', () => {
        const state = styleeditor({ }, errorStyle('edit', { status: 400, statusText: 'Error on line 10, column 2' }));
        expect(state).toEqual({
            loading: false,
            canEdit: true,
            error: {
                edit: {
                    status: 400,
                    message: 'Error on line 10, column 2',
                    line: 10,
                    column: 2
                }
            }
        });
    });
    it('test errorStyle unmarshalling parser error ', () => {
        const state = styleeditor({ }, errorStyle('parsingCapabilities', { message: "could not be unmarshalled" }));
        expect(state).toEqual({
            loading: false,
            canEdit: false,
            error: {
                parsingCapabilities: {
                    status: 400,
                    message: 'could not be unmarshalled'
                }
            }
        });
    });

    it('test errorStyle 401', () => {
        const state = styleeditor({ }, errorStyle('', { status: 401, statusText: 'Error no auth' }));
        expect(state).toEqual({
            loading: false,
            canEdit: false,
            error: {
                global: {
                    status: 401,
                    message: 'Error no auth'
                }
            }
        });
    });

    it('test errorStyle sld error', () => {
        const state = styleeditor({ }, errorStyle('edit', { status: 400, statusText: 'Error on lineNumber: 10; columnNumber: 2;' }));
        expect(state).toEqual({
            loading: false,
            canEdit: true,
            error: {
                edit: {
                    status: 400,
                    message: 'Error on lineNumber: 10; columnNumber: 2;',
                    line: 10,
                    column: 2
                }
            }
        });
    });
    it('test updateEditorMetadata action', () => {
        const updateMetadata = updateEditorMetadata({
            editorType: 'visual',
            styleJSON: '{}'
        });
        const state = styleeditor({ }, updateMetadata);
        expect(state).toEqual({
            metadata: {
                editorType: 'visual',
                styleJSON: '{}'
            }
        });
    });
});
