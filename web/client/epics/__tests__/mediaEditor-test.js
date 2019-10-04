/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {testEpic, addTimeoutEpic, TEST_TIMEOUT} from './epicTestUtils';

import {
    loadMediaEditorDataEpic,
    editorSaveUpdateMediaEpic
} from '../mediaEditor';

import {
    loadMedia,
    saveMedia,
    show,
    ADDING_MEDIA,
    EDITING_MEDIA,
    LOAD_MEDIA,
    LOAD_MEDIA_SUCCESS,
    SAVE_MEDIA_SUCCESS,
    SELECT_ITEM
} from '../../actions/mediaEditor';

describe('MediaEditor Epics', () => {

    it('loadMediaEditorDataEpic with loadMedia ', (done) => {
        const NUM_ACTIONS = 1;
        const params = {mediaType: "image"};
        const mediaType = "image";
        const resultData = {
            resources: [{id: "resId", type: "image"}],
            totalCount: 1
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
            geostory: {
                currentStory: {
                    resources: [{
                        id: "resId",
                        type: "image"
                    }]}
            },
            mediaEditor: {
                settings: {
                    sourceId
                }
            }
        });
    });
    it('loadMediaEditorDataEpic with show and 0 resources', (done) => {
        const NUM_ACTIONS = 1;
        const sourceId = "geostory";
        testEpic(addTimeoutEpic(loadMediaEditorDataEpic, 10), NUM_ACTIONS, show("geostory"), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default: expect(true).toEqual(false);
                    break;
                }
            });
        }, {
            geostory: {
                currentStory: {
                    resources: []
                }
            },
            mediaEditor: {
                settings: {
                    sourceId
                }
            }
        });
    });
    it('editorSaveUpdateMediaEpic add new media', (done) => {
        const NUM_ACTIONS = 4;
        const source = "geostory";
        const type = "image";
        const data = {};
        testEpic(editorSaveUpdateMediaEpic, NUM_ACTIONS, saveMedia({type, source, data}), (actions) => {
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
                case SELECT_ITEM:
                    expect(a.id.length).toEqual(36);
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
            mediaEditor: {
                saveState: {
                    adding: true
                },
                selected: "id",
                settings: {
                    sourceId: "geostory"
                }
            }
        });
    });

    it('editorSaveUpdateMediaEpic update media', (done) => {
        const NUM_ACTIONS = 3;
        const source = "geostory";
        const type = "image";
        const data = {src: "http", title: "title"};
        testEpic(editorSaveUpdateMediaEpic, NUM_ACTIONS, saveMedia({type, source, data}), (actions) => {
            expect(actions.length).toEqual(NUM_ACTIONS);
            actions.map((a) => {
                switch (a.type) {
                case SAVE_MEDIA_SUCCESS:
                    expect(a.id.length).toEqual(36);
                    expect(a.mediaType).toEqual(type);
                    expect(a.source).toEqual(source);
                    expect(a.data).toEqual(data);
                    break;
                case EDITING_MEDIA:
                    expect(a.editing).toEqual(false);
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
            geostory: {
                resources: [{
                    id: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                    data: {
                        src: "ht",
                        title: "ti"
                    }
                }]
            },
            mediaEditor: {
                saveState: {
                    editing: true,
                    adding: true
                },
                selected: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9",
                settings: {
                    sourceId: "geostory"
                }
            }
        });
    });
});
