/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import {toModulePlugin} from "../../utils/ModulePluginsUtils";
import useModulePlugins from "../useModulePlugins";
import {getStore, setStore} from "../../utils/StateUtils";

describe('useModulePlugins hook', () => {
    const originalStore = getStore();
    const store = {
        dispatch() { },
        getState: () => {
            return {};
        },
        subscribe() {
        },
        replaceReducer: () => { },
        storeManager: {
            reduce: () => {},
            addReducer: () => {},
            removeReducer: () => {},
            addEpics: () => {},
            muteEpics: () => {},
            unmuteEpics: () => {},
            rootEpic: () => {}
        }
    };
    const Component = ({onLoaded = () => {}, plugins, config}) => {
        const { plugins: loadedPlugins, pending } = useModulePlugins({
            pluginsEntries: plugins,
            pluginsConfig: config
        });
        if (!pending) onLoaded(loadedPlugins);
        return false;
    };

    beforeEach((done) => {
        setStore(store);
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        setStore(originalStore);
        window.history.back();
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test module plugins load', done => {
        const assertCallback = (plugins) => {
            expect(plugins.ExamplePlugin).toExist();
            expect(plugins.Example2Plugin).toExist();
            done();
        };

        const plugins = {
            ExamplePlugin: toModulePlugin('Example', () => import('../../test-resources/module-plugins/dummy')),
            Example2Plugin: toModulePlugin('Example2', () => import('../../test-resources/module-plugins/dummy2'))
        };
        const pluginsConfig = [
            'ExamplePlugin',
            'Example2Plugin'
        ];

        ReactDOM.render(<Component onLoaded={assertCallback} plugins={plugins} config={pluginsConfig} />, document.getElementById('container'));
    });
    it('test epics should not be muted on nested PluginsContainer render', done => {
        const newStore = {
            dispatch() { },
            getState: () => {
                return {};
            },
            subscribe() {
            },
            replaceReducer: () => { },
            storeManager: {
                reduce: () => {},
                addReducer: () => {},
                removeReducer: () => {},
                addEpics: () => {},
                muteEpics: () => {
                    // we should not end up in here
                    expect(true).toBe(false);
                },
                unmuteEpics: () => {},
                rootEpic: () => {}
            }
        };
        setStore(newStore);

        const plugins = {
            ExamplePlugin: toModulePlugin('Example', () => import('../../test-resources/module-plugins/dummy')),
            Example2Plugin: toModulePlugin('Example2', () => import('../../test-resources/module-plugins/dummy2'))
        };
        const pluginsConfig = [
            'ExamplePlugin',
            'Example2Plugin'
        ];

        ReactDOM.render(<Component plugins={plugins} config={pluginsConfig} />, document.getElementById('container'));
        setTimeout(() => {
            ReactDOM.render(<Component
                plugins={{ExamplePlugin: toModulePlugin('Example', () => import('../../test-resources/module-plugins/dummy'))}}
                config={['ExamplePlugin']} />, document.getElementById('container'));
        }, 200);
        setTimeout(() => {
            done();
        }, 200);
    });
    it('test epics should be muted if route has changed', done => {
        const newStore = {
            dispatch() { },
            getState: () => {
                return {};
            },
            subscribe() {
            },
            replaceReducer: () => { },
            storeManager: {
                reduce: () => {},
                addReducer: () => {},
                removeReducer: () => {},
                addEpics: () => {},
                muteEpics: (plugin) => {
                    expect(plugin).toBe('Example2Plugin');
                    done();
                },
                unmuteEpics: () => {},
                rootEpic: () => {}
            }
        };
        setStore(newStore);

        const plugins = {
            ExamplePlugin: toModulePlugin('Example', () => import('../../test-resources/module-plugins/dummy')),
            Example2Plugin: toModulePlugin('Example2', () => import('../../test-resources/module-plugins/dummy2'))
        };
        const pluginsConfig = [
            'ExamplePlugin',
            'Example2Plugin'
        ];

        ReactDOM.render(<Component plugins={plugins} config={pluginsConfig} />, document.getElementById('container'));
        setTimeout(() => {
            window.history.pushState('page2', 'Title', '/mapstore/#/newPage');
            ReactDOM.render(<Component
                plugins={{ExamplePlugin: toModulePlugin('Example', () => import('../../test-resources/module-plugins/dummy'))}}
                config={['ExamplePlugin']} />, document.getElementById('container'));
        }, 200);
        setTimeout(() => {
            expect(true).toBe(false);
        }, 200);
    });
});
