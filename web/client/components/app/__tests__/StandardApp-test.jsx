/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import StandardApp from '../StandardApp';
import ConfigUtils from '../../../utils/ConfigUtils';

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

    it('creates a default app and renders the given component', (done) => {
        const store = () => ({
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        });
        const oldLoad = ConfigUtils.loadConfiguration;
        ConfigUtils.loadConfiguration = () => ({
            then: (callback) => {
                callback({});
            }
        });

        const app = ReactDOM.render(<StandardApp appStore={store} appComponent={mycomponent}/>, document.getElementById("container"));
        expect(app).toExist();

        setTimeout(() => {
            try {
                const dom = ReactDOM.findDOMNode(app);
                expect(dom.className).toBe('mycomponent');
                done();
            } catch (err) {
                done(err);
            } finally {
                ConfigUtils.loadConfiguration = oldLoad;
            }
        }, 0);
    });


    it('creates a default app and configures plugins', (done) => {
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
        ConfigUtils.loadConfiguration = () => ({
            then: (callback) => {
                callback({});
            }
        });

        const app = ReactDOM.render(<StandardApp appStore={store} appComponent={mycomponent} pluginsDef={pluginsDef}/>, document.getElementById("container"));
        expect(app).toExist();

        setTimeout(() => {
            try {
                const dom = ReactDOM.findDOMNode(app);
                expect(dom.getElementsByClassName('MyPlugin').length).toBe(1);
                done();
            } catch (err) {
                done(err);
            } finally {
                ConfigUtils.loadConfiguration = oldLoad;
            }
        }, 0);
    });
});
