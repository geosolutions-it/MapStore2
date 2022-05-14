/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ReactDOM from 'react-dom';
import expect from 'expect';
import {
    PERSISTED_STORE_NAME,
    setStore,
    getStore,
    createStore,
    updateStore,
    augmentStore
} from '../StateUtils';
import Rx from 'rxjs';
import { setConfigProp } from '../ConfigUtils';

describe('StateUtils', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
        setStore(null);
        setStore(null, 'customname');
    });

    it('default store persistence', () => {
        const mystore = {
            name: 'mystore'
        };
        setStore(mystore);
        expect(getStore()).toExist();
        expect(getStore().name).toBe('mystore');
    });

    it('named store persistence', () => {
        const mystore = {
            name: 'mystore'
        };
        setStore(mystore, 'customname');
        expect(getStore().name).toNotExist();
        expect(getStore('customname')).toExist();
        expect(getStore('customname').name).toBe('mystore');
    });

    it('createStore with rootReducer', () => {
        const spy1 = expect.createSpy().andCall((action, state) => state);
        const store = createStore({ rootReducer: spy1 });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({type: "fake"});
        expect(spy1.calls.length > 0).toBe(true);
    });

    it('createStore with reducers list', () => {
        const spy1 = expect.createSpy().andCall((action, state) => state);
        const store = createStore({ reducers: {test: spy1} });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({ type: "fake" });
        expect(spy1.calls.length > 0).toBe(true);
    });

    it('createStore with rootEpic', () => {
        const spy1 = expect.createSpy().andCall((actions$) => actions$.ofType("fake").switchMap(() => Rx.Observable.empty()));
        const store = createStore({ rootEpic: spy1 });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({ type: "fake" });
        expect(spy1.calls.length > 0).toBe(true);
    });

    it('createStore with epics list', () => {
        const spy1 = expect.createSpy().andCall((actions$) => actions$.ofType("fake").switchMap(() => Rx.Observable.empty()));
        const store = createStore({ epics: {myepic: spy1} });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({ type: "fake" });
        expect(spy1.calls.length > 0).toBe(true);
    });

    it('createStore with initial state', () => {
        const spy1 = expect.createSpy().andCall((action, state) => state);
        const store = createStore({ rootReducer: spy1, state: {prop: 'value'} });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({ type: "fake" });
        expect(spy1.calls.length > 0).toBe(true);
        expect(spy1.calls[0].arguments[0].prop).toBe('value');
    });
    it('updateStore with rootReducer', () => {
        const spy1 = expect.createSpy().andCall((action, state) => state);
        const spy2 = expect.createSpy().andCall((action, state) => state);
        const store = createStore({ rootReducer: spy1 });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({ type: "fake" });
        const beforeUpdateCalls = spy1.calls.length;
        expect(beforeUpdateCalls > 0).toBe(true);
        expect(spy2.calls.length > 0).toBe(false);
        updateStore({rootReducer: spy2}, store);
        store.dispatch({ type: "fake" });
        expect(spy2.calls.length > 0).toBe(true);
        expect(spy1.calls.length).toBe(beforeUpdateCalls);
    });
    it('updateStore with reducers', () => {
        const spy1 = expect.createSpy().andCall((action, state) => state);
        const spy2 = expect.createSpy().andCall((action, state) => state);
        const store = createStore({ reducers: { test: spy1 } });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({ type: "fake" });
        const beforeUpdateCalls = spy1.calls.length;
        expect(beforeUpdateCalls > 0).toBe(true);
        expect(spy2.calls.length > 0).toBe(false);
        updateStore({ reducers: { test: spy2 } }, store);
        store.dispatch({ type: "fake" });
        expect(spy2.calls.length > 0).toBe(true);
        expect(spy1.calls.length).toBe(beforeUpdateCalls);
    });

    it('updateStore with rootEpic', () => {
        const spy1 = expect.createSpy().andCall((actions$) => actions$.ofType("fake").switchMap(() => Rx.Observable.empty()));
        const spy2 = expect.createSpy().andCall((actions$) => actions$.ofType("fake").switchMap(() => Rx.Observable.empty()));
        const store = createStore({ rootEpic: spy1 });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({ type: "fake" });
        const beforeUpdateCalls = spy1.calls.length;
        expect(beforeUpdateCalls > 0).toBe(true);
        expect(spy2.calls.length > 0).toBe(false);
        updateStore({ rootEpic: spy2 }, store);
        store.dispatch({ type: "fake" });
        expect(spy2.calls.length > 0).toBe(true);
        expect(spy1.calls.length).toBe(beforeUpdateCalls);
    });
    it('updateStore with epics', () => {
        const spy1 = expect.createSpy().andCall((actions$) => actions$.ofType("fake").switchMap(() => Rx.Observable.empty()));
        const spy2 = expect.createSpy().andCall((actions$) => actions$.ofType("fake").switchMap(() => Rx.Observable.empty()));
        const store = createStore({ epics: { myepic: spy1 } });
        expect(store).toExist();
        expect(store.dispatch).toExist();
        store.dispatch({ type: "fake" });
        const beforeUpdateCalls = spy1.calls.length;
        expect(beforeUpdateCalls > 0).toBe(true);
        expect(spy2.calls.length > 0).toBe(false);
        updateStore({ epics: { myepic: spy2 } }, store);
        store.dispatch({ type: "fake" });
        expect(spy2.calls.length > 0).toBe(true);
        expect(spy1.calls.length).toBe(beforeUpdateCalls);
    });
    it('augmentStore should add all reducers if called many times', () => {
        const rootReducer = () => ({});
        let currentReducer = rootReducer;
        setConfigProp(PERSISTED_STORE_NAME + '.rootReducer', rootReducer);
        const store = {
            replaceReducer: (reducer) => {
                currentReducer = reducer;
            }
        };
        augmentStore({ reducers: {
            map: () => {
                return {};
            }
        }}, store);
        augmentStore({ reducers: {
            controls: () => {
                return {};
            }
        } }, store);
        const newState = currentReducer({}, {});
        expect(Object.keys(newState)).toEqual([ 'map', 'controls' ]);
        setConfigProp(PERSISTED_STORE_NAME + '.rootReducer', undefined);
    });
    it('should use the new added reducers (augmentStore)', () => {
        const rootReducer = () => ({});
        setConfigProp(PERSISTED_STORE_NAME + '.rootReducer', rootReducer);
        const store = {
            replaceReducer: (reducer) => {
                reducer();
            }
        };
        let reducersKeys = [];
        augmentStore({ reducers: {
            map: () => {
                reducersKeys.push('map');
                return {};
            },
            controls: () => {
                reducersKeys.push('controls');
                return {};
            }
        } }, store);
        expect(reducersKeys).toEqual([ 'map', 'controls' ]);
        setConfigProp(PERSISTED_STORE_NAME + '.rootReducer', undefined);
    });
    it('should not use the new added reducers if they are available in the root reducer (augmentStore)', () => {
        const rootReducer = () => ({
            map: () => ({})
        });
        setConfigProp(PERSISTED_STORE_NAME + '.rootReducer', rootReducer);
        const store = {
            replaceReducer: (reducer) => {
                reducer();
            }
        };
        let reducersKeys = [];
        augmentStore({ reducers: {
            map: () => {
                reducersKeys.push('map');
                return {};
            },
            controls: () => {
                reducersKeys.push('controls');
                return {};
            }
        } }, store);
        expect(reducersKeys).toEqual([ 'controls' ]);
        setConfigProp(PERSISTED_STORE_NAME + '.rootReducer', undefined);
    });
});
