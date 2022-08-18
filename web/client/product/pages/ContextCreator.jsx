/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get} from 'lodash';
import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;

import {clearContextCreator, loadContext} from '../../actions/contextcreator';
import Page from '../../containers/Page';
import BorderLayout from '../../components/layout/BorderLayout';

/**
  * @name ContextCreator
  * @memberof pages
  * @class
  * @classdesc
  * This is the main container page for ContextCreator.
  * It handles all the initial of context and
  * it is a container for the ContextCreator plugins.
  *
  */
class ContextCreator extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadContext: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func
    };

    static defaultProps = {
        name: "context-creator",
        mode: 'desktop',
        loadContext: () => {},
        reset: () => {}
    };

    state = {};

    componentDidUpdate(oldProps) {
        const contextId = get(this.props, "match.params.contextId");
        const oldContextId = get(oldProps, "match.params.contextId");
        if (contextId !== oldContextId && this.state.pluginsAreLoaded) {
            this.props.reset();
            this.props.loadContext(contextId);
        }
    }
    componentWillUnmount() {
        this.props.reset();
    }

    onPluginsLoaded = (pluginsAreLoaded) => {
        if (pluginsAreLoaded && !this.state.pluginsAreLoaded) {
            this.setState({pluginsAreLoaded: true}, () => {
                const contextId = get(this.props, "match.params.contextId");
                this.props.reset();
                this.props.loadContext(contextId);
            });
        }
    }

    render() {
        return (<Page
            id="context-creator"
            component={BorderLayout}
            includeCommon={false}
            plugins={this.props.plugins}
            params={this.props.match.params}
            loaderComponent={this.props.loaderComponent}
            onPluginsLoaded={this.onPluginsLoaded}
        />);
    }
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    loadContext,
    reset: clearContextCreator
})(ContextCreator);
