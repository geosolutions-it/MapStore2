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
import {Provider} from "react-redux";
import withModulePlugins from '../withModulePlugins';
import {toModulePlugin} from "../../../../utils/ModulePluginsUtils";
import {setStore} from "../../../../utils/StateUtils";

const pluginConfig = [
    'ExamplePlugin'
];

const getPluginConfig = () => {
    return pluginConfig;
};


const pluginEntries = {
    ExamplePlugin: toModulePlugin('Example', () => import('../../../../test-resources/module-plugins/dummy'))
};

const wrapWithStore = (Component, store) => {
    return (props) => (
        <Provider store={store}>
            <Component {...props}/>
        </Provider>);

};

describe('withModulePlugins enhancer', () => {
    let registeredEpics = {};
    let registeredReducers = {};

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
            addReducer: (key) => {
                registeredReducers[key] = true;
            },
            removeReducer: () => {},
            addEpics: (key) => {
                registeredEpics[key] = true;
            },
            muteEpics: () => {},
            unmuteEpics: () => {},
            rootEpic: () => {}
        }
    };
    setStore(store);
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        registeredEpics = {};
        registeredReducers = {};
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('test that module plugin successfully loaded', done => {
        const Listener = (props) => {
            expect(props.plugins).toExist();
            expect(props.plugins.ExamplePlugin).toExist();
            expect(registeredEpics.Example).toBe(true);
            expect(registeredReducers.example).toBe(true);
            done();
            return false;
        };

        const Component = withModulePlugins(getPluginConfig)(Listener);
        const Cmp = wrapWithStore(Component, store);
        ReactDOM.render(<Cmp plugins={pluginEntries} pluginsConfig={pluginConfig} />, document.getElementById('container'));
        const container = document.getElementById('container');
        expect(container).toBeTruthy();
    });
});
