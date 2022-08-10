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
    const Component = ({onLoaded}) => {
        const { plugins: loadedPlugins, pending } = useModulePlugins({
            pluginsEntries: {
                ExamplePlugin: toModulePlugin('Example', () => import('../../test-resources/module-plugins/dummy'))
            },
            pluginsConfig: [
                'ExamplePlugin'
            ]
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
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test module plugins load', done => {
        const assertCallback = (plugins) => {
            expect(plugins.ExamplePlugin).toExist();
            done();
        };
        ReactDOM.render(<Component onLoaded={assertCallback} />, document.getElementById('container'));
    });
});
