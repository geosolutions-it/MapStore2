/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const React = require('react');
const ReactDOM = require('react-dom');
const {Provider} = require('react-redux');

const StandardAppComponent = require('../StandardAppComponent');

const ConfigUtils = require('../../../utils/ConfigUtils');
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

    it('creates a default app', () => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        };
        const app = ReactDOM.render(<Provider store={store}><StandardAppComponent/></Provider>, document.getElementById("container"));
        expect(app).toExist();
    });

    it('creates a default app with plugins', () => {
        const plugins = {
            MyPlugin
        };

        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        };
        const app = ReactDOM.render(<Provider store={store}><StandardAppComponent plugins={plugins} pluginsConfig={{desktop: ['My']}} /></Provider>, document.getElementById("container"));
        expect(app).toExist();

        const dom = ReactDOM.findDOMNode(app);

        expect(dom.getElementsByClassName('MyPlugin').length).toBe(1);
    });
});
