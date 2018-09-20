/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');

const React = require('react');
const ReactDOM = require('react-dom');
const PluginsContainer = require('../PluginsContainer');

class My extends React.Component {
    render() {
        return <div/>;
    }
}
const plugins = {
    MyPlugin: My,
    OtherPlugin: My
};

const pluginsCfg = {
    desktop: [ "My", {
        name: "Other",
        cfg: {
            disablePluginIf: "{true}"
        }
    }]
};

const pluginsCfg2 = {
    desktop: ["My", "Other"]
};

describe('PluginsContainer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('checks filterDisabledPlugins one disabled', () => {
        const cmp = ReactDOM.render(<PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
                plugins={plugins} pluginsConfig={pluginsCfg}/>, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const rendered = cmpDom.getElementsByTagName("div");
        expect(rendered.length).toBe(1);
    });

    it('checks filterDisabledPlugins no disabled', () => {
        const cmp = ReactDOM.render(<PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
            plugins={plugins} pluginsConfig={pluginsCfg2} />, document.getElementById("container"));
        expect(cmp).toExist();

        const cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        const rendered = cmpDom.getElementsByTagName("div");
        expect(rendered.length).toBe(2);
    });
});
