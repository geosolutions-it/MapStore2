/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;
import { getMonitoredState } from '../utils/PluginsUtils';
import ConfigUtils from '../utils/ConfigUtils';
import ModulePluginsContainer from "../product/pages/containers/ModulePluginsContainer";

const PluginsContainer = connect((state) => ({
    mode: urlQuery.mode || (urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    monitoredState: getMonitoredState(state, ConfigUtils.getConfigProp('monitorState'))
}))(ModulePluginsContainer);

class Page extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        pagePluginsConfig: PropTypes.object,
        pluginsConfig: PropTypes.object,
        params: PropTypes.object,
        onMount: PropTypes.func,
        onLoaded: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func,
        component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        includeCommon: PropTypes.bool
    };

    static defaultProps = {
        mode: 'desktop',
        onMount: () => {},
        onLoaded: () => {},
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
            loaderComponent={this.props.loaderComponent}
            onLoaded={this.props.onLoaded}
        />);
    }
}

export default Page;
