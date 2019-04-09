/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const mainApp = require('../main');
const expect = require('expect');
const assign = require('object-assign');
const ConfigUtils = require('../../utils/ConfigUtils');

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
                appComponent: AppComponent,
                onStoreInit: () => {
                    setTimeout(() => {
                        expect(document.body.innerHTML).toContain("TEST");
                        expect(config.printingEnabled).toBe(true);
                        done();
                    }, 0);
                }
            });
        };
        mainApp({}, {plugins: {}}, overrideCfg);
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
});
