/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './login/login.css';

import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';

import epics from '../epics/login';
import { comparePendingChanges } from '../epics/pendingChanges';
import security from '../reducers/security';
import { PasswordReset, UserDetails, LoginNav, UserMenu, Login } from './login/index';

/**
  * Login Plugin. Allow to login/logout or show user info and reset password tools.
  * It renders a menu in {@link #plugins.OmniBar|OmniBar} plugin.
  * If `localConfig.json` `authenticationProviders` property in the root contains only one value, the login will use that provider by default.
  * `authenticationProviders` members are object with
  * - `type` (`<openID|basic>`): indicates the type of authentication to use.
  * - `provider` (`<geostore|google|...>`). In case of `type=openID`, the provider indicates the path to query in GeoStore.
  * - `url` optional URL to redirect in case of `openID`. By default it will use the standard convention to `rest/geostore/{provider}/login`.
  * Example of configuration.
  * ```json
  * {
  *  "authenticationProviders": [{"type": "openID", "provider": "google"}, {"type": "basic", "provider": "geostore"}]
  * }
  * ```
  * By default, if not set, it will use classic `{"type": "basic", "provider": "geostore"}` setup for GeoStore.
  * @class Login
  * @memberof plugins
  * @static
  *
  * @prop {string} cfg.id identifier of the Plugin, by default `"mapstore-login-menu"`
  * @prop {object} cfg.menuStyle inline style for the menu, by default:
  * ```
  * menuStyle: {
  *      zIndex: 30
  * }
  *```
  */
class LoginTool extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        menuStyle: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-login-menu",
        menuStyle: {
            zIndex: 30
        }
    };

    render() {
        return (<div id={this.props.id}>
            <div style={this.props.menuStyle}>
                <UserMenu />
            </div>
            <UserDetails />
            <PasswordReset />
            <Login />
        </div>);
    }
}

export default {
    LoginPlugin: assign(LoginTool, {
        OmniBar: {
            name: "login",
            position: 3,
            tool: LoginNav,
            tools: [UserDetails, PasswordReset, Login],
            priority: 1
        }
    }),
    reducers: {security},
    epics: {
        ...epics,
        comparePendingChanges
    }
};
