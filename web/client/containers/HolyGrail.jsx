const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const { connect } = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;
const PluginsUtils = require('../utils/PluginsUtils');
const ConfigUtils = require('../utils/ConfigUtils');
const BorderLayout = require('../components/layout/BorderLayout');

const PluginsContainer = connect((state) => ({
    mode: urlQuery.mode || (urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    monitoredState: PluginsUtils.getMonitoredState(state, ConfigUtils.getConfigProp('monitorState'))
}))(require('../components/plugins/PluginsContainer'));

class HolyGrail extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        pagePluginsConfig: PropTypes.object,
        className: PropTypes.string,
        pluginsConfig: PropTypes.object,
        params: PropTypes.object,
        onMount: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        pagePluginsConfig: {
            desktop: [],
            mobile: []
        },
        pluginsConfig: {
            desktop: [],
            mobile: []
        },
        onMount: () => { }
    };

    UNSAFE_componentWillMount() {
        this.props.onMount();
    }

    render() {
        let pluginsConfig = {
            desktop: [...this.props.pagePluginsConfig.desktop, ...this.props.pluginsConfig.desktop],
            mobile: [...this.props.pagePluginsConfig.mobile, ...this.props.pluginsConfig.mobile]
        };
        return (<PluginsContainer component={BorderLayout} key={this.props.id} id={this.props.id} className={`holygrail ${this.props.className || ""}`}
            pluginsConfig={pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.params}
        />);
    }
}

module.exports = HolyGrail;
