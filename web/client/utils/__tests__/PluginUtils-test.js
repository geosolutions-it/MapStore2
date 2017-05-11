/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {Provider} = require('react-redux');
const expect = require('expect');
const PluginsUtils = require('../PluginsUtils');
const assign = require('object-assign');
const MapSearchPlugin = require('../../plugins/MapSearch');
const Rx = require('rxjs');
const { ActionsObservable } = require('redux-observable');

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
describe('PluginsUtils', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('combineReducers', () => {
        const P1 = {
            reducers: {
                reducer1: () => {}
            }
        };

        const P2 = {
            reducers: {
                reducer1: (state = {}) => assign({}, state, { A: "A"}),
                reducer2: (state = {}) => state
            }
        };
        const reducers = {
            reducer3: (state = {}) => state
        };
        const spyNo = expect.spyOn(P1.reducers, "reducer1");
        const finalReducer = PluginsUtils.combineReducers([P1, P2], reducers);
        const state = finalReducer();
        expect(state.reducer1).toExist();
        expect(state.reducer1.A).toBe("A");

        // test overriding
        expect(spyNo.calls.length).toBe(0);
    });
    it('getPluginDescriptor', () => {
        const P1 = assign( () => {}, {
            reducers: {
                reducer1: () => {}
            }
        });
        const item = {
            test: "TEST"
        };
        const P2 = assign( () => {}, {
            P1: item,
            reducers: {
                reducer1: () => ({ A: "A"}),
                reducer2: () => {}
            }
        });
        const cfg = {
            test: "TEST"
        };
        let desc1 = PluginsUtils.getPluginDescriptor({}, {P1Plugin: P1, P2Plugin: P2}, [{name: "P1", cfg}, "P2"], "P1" );
        expect(desc1).toExist();
        expect(desc1.id).toBe("P1");
        expect(desc1.name).toBe("P1");
        expect(desc1.cfg).toExist(cfg);
        expect(desc1.items.length).toBe(1);
        expect(desc1.items[0].test).toBe(item.test);
        expect(desc1.items[0].cfg).toExist();

    });
    it('combineEpics', () => {
        const plugins = {MapSearchPlugin: MapSearchPlugin};
        const appEpics = {appEpics: (actions$) => actions$.ofType('TEST_ACTION').map(() => ({type: "NEW_ACTION_TEST"}))};
        const epics = PluginsUtils.combineEpics(plugins, appEpics);
        expect(typeof epics ).toEqual('function');
    });
    it('combineEpics with defaultEpicWrapper', (done) => {
        const plugins = {MapSearchPlugin: MapSearchPlugin};
        const appEpics = {
            appEpics: (actions$) => actions$.filter( a => a.type === 'TEST_ACTION').map(() => ({type: "RESPONSE"})),
            appEpics2: (actions$) => actions$.filter( a => a.type === 'TEST_ACTION1').map(() => {throw new Error(); })};
        const epics = PluginsUtils.combineEpics(plugins, appEpics);
        expect(typeof epics ).toEqual('function');
        epicTest(epics, 1, [{type: 'TEST_ACTION1'}, {type: 'TEST_ACTION'}], actions => {
            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe("RESPONSE");
            done();
        });
    });

    it('combineEpics with custom wrapper', (done) => {
        const plugins = {MapSearchPlugin: MapSearchPlugin};
        let counter = 0;
        const appEpics = {
            appEpics: (actions$) => actions$.filter( a => a.type === 'TEST_ACTION').map(() => ({type: "RESPONSE"}))};
        const epics = PluginsUtils.combineEpics(plugins, appEpics, epic => (...args) => {counter++; return epic(...args); });
        epicTest( epics, 1, [{type: 'TEST_ACTION1'}, {type: 'TEST_ACTION'}], () => {
            expect(counter).toBe(1);
            done();
        });
    });

    it('connect', () => {
        const MyComponent = (props) => <div>{props.test}</div>;
        const Connected = PluginsUtils.connect((state) => ({test: state.test}), {})(MyComponent);
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({
                test: "statetest"
            })
        };
        const app = ReactDOM.render(<Provider store={store}><Connected test="propstest" pluginCfg={{test: "plugintest"}}/></Provider>, document.getElementById("container"));
        const domElement = ReactDOM.findDOMNode(app);
        expect(domElement.innerText).toBe("plugintest");
    });
    it('handleExpression', () => {
        expect(PluginsUtils.handleExpression({state1: "test1"}, {context1: "test2"}, "{state.state1 + ' ' + context.context1}")).toBe("test1 test2");
    });
    it('filterState', () => {
        expect(PluginsUtils.filterState({state1: "test1"}, [{name: "A", path: "state1"}]).A).toBe("test1");
    });
    it('filterDisabledPlugins', () => {
        expect(PluginsUtils.filterDisabledPlugins(
            {plugin: {
                disablePluginIf: "{true}"
            }},
            {},
            {}
        )).toBe(false);

        // check ignore other items, if any
        expect(PluginsUtils.filterDisabledPlugins(
            {},
            {},
            {}
        )).toBe(true);
    });
    it('getMonitoredState', () => {
        expect(PluginsUtils.getMonitoredState({maptype: {mapType: "leaflet"}}).mapType).toBe("leaflet");
    });

    it('handleExpression', () => {
        expect(PluginsUtils.handleExpression({state1: "test1"}, {context1: "test2"}, "{state.state1 + ' ' + context.context1}")).toBe("test1 test2");
    });
    it('dispatch', () => {
        const expr = PluginsUtils.handleExpression(() => ({
            dispatch: (action) => action
        }), {context1: "test2"}, "{dispatch((function() { return 'test'; }))}");

        expect(expr).toExist();
        expect(expr()).toBe("test");
    });
});
