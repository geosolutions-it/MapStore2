/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import expect from 'expect';
import PluginsUtils from '../PluginsUtils';
import assign from 'object-assign';
import axios from '../../libs/ajax';

import MapSearchPlugin from '../../plugins/MapSearch';

import { testEpic } from '../../epics/__tests__/epicTestUtils';


const defaultState = () => {
    return {};
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
    it('getPluginDescriptor functional component', () => {
        const Component = () => {
            return <div>hello</div>;
        };
        const P1 = PluginsUtils.createPlugin('P1', {
            component: Component
        });
        const desc1 = PluginsUtils.getPluginDescriptor({}, P1, ["P1"], "P1");
        expect(desc1).toExist();
        expect(desc1.id).toBe("P1");
        expect(desc1.name).toBe("P1");
        expect(desc1.impl).toBe(Component);
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

    it('getPluginItems', () => {
        const plugins = {
            Test1Plugin: {
                Container1: {
                    priority: 1
                },
                Container2: {
                    priority: 1
                }
            },
            Container1Plugin: {},
            Container2Plugin: {}
        };

        const pluginsConfig = [{
            name: "Test1"
        }, "Container1", "Container2"];
        const items1 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container1", "Container1", true, []);
        expect(items1.length).toBe(1);
        const items2 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container2", "Container2", true, []);
        expect(items2.length).toBe(1);
    });

    it('getPluginItems with showIn', () => {
        const plugins = {
            Test1Plugin: {
                Container1: {
                    priority: 1
                },
                Container2: {
                    priority: 1
                }
            },
            Container1Plugin: {},
            Container2Plugin: {}
        };

        const pluginsConfig = [{
            name: "Test1",
            showIn: ['Container1']
        }, "Container1", "Container2"];
        const items1 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container1", "Container1", true, []);
        expect(items1.length).toBe(1);
        const items2 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container2", "Container2", true, []);
        expect(items2.length).toBe(0);
    });

    it('getPluginItems with hideFrom', () => {
        const plugins = {
            Test1Plugin: {
                Container1: {
                    priority: 1
                },
                Container2: {
                    priority: 1
                }
            },
            Container1Plugin: {},
            Container2Plugin: {}
        };

        const pluginsConfig = [{
            name: "Test1",
            hideFrom: ['Container1']
        }, "Container1", "Container2"];
        const items1 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container1", "Container1", true, []);
        expect(items1.length).toBe(0);
        const items2 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container2", "Container2", true, []);
        expect(items2.length).toBe(1);
    });

    it('getPluginItems with priority', () => {
        const plugins = {
            Test1Plugin: {
                Container1: {
                    priority: 1
                },
                Container2: {
                    priority: 2
                }
            },
            Container1Plugin: {},
            Container2Plugin: {}
        };

        const pluginsConfig = [{
            name: "Test1"
        }, "Container1", "Container2"];
        const items1 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container1", "Container1", true, []);
        expect(items1.length).toBe(0);
        const items2 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container2", "Container2", true, []);
        expect(items2.length).toBe(1);
    });

    it('getPluginItems with overridden priority', () => {
        const plugins = {
            Test1Plugin: {
                Container1: {
                    priority: 1
                },
                Container2: {
                    priority: 2
                }
            },
            Container1Plugin: {},
            Container2Plugin: {}
        };

        const pluginsConfig = [{
            name: "Test1",
            override: {
                Container1: {
                    priority: 3
                }
            }
        }, "Container1", "Container2"];
        const items1 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container1", "Container1", true, []);
        expect(items1.length).toBe(1);
        const items2 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container2", "Container2", true, []);
        expect(items2.length).toBe(0);
    });

    it('getPluginItems with disabled plugin', () => {
        const plugins = {
            Test1Plugin: {
                Container1: {
                    priority: 1
                },
                Container2: {
                    priority: 2
                }
            },
            Container1Plugin: {},
            Container2Plugin: {}
        };

        const pluginsConfig = [{
            name: "Test1",
            "cfg": {
                disablePluginIf: "{true}"
            }
        }, "Container1", "Container2"];
        const items1 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container1", "Container1", true, []);
        expect(items1.length).toBe(0);
        const items2 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container2", "Container2", true, []);
        expect(items2.length).toBe(0);
    });

    it('getPluginItems with filtered plugin', () => {
        const plugins = {
            Test1Plugin: {
                Container1: {
                    priority: 1
                },
                Container2: {
                    priority: 2
                }
            },
            Container1Plugin: {},
            Container2Plugin: {}
        };

        const pluginsConfig = [{
            name: "Test1",
            disablePluginIf: "{true}"
        }, "Container1", "Container2"];
        const items1 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container1", "Container1", true, [], () => false);
        expect(items1.length).toBe(0);
        const items2 = PluginsUtils.getPluginItems(defaultState, plugins, pluginsConfig, "Container2", "Container2", true, [], () => false);
        expect(items2.length).toBe(0);
    });

    it('dispatch', () => {
        const expr = PluginsUtils.handleExpression(() => ({
            dispatch: (action) => action
        }), {context1: "test2"}, "{dispatch((function() { return 'test'; }))}");

        expect(expr).toExist();
        expect(expr()).toBe("test");
    });

    it('createPlugin', () => {
        const plugin = PluginsUtils.createPlugin('My', {
            component: {
                myprop: {}
            },
            containers: {
                Container: {}
            },
            reducers: {myreducer: {}},
            epics: {myepic: {}},
            options: {myoption: {}}
        });
        expect(plugin.MyPlugin).toExist();
        expect(plugin.MyPlugin.isMapStorePlugin).toBe(true);
        expect(plugin.MyPlugin.myprop).toExist();
        expect(plugin.MyPlugin.Container).toExist();
        expect(plugin.MyPlugin.myoption).toExist();
        expect(plugin.reducers).toExist();
        expect(plugin.epics).toExist();
    });

    it('createPlugin lazy', (done) => {
        const plugin = PluginsUtils.createPlugin('My', {
            lazy: true,
            enabler: (state) => state.my.enabled,
            loader: () => new Promise((resolve) => {
                resolve({
                    myproperty: true
                });
            }),
            containers: {
                Container: {}
            },
            reducers: { myreducer: {} },
            epics: { myepic: {} },
            options: { myoption: {} }
        });
        expect(plugin.MyPlugin).toExist();
        expect(plugin.MyPlugin.Container).toExist();
        expect(plugin.MyPlugin.myoption).toExist();
        expect(plugin.MyPlugin.enabler).toExist();
        expect(plugin.MyPlugin.loadPlugin).toExist();
        expect(plugin.reducers).toExist();
        expect(plugin.epics).toExist();
        expect(plugin.MyPlugin.enabler({
            my: {
                enabled: true
            }
        })).toBe(true);
        plugin.MyPlugin.loadPlugin(resp => {
            expect(resp).toExist();
            expect(resp.myproperty).toBe(true);
            expect(resp.isMapStorePlugin).toBe(true);
            done();
        });
    });

    it('importPlugin', (done) => {
        axios.get('base/web/client/test-resources/lazy/dummy.js').then(source => {
            PluginsUtils.importPlugin(source.data, (name, plugin) => {
                expect(name).toBe('Dummy');
                plugin.loadPlugin((pluginDef) => {
                    expect(pluginDef).toExist();
                    expect(pluginDef.component).toExist();
                    done();
                });
            });
        });
    });

    it('loadPlugin', (done) => {
        PluginsUtils.loadPlugin('base/web/client/test-resources/lazy/dummy.js').then(({name, plugin}) => {
            expect(name).toBe('Dummy');
            plugin.loadPlugin((pluginDef) => {
                expect(pluginDef).toExist();
                expect(pluginDef.component).toExist();
                done();
            });
        });
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
        const finalReducer = PluginsUtils.combineReducers([P1, P2], reducers);
        const state = finalReducer();
        expect(state.reducer1).toExist();
        expect(state.reducer1.A).toBe("A");

        // test overriding
        expect(spyNo.calls.length).toBe(0);
    });

    it('combineEpics', () => {
        const plugins = { MapSearchPlugin: MapSearchPlugin };
        const appEpics = { appEpics: (actions$) => actions$.ofType('TEST_ACTION').map(() => ({ type: "NEW_ACTION_TEST" })) };
        const epics = PluginsUtils.combineEpics(plugins, appEpics);
        expect(typeof epics).toEqual('function');
    });
    it('combineEpics with defaultEpicWrapper', (done) => {
        const plugins = { MapSearchPlugin: MapSearchPlugin };
        const appEpics = {
            appEpics: (actions$) => actions$.filter(a => a.type === 'TEST_ACTION').map(() => ({ type: "RESPONSE" })),
            appEpics2: (actions$) => actions$.filter(a => a.type === 'TEST_ACTION1').map(() => { throw new Error(); })
        };
        const epics = PluginsUtils.combineEpics(plugins, appEpics);
        expect(typeof epics).toEqual('function');
        testEpic(epics, 1, [{ type: 'TEST_ACTION1' }, { type: 'TEST_ACTION' }], actions => {
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
        const epics = PluginsUtils.combineEpics(
            plugins,
            appEpics,
            epic => (...args) => { counter++; return epic(...args); }
        );
        testEpic(epics, 1, [{ type: 'TEST_ACTION1' }, { type: 'TEST_ACTION' }], () => {
            expect(counter).toBe(1);
            done();
        });
    });
});
