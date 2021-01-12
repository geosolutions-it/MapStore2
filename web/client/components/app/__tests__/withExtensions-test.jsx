/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import StandardApp from '../StandardApp';
import withExtensions from '../withExtensions';

import ConfigUtils from '../../../utils/ConfigUtils';
import { LOAD_EXTENSIONS, PLUGIN_UNINSTALLED } from '../../../actions/contextcreator';
import MockAdapter from "axios-mock-adapter";
import axios from "../../../libs/ajax";
import { setStore } from '../../../utils/StateUtils';

let mockAxios;
const StandardAppWithExtensions = withExtensions(StandardApp);

describe('StandardApp withExtensions', () => {
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
        document.head.innerHTML = '';
        ConfigUtils.setLocalConfigurationFile('localConfig.json');
        ConfigUtils.setConfigProp("persisted.reduxStore", undefined);
        ConfigUtils.setConfigProp("translationsPath", "translations");
        setTimeout(done);
    });
    it('extensions plugins are available if extensions are enabled', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(/localconfig/i).reply(200, {});
        mockAxios.onGet(/extensions\.json/i).reply(200, {
            My: {
                bundle: "base/web/client/test-resources/extensions/myextension.js"
            }
        });
        const store = () => ({
            dispatch() { },
            getState() {
                return {};
            },
            subscribe() {
            },
            replaceReducer: () => { }
        });
        setStore(store());
        const MyApp = ({ plugins }) => {
            expect(plugins.MyPlugin).toExist();
            done();
            return null;
        };

        const app = ReactDOM.render(<StandardAppWithExtensions appComponent={MyApp} appStore={store} enableExtensions />, document.getElementById("container"));
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

        const app = ReactDOM.render(<StandardAppWithExtensions appStore={store} enableExtensions />, document.getElementById("container"));
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


        const app = ReactDOM.render(<StandardAppWithExtensions appStore={store} enableExtensions={false} />, document.getElementById("container"));
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
            dispatch() { },
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

        const app = ReactDOM.render(<StandardAppWithExtensions appStore={store} enableExtensions />, document.getElementById("container"));
        expect(app).toExist();
        setTimeout(() => {
            expect(mockAxios.history.get.length).toBe(3);
            expect(mockAxios.history.get[1].url).toBe("extensions.json");
            expect(mockAxios.history.get[2].url).toBe("extensions.json");
            done();
        }, 0);
    });
    it('PLUGIN_UNINSTALLED removes extension translations', (done) => {
        ConfigUtils.setConfigProp("translationsPath", ["translations", "dist/extensions/My/translations"]);
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(/localconfig/i).reply(200, {});
        mockAxios.onGet(/extensions\.json/i).reply(200, {
            Other: {
                bundle: "base/web/client/test-resources/extensions/otherextension.js"
            },
            My: {
                bundle: "base/web/client/test-resources/extensions/myextension.js"
            }
        });
        const store = () => ({
            dispatch() { },
            getState() {
                return {};
            },
            subscribe() {
            },
            addActionListener(listener) {
                listener({
                    type: PLUGIN_UNINSTALLED,
                    plugin: "My",
                    cfg: {
                        translations: "dist/extensions/My/translations"
                    }
                });
            },
            replaceReducer: () => { }

        });
        setStore(store());
        const MyApp = () => {
            expect(ConfigUtils.getConfigProp("translationsPath").length).toBe(1);
            done();
        };
        ReactDOM.render(<StandardAppWithExtensions appStore={store} appComponent={MyApp} enableExtensions />, document.getElementById("container"));
    });
    it('PLUGIN_UNINSTALLED action triggers removing an extension from available plugins', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(/localconfig/i).reply(200, {});
        mockAxios.onGet(/extensions\.json/i).reply(200, {
            Other: {
                bundle: "base/web/client/test-resources/extensions/otherextension.js"
            },
            My: {
                bundle: "base/web/client/test-resources/extensions/myextension.js"
            }
        });
        const store = () => ({
            dispatch() { },
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
            replaceReducer: () => { }

        });
        setStore(store());
        const MyApp = ({ plugins }) => {
            expect(plugins.OtherPlugin).toExist();
            expect(plugins.MyPlugin).toNotExist();
            done();
        };
        ReactDOM.render(<StandardAppWithExtensions appStore={store} appComponent={MyApp} enableExtensions />, document.getElementById("container"));
    });
    it('extensions assets are loaded from external folder if configured', (done) => {
        ConfigUtils.setConfigProp("extensionsFolder", "base/");
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(/localConfig/).reply(200, {});
        mockAxios.onGet(/extensions\.json/i).reply(200, {
            My: {
                bundle: "web/client/test-resources/extensions/myextension.js",
                translations: "translations"
            }
        });
        mockAxios.onGet(/translations/).reply(200, {});
        const store = () => ({
            dispatch() { },
            getState() {
                return {};
            },
            subscribe() {
            },
            replaceReducer() { }
        });
        ConfigUtils.setConfigProp("persisted.reduxStore", store());

        const app = ReactDOM.render(<StandardAppWithExtensions appStore={store} enableExtensions />, document.getElementById("container"));
        expect(app).toExist();
        setTimeout(() => {
            expect(document.head.getElementsByTagName("script").length).toBe(1);
            expect(document.head.getElementsByTagName("script").item(0).src).toContain("base/");
            done();
        }, 500);
    });
    it('If one extension errors the other extensions continue to work', (done) => {
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(/localConfig/).reply(200, {});
        mockAxios.onGet(/extensions/).reply(200, {
            My: {
                bundle: "base/web/client/test-resources/extensions/myextension.js",
                translations: "translations"
            },
            Error: {
                bundle: "base/web/client/test-resources/extensions/nodata.js"
            }
        });
        mockAxios.onGet(/translations/).reply(200, {});
        const store = () => ({
            dispatch() { },
            getState() {
                return {};
            },
            subscribe() {
            },
            replaceReducer() { }
        });
        ConfigUtils.setConfigProp("persisted.reduxStore", store());
        const MyApp = ({ plugins }) => {
            if (plugins) {
                expect(plugins.MyPlugin).toExist();
                expect(plugins.ErrorPlugin).toNotExist();
                done();
            }
        };
        const app = ReactDOM.render(<StandardAppWithExtensions appStore={store} enableExtensions appComponent={MyApp} />, document.getElementById("container"));
        expect(app).toExist();


    });
});
