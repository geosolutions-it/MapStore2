/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import Rx from 'rxjs';

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import { loadPermalinkEpic, savePermalinkEpic } from '../permalink';
import { LOADING, LOAD_PERMALINK_ERROR, PERMALINK_LOADED, UPDATE_SETTINGS, loadPermalink, savePermalink } from '../../actions/permalink';
import Persistence from '../../api/persistence';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { loginSuccess } from '../../actions/security';

const api = {
    createResource: () => Rx.Observable.of(10),
    getResource: () => Rx.Observable.of({name: "test", attributes: {type: "map", pathTemplate: "/viewer/${id}"}}),
    updateResource: () => Rx.Observable.of(10),
    updateResourceAttribute: () =>  Rx.Observable.of(11),
    getResourceIdByName: () =>  Rx.Observable.of(10)
};
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
    },
    router: {
        location: {
            pathname: "/permalink/10"
        }
    }
};
const setApiGetResource = (_api, apiResources) => {
    const apiTest = {
        ..._api,
        ...apiResources
    };
    Persistence.addApi("testPermalink", apiTest);
    Persistence.setApi("testPermalink");
};
describe('Permalink Epics', () => {
    Persistence.addApi("testPermalink", api);
    beforeEach(done => {
        Persistence.setApi("testPermalink");
        setTimeout(done);
    });

    afterEach(done => {
        Persistence.setApi("geostore");
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
                        expect(action.settings).toEqual({name: "test"});
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
                        expect(action.settings).toEqual({name: "test"});
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
                        expect(action.settings).toEqual({name: "test"});
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
                        expect(action.settings).toEqual({name: "test"});
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
    it('savePermalinkEpic with missing category as an ADMIN user', (done) => {
        setApiGetResource(api, {
            createResource: ()=> Rx.Observable.throw({status: 404, data: "Resource Category not found"}),
            createCategory: () => Rx.Observable.throw({status: 500})
        });
        const NUMBER_OF_ACTIONS = 2;
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
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('permalink.errors.save.title');
                        expect(action.message).toBe('permalink.errors.save.categoryErrorAdmin');
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {...state, security: { user: {role: "ADMIN"}}});
    });
    it('savePermalinkEpic with missing category as NON-ADMIN user', (done) => {
        setApiGetResource(api, {
            createResource: ()=> Rx.Observable.throw({status: 404, data: "Resource Category not found"}),
            createCategory: () => Rx.Observable.throw({status: 500})
        });
        const NUMBER_OF_ACTIONS = 2;
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
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('permalink.errors.save.title');
                        expect(action.message).toBe('permalink.errors.save.categoryErrorNonAdmin');
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {...state, security: { user: {role: "USER"}}});
    });
    it("loadPermalinkEpic on load permalink", (done) => {
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
            }, state);
    });
    it("loadPermalinkEpic on login success", (done) => {
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
            }, state);
    });
    it("loadPermalinkEpic on load permalink - context", (done) => {
        const getResource = () => Rx.Observable.of({name: "test", attributes: {type: "context", pathTemplate: "/context/${name}?category=PERMALINK"}});
        setApiGetResource(api, {getResource});
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
                        expect(action.payload.args).toEqual(["/context/test?category=PERMALINK"]);
                        break;
                    case PERMALINK_LOADED:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });

    it("loadPermalinkEpic on error - not found", (done) => {
        const getResource = () => Rx.Observable.throw({status: 404});
        setApiGetResource(api, {getResource});
        const ERROR_STATUS = 404;
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    const permalinkDontExit = 'permalink.errors.loading.permalinkDoesNotExist';
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.status).toBe(ERROR_STATUS);
                        expect(action.error.messageId).toBe(permalinkDontExit);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('permalink.errors.loading.title');
                        expect(action.message).toBe(permalinkDontExit);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });
    it("loadPermalinkEpic on error forbidden and not logged in", (done) => {
        const getResource = () => Rx.Observable.throw({status: 403});
        setApiGetResource(api, {getResource});
        const ERROR_STATUS = 403;
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    const permalinkErrorLogin = 'permalink.errors.loading.pleaseLogin';
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.status).toBe(ERROR_STATUS);
                        expect(action.error.messageId).toBe(permalinkErrorLogin);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('permalink.errors.loading.title');
                        expect(action.message).toBe(permalinkErrorLogin);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });
    it("loadPermalinkEpic on error forbidden and logged in", (done) => {
        const getResource = () => Rx.Observable.throw({status: 403});
        setApiGetResource(api, {getResource});
        const ERROR_STATUS = 403;
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    const permalinkErrorLogin = 'permalink.errors.loading.permalinkNotAccessible';
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.status).toBe(ERROR_STATUS);
                        expect(action.error.messageId).toBe(permalinkErrorLogin);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('permalink.errors.loading.title');
                        expect(action.message).toBe(permalinkErrorLogin);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {
                ...state,
                security: {
                    user: {}
                }
            });
    });
    it("loadPermalinkEpic on error unknown", (done) => {
        const getResource = () => Rx.Observable.throw({status: 500});
        setApiGetResource(api, {getResource});
        const ERROR_STATUS = 500;
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loginSuccess()
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action)=>{
                    const permalinkErrorUnknown = 'permalink.errors.loading.unknownError';
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.status).toBe(ERROR_STATUS);
                        expect(action.error.messageId).toBe(permalinkErrorUnknown);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe('permalink.errors.loading.title');
                        expect(action.message).toBe(permalinkErrorUnknown);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, {
                ...state,
                security: {
                    user: {}
                }
            });
    });

    // ── Security regression: pathTemplate must not enable RCE or Open Redirect (F-12 / SM-23) ──
    // See MapStore2/web/client/epics/permalink.js loadPermalinkEpic — pathTemplate is a
    // user-persisted GeoStore attribute compiled at load time. It MUST be substituted
    // through generateTemplateString (regex, not Function()) and gated by isSafeRelativePath
    // before being handed to react-router push().

    it("loadPermalinkEpic — rejects protocol-relative pathTemplate (open redirect)", (done) => {
        const getResource = () => Rx.Observable.of({
            name: "evil",
            attributes: { type: "map", pathTemplate: "//evil.example/${id}" }
        });
        setApiGetResource(api, { getResource });
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loadPermalink(10)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action) => {
                    const invalidTarget = "permalink.errors.loading.invalidTarget";
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.messageId).toBe(invalidTarget);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe("permalink.errors.loading.title");
                        expect(action.message).toBe(invalidTarget);
                        break;
                    case "@@router/CALL_HISTORY_METHOD":
                        // must NOT emit — router push on a cross-origin path is the bug
                        expect(true).toBe(false);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });

    it("loadPermalinkEpic — rejects absolute-URL pathTemplate (open redirect)", (done) => {
        const getResource = () => Rx.Observable.of({
            name: "evil",
            attributes: { type: "map", pathTemplate: "http://evil.example/steal?t=${id}" }
        });
        setApiGetResource(api, { getResource });
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loadPermalink(10)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action) => {
                    const invalidTarget = "permalink.errors.loading.invalidTarget";
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error.messageId).toBe(invalidTarget);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.message).toBe(invalidTarget);
                        break;
                    case "@@router/CALL_HISTORY_METHOD":
                        expect(true).toBe(false);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });

    it("loadPermalinkEpic — rejects embedded-protocol pathTemplate (javascript: URI)", (done) => {
        const getResource = () => Rx.Observable.of({
            name: "evil",
            attributes: { type: "map", pathTemplate: "/javascript:alert(1)?a=${id}" }
        });
        setApiGetResource(api, { getResource });
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loadPermalink(10)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action) => {
                    const invalidTarget = "permalink.errors.loading.invalidTarget";
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error.messageId).toBe(invalidTarget);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.message).toBe(invalidTarget);
                        break;
                    case "@@router/CALL_HISTORY_METHOD":
                        expect(true).toBe(false);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });

    it("loadPermalinkEpic — RCE payload with whitespace is rejected by safety guard", (done) => {
        // This attack payload contains spaces (inside "throw new Error"). Two independent
        // layers of the fix defeat it:
        //   1. generateTemplateString's regex /\$\{([\s]*[^;\s\{]+[\s]*)\}/g refuses to
        //      match ${...} blocks whose body contains interior whitespace, so no
        //      substitution occurs — Function() is never called.
        //   2. isSafeRelativePath then rejects the still-whitespace-carrying template
        //      before push() would be invoked (\s in the guard's character class).
        // Expected outcome: LOAD_PERMALINK_ERROR + SHOW_NOTIFICATION with the
        // "permalink.errors.loading.invalidTarget" message id; NO router push() action.
        const rcePayload = '/viewer/${constructor.constructor("throw new Error(\'RCE\')")()}';
        const getResource = () => Rx.Observable.of({
            name: "evil",
            attributes: { type: "map", pathTemplate: rcePayload }
        });
        setApiGetResource(api, { getResource });
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loadPermalink(10)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action) => {
                    const invalidTarget = "permalink.errors.loading.invalidTarget";
                    switch (action.type) {
                    case LOAD_PERMALINK_ERROR:
                        expect(action.error).toBeTruthy();
                        expect(action.error.messageId).toBe(invalidTarget);
                        break;
                    case SHOW_NOTIFICATION:
                        expect(action.title).toBe("permalink.errors.loading.title");
                        expect(action.message).toBe(invalidTarget);
                        break;
                    case "@@router/CALL_HISTORY_METHOD":
                        // The malicious path must NOT reach the router.
                        expect(true).toBe(false);
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });

    it("loadPermalinkEpic — encodeURIComponent applied to substituted values (defense-in-depth)", (done) => {
        // Even when the value contains slashes, they get URL-encoded so they cannot alter
        // the path structure. Simulates an attacker-controlled id containing path traversal.
        const getResource = () => Rx.Observable.of({
            name: "test/../admin",
            attributes: { type: "context", pathTemplate: "/context/${name}?category=PERMALINK" }
        });
        setApiGetResource(api, { getResource });
        const NUMBER_OF_ACTIONS = 2;
        testEpic(
            loadPermalinkEpic,
            NUMBER_OF_ACTIONS, [
                loadPermalink(10)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                actions.forEach((action) => {
                    switch (action.type) {
                    case "@@router/CALL_HISTORY_METHOD":
                        // "/context/test%2F..%2Fadmin?category=PERMALINK" — slashes encoded
                        expect(action.payload.args[0].startsWith("/context/")).toBe(true);
                        expect(action.payload.args[0].indexOf("/admin")).toBe(-1);
                        expect(action.payload.args[0].indexOf("%2F")).toBeGreaterThan(-1);
                        break;
                    case PERMALINK_LOADED:
                        break;
                    default:
                        expect(true).toBe(false);
                    }
                });
                done();
            }, state);
    });
});
