/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import StandardAppComponent from '../StandardAppComponent';
import ConfigUtils from '../../../utils/ConfigUtils';
window.__DEVTOOLS__ = false;

class MyPlugin extends React.Component {
    render() {
        return <div className="MyPlugin"/>;
    }
}

describe('StandardAppComponent', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        ConfigUtils.setLocalConfigurationFile('base/web/client/test-resources/localConfig.json');
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        ConfigUtils.setLocalConfigurationFile('localConfig.json');
        setTimeout(done);
    });

    it('creates a default app', (done) => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        };
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardAppComponent/></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            done();
        });
    });

    it('creates a default app with plugins', (done) => {
        const plugins = {
            MyPlugin
        };

        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        };
        const container = document.getElementById("container");
        expect(container.innerHTML).toNotExist();
        ReactDOM.render(<Provider store={store}><StandardAppComponent plugins={plugins} pluginsConfig={{desktop: ['My']}} /></Provider>, container, () => {
            expect(container.innerHTML).toExist();
            expect(container.getElementsByClassName('MyPlugin').length).toBe(1);
            done();
        });
    });
});
