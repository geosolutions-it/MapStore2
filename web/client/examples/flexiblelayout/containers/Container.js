/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PluginsUtils from '../../../utils/PluginsUtils';
import ConfigUtils from '../../../utils/ConfigUtils';
import BorderLayout from '../../../components/layout/BorderLayout';
import PluginsContainerComponent from '../../../components/plugins/PluginsContainer';
import url from 'url';

const urlQuery = url.parse(window.location.href, true).query;

const PluginsContainer = connect((state) => ({
    mode: urlQuery.mode || (urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    monitoredState: PluginsUtils.getMonitoredState(state, ConfigUtils.getConfigProp('monitorState')),
    pluginsState: { ...(state && state.controls || {}) }
}))(PluginsContainerComponent);

function Container({
    id,
    className,
    params,
    plugins,
    pagePluginsConfig = {
        desktop: [],
        mobile: []
    },
    pluginsConfig = {
        desktop: [],
        mobile: []
    },
    onMount = () => {}
}) {
    useEffect(() => {
        onMount();
    }, []);
    let allPluginsConfig = {
        desktop: [...pagePluginsConfig.desktop, ...pluginsConfig.desktop],
        mobile: [...pagePluginsConfig.mobile, ...pluginsConfig.mobile]
    };
    return (<PluginsContainer
        component={BorderLayout}
        key={id}
        id={id}
        className={`holygrail ${className || ""}`}
        pluginsConfig={allPluginsConfig}
        plugins={plugins}
        params={params}
    />);
}

Container.propTypes = {
    id: PropTypes.string,
    pagePluginsConfig: PropTypes.object,
    className: PropTypes.string,
    pluginsConfig: PropTypes.object,
    params: PropTypes.object,
    onMount: PropTypes.func,
    plugins: PropTypes.object
};

export default Container;
