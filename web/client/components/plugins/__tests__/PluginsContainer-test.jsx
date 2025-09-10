/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';

import PluginsContainer from '../PluginsContainer';

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
    NoRootPlugin: Object.assign(NoRootPlugin, { noRoot: true, Container: {
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

const store = {
    dispatch: () => {},
    subscribe: () => {},
    getState: () => ({})
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
        const container = document.getElementById("container");
        ReactDOM.render(
            <Provider store={store}>
                <PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
                    plugins={plugins} pluginsConfig={pluginsCfg}/>
            </Provider>, container);
        expect(container.innerHTML).toExist();

        const cmpDom = container.firstElementChild;
        expect(cmpDom).toExist();

        const rendered = cmpDom.getElementsByTagName("div");
        expect(rendered.length).toBe(1);
    });

    it('checks filterDisabledPlugins no disabled', () => {
        const container = document.getElementById("container");
        ReactDOM.render(
            <Provider store={store}>
                <PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
                    plugins={plugins} pluginsConfig={pluginsCfg2} />
            </Provider>, container);
        expect(container.innerHTML).toExist();

        const cmpDom = container.firstElementChild;
        expect(cmpDom).toExist();

        const rendered = cmpDom.getElementsByTagName("div");
        expect(rendered.length).toBe(2);
    });
    it('test noRoot option disable root rendering of plugins', () => {
        // Not rendered without container
        const container = document.getElementById("container");
        ReactDOM.render(
            <Provider store={store}>
                <PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
                    plugins={plugins} pluginsConfig={pluginsCfg3} />
            </Provider>, container);
        expect(container.innerHTML).toExist();

        let cmpDom = container.firstElementChild;
        expect(cmpDom).toExist();

        let rendered = cmpDom.getElementsByTagName("div");

        // rendered in container
        expect(rendered.length).toBe(1);
        ReactDOM.render(
            <Provider store={store}>
                <PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
                    plugins={plugins} pluginsConfig={pluginsCfg4} />
            </Provider>, container);
        expect(container.innerHTML).toExist();

        cmpDom = container.firstElementChild;
        expect(cmpDom).toExist();

        expect(document.getElementById('no-impl-item-no-root-plugin')).toNotExist();
        expect(document.getElementById('no-root')).toExist();
    });
    it('checks plugin with forwardRef = true connect option', () => {
        const container = document.getElementById("container");
        ReactDOM.render(<Provider store={store}>
            <PluginsContainer mode="desktop" defaultMode="desktop" params={{}}
                plugins={plugins} pluginsConfig={pluginsCfgRef}/>
        </Provider>, container);

        expect(container.innerHTML).toExist();
        expect(window.WithGlobalRefPlugin.myFunc).toExist();
    });
});
