/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const {UserDetails, PasswordReset, UserMenu, Login, LoginNav } = require('./login/index');

require('./login/login.css');

const LoginTool = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        menuStyle: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "mapstore-login-menu",
            menuStyle: {
                zIndex: 30
            }
        };
    },
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
});
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
    reducers: {security: require('../reducers/security')}
};
