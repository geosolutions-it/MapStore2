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

import { loadDashboard, resetDashboard } from '../../actions/dashboard';
import { checkLoggedUser } from '../../actions/security';
import Page from '../../containers/Page';
import BorderLayout from '../../components/layout/BorderLayout';
import {onPluginsLoadedHandler} from "../../utils/ModulePluginsUtils";

/**
  * @name Dashboard
  * @memberof pages
  * @class
  * @classdesc
  * This is the main container page for Dashboard.
  * It handles all the routing and initial loading functionalities dedicated to Dashboard contents and
  * it is a container for the Dashboard plugins.
  *
  */
class DashboardPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadResource: PropTypes.func,
        checkLoggedUser: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object,
        name: PropTypes.string,
        loaderComponent: PropTypes.func
    };

    static defaultProps = {
        name: "dashboard",
        mode: 'desktop',
        reset: () => {},
        checkLoggedUser: () => {}
    };

    state = {};

    componentDidUpdate(oldProps) {
        const id = get(this.props, "match.params.did");
        if (get(oldProps, "match.params.did") !== get(this.props, "match.params.did") && this.state.pluginsAreLoaded) {
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

    onPluginsLoaded = (loadedPlugins) => {
        onPluginsLoadedHandler(loadedPlugins, ['Dashboard'], () => {
            this.setState({pluginsAreLoaded: true}, () => {
                const id = get(this.props, "match.params.did");
                if (id) {
                    this.props.reset();
                    this.props.loadResource(id);
                } else {
                    this.props.reset();
                    this.props.checkLoggedUser();
                }
            });
        }, this.state.pluginsAreLoaded);
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
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    checkLoggedUser,
    loadResource: loadDashboard,
    reset: resetDashboard
})(DashboardPage);
