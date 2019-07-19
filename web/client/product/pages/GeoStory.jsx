/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const ConfigUtils = require('../../utils/ConfigUtils');

const { loadMapConfig } = require('../../actions/config');
const { resetControls, setControlProperty } = require('../../actions/controls');
const { mapSelector } = require('../../selectors/map');
const HolyGrail = require('../../containers/HolyGrail');

class GeoStory extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        mode: PropTypes.string,
        match: PropTypes.object,
        map: PropTypes.object,
        loadMapConfig: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object,
        onPermalink: PropTypes.func,
        setLayout: PropTypes.func,
        setReadOnly: PropTypes.func
    };

    static defaultProps = {
        name: 'geostory',
        mode: 'desktop',
        loadMapConfig: () => { },
        reset: () => { },
        map: {},
        onPermalink: () => {},
        setLayout: () => {},
        setReadOnly: () => {}
    };

    render() {
        const plugins = ConfigUtils.getConfigProp('plugins') || {};
        const pagePlugins = {
            desktop: [],
            mobile: []
        };
        const pluginsConfig = {
            desktop: plugins[this.props.name] || [],
            mobile: plugins[this.props.name] || []
        };
        return (
            <HolyGrail
                id="map-viewer-container"
                pagePluginsConfig={pagePlugins}
                pluginsConfig={pluginsConfig}
                plugins={this.props.plugins}
                params={this.props.match.params}/>
        );
    }
}

module.exports = connect((state) => ({
        mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop',
        map: mapSelector(state)
    }),
    {
        loadMapConfig,
        reset: resetControls,
        setLayout: setControlProperty.bind(null, 'geostory', 'layout'),
        setReadOnly: setControlProperty.bind(null, 'geostory', 'readOnly', true)
    }
)(GeoStory);
