/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import Rx from 'rxjs';
import MockAdapter from 'axios-mock-adapter';

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import { loadPermalinkEpic, savePermalinkEpic } from '../permalink';
import { LOADING, LOAD_PERMALINK_ERROR, PERMALINK_LOADED, UPDATE_SETTINGS, loadPermalink, savePermalink } from '../../actions/permalink';
import Persistence from '../../api/persistence';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import axios from '../../libs/ajax';
import { loginSuccess } from '../../actions/security';

const api = {
    createResource: () => Rx.Observable.of(10),
    getResource: () => Rx.Observable.of({name: "test"}),
    updateResource: () => Rx.Observable.of(10),
    updateResourceAttribute: () =>  Rx.Observable.of(11)
};
let mockAxios;
const state = {
    map: {
        present: {
            bbox: {}
        }
    },
    context: {
        resource: {
            id: "context-id"
        }
    },
    layers: {
        groups: [{
            expanded: true,
            id: 'Default',
            name: 'Default',
            nodes: [ 'layer_01', 'layer_02' ],
            title: 'Default'
        }],
        flat: [{
            id: 'layer_01',
            title: 'title_01'
        }, {
            id: 'layer_02',
            title: 'title_02'
        }]
    }
};
describe('Permalink Epics', () => {
    Persistence.addApi("testPermalink", api);
    beforeEach(done => {
        Persistence.setApi("testPermalink");
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });

    afterEach(done => {
        Persistence.setApi("geostore");
        mockAxios.restore();
        setTimeout(done);
    });
    it('test savePermalinkEpic with empty resource', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        testEpic(
            addTimeoutEpic(savePermalinkEpic, 10),
            NUMBER_OF_ACTIONS, [
                savePermalink()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.map((action) => {
                    expect(action.type).toBe(TEST_TIMEOUT);
                });
                done();
            }, {});
    });
    it('savePermalinkEpic with map resource', (done) => {
        const NUMBER_OF_ACTIONS = 4;
        const permalinkObj = {
            permalinkType: "map",
            resource: {
                category: "PERMALINK",
                metadata: {name: "test"},
                attributes: {
                    title: "title",
                    description: "description"
                }
            }
        };

        testEpic(
            savePermalinkEpic,
            NUMBER_OF_ACTIONS, [
                savePermalink(permalinkObj)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    switch (action.type) {
                    case LOADING:
                        break;
                    case UPDATE_SETTINGS:
                        expect(action.settings).toEqual({id: 10});
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.id).toBe("PERMALINK_SAVE_SUCCESS");
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });
    it('savePermalinkEpic with context resource', (done) => {
        const NUMBER_OF_ACTIONS = 4;
        const permalinkObj = {
            permalinkType: "context",
            resource: {
                category: "PERMALINK",
                metadata: {name: "test"},
                attributes: {
                    title: "title",
                    description: "description"
                }
            }
        };

        testEpic(
            savePermalinkEpic,
            NUMBER_OF_ACTIONS, [
                savePermalink(permalinkObj)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    switch (action.type) {
                    case LOADING:
                        break;
                    case UPDATE_SETTINGS:
                        expect(action.settings).toEqual({id: 10});
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.id).toBe("PERMALINK_SAVE_SUCCESS");
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });
    it('savePermalinkEpic with dashboard resource', (done) => {
        const _state = {
            ...state,
            widgets: {
                containers: {
                    floating: {
                        widgets: {},
                        layouts: {}
                    }
                }
            },
            dashboard: {
                services: {}
            }
        };
        const NUMBER_OF_ACTIONS = 4;
        const permalinkObj = {
            permalinkType: "dashboard",
            resource: {
                category: "PERMALINK",
                metadata: {name: "test"},
                attributes: {
                    title: "title"
                }
            }
        };

        testEpic(
            savePermalinkEpic,
            NUMBER_OF_ACTIONS, [
                savePermalink(permalinkObj)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    switch (action.type) {
                    case LOADING:
                        break;
                    case UPDATE_SETTINGS:
                        expect(action.settings).toEqual({id: 10});
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.id).toBe("PERMALINK_SAVE_SUCCESS");
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, _state);
    });
    it('savePermalinkEpic with geostory resource', (done) => {
        const _state = {
            ...state,
            geostory: {currentStory: {}}
        };
        const NUMBER_OF_ACTIONS = 4;
        const permalinkObj = {
            permalinkType: "geostory",
            resource: {
                category: "PERMALINK",
                metadata: {name: "test"},
                attributes: {
                    title: "title"
                }
            }
        };

        testEpic(
            savePermalinkEpic,
            NUMBER_OF_ACTIONS, [
                savePermalink(permalinkObj)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    switch (action.type) {
                    case LOADING:
                        break;
                    case UPDATE_SETTINGS:
                        expect(action.settings).toEqual({id: 10});
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.id).toBe("PERMALINK_SAVE_SUCCESS");
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, _state);
    });
    it("loadPermalinkEpic on load permalink", (done) => {
        mockAxios.onGet().reply(200, {AttributeList: {Attribute: [{name: "pathTemplate", value: "/viewer/${id}"}]}});
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loadPermalink(10)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    switch (action.type) {
                    case "@@router/CALL_HISTORY_METHOD":
                        expect(action.payload.args).toEqual(["/viewer/10"]);
                        break;
                    case PERMALINK_LOADED:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {});
    });
    it("loadPermalinkEpic on load permalink - context", (done) => {
        mockAxios.onGet().reply(200, {AttributeList: {Attribute: [{name: "pathTemplate", value: "/context/${name}"}, {name: "type", value: "context"}]}});
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loadPermalink(10)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    switch (action.type) {
                    case "@@router/CALL_HISTORY_METHOD":
                        expect(action.payload.args).toEqual(["/context/test"]);
                        break;
                    case PERMALINK_LOADED:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {});
    });
    it("loadPermalinkEpic on login success", (done) => {
        mockAxios.onGet().reply(200, {AttributeList: {Attribute: [{name: "pathTemplate", value: "/viewer/${id}"}]}});
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    switch (action.type) {
                    case "@@router/CALL_HISTORY_METHOD":
                        expect(action.payload.args).toEqual(["/viewer/10"]);
                        break;
                    case PERMALINK_LOADED:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {
                router: {
                    location: {
                        pathname: "/permalink/10"
                    }
                }
            });
    });
    it("loadPermalinkEpic on error - not found", (done) => {
        const ERROR_STATUS = 404;
        mockAxios.onGet().reply(ERROR_STATUS);
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    const permalinkDontExit = 'share.permalink.errors.loading.permalinkDoesNotExist';
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.status).toBe(ERROR_STATUS);
                        expect(action.error.messageId).toBe(permalinkDontExit);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('share.permalink.errors.loading.title');
                        expect(action.message).toBe(permalinkDontExit);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {});
    });
    it("loadPermalinkEpic on error forbidden and not logged in", (done) => {
        const ERROR_STATUS = 403;
        mockAxios.onGet().reply(ERROR_STATUS);
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    const permalinkErrorLogin = 'share.permalink.errors.loading.pleaseLogin';
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.status).toBe(ERROR_STATUS);
                        expect(action.error.messageId).toBe(permalinkErrorLogin);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('share.permalink.errors.loading.title');
                        expect(action.message).toBe(permalinkErrorLogin);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {});
    });
    it("loadPermalinkEpic on error forbidden and logged in", (done) => {
        const ERROR_STATUS = 403;
        mockAxios.onGet().reply(ERROR_STATUS);
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    const permalinkErrorLogin = 'share.permalink.errors.loading.permalinkNotAccessible';
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.status).toBe(ERROR_STATUS);
                        expect(action.error.messageId).toBe(permalinkErrorLogin);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('share.permalink.errors.loading.title');
                        expect(action.message).toBe(permalinkErrorLogin);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {
                security: {
                    user: {}
                }
            });
    });
    it("loadPermalinkEpic on error unknown", (done) => {
        const ERROR_STATUS = 500;
        mockAxios.onGet().reply(ERROR_STATUS);
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    const permalinkErrorUnknown = 'share.permalink.errors.loading.unknownError';
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.status).toBe(ERROR_STATUS);
                        expect(action.error.messageId).toBe(permalinkErrorUnknown);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('share.permalink.errors.loading.title');
                        expect(action.message).toBe(permalinkErrorUnknown);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {
                security: {
                    user: {}
                }
            });
    });
});
