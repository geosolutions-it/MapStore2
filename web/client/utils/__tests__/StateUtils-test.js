/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ReactDOM from 'react-dom';
import expect from 'expect';
import {combineReducers, combineEpics, setStore, getStore, createStore, updateStore} from '../StateUtils';
import MapSearchPlugin from '../../plugins/MapSearch';
import Rx, { Observable } from 'rxjs';
import { ActionsObservable } from 'redux-observable';

const epicTest = (epic, count, action, callback, state = {}) => {
    const actions = new Rx.Subject();
    const actions$ = new ActionsObservable(actions);
    const store = { getState: () => state };
    epic(actions$, store)
        .take(count)
        .toArray()
        .subscribe(callback);
    if (action.length) {
        action.map(act => actions.next(act));
    } else {
        actions.next(action);
    }
};

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
    it('combineReducers', () => {
        const P1 = {
            reducers: {
                reducer1: () => { }
            }
        };

        const P2 = {
            reducers: {
                reducer1: (state = {}) => ({...state, A: "A" }),
                reducer2: (state = {}) => state
            }
        };
        const reducers = {
            reducer3: (state = {}) => state
        };
        const spyNo = expect.spyOn(P1.reducers, "reducer1");
        const finalReducer = combineReducers([P1, P2], reducers);
        const state = finalReducer();
        expect(state.reducer1).toExist();
        expect(state.reducer1.A).toBe("A");

        // test overriding
        expect(spyNo.calls.length).toBe(0);
    });

    it('combineEpics', () => {
        const plugins = { MapSearchPlugin: MapSearchPlugin };
        const appEpics = { appEpics: (actions$) => actions$.ofType('TEST_ACTION').map(() => ({ type: "NEW_ACTION_TEST" })) };
        const epics = combineEpics(plugins, appEpics);
        expect(typeof epics).toEqual('function');
    });
    it('combineEpics with defaultEpicWrapper', (done) => {
        const plugins = { MapSearchPlugin: MapSearchPlugin };
        const appEpics = {
            appEpics: (actions$) => actions$.filter(a => a.type === 'TEST_ACTION').map(() => ({ type: "RESPONSE" })),
            appEpics2: (actions$) => actions$.filter(a => a.type === 'TEST_ACTION1').map(() => { throw new Error(); })
        };
        const epics = combineEpics(plugins, appEpics);
        expect(typeof epics).toEqual('function');
        epicTest(epics, 1, [{ type: 'TEST_ACTION1' }, { type: 'TEST_ACTION' }], actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe("RESPONSE");
            done();
        });
    });

    it('combineEpics with custom wrapper', (done) => {
        const plugins = { MapSearchPlugin: MapSearchPlugin };
        let counter = 0;
        const appEpics = {
            appEpics: (actions$) => actions$.filter(a => a.type === 'TEST_ACTION').map(() => ({ type: "RESPONSE" }))
        };
        const epics = combineEpics(plugins, appEpics, epic => (...args) => { counter++; return epic(...args); });
        epicTest(epics, 1, [{ type: 'TEST_ACTION1' }, { type: 'TEST_ACTION' }], () => {
            expect(counter).toBe(1);
            done();
        });
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

    it('createStore with reducers from plugins list', () => {
        const spy1 = expect.createSpy().andCall((action, state) => state);
        const store = createStore({ plugins: [{
            reducers: {
                test: spy1
            }
        }]});
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

    it('createStore with epics from plugins list', () => {
        const spy1 = expect.createSpy().andCall((actions$) => actions$.ofType("fake").switchMap(() => Rx.Observable.empty()));
        const store = createStore({ plugins: [{epics: { myepic: spy1 }}] });
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
});
