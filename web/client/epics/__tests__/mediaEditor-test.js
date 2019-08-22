/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {testEpic} from './epicTestUtils';

import {
    loadMediaEditorDataEpic,
    editorSaveNewMediaEpic
} from '../mediaEditor';

import {
    loadMedia,
    saveMedia,
    show,
    ADDING_MEDIA,
    LOAD_MEDIA,
    LOAD_MEDIA_SUCCESS,
    SAVE_MEDIA_SUCCESS
} from '../../actions/mediaEditor';

describe('MediaEditor Epics', () => {

    it('loadMediaEditorDataEpic with loadMedia ', (done) => {
        const NUM_ACTIONS = 1;
        const params = {mediaType: "image"};
        const mediaType = "image";
        const resultData = {
            resources: [],
            totalCount: 0
        };
        const sourceId = "geostory";
        testEpic(loadMediaEditorDataEpic, NUM_ACTIONS, loadMedia(params, mediaType, sourceId), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                    case LOAD_MEDIA_SUCCESS:
                        expect(a.params).toEqual(params);
                        expect(a.mediaType).toEqual(mediaType);
                        expect(a.sourceId).toEqual(sourceId);
                        expect(a.resultData).toEqual(resultData);
                        break;
                    default: expect(true).toEqual(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {},
            mediaEditor: {}
        });
    });
    it('loadMediaEditorDataEpic with show ', (done) => {
        const NUM_ACTIONS = 1;
        const params = {mediaType: "image"};
        const mediaType = "image";
        const resultData = {
            resources: [],
            totalCount: 0
        };
        const sourceId = "geostory";
        testEpic(loadMediaEditorDataEpic, NUM_ACTIONS, show("geostory"), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                    case LOAD_MEDIA_SUCCESS:
                        expect(a.params).toEqual(params);
                        expect(a.mediaType).toEqual(mediaType);
                        expect(a.sourceId).toEqual(sourceId);
                        expect(a.resultData).toEqual(resultData);
                        break;
                    default: expect(true).toEqual(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {},
            mediaEditor: {}
        });
    });
    it('editorSaveNewMediaEpic ', (done) => {
        const NUM_ACTIONS = 3;
        const source = "geostory";
        const type = "image";
        const data = {};
        testEpic(editorSaveNewMediaEpic, NUM_ACTIONS, saveMedia({type, source, data}), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                    case SAVE_MEDIA_SUCCESS:
                        expect(a.id.length).toEqual(36);
                        expect(a.mediaType).toEqual(type);
                        expect(a.source).toEqual(source);
                        expect(a.data).toEqual(data);
                        break;
                    case ADDING_MEDIA:
                        expect(a.adding).toEqual(false);
                        break;
                    case LOAD_MEDIA:
                        expect(a.mediaType).toEqual(type);
                        expect(a.sourceId).toEqual(source);
                        break;
                    default: expect(true).toEqual(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {},
            mediaEditor: {}
        });
    });
});
