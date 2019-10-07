/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import MockAdapter from 'axios-mock-adapter';
import { CALL_HISTORY_METHOD } from 'react-router-redux';

import TEST_STORY from "../../test-resources/geostory/sampleStory_1.json";
import axios from '../../libs/ajax';

import { logout, loginSuccess } from '../../actions/security';

import {
    scrollToContentEpic,
    loadGeostoryEpic,
    openMediaEditorForNewMedia,
    editMediaForBackgroundEpic,
    cleanUpEmptyStoryContainers,
    saveGeoStoryResource,
    reloadGeoStoryOnLoginLogout
} from '../geostory';
import {
    LOADING_GEOSTORY,
    loadGeostory,
    SET_CURRENT_STORY,
    LOAD_GEOSTORY_ERROR,
    add,
    UPDATE,
    remove,
    REMOVE,
    saveStory,
    SET_CONTROL,
    SAVED,
    SET_RESOURCE,
    GEOSTORY_LOADED,
    ADD_RESOURCE
} from '../../actions/geostory';
import {
    SHOW,
    SELECT_ITEM,
    hide,
    chooseMedia,
    editMedia
} from '../../actions/mediaEditor';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import {testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import { ContentTypes, MediaTypes, Controls } from '../../utils/GeoStoryUtils';

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
    it('test scrollToContentEpic, with img mounted', (done) => {
        const NUM_ACTIONS = 0;
        const SAMPLE_ID = "res_img";
        const SAMPLE_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        document.body.innerHTML = '<div id="container"></div>';

        ReactDOM.render(
            <div id="img-container">
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 0}
                    src={SAMPLE_SRC}
                />
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 1}
                    src={SAMPLE_SRC}
                />
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 2}
                    src={SAMPLE_SRC}
                />
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 3}
                    src={SAMPLE_SRC}
                />
                <img
                    width= {500}
                    height= {500}
                    id={SAMPLE_ID + 4}
                    src={SAMPLE_SRC}
                />
            </div>, document.getElementById("container"));
        testEpic(scrollToContentEpic, NUM_ACTIONS, [
            add(`sections[{id: "abc"}].contents[{id: "def"}]`, undefined, {type: ContentTypes.MEDIA, id: SAMPLE_ID + 4})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const container = document.getElementById('container');
            expect(container).toExist();
            expect(container.scrollHeight).toBeGreaterThan(0);
            done();
        }, {
            geostory: {}
        });
    });
    it('test scrollToContentEpic, with img mounted after a delay', (done) => {
        const NUM_ACTIONS = 1;
        const SAMPLE_ID = "res_img";
        const SAMPLE_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
        const DELAY = 400;
        let container = null;
        setTimeout(() => {
            document.body.innerHTML = '<div id="container"></div>';
            container = ReactDOM.render(
                <div id="img-container">
                    <img
                        width= {500}
                        height= {500}
                        id={SAMPLE_ID + 0}
                        src={SAMPLE_SRC}
                    />
                    <img
                        width= {500}
                        height= {500}
                        id={SAMPLE_ID + 1}
                        src={SAMPLE_SRC}
                    />
                    <img
                        width= {500}
                        height= {500}
                        id={SAMPLE_ID + 2}
                        src={SAMPLE_SRC}
                    />
                    <img
                        width= {500}
                        height= {500}
                        id={SAMPLE_ID + 3}
                        src={SAMPLE_SRC}
                    />
                    <img
                        width= {500}
                        height= {500}
                        id={SAMPLE_ID + 4}
                        src={SAMPLE_SRC}
                    />
                </div>, document.getElementById("container"));
        }, DELAY);
        testEpic(addTimeoutEpic(scrollToContentEpic, 100), NUM_ACTIONS, [
            add(`sections[{id: "abc"}].contents[{id: "def"}]`, undefined, {type: ContentTypes.MEDIA, id: SAMPLE_ID + 4})
        ], (actions) => {
            expect(actions.length).toBe(1);
            setTimeout(() => {
                expect(container.scrollHeight).toBeGreaterThan(0);
                done();
            }, 500);
        }, {
            geostory: {}
        });
    });
    describe('saveGeoStoryResource', () => {
        it('test save (create) simple story', done => {
            const TEST_RESOURCE = {
                category: "GEOSTORY",
                metadata: {
                    name: "name",
                    description: "description",
                    attribute1: "value1",
                    attribute2: "value2"
                }
            };
            mockAxios.onPost().reply(() => {
                return [200, 1234];
            });
            mockAxios.onGet(/\/permissions$/).reply(200, {
                "SecurityRuleList": {
                    "SecurityRule": {
                        "canRead": true,
                        "canWrite": true,
                        "user": {
                            "id": 3,
                            "name": "admin"
                        }
                    }
                }
            });
            testEpic(saveGeoStoryResource, 5, {...saveStory(TEST_RESOURCE), delay: 0}, ([a1, a2, a3, a4, a5]) => {
                expect(a1.type).toBe(LOADING_GEOSTORY);
                expect(a2.type).toBe(SAVED);
                expect(a2.id).toBe(1234);
                expect(a3.type).toBe(SET_CONTROL);
                expect(a3.control).toBe(Controls.SHOW_SAVE);
                expect(a3.value).toBe(false);
                expect(a4.type).toBe(CALL_HISTORY_METHOD);
                expect(a5.type).toBe(SHOW_NOTIFICATION);
                done();
            });
        });
    });
    it('loadGeostoryEpic loading one sample story', (done) => {
        const NUM_ACTIONS = 4;
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
                case SET_RESOURCE: {
                    expect(a.resource).toExist(); // TODO: test values
                    break;
                }
                case GEOSTORY_LOADED: {
                    expect(a.id).toExist();
                    break;
                }
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
        const NUM_ACTIONS = 6;
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
        const NUM_ACTIONS = 4;
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
                case LOAD_GEOSTORY_ERROR:
                    break;
                case SHOW_NOTIFICATION:
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
    it('test openMediaEditorForNewMedia, adding a media content and choosing an image', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(openMediaEditorForNewMedia, NUM_ACTIONS, [
            add(`sections[{id: "abc"}].contents[{id: "def"}]`, undefined, {type: ContentTypes.MEDIA, id: "102cbcf6-ff39-4b7f-83e4-78841ee13bb9"}),
            chooseMedia({id: "geostory"})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map(a => {
                switch (a.type) {
                case UPDATE:
                    expect(a.element).toEqual({resourceId: "geostory", type: MediaTypes.IMAGE});
                    expect(a.mode).toEqual("merge");
                    expect(a.path).toEqual(`sections[{id: "abc"}].contents[{id: "def"}][{"id":"102cbcf6-ff39-4b7f-83e4-78841ee13bb9"}]`);
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
            geostory: {},
            mediaEditor: {
                settings: {
                    mediaType: "image"
                }
            }
        });
    });
    it('test openMediaEditorForNewMedia, adding an empty media content (image)', (done) => {
        const NUM_ACTIONS = 2;
        testEpic(openMediaEditorForNewMedia, NUM_ACTIONS, [
            add(`sections[{id: "abc"}].contents[{id: "def"}]`, undefined, {type: ContentTypes.MEDIA, id: ""}),
            hide()
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map(a => {
                switch (a.type) {
                case UPDATE:
                    expect(a.element).toEqual({type: MediaTypes.IMAGE});
                    expect(a.mode).toEqual("merge");
                    expect(a.path).toEqual(`sections[{id: "abc"}].contents[{id: "def"}][{"id":""}]`);
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
            geostory: {},
            mediaEditor: {
                settings: {
                    mediaType: "image"
                }
            }
        });
    });
    it('test openMediaEditorForNewMedia, adding a media section and choosing an image', (done) => {
        const NUM_ACTIONS = 2;
        const element = {
            id: '57cd0993-ad29-438a-b02a-d8f110de5d81',
            type: 'paragraph',
            title: 'Media Section',
            contents: [
                {
                    id: '724f91c4-f438-4be8-aef5-587ce623c96f',
                    type: 'column',
                    contents: [
                        {
                            id: '6296fd1a-fbad-4736-8ae1-124150b9f952',
                            type: 'media'
                        }
                    ]
                }
            ]
        };

        testEpic(openMediaEditorForNewMedia, NUM_ACTIONS, [
            add(`sections`, undefined, element),
            chooseMedia({id: "geostory"})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map(a => {
                switch (a.type) {
                case UPDATE:
                    expect(a.element).toEqual({resourceId: "geostory", type: MediaTypes.IMAGE});
                    expect(a.mode).toEqual("merge");
                    expect(a.path).toEqual(`sections[{"id":"57cd0993-ad29-438a-b02a-d8f110de5d81"}].contents[0].contents[0]`);
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
            geostory: {},
            mediaEditor: {
                settings: {
                    mediaType: "image"
                }
            }
        });
    });
    it('update story with already existing image (geostory)', (done) => {
        const NUM_ACTIONS = 3;
        testEpic(addTimeoutEpic(editMediaForBackgroundEpic), NUM_ACTIONS, [
            editMedia({path: `sections[{"id": "section_id"}].contents[{"id": "content_id"}]`, owner: "geostore"}),
            chooseMedia({id: "resourceId"})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map(a => {
                switch (a.type) {
                case UPDATE:
                    expect(a.element).toEqual({
                        resourceId: "resourceId",
                        type: "image"
                    });
                    expect(a.mode).toEqual("merge");
                    expect(a.path).toEqual(`sections[{"id": "section_id"}].contents[{"id": "content_id"}]`);
                    break;
                case SHOW:
                    expect(a.owner).toEqual("geostore");
                    break;
                case SELECT_ITEM:
                    expect(a.id).toEqual("resourceId");
                    break;
                default: expect(true).toBe(false);
                    break;
                }
            });
            done();
        }, {
            geostory: {
                currentStory: {
                    resources: [{
                        id: "resourceId",
                        data: {
                            id: "resource_id"
                        }
                    }],
                    sections: [{
                        id: "section_id",
                        contents: [{
                            id: "content_id",
                            resourceId: "resourceId"
                        }]
                    }]
                }
            },
            mediaEditor: {
                settings: {
                    mediaType: "image",
                    sourceId: "geostory"
                }
            }
        });
    });

    it('update story with a new map resource (geostore) from external service', (done) => {
        const NUM_ACTIONS = 4;
        const mediaType = "map";
        testEpic(addTimeoutEpic(editMediaForBackgroundEpic), NUM_ACTIONS, [
            editMedia({path: `sections[{"id": "section_id"}].contents[{"id": "content_id"}]`, owner: "geostore"}),
            chooseMedia({id: "resourceId", type: mediaType})
        ], (actions) => {
            expect(actions.length).toBe(NUM_ACTIONS);
            actions.map(a => {
                switch (a.type) {
                case UPDATE:
                    expect(a.element.resourceId.length).toEqual(36);
                    expect(a.element.type).toEqual(mediaType);
                    expect(a.mode).toEqual("merge");
                    expect(a.path).toEqual(`sections[{"id": "section_id"}].contents[{"id": "content_id"}]`);
                    break;
                case SHOW:
                    expect(a.owner).toEqual("geostore");
                    break;
                case ADD_RESOURCE:
                    expect(a.id.length).toEqual(36); // uuid
                    expect(a.mediaType).toEqual(mediaType);
                    expect(a.data).toEqual({
                        id: "resourceId",
                        type: mediaType
                    });
                    break;
                case SELECT_ITEM:
                    expect(a.id).toEqual("resource_id");
                    break;
                default: expect(true).toBe(false);
                    break;
                }
            });
            done();
        }, {
            geostory: {
                currentStory: {
                    resources: [{
                        id: "geostoreMap-resource_id"
                    }],
                    sections: [{
                        id: "section_id",
                        contents: [{
                            id: "content_id",
                            resourceId: "resource_id",
                            type: "map"
                        }]
                    }]
                }
            },
            mediaEditor: {
                settings: {
                    mediaType: "map",
                    sourceId: "geostoreMap"
                }
            }
        });
    });

    describe('reloadGeoStoryOnLoginLogout', () => {
        it('on login', done => {
            testEpic(reloadGeoStoryOnLoginLogout, 1, [loadGeostory(1234), loginSuccess()], () => {
                done();
            });
        });
        it('on logout', done => {
            testEpic(reloadGeoStoryOnLoginLogout, 1, [loadGeostory(1234), logout()], () => {
                done();
            });
        });

    });
    describe('cleanUpEmptyStoryContainers', () => {
        it('do not trigger when container has content', done => {
            testEpic(addTimeoutEpic(cleanUpEmptyStoryContainers, 20), 1, remove("sections[0].contents[0].contents[0]"), ([a]) => {
                expect(a.type).toBe(TEST_TIMEOUT);
                done();
            }, {
                geostory: {
                    currentStory: TEST_STORY
                }
            });
        });
        it('removes empty section', done => {
            testEpic(cleanUpEmptyStoryContainers, 1, remove("sections[{\"id\":\"SECTION\"}].contents[0]"), ([a]) => {
                expect(a.type).toBe(REMOVE);
                expect(a.path).toBe("sections.0"); // the path is transformed like this. Anyway it is still a valid lodash path
                done();
            }, {
                geostory: {
                    currentStory: {
                        sections: [{
                            id: 'SECTION',
                            contents: []
                        }]
                    }
                }
            });
        });
        it('removes empty content', done => {
            const S1 = {
                geostory: {
                    currentStory: {
                        sections: [{
                            id: 'SECTION', // e.g. paragraph, or immersive
                            contents: [{
                                contents: [] // e.g. column
                            }]
                        }]
                    }
                }
            };

            testEpic(cleanUpEmptyStoryContainers, 1, remove("sections[{\"id\":\"SECTION\"}].contents[0].contents[0]"), ([a]) => {
                expect(a.type).toBe(REMOVE);
                expect(a.path).toBe("sections.0.contents.0"); // the path is transformed like this. Anyway it is still a valid lodash path
                done();
            }, S1);
        });
        it('removes empty content recursively', done => {
            const S1 = {
                geostory: {
                    currentStory: {
                        sections: [{
                            id: 'SECTION',
                            contents: [{
                                contents: []
                            }]
                        }]
                    }
                }
            };
            const S2 = {
                geostory: {
                    currentStory: {
                        sections: [{
                            id: 'SECTION',
                            contents: []
                        }]
                    }
                }
            };
            testEpic(cleanUpEmptyStoryContainers, 1, remove("sections[{\"id\":\"SECTION\"}].contents[0].contents[0]"), ([a]) => {
                expect(a.type).toBe(REMOVE);
                expect(a.path).toBe("sections.0.contents.0"); // the path is transformed like this. Anyway it is still a valid lodash path
                // call again the epic removes also the section
                testEpic(cleanUpEmptyStoryContainers, 1, a, ([a2]) => {
                    expect(a2.type).toBe(REMOVE);
                    expect(a2.path).toBe("sections.0");
                    done();
                }, S2);
            }, S1);
        });
    });
});
