/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {UserDetails, PasswordReset, UserMenu, Login } = require('./login/index');

const LoginTool = React.createClass({
    propTypes: {
        menuStyle: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            menuStyle: {
                position: "absolute",
                right: "0px",
                top: "0px",
                margin: "20px",
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
    LoginPlugin: LoginTool,
    reducers: {security: require('../reducers/security')}
};
