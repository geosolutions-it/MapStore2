const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {connect} = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;
const PluginsUtils = require('../utils/PluginsUtils');
const ConfigUtils = require('../utils/ConfigUtils');

const PluginsContainer = connect((state) => ({
    mode: urlQuery.mode || (urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    monitoredState: PluginsUtils.getMonitoredState(state, ConfigUtils.getConfigProp('monitorState'))
}))(require('../components/plugins/PluginsContainer'));

class Page extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        pagePluginsConfig: PropTypes.object,
        pluginsConfig: PropTypes.object,
        params: PropTypes.object,
        onMount: PropTypes.func,
        plugins: PropTypes.object,
        component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        includeCommon: PropTypes.bool
    };

    static defaultProps = {
        mode: 'desktop',
        onMount: () => {},
        className: '',
        includeCommon: true
    };

    UNSAFE_componentWillMount() {
        this.props.onMount();
    }

    getDefaultPluginsConfig = (name) => {
        const plugins = ConfigUtils.getConfigProp("plugins") || {};
        return {
            "desktop": plugins[name] || [],
            "mobile": plugins[name] || []
        };
    };

    render() {
        const specificPluginsConfig = this.props.pluginsConfig || this.getDefaultPluginsConfig(this.props.id);
        const commonPluginsConfig = this.props.includeCommon ? (this.props.pagePluginsConfig || this.getDefaultPluginsConfig('common')) : {
            desktop: [],
            mobile: []
        };

        const pluginsConfig = {
            desktop: [...commonPluginsConfig.desktop, ...specificPluginsConfig.desktop],
            mobile: [...commonPluginsConfig.mobile, ...specificPluginsConfig.mobile]
        };
        return (<PluginsContainer key={this.props.id} id={"page-" + this.props.id} component={this.props.component} className={"page page-" + this.props.id + " " + this.props.className}
            pluginsConfig={pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.params}
        />);
    }
}

module.exports = Page;
