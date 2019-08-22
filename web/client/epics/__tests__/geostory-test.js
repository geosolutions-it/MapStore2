/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import TEST_STORY from "json-loader!../../test-resources/geostory/sampleStory_1.json";
import MockAdapter from 'axios-mock-adapter';

import axios from '../../libs/ajax';

import {
    loadGeostoryEpic,
    openMediaEditorForNewMedia
} from '../geostory';
import {
    LOADING_GEOSTORY,
    loadGeostory,
    SET_CURRENT_STORY,
    LOAD_GEOSTORY_ERROR,
    add,
    UPDATE
} from '../../actions/geostory';
import {
    SHOW,
    hide,
    chooseMedia
} from '../../actions/mediaEditor';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import {testEpic, addTimeoutEpic} from './epicTestUtils';
import { ContentTypes } from '../../utils/GeoStoryUtils';

let mockAxios;
describe('Geostory Epics', () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        mockAxios.restore();
        setTimeout(done);
    });
    it('loadGeostoryEpic loading one sample story', (done) => {
        const NUM_ACTIONS = 3;
        mockAxios.onGet().reply(200, TEST_STORY);
        testEpic(loadGeostoryEpic, NUM_ACTIONS, loadGeostory("sampleStory"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((a, i) => {
                switch (a.type) {
                    case LOADING_GEOSTORY:
                        expect(a.name).toBe("loading");
                        expect(a.value).toBe(i === 0);
                        break;
                    case SET_CURRENT_STORY:
                        expect(a.story).toEqual(TEST_STORY);
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {}
        });
    });
    it('loadGeostoryEpic loading wrong story', (done) => {
        const NUM_ACTIONS = 5;
        mockAxios.onGet().reply(404);
        testEpic(loadGeostoryEpic, NUM_ACTIONS, loadGeostory("wrongStoryName"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((a, i) => {
                switch (a.type) {
                    case LOADING_GEOSTORY:
                        expect(a.name).toBe("loading");
                        expect(a.value).toBe(i === 0);
                        break;
                    case SET_CURRENT_STORY:
                        expect(a.story).toEqual({});
                        break;
                    case LOAD_GEOSTORY_ERROR:
                    expect(a.error.messageId).toEqual("geostory.errors.loading.geostoryDoesNotExist");
                        break;
                    case SHOW_NOTIFICATION:
                        expect(a.message).toEqual("geostory.errors.loading.geostoryDoesNotExist");
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {}
        });
    });

    it('loadGeostoryEpic loading a story without permissions for a non logged user', (done) => {
        const NUM_ACTIONS = 5;
        mockAxios.onGet().reply(403);
        testEpic(loadGeostoryEpic, NUM_ACTIONS, loadGeostory("wrongStoryName"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((a, i) => {
                switch (a.type) {
                    case LOADING_GEOSTORY:
                        expect(a.name).toBe("loading");
                        expect(a.value).toBe(i === 0);
                        break;
                    case SET_CURRENT_STORY:
                        expect(a.story).toEqual({});
                        break;
                    case LOAD_GEOSTORY_ERROR:
                    expect(a.error.messageId).toEqual("geostory.errors.loading.pleaseLogin");
                        break;
                    case SHOW_NOTIFICATION:
                        expect(a.message).toEqual("geostory.errors.loading.pleaseLogin");
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {}
        });
    });
    it('loadGeostoryEpic loading a story without permissions for a logged user', (done) => {
        const NUM_ACTIONS = 5;
        mockAxios.onGet().reply(403);
        testEpic(loadGeostoryEpic, NUM_ACTIONS, loadGeostory("wrongStoryName"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((a, i) => {
                switch (a.type) {
                    case LOADING_GEOSTORY:
                        expect(a.name).toBe("loading");
                        expect(a.value).toBe(i === 0);
                        break;
                    case SET_CURRENT_STORY:
                        expect(a.story).toEqual({});
                        break;
                    case LOAD_GEOSTORY_ERROR:
                    expect(a.error.messageId).toEqual("geostory.errors.loading.geostoryNotAccessible");
                        break;
                    case SHOW_NOTIFICATION:
                        expect(a.message).toEqual("geostory.errors.loading.geostoryNotAccessible");
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {},
            security: {
                user: {
                    name: "Nina"
                }
            }
        });
    });
    it('loadGeostoryEpic loading a story with unknownError', (done) => {
        const NUM_ACTIONS = 5;
        mockAxios.onGet().reply(500);
        testEpic(loadGeostoryEpic, NUM_ACTIONS, loadGeostory("wrongStoryName"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((a, i) => {
                switch (a.type) {
                    case LOADING_GEOSTORY:
                        expect(a.name).toBe("loading");
                        expect(a.value).toBe(i === 0);
                        break;
                    case SET_CURRENT_STORY:
                        expect(a.story).toEqual({});
                        break;
                    case LOAD_GEOSTORY_ERROR:
                    expect(a.error.messageId).toEqual("geostory.errors.loading.unknownError");
                        break;
                    case SHOW_NOTIFICATION:
                        expect(a.message).toEqual("geostory.errors.loading.unknownError");
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {}
        });
    });
    /*
     * TODO: investigate why it fails only in travis, (tested locally with both firefox and chrome),
     * with firefox it works but i have some problems of stability
    */
    it.skip('loadGeostoryEpic loading a story with malformed json configuration', (done) => {
        const NUM_ACTIONS = 5;
        mockAxios.onGet().reply(200, `{"description":"Sample story with 1 paragraph and 1 immersive section, two columns","type":"cascade","sections":[{"type":"paragraph","id":"SomeID","title":"Abstract","contents":[{"id":"SomeID","type":'text',"background":{},"html":"<p>this is some html content</p>"}]}]}`);
        testEpic(loadGeostoryEpic, NUM_ACTIONS, loadGeostory("StoryWithError"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((a, i) => {
                switch (a.type) {
                    case LOADING_GEOSTORY:
                        expect(a.name).toBe("loading");
                        expect(a.value).toBe(i === 0);
                        break;
                    case SET_CURRENT_STORY:
                        expect(a.story).toEqual({});
                        break;
                    case LOAD_GEOSTORY_ERROR:
                    expect(a.error.messageId).toEqual("Unexpected token \' in JSON at position 200");
                        break;
                    case SHOW_NOTIFICATION:
                        expect(a.message).toEqual("Unexpected token \' in JSON at position 200");
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {}
        });
    });
    it('loadGeostoryEpic loading a bad story format', (done) => {
        const NUM_ACTIONS = 3;
        mockAxios.onGet().reply(200, false);
        testEpic(loadGeostoryEpic, NUM_ACTIONS, loadGeostory("wrongStoryName"), (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map((a, i) => {
                switch (a.type) {
                    case LOADING_GEOSTORY:
                        expect(a.name).toBe("loading");
                        expect(a.value).toBe(i === 0);
                        break;
                    case SET_CURRENT_STORY:
                        expect(a.story).toEqual({});
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {}
        });
    });
    it('openMediaEditorForNewMedia showing media and updating story', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(openMediaEditorForNewMedia, NUM_ACTIONS, [
            add(`sections[{id: "abc"}].contents[{id: "def"}]`, undefined, {type: ContentTypes.MEDIA, id: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9"}),
            chooseMedia({id: "geostory"})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map(a => {
                switch (a.type) {
                    case UPDATE:
                        expect(a.element).toEqual("geostory");
                        expect(a.mode).toEqual("replace");
                        expect(a.path).toEqual(`sections[{id: "abc"}].contents[{id: "def"}][{"id":"102cbcf6-ff39-4b7f-83e4-78841ee13bb9"}].resourceId`);
                        break;
                    case SHOW:
                        expect(a.owner).toEqual("geostory");
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {}
        });
    });
    // TODO: finish to test also takeUntil flow
    it.skip('openMediaEditorForNewMedia showing media and updating story and hide', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(addTimeoutEpic(openMediaEditorForNewMedia), NUM_ACTIONS, [
            add(`sections[{id: "abc"}].contents[{id: "def"}]`, undefined, {type: ContentTypes.MEDIA, id: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9"}),
            chooseMedia({id: "geostory"}),
            hide()
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map(a => {
                switch (a.type) {
                    case UPDATE:
                        expect(a.element).toEqual("geostory");
                        expect(a.mode).toEqual("replace");
                        expect(a.path).toEqual(`sections[{id: "abc"}].contents[{id: "def"}][{"id":"102cbcf6-ff39-4b7f-83e4-78841ee13bb9"}].resourceId`);
                        break;
                    case SHOW:
                        expect(a.owner).toEqual("geostory");
                        break;
                    default: expect(true).toBe(false);
                        break;
                }
            });
            done();
        }, {
            geostory: {}
        });
    });
});
