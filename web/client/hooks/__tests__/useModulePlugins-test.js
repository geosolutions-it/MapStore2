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

const pluginConfig = [
    'ExamplePlugin'
];

const pluginEntries = {
    ExamplePlugin: toModulePlugin('Example', () => import('../../test-resources/module-plugins/dummy'))
};

const Component = ({onLoaded}) => {
    const { plugins: loadedPlugins, pending } = useModulePlugins({
        pluginsEntries: pluginEntries,
        pluginsConfig: pluginConfig
    });
    if (!pending) onLoaded(loadedPlugins);
    return false;
};


describe('useModulePlugins hook', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
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
