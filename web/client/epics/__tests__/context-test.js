/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic } from './epicTestUtils';
import ajax from '../../libs/ajax';

import { configureMap, configureError, LOAD_MAP_CONFIG } from "../../actions/config";
import {
    loadContext,
    LOAD_CONTEXT,
    LOADING,
    SET_RESOURCE,
    SET_CURRENT_CONTEXT,
    LOAD_FINISHED,
    contextLoadError,
    CONTEXT_LOAD_ERROR,
    loadFinished

} from "../../actions/context";

import {
    loginSuccess,
    logout
} from '../../actions/security';

import CONTEXT_SHORT_RESOURCE from '../../test-resources/geostore/resources/resource/context_1.json';
import CONTEXT_RESOURCE from '../../test-resources/geostore/resources/resource/context_2.json';
import CONTEXT_DATA from '../../test-resources/geostore/data/context_1.json';
import CONTEXT_ATTRIBUTES from '../../test-resources/geostore/resources/resource/context_1_attributes.json';

import { loadContextAndMap, handleLoginLogoutContextReload } from "../context";
import MockAdapter from 'axios-mock-adapter';


let mockAxios;

describe('context epics', () => {
    const mapId = 1;
    const contextId = 2;
    const contextName = 'contextName';
    describe('loadContextAndMap', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(ajax);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        // setup mockAxios to reply with a context, with the status provided
        const createContextResponse = (status = 200) => {
            mockAxios.onGet(`/rest/geostore/extjs/resource/${contextId}`).reply(() => {
                return [status, CONTEXT_SHORT_RESOURCE];
            });
            mockAxios.onGet(`/rest/geostore/data/${contextId}`).reply(() => {
                return [status, CONTEXT_DATA];
            });
            mockAxios.onGet(`/rest/geostore/resources/resource/${contextId}/attributes`).reply(() => {
                return [status, CONTEXT_ATTRIBUTES];
            });
            mockAxios.onGet(`/rest/geostore/misc/category/name/CONTEXT/resource/name/${contextName}`).reply(() => {
                return [status, CONTEXT_RESOURCE];
            });
        };

        it('successful context and map load flow', done => {
            createContextResponse();
            const act = [
                loadContext({ mapId, contextName }),
                configureMap() // THIS ACTION FAKES MAP LOAD FLOW END
            ];
            testEpic(loadContextAndMap, 6, act, ([loadingAction, loadMapAction, setResourceAction, setContextAction, loadFinishedAction, loadEndAction]) => {

                expect(loadingAction.type).toBe(LOADING);
                expect(loadingAction.value).toBe(true);
                expect(loadMapAction.type).toBe(LOAD_MAP_CONFIG);
                expect(setResourceAction.type).toBe(SET_RESOURCE);
                expect(setResourceAction.resource.canDelete).toBe(true); // check one random content of the resource
                expect(setContextAction.type).toBe(SET_CURRENT_CONTEXT);
                expect(setContextAction.context.plugins.desktop).toExist(); // check context content
                expect(loadFinishedAction.type).toBe(LOAD_FINISHED);
                expect(loadEndAction.type).toBe(LOADING);
                expect(loadEndAction.value).toBe(false);
                done();
            });

        });
        /*
         * check error actions
         */
        const checkLoadErrors = (startActions, initialState, messageId, done) => {
            testEpic(loadContextAndMap, 4, startActions, ([loadingAction, loadMapAction, errorAction, loadEndAction]) => {
                expect(loadingAction.type).toBe(LOADING);
                expect(loadingAction.value).toBe(true);
                expect(loadMapAction.type).toBe(LOAD_MAP_CONFIG);
                expect(errorAction.type).toBe(CONTEXT_LOAD_ERROR);
                expect(errorAction.error.status).toBe(403);
                expect(errorAction.error.messageId).toBe(messageId);
                expect(loadEndAction.type).toBe(LOADING);
                expect(loadEndAction.value).toBe(false);
                done();
            }, initialState);
        };
        const NOT_LOGGED_STATE = {};
        const LOGGED_STATE = {
            security: {
                user: {
                    role: "USER"
                }
            }
        };
        describe('handle map load error', () => {
            it('403 forbidden, not logged in', done => {
                createContextResponse();
                const actions = [
                    loadContext({ mapId, contextName }),
                    configureError({status: 403}) // THIS ACTION FAKES MAP LOAD FLOW END
                ];
                checkLoadErrors(actions, NOT_LOGGED_STATE, 'context.errors.map.pleaseLogin', done);

            });
            it('403 forbidden, logged in', done => {
                createContextResponse();
                const actions = [
                    loadContext({ mapId, contextName }),
                    configureError({ status: 403 }) // THIS ACTION FAKES MAP LOAD FLOW END
                ];
                checkLoadErrors(actions, LOGGED_STATE, 'context.errors.map.notAccessible', done);

            });
        });
        describe('handle context load error', () => {
            it('403 forbidden, not logged in', done => {
                createContextResponse(403);
                const actions = [
                    loadContext({ mapId, contextName }),
                    configureMap() // THIS ACTION FAKES MAP LOAD FLOW END
                ];
                checkLoadErrors(actions, NOT_LOGGED_STATE, 'context.errors.context.pleaseLogin', done);

            });
            it('403 forbidden, logged in', done => {
                createContextResponse(403);
                const actions = [
                    loadContext({ mapId, contextName }),
                    configureMap() // THIS ACTION FAKES MAP LOAD FLOW END
                ];
                checkLoadErrors(actions, LOGGED_STATE, 'context.errors.context.notAccessible', done);
            });
        });
    });
    describe('handleLoginLogoutContextReload', () => {
        it('reload when forbidden, then the user login', done => {
            const actions = [loadContext({ mapId, contextName }), contextLoadError({ error: { status: 403 } }), loginSuccess()];
            testEpic(handleLoginLogoutContextReload, 1, actions, ([reloadAction]) => {
                expect(reloadAction.type).toBe(LOAD_CONTEXT);
                expect(reloadAction.mapId).toBe(mapId);
                expect(reloadAction.contextName).toBe(contextName);
                done();
            });
        });
        it('reload when loaded, then the user logout', done => {
            const actions = [loadContext({ mapId, contextName }), loadFinished(), logout()];
            testEpic(handleLoginLogoutContextReload, 1, actions, ([reloadAction]) => {
                expect(reloadAction.type).toBe(LOAD_CONTEXT);
                expect(reloadAction.mapId).toBe(mapId);
                expect(reloadAction.contextName).toBe(contextName);
                done();
            });
        });
    });

});

