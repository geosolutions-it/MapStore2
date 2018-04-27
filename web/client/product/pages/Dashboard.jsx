/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const { get, isNil } = require('lodash');
const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const ConfigUtils = require('../../utils/ConfigUtils');

const { loadDashboard, resetDashboard } = require('../../actions/dashboard');

const HolyGrail = require('../../containers/HolyGrail');

class DashboardPage extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        mode: PropTypes.string,
        match: PropTypes.object,
        loadResource: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        name: "dashboard",
        mode: 'desktop',
        loadMaps: () => {},
        reset: () => {}
    };

    componentWillMount() {
        const id = get(this.props, "match.params.did");
        if (id) {
            this.props.reset();
            this.props.loadResource(id);
        } else {
            this.props.reset();
        }
    }
    componentDidUpdate(oldProps) {
        const id = get(this.props, "match.params.did");
        if (get(oldProps, "match.params.did") !== get(this.props, "match.params.did")) {
            if (isNil(id)) {
                this.props.reset();
            } else {
                this.props.loadResource(id);
            }
        }
    }
    componentWillUnmount() {
        this.props.reset();
    }
    render() {
        let plugins = ConfigUtils.getConfigProp("plugins") || {};
        let pagePlugins = {
            "desktop": [],
            "mobile": []
        };
        let pluginsConfig = {
            "desktop": plugins[this.props.name] || [],
            "mobile": plugins[this.props.name] || []
        };

        return (<HolyGrail
            id="dashboard-view-container"
            pagePluginsConfig={pagePlugins}
            pluginsConfig={pluginsConfig}
            plugins={this.props.plugins}
            params={this.props.match.params}
            />);
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
    {
        loadResource: loadDashboard,
        reset: resetDashboard
    })(DashboardPage);
