/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const PropTypes = require('prop-types');
const React = require('react');
const ReactDOM = require('react-dom');
const StandardApp = require('../StandardApp');

const ConfigUtils = require('../../../utils/ConfigUtils');
const {LOAD_EXTENSIONS, PLUGIN_UNINSTALLED} = require('../../../actions/contextcreator');
const MockAdapter = require("axios-mock-adapter");
const axios = require("../../../libs/ajax");
const {setStore} = require('../../../utils/StateUtils');

let mockAxios;

class mycomponent extends React.Component {
    static propTypes = {
        plugins: PropTypes.object
    };

    static defaultProps = {
        plugins: {}
    };

    renderPlugins = () => {
        return Object.keys(this.props.plugins).map((plugin) => <div className={plugin}/>);
    };

    render() {
        return (<div className="mycomponent">
            {this.renderPlugins()}
        </div>);
    }
}

describe('StandardApp', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        ConfigUtils.setConfigProp("extensionsFolder", "");
        ConfigUtils.setLocalConfigurationFile('base/web/client/test-resources/localConfig.json');
        setTimeout(done);
    });

    afterEach((done) => {
        if (mockAxios) {
            mockAxios.restore();
        }
        mockAxios = null;
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        ConfigUtils.setLocalConfigurationFile('localConfig.json');
        ConfigUtils.setConfigProp("persisted.reduxStore", undefined);
        setTimeout(done);
    });

    it('creates a default app', () => {
        const app = ReactDOM.render(<StandardApp/>, document.getElementById("container"));
        expect(app).toExist();
    });

    it('creates a default app with onInit', (done) => {
        const init = {
            onInit: (cfg) => {
                expect(cfg).toExist();
                done();
            }
        };
        let app = ReactDOM.render(<StandardApp onInit={init.onInit}/>, document.getElementById("container"));
        expect(app).toExist();
    });

    it('creates a default app with the given store creator', (done) => {
        const store = () => ({
            dispatch() {
                done();
            },
            getState() {
                return {};
            },
            subscribe() {
            }
        });


        const app = ReactDOM.render(<StandardApp appStore={store}/>, document.getElementById("container"));
        expect(app).toExist();
    });

    it('creates a default app and runs the initial actions', (done) => {
        const myaction = (param) => {
            return param;
        };
        const store = () => ({
            dispatch(value) {
                if (value === 10) {
                    done();
                }
            },
            getState() {
                return {};
            },
            subscribe() {
            }
        });


        const app = ReactDOM.render(<StandardApp appStore={store} initialActions={[myaction.bind(null, 10)]}/>, document.getElementById("container"));
        expect(app).toExist();
    });

    it('creates a default app and reads initialState from localConfig', (done) => {
        const store = (plugins, storeOpts) => {
            expect(storeOpts.initialState.defaultState.test).toExist();
            expect(storeOpts.initialState.defaultState.testMode).toBe('EXPRESSION_MODE_desktop');
            done();
            return {
                dispatch() {
                },
                getState() {
                    return {};
                },
                subscribe() {
                }
            };
        };

        const storeOpts = {
            initialState: {
                defaultState: {
                    test: "test"
                },
                mobile: {}
            }
        };
        const app = ReactDOM.render(<StandardApp appStore={store} storeOpts={storeOpts}/>, document.getElementById("container"));
        expect(app).toExist();
    });

    it('creates a default app and reads initialState with mode', (done) => {
        const store = (plugins, storeOpts) => {
            expect(storeOpts.initialState.defaultState.testMode).toBe('EXPRESSION_MODE_TEST');
            done();
            return {
                dispatch() {
                },
                getState() {
                    return {};
                },
                subscribe() {
                }
            };
        };

        const storeOpts = {
            initialState: {
                defaultState: {
                    test: "NOTHING"

                },
                mobile: {}
            }
        };
        const app = ReactDOM.render(<StandardApp mode={'TEST'} appStore={store} storeOpts={storeOpts} />, document.getElementById("container"));
        expect(app).toExist();
    });

    it('test the parseInitialState func', (done) => {
        const store = (plugins, storeOpts) => {
            expect(storeOpts.initialState.defaultState.test).toExist();
            done();
            return {
                dispatch() {
                },
                getState() {
                    return {};
                },
                subscribe() {
                }
            };
        };

        const valueArr1 = "valueArr1";
        const valueArr2 = "valueArr2";
        const innerObjTestValue = "innerObjTestValue";
        const storeOpts = {
            initialState: {
                defaultState: {
                    test: "test",
                    withArrayEmpty: [],
                    withArray: [valueArr1],
                    withArrayObj: [valueArr2, {
                        innerObjTest: innerObjTestValue
                    }]
                },
                mobile: {}
            }
        };
        const app = ReactDOM.render(<StandardApp appStore={store} storeOpts={storeOpts}/>, document.getElementById("container"));
        expect(app).toExist();
        const parsedInitialState = app.parseInitialState(storeOpts.initialState, {});
        expect(parsedInitialState.defaultState.withArray.length).toBe(1);
        expect(parsedInitialState.defaultState.withArrayEmpty.length).toBe(0);
        expect(parsedInitialState.defaultState.withArray[0]).toBe(valueArr1);
        expect(parsedInitialState.defaultState.withArrayObj.length).toBe(2);
        expect(parsedInitialState.defaultState.withArrayObj[0]).toBe(valueArr2);
        expect(parsedInitialState.defaultState.withArrayObj[1].innerObjTest).toBe(innerObjTestValue);
    });

    it('creates a default app and renders the given component', () => {
        const store = () => ({
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        });
        const oldLoad = ConfigUtils.loadConfiguration;
        try {
            ConfigUtils.loadConfiguration = () => ({
                then: (callback) => {
                    callback({});
                }
            });
            const app = ReactDOM.render(<StandardApp appStore={store} appComponent={mycomponent}/>, document.getElementById("container"));
            expect(app).toExist();

            const dom = ReactDOM.findDOMNode(app);
            expect(dom.className).toBe('mycomponent');
        } finally {
            ConfigUtils.loadConfiguration = oldLoad;
        }
    });

    it('creates a default app and configures plugins', () => {
        const pluginsDef = {
            plugins: {
                MyPlugin: {
                    MyPlugin: {},
                    reducers: {}
                }
            },
            requires: {}
        };

        const store = () => ({
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        });
        const oldLoad = ConfigUtils.loadConfiguration;
        try {
            ConfigUtils.loadConfiguration = () => ({
                then: (callback) => {
                    callback({});
                }
            });

            const app = ReactDOM.render(<StandardApp appStore={store} appComponent={mycomponent} pluginsDef={pluginsDef}/>, document.getElementById("container"));
            expect(app).toExist();

            const dom = ReactDOM.findDOMNode(app);
            expect(dom.getElementsByClassName('MyPlugin').length).toBe(1);
        } finally {
            ConfigUtils.loadConfiguration = oldLoad;
        }
    });
    it('extensions plugins are available if extensions are enabled', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(/localconfig/i).reply(200, {});
        mockAxios.onGet(/extensions\.json/i).reply(200, {
            MyPlugin: {
                bundle: "myplugin.js"
            }
        });
        mockAxios.onGet(/myplugin/i).reply(200, "(window.webpackJsonp = window.webpackJsonp || []).push([[\"myplugin\"], {\"Extension.jsx\": function(e, n, t) {n.default = {name: \"My\"};}}]);");
        const store = () => ({
            dispatch() { },
            getState() {
                return {};
            },
            subscribe() {
            },
            replaceReducer: () => {}
        });
        setStore(store());
        const MyApp = ({plugins}) => {
            expect(plugins.MyPlugin).toExist();
            done();
        };

        const app = ReactDOM.render(<StandardApp appComponent={MyApp} appStore={store} enableExtensions />, document.getElementById("container"));
        expect(app).toExist();
    });

    it('extensions.json is loaded if extensions are enabled', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet().reply(200, {});
        const store = () => ({
            dispatch() { },
            getState() {
                return {};
            },
            subscribe() {
            }
        });

        const app = ReactDOM.render(<StandardApp appStore={store} enableExtensions />, document.getElementById("container"));
        expect(app).toExist();
        setTimeout(() => {
            expect(mockAxios.history.get.length).toBe(2);
            expect(mockAxios.history.get[1].url).toBe("extensions.json");
            done();
        }, 0);
    });
    it('extensions.json is not loaded if extensions are not enabled', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet().reply(200, {});
        const store = () => ({
            dispatch() { },
            getState() {
                return {};
            },
            subscribe() {
            }
        });


        const app = ReactDOM.render(<StandardApp appStore={store} enableExtensions={false} />, document.getElementById("container"));
        expect(app).toExist();
        setTimeout(() => {
            expect(mockAxios.history.get.length).toBe(1);
            expect(mockAxios.history.get[0].url).toNotBe("extensions.json");
            done();
        }, 0);
    });
    it('LOAD_EXTENSIONS actions triggers reloading the extensions.json registry', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet().reply(200, {});
        const store = () => ({
            dispatch() {},
            getState() {
                return {};
            },
            subscribe() {
            },
            addActionListener(listener) {
                listener({
                    type: LOAD_EXTENSIONS
                });
            }
        });

        const app = ReactDOM.render(<StandardApp appStore={store} enableExtensions/>, document.getElementById("container"));
        expect(app).toExist();
        setTimeout(() => {
            expect(mockAxios.history.get.length).toBe(3);
            expect(mockAxios.history.get[1].url).toBe("extensions.json");
            expect(mockAxios.history.get[2].url).toBe("extensions.json");
            done();
        }, 0);
    });
    it('PLUGIN_UNINSTALLED action triggers removing an extension from available plugins', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(/localconfig/i).reply(200, {});
        mockAxios.onGet(/extensions\.json/i).reply(200, {
            OtherPlugin: {
                bundle: "myplugin.js"
            },
            MyPlugin: {
                bundle: "myplugin.js"
            }
        });
        mockAxios.onGet(/myplugin/i).reply(200, "(window.webpackJsonp = window.webpackJsonp || []).push([[\"myplugin\"], {\"Extension.jsx\": function(e, n, t) {n.default = {name: \"My\"};}}]);");
        const store = () => ({
            dispatch() {},
            getState() {
                return {};
            },
            subscribe() {
            },
            addActionListener(listener) {
                listener({
                    type: PLUGIN_UNINSTALLED,
                    plugin: "My"
                });
            },
            replaceReducer: () => {}

        });
        setStore(store());
        const MyApp = ({plugins}) => {
            expect(plugins.OtherPlugin).toExist();
            expect(plugins.MyPlugin).toNotExist();
            done();
        };
        ReactDOM.render(<StandardApp appStore={store} appComponent={MyApp} enableExtensions/>, document.getElementById("container"));
    });
    it('extensions assets are loaded from external folder if configured', (done) => {
        ConfigUtils.setConfigProp("extensionsFolder", "myfolder/");
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(/localConfig/).reply(200, {});
        mockAxios.onGet(/extensions/).reply(200, {
            My: {
                bundle: "myplugin.js",
                translations: "translations"
            }
        });
        mockAxios.onGet(/myplugin/).reply(200, "window.webpackJsonp.push([[\"myplugin\"], {\"a\": function(e, n, t) {n.default={}} }])");
        mockAxios.onGet(/translations/).reply(200, {});
        const store = () => ({
            dispatch() { },
            getState() {
                return {};
            },
            subscribe() {
            },
            replaceReducer() {}
        });
        ConfigUtils.setConfigProp("persisted.reduxStore", store());

        const app = ReactDOM.render(<StandardApp appStore={store} enableExtensions />, document.getElementById("container"));
        expect(app).toExist();
        setTimeout(() => {
            expect(mockAxios.history.get.length).toBe(3);
            expect(mockAxios.history.get[2].url).toBe("myfolder/myplugin.js");
            done();
        }, 0);
    });
});
