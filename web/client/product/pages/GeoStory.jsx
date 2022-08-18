/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get, isNil } from 'lodash';
import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;

import Page from '../../containers/Page';
import {
    loadGeostory,
    setEditing,
    updateUrlOnScroll
} from '../../actions/geostory';
import { geostoryIdSelector } from '../../selectors/geostory';
import { isLoggedIn } from '../../selectors/security';
import BorderLayout from '../../components/layout/BorderLayout';
import {normalizeName} from "../../utils/PluginsUtils";

/**
  * @name GeoStory
  * @memberof pages
  * @class
  * @classdesc
  * This is the main container page for GeoStory.
  * It handles all the routing and initial loading functionalities dedicated to GeoStory contents and
  * it is a container for the GeoStory plugins.
  *
  */
class GeoStoryPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        name: PropTypes.string,
        loadResource: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func,
        canEdit: PropTypes.bool,
        location: PropTypes.object,
        history: PropTypes.object,
        setEditing: PropTypes.func,
        previousId: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        updateUrlOnScroll: PropTypes.func
    };

    static defaultProps = {
        name: "geostory",
        mode: 'desktop',
        reset: () => { },
        setEditing: () => {},
        updateUrlOnScroll: () => {}
    };

    state = {};

    componentDidUpdate(oldProps) {
        const id = get(this.props, "match.params.gid");
        const oldId = get(oldProps, "match.params.gid");
        if (oldId !== id) {
            if (isNil(id)) {
                this.props.reset();
            } else {
                this.setInitialMode(true);
                this.props.loadResource(id);
            }
        }
    }
    componentWillUnmount() {
        this.props.reset();
    }

    onPluginsLoaded = (loadedPlugins) => {
        const pluginKeys = typeof loadedPlugins === 'object' ? Object.keys(loadedPlugins) : loadedPlugins;
        const plugins = ['GeoStory'];
        if (plugins.every(elem => pluginKeys.includes(normalizeName(elem))) && !this.state.pluginsAreLoaded) {
            this.setState({pluginsAreLoaded: true}, () => {
                const id = get(this.props, "match.params.gid");
                const previousId = this.props.previousId && this.props.previousId + '';
                this.props.reset();
                this.setInitialMode(previousId !== id);
                this.props.updateUrlOnScroll(true);
                this.props.loadResource(id);
            });
        }
    }

    render() {
        return (<Page
            id={this.props.name}
            component={BorderLayout}
            includeCommon={false}
            plugins={this.props.plugins}
            params={this.props.match.params}
            loaderComponent={this.props.loaderComponent}
            onPluginsLoaded={this.onPluginsLoaded}
        />);
    }

    setInitialMode = (isViewMode) => {
        const { pathname } = this.props.location;
        const isShared = pathname.includes('/geostory/shared');
        // mobile and shared page need to disable editing on start
        if (isShared || !this.props.canEdit || isViewMode) {
            this.props.setEditing(false);
        }
    }
}

const canEditGeoStorySelector = (state) => {
    const isMobile = state?.browser?.mobile;
    return isLoggedIn(state) && !isMobile ? true : false;
};

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop',
    canEdit: canEditGeoStorySelector(state),
    previousId: geostoryIdSelector(state)
}),
{
    loadResource: loadGeostory,
    setEditing,
    updateUrlOnScroll
    // reset: resetGeostory
})(GeoStoryPage);
