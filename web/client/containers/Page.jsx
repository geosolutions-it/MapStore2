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
        pagePluginsConfig: PropTypes.object,
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
        onMount: () => {}
    };

    componentWillMount() {
        this.props.onMount();
    }

    render() {
        let pluginsConfig = {
            desktop: [...this.props.pagePluginsConfig.desktop, ...this.props.pluginsConfig.desktop],
            mobile: [...this.props.pagePluginsConfig.mobile, ...this.props.pluginsConfig.mobile]
        };
        return (<PluginsContainer key={this.props.id} id={"page-" + this.props.id} className={"page page-" + this.props.id}
            pluginsConfig={pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.params}
            />);
    }
}

module.exports = Page;
