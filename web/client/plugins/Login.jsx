const PropTypes = require('prop-types');
/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const {UserDetails, PasswordReset, UserMenu, Login, LoginNav } = require('./login/index');
const epics = require('../epics/login');
const { comparePendingChanges } = require('../epics/pendingChanges');

require('./login/login.css');

/**
  * Login Plugin. Allow to login/logout or show user info and reset password tools
  * @class Login
  * @memberof plugins
  * @static
  *
  * @prop {string} cfg.id identifier of the Plugin, by default `"mapstore-login-menu"`
  * @prop {object} cfg.menuStyle inline style for the menu, by defualt:
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

module.exports = {
    LoginPlugin: assign(LoginTool, {
        OmniBar: {
            name: "login",
            position: 3,
            tool: LoginNav,
            tools: [UserDetails, PasswordReset, Login],
            priority: 1
        }
    }),
    reducers: {security: require('../reducers/security')},
    epics: {
        ...epics,
        comparePendingChanges
    }
};
