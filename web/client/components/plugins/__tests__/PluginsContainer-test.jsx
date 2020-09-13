/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const assign = require('object-assign');
const PropTypes = require('prop-types');

const React = require('react');
const ReactDOM = require('react-dom');
const PluginsContainer = require('../PluginsContainer');
const {Provider} = require('react-redux');
const {connect} = require('react-redux');

class My extends React.Component {
    render() {
        return <div/>;
    }
    myFunc() {}
}
class Container extends React.Component {
    static propTypes = {
        items: PropTypes.any
    }
    render() {
        const {items} = this.props;
        const renderCmp = (item = {}) => {
            const ItemCmp = item.plugin;
            if (ItemCmp) {
                return <ItemCmp />;
            }
            return <div id={`no-impl-item-${item.name}`} />;

        };
        return (<React.Fragment>
            {items.map(renderCmp)}
        </React.Fragment>);
    }

}

class NoRootPlugin extends React.Component {
    render() {
        return <div id="no-root"/>;
    }
}
const plugins = {
    MyPlugin: My,
    OtherPlugin: My,
    ContainerPlugin: Container,
    NoRootPlugin: assign(NoRootPlugin, { noRoot: true, Container: {
        name: 'no-root-plugin',
        position: 1,
        priority: 1
    }}),
    WithGlobalRefPlugin: connect(
        null,
        null,
        null,
        {
            forwardRef: true
        }
    )(My)
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

const pluginsCfg3 = {
    desktop: ["My", "NoRoot"]
};
const pluginsCfg4 = {
    desktop: ["Container", "NoRoot"]
};

const pluginsCfgRef = {
    desktop: [
        {
            'name': 'WithGlobalRef',
            'cfg': {
                'withGlobalRef': true
            }
        }
    ]
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
    it('test noRoot option disable root rendering of plugins', () => {
        // Not rendered without container
        let cmp = ReactDOM.render(<PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
            plugins={plugins} pluginsConfig={pluginsCfg3} />, document.getElementById("container"));
        expect(cmp).toExist();

        let cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        let rendered = cmpDom.getElementsByTagName("div");

        // rendered in container
        expect(rendered.length).toBe(1);
        cmp = ReactDOM.render(<PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
            plugins={plugins} pluginsConfig={pluginsCfg4} />, document.getElementById("container"));
        expect(cmp).toExist();

        cmpDom = ReactDOM.findDOMNode(cmp);
        expect(cmpDom).toExist();

        rendered = cmpDom.getElementsByTagName("div");
        expect(document.getElementById('no-impl-item-no-root-plugin')).toNotExist();
        expect(document.getElementById('no-root')).toExist();
    });
    it('checks plugin with forwardRef = true connect option', () => {
        const store = {
            dispatch: () => {},
            subscribe: () => {},
            getState: () => ({})
        };
        const app = ReactDOM.render(<Provider store={store}><PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
            plugins={plugins} pluginsConfig={pluginsCfgRef}/></Provider>, document.getElementById("container"));

        expect(app).toExist();
        expect(window.WithGlobalRefPlugin.myFunc).toExist();
    });
});
