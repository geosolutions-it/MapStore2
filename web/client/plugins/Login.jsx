/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './login/login.css';

import PropTypes from 'prop-types';
import React from 'react';

import epics from '../epics/login';
import { comparePendingChanges } from '../epics/pendingChanges';
import security from '../reducers/security';
import { Login, LoginNav, PasswordReset, UserDetails, UserMenu } from './login/index';
import {connect, createPlugin} from "../utils/PluginsUtils";
import {Glyphicon} from "react-bootstrap";
import {burgerMenuSelector} from "../selectors/controls";
import { isAdminUserSelector } from '../selectors/security';

/**
  * Login Plugin. Allow to login/logout or show user info and reset password tools.
  * It renders a menu in {@link #plugins.OmniBar|OmniBar} plugin.
  * If `localConfig.json` `authenticationProviders` property in the root contains only one value, the login will use that provider by default.
  * `authenticationProviders` members are object with
  * - `type` (`<openID|basic>`): indicates the type of authentication to use.
  * - `provider` (`<geostore|google|...>`). In case of `type=openID`, the provider indicates the path to query in GeoStore.
  * - `url` optional URL to redirect in case of `openID`. By default it will use the standard convention to `rest/geostore/{provider}/login`.
  * - `imageURL` optional URL for the image to use in the link of the login form. (certain pre-defined services like `google` may have their own default logo)
  * - `title` a text to show in the link to the login page of the provider, if logo is present, this text is used as `alt` text in for the image.
  * Example of configuration.
  * ```json
  * {
  *  "authenticationProviders": [{"type": "openID", "provider": "google"}, {"type": "basic", "provider": "geostore"}]
  * }
  * ```
  * By default, if not set, it will use classic `{"type": "basic", "provider": "geostore"}` setup for GeoStore.
 *
 * If you want to show this plugin with BurgerMenu (so without Sidebar), apply the following configuration:
 *
 * ```javascript
 * {
 *     "cfg": {},
 *     "override": {
 *         "OmniBar": {
 *             "priority": 5
 *         }
 *     }
 * }
 * ```
 *
  * @class Login
  * @memberof plugins
  * @static
  *
  * @prop {string} cfg.id identifier of the Plugin, by default `"mapstore-login-menu"`
  * @prop {object} cfg.menuStyle inline style for the menu, by default:
  * @prop {object} cfg.isUsingLDAP flag refers to if the user with type LDAP or not to manage show/hide change psasword, by default: false
  * ```
  * menuStyle: {
  *      zIndex: 30
  * }
  *```
  */
class LoginTool extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        menuStyle: PropTypes.object,
        isAdmin: PropTypes.bool,
        isUsingLDAP: PropTypes.bool
    };

    static defaultProps = {
        id: "mapstore-login-menu",
        menuStyle: {
            zIndex: 30
        },
        isAdmin: false,
        isUsingLDAP: false
    };

    render() {
        return (<div id={this.props.id}>
            <div style={this.props.menuStyle}>
                <UserMenu showPasswordChange={!(!this.props.isAdmin && this.props.isUsingLDAP)} />
            </div>
            <UserDetails />
            <PasswordReset />
            <Login />
        </div>);
    }
}

const LoginNavComponent = connect((state) => ({
    renderButtonContent: () => {return <Glyphicon glyph="user" />; },
    bsStyle: 'primary',
    isAdmin: isAdminUserSelector(state)
}))(LoginNav);

export default createPlugin('Login', {
    component: connect((state) => ({isAdmin: isAdminUserSelector(state)}))(LoginTool),
    containers: {
        OmniBar: {
            name: "login",
            position: 3,
            tool: LoginNavComponent,
            tools: [UserDetails, PasswordReset, Login],
            priority: 1
        },
        BrandNavbar: {
            target: 'right-menu',
            position: 9,
            priority: 3,
            Component: (props) => {
                return (
                    <>
                        <LoginNavComponent {...props} className="square-button-md"/>
                        <UserDetails />
                        <PasswordReset />
                        <Login />
                    </>
                );
            }
        },
        SidebarMenu: {
            name: "login",
            position: 2,
            tool: connect((state) => ({
                bsStyle: 'tray',
                tooltipPosition: 'left',
                renderButtonContent: (props) => [<Glyphicon glyph="user" />, props.renderButtonText ? props.user && <span>props.user[props.displayName]</span> || <span>"Guest"</span> : null],
                renderButtonText: true,
                menuProps: {
                    noCaret: true
                },
                isAdmin: isAdminUserSelector(state)
            }))(LoginNav),
            selector: (state) => ({
                style: { display: burgerMenuSelector(state) ? 'none' : null }
            }),
            tools: [UserDetails, PasswordReset, Login],
            priority: 2
        }
    },
    reducers: {security},
    epics: {
        ...epics,
        comparePendingChanges
    }
});
