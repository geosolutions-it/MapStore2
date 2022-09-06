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
    setStore,
    getStore,
    createStore,
    updateStore,
    createStoreManager
} from '../StateUtils';
import {createEpicMiddleware} from "redux-observable";
import Rx from 'rxjs';
import {REDUCERS_LOADED, reducersLoaded} from "../../actions/storemanager";

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

    describe('storeManager', () => {
        let storeManager;
        let epicMiddleware;
        beforeEach(() => {
            storeManager = createStoreManager({}, {});
            epicMiddleware = createEpicMiddleware(storeManager.rootEpic);
            createStore({
                rootReducer: (action, state) => state,
                state: {},
                middlewares: [epicMiddleware]
            });
            storeManager.addEpics('test', {
                epic1: (action$) =>
                    action$.ofType('TEST')
                        .switchMap(() => {
                            return Rx.Observable.empty();
                        }),
                epic2: (action$) =>
                    action$.ofType('TEST')
                        .switchMap(() => {
                            return Rx.Observable.empty();
                        })
            });
        });
        afterEach(() => {
            storeManager = {};
        });

        it('addEpics and verify they are isolated', (done) => {
            const subjects = storeManager.getEpicsRegistry().muteState;
            expect(subjects.epic1).toExist();
            expect(subjects.epic2).toExist();
            done();
        });
        it('addEpics and verify they are added into registry', (done) => {
            const added = storeManager.getEpicsRegistry().addedEpics;
            expect(added.epic1).toBe('testPlugin');
            expect(added.epic2).toBe('testPlugin');
            done();
        });
        it('add same epics from two different plugins and make sure both of them are counted upon epic mute/unmute', (done) => {
            storeManager.addEpics('test2', {
                epic1: (action$) =>
                    action$.ofType('TEST')
                        .switchMap(() => {
                            return Rx.Observable.empty();
                        })
            });
            const listenedBy = storeManager.getEpicsRegistry().epicsListenedBy;
            expect(listenedBy.epic1.length).toBe(2);
            expect(listenedBy.epic2.length).toBe(1);
            done();
        });
        it('add same epics from two different plugins and make sure that all of the epics are properly grouped per plugin', (done) => {
            storeManager.addEpics('test2', {
                epic1: (action$) =>
                    action$.ofType('TEST')
                        .switchMap(() => {
                            return Rx.Observable.empty();
                        })
            });
            const groupedByModule = storeManager.getEpicsRegistry().groupedByModule;
            expect(groupedByModule.testPlugin).toInclude('epic1');
            expect(groupedByModule.testPlugin).toInclude('epic2');
            expect(groupedByModule.test2Plugin).toInclude('epic1');
            done();
        });
        it('add same epics from two different plugins and make sure that repetitive epic is getting registered only from the first plugin attempting to register it', (done) => {
            storeManager.addEpics('test2', {
                epic1: (action$) =>
                    action$.ofType('TEST')
                        .switchMap(() => {
                            return Rx.Observable.empty();
                        })
            });
            const addedEpics = storeManager.getEpicsRegistry().addedEpics;
            expect(addedEpics.epic1).toBe('testPlugin');
            expect(addedEpics.epic2).toBe('testPlugin');
            done();
        });
        it('mute epic when plugin is missing on the page, assure that it updates listeners list', (done) => {
            storeManager.addEpics('test2', {
                epic1: (action$) =>
                    action$.ofType('TEST')
                        .switchMap(() => {
                            return Rx.Observable.empty();
                        })
            });
            storeManager.muteEpics('testPlugin');
            const listenedBy = storeManager.getEpicsRegistry().epicsListenedBy;
            expect(listenedBy.epic1.length).toBe(1);
            expect(listenedBy.epic2.length).toBe(0);
            done();
        });
        it('unmute epic when plugin is added back to the page, assure that it updates listeners list', (done) => {
            storeManager.addEpics('test2', {
                epic1: (action$) =>
                    action$.ofType('TEST')
                        .switchMap(() => {
                            return Rx.Observable.empty();
                        })
            });
            storeManager.muteEpics('testPlugin');
            storeManager.unmuteEpics('testPlugin');
            const listenedBy = storeManager.getEpicsRegistry().epicsListenedBy;
            expect(listenedBy.epic1.length).toBe(2);
            expect(listenedBy.epic2.length).toBe(1);
            done();
        });
    });

    it('test reducersLoaded action creator', (done) => {
        const reducers = ['a', 'b'];
        const action = reducersLoaded(reducers);
        expect(action.reducers).toEqual(reducers);
        expect(action.type).toBe(REDUCERS_LOADED);
        done();
    });
});
