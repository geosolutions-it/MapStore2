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
import url from 'url';
import ConfigUtils from '../../../utils/ConfigUtils';
import { loadMapConfig } from '../../../actions/config';
import { resetControls } from '../../../actions/controls';
import { mapSelector } from '../../../selectors/map';

import Container from '../containers/Container';

const urlQuery = url.parse(window.location.href, true).query;

function MapViewer({
    name = 'viewer',
    plugins,
    match,
    map,
    onLoadConfig
}) {

    useEffect(() => {
        if (!map) {
            onLoadConfig('config.json', null);
        }
    }, []);

    const configPlugins = ConfigUtils.getConfigProp('plugins') || {};
    const pagePlugins = {
        desktop: [],
        mobile: []
    };

    const pluginsConfig = {
        desktop: configPlugins[name] || [],
        mobile: configPlugins[name] || []
    };

    return (
        <Container
            id="map-viewer-container"
            pagePluginsConfig={pagePlugins}
            pluginsConfig={pluginsConfig}
            plugins={plugins}
            params={match.params}/>
    );
}

MapViewer.propTypes = {
    name: PropTypes.string,
    mode: PropTypes.string,
    match: PropTypes.object,
    map: PropTypes.object,
    onLoadConfig: PropTypes.func,
    reset: PropTypes.func,
    plugins: PropTypes.object
};

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop',
    map: mapSelector(state)
}),
{
    onLoadConfig: loadMapConfig,
    reset: resetControls
}
)(MapViewer);
