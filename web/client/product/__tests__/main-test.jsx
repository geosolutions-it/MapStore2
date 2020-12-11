/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {includes} from 'lodash';
import assign from 'object-assign';
import React from 'react';
import ReactDOM from 'react-dom';

import ConfigUtils from '../../utils/ConfigUtils';
import mainApp from '../main';

class AppComponent extends React.Component {
    render() {
        return <div>TEST</div>;
    }
}

describe('standard application runner', () => {
    beforeEach((done) => {
        window.__DEVTOOLS__ = {};
        global.Intl = {};
        ConfigUtils.setLocalConfigurationFile("base/web/client/test-resources/localConfig.json");
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        delete window.__DEVTOOLS__;
        global.Intl = null;
        ConfigUtils.setLocalConfigurationFile("localConfig.json");
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('allows overriding appConfig', (done) => {
        const overrideCfg = (config) => {
            return assign({}, config, {
                appComponent: AppComponent
            });
        };
        mainApp({}, {plugins: {}}, overrideCfg);
        setTimeout(() => {
            expect(document.body.innerHTML).toContain("TEST");
            done();
        }, 200);
    });

    it('check printingEnabled set to false', (done) => {
        const overrideCfg = (config) => {
            return assign({}, config, {
                onStoreInit: () => {
                    setTimeout(() => {
                        expect(config.printingEnabled).toBe(false);
                        done();
                    }, 0);
                }
            });
        };
        mainApp({printingEnabled: false}, {plugins: {}}, overrideCfg);
    });
    it('testing default appStore', () => {
        let defaultConfig;
        mainApp(defaultConfig, {plugins: {}}, (config) => {
            expect(config.appReducers).toBeTruthy();
            const reducersKeys = Object.keys(config.appReducers);
            expect(includes(reducersKeys, "maptype")).toBe(true);
            expect(includes(reducersKeys, "maps")).toBe(true);
            expect(includes(reducersKeys, "maplayout")).toBe(true);
            expect(includes(reducersKeys, "version")).toBe(true);
        });
    });

    it('testing default appStore plus some extra reducers', () => {
        let defaultConfig = {
            appReducers: {
                catalog: require("../../reducers/catalog").default
            }
        };
        mainApp(defaultConfig, {plugins: {}}, (config) => {
            expect(config.appReducers).toBeTruthy();
            const reducersKeys = Object.keys(config.appReducers);
            expect(includes(reducersKeys, "maptype")).toBe(true);
            expect(includes(reducersKeys, "maps")).toBe(true);
            expect(includes(reducersKeys, "maplayout")).toBe(true);
            expect(includes(reducersKeys, "version")).toBe(true);
            expect(includes(reducersKeys, "catalog")).toBe(true);
        });
    });

    it('testing appStore overridng default reducers', () => {
        let defaultConfig = {
            baseReducers: {
                catalog: require("../../reducers/catalog").default
            }
        };
        mainApp(defaultConfig, {plugins: {}}, (config) => {
            expect(config.appReducers).toBeTruthy();
            const reducersKeys = Object.keys(config.appReducers);
            expect(includes(reducersKeys, "maptype")).toBe(false);
            expect(includes(reducersKeys, "maps")).toBe(false);
            expect(includes(reducersKeys, "maplayout")).toBe(false);
            expect(includes(reducersKeys, "version")).toBe(false);
            expect(includes(reducersKeys, "catalog")).toBe(true);
        });
    });
});
