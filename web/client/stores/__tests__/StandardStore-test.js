
/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import createStore from "../StandardStore";
import { Observable } from 'rxjs';
import { standardRootReducerFunc } from "../defaultOptions";
import {LOAD_MAP_CONFIG} from "../../actions/config";
import mapInfoReducers from "../../reducers/mapInfo";
import browserReducers from "../../reducers/browser";
import { CHANGE_BROWSER_PROPERTIES } from '../../actions/browser';
import { setApi, getApi, getItemKey } from '../../api/userPersistedStorage';
import securityReducer from '../../reducers/security';
import MockAdapter from 'axios-mock-adapter';
import axios from '../../libs/ajax';
import ConfigUtils from '../../utils/ConfigUtils';
import { markLoginBrowserSession, clearLoginBrowserSession } from '../../utils/LoginPersistenceUtils';

describe('Test StandardStore', () => {
    it('storeOpts notify is true by default', () => {
        const store = createStore({}, {}, /* storeOpts */{});
        expect(store.addActionListener).toBeTruthy();
    });
    it('addActionListener is not available if storeOpts notify is false', () => {
        const store = createStore({}, {}, /* storeOpts */{ notify: false });
        expect(store.addActionListener).toBeFalsy();
    });
    it('appEpics override standard epics', (done) => {

        const store = createStore({
            appEpics: {
                loadMapConfigAndConfigureMap: ($action) =>
                    $action.ofType(LOAD_MAP_CONFIG).switchMap(() => Observable.of({type: "PONG"}))
            }
        });
        let actions = 0;
        store.addActionListener((action) => {
            actions++;
            if (actions === 2) {
                expect(action.type).toBe("PONG");
                done();
            }
        });
        store.dispatch({
            type: LOAD_MAP_CONFIG
        });
    });
    it("tests that mobile overrides don't merge on desktop", () => {
        const store = createStore({
            initialState: {
                defaultState: {
                    mapInfo: {
                        enabled: true,
                        highlight: true
                    }
                },
                mobile: { // This has been duplicated from product/appConfig.js
                    mapInfo: {enabled: true, infoFormat: 'application/json' },
                    mousePosition: {enabled: true, crs: "EPSG:4326", showCenter: true}
                }
            },
            appReducers: {
                mapInfo: mapInfoReducers,
                browser: browserReducers
            },
            rootReducerFunc: standardRootReducerFunc
        });

        store.dispatch({
            type: CHANGE_BROWSER_PROPERTIES,
            newProperties: {
                mobile: false
            }
        });

        const state = store.getState();
        expect(state.browser.mobile).toBe(false);
        expect(state.mapInfo.enabled).toBe(true);
        expect(state.mapInfo.highlight).toBe(true);
        expect(state.mapInfo.infoFormat).toBe(undefined);
    });
    it("tests that mobile-specific state overrides merge deeply", () => {
        const store = createStore({
            initialState: {
                defaultState: {
                    mapInfo: {
                        highlight: true
                    }
                },
                mobile: { // This has been duplicated from product/appConfig.js
                    mapInfo: {
                        enabled: true,
                        infoFormat: 'application/json'
                    },
                    mousePosition: {
                        enabled: true,
                        crs: "EPSG:4326",
                        showCenter: true
                    }
                }
            },
            appReducers: {
                mapInfo: mapInfoReducers,
                browser: browserReducers
            },
            rootReducerFunc: standardRootReducerFunc
        });

        store.dispatch({
            type: CHANGE_BROWSER_PROPERTIES,
            newProperties: {
                mobile: true
            }
        });

        const state = store.getState();
        expect(state.browser.mobile).toBe(true);
        expect(state.mapInfo.enabled).toBe(true);
        expect(state.mapInfo.highlight).toBe(true);
        expect(state.mapInfo.infoFormat).toBe("application/json");
    });
});

describe('Test StandardStore persist - authHeader not stored', () => {
    const PERSIST_KEY = getItemKey('persistence', 'security');

    beforeEach(() => {
        setApi('memoryStorage');
        getApi().removeItem(PERSIST_KEY);
    });
    afterEach(() => {
        getApi().removeItem(PERSIST_KEY);
    });

    it('authHeader is not written to storage when security state is saved', (done) => {
        const store = createStore(
            { appReducers: { security: securityReducer } },
            {},
            { persist: { whitelist: ['security'] } }
        );
        store.dispatch({ type: 'TEST_ACTION' });
        setTimeout(() => {
            const stored = JSON.parse(getApi().getItem(PERSIST_KEY) || '{}');
            expect(stored.authHeader).toBe(undefined);
            done();
        }, 50);
    });

    it('authHeader already in storage is cleaned up on store initialization', () => {
        getApi().setItem(PERSIST_KEY, JSON.stringify({ user: { name: 'test' }, authHeader: 'Basic dGVzdA==' }));
        createStore(
            { appReducers: { security: securityReducer } },
            {},
            { persist: { whitelist: ['security'] } }
        );
        const stored = JSON.parse(getApi().getItem(PERSIST_KEY) || '{}');
        expect(stored.authHeader).toBe(undefined);
        expect(stored.user).toEqual({ name: 'test' });
    });

    it('authHeader is not present in initial state loaded from storage', () => {
        getApi().setItem(PERSIST_KEY, JSON.stringify({ user: { name: 'test' }, authHeader: 'Basic dGVzdA==' }));
        const store = createStore(
            { appReducers: { security: securityReducer } },
            {},
            { persist: { whitelist: ['security'] } }
        );
        expect(store.getState().security?.authHeader).toBe(undefined);
        expect(store.getState().security?.user).toEqual({ name: 'test' });
    });
});

describe('Test StandardStore persist - loginPersistence', () => {
    const PERSIST_KEY = getItemKey('persistence', 'security');
    const PERSISTED_LOGIN = { user: { name: 'test' }, token: 'persisted-token' };
    let mockAxios;

    const create = () => createStore(
        { appReducers: { security: securityReducer } },
        {},
        { persist: { whitelist: ['security'] } }
    );

    beforeEach(() => {
        setApi('memoryStorage');
        getApi().setItem(PERSIST_KEY, JSON.stringify(PERSISTED_LOGIN));
        mockAxios = new MockAdapter(axios);
        mockAxios.onDelete(/session\/logout/).reply(204);
        clearLoginBrowserSession();
    });
    afterEach(() => {
        getApi().removeItem(PERSIST_KEY);
        mockAxios.restore();
        clearLoginBrowserSession();
        ConfigUtils.removeConfigProp('loginPersistence');
    });

    it('restores the persisted login by default', () => {
        const store = create();
        expect(store.getState().security?.user).toEqual({ name: 'test' });
        expect(mockAxios.history.delete.length).toBe(0);
    });

    it('with browserSession, restores the login of the same browser session', () => {
        ConfigUtils.setConfigProp('loginPersistence', 'browserSession');
        markLoginBrowserSession();
        const store = create();
        expect(store.getState().security?.user).toEqual({ name: 'test' });
        expect(mockAxios.history.delete.length).toBe(0);
    });

    it('with browserSession, drops the login of an earlier browser session and ends it on the server', (done) => {
        ConfigUtils.setConfigProp('loginPersistence', 'browserSession');
        const store = create();
        expect(store.getState().security?.user).toBeFalsy();
        expect(JSON.parse(getApi().getItem(PERSIST_KEY) || '{}').user).toBeFalsy();
        setTimeout(() => {
            try {
                expect(mockAxios.history.delete.length).toBe(1);
                expect(mockAxios.history.delete[0].headers.Authorization).toBe('Bearer persisted-token');
                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });
});
