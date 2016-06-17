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

const LoginTool = React.createClass({
    propTypes: {
        menuStyle: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            menuStyle: {
                zIndex: 30
            }
        };
    },
    render() {
        return (<div>
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
            tools: [UserDetails, PasswordReset, Login]
        }
    }),
    reducers: {security: require('../reducers/security')}
};
