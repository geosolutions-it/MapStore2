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
import { Login, LoginNav, PasswordReset, UserDetails, UserMenu } from './login/index';
import {connect} from "../utils/PluginsUtils";
import {Glyphicon} from "react-bootstrap";
import {burgerMenuSelector} from "../selectors/controls";
import {sidebarIsActiveSelector} from "../selectors/sidebarmenu";

/**
  * Login Plugin. Allow to login/logout or show user info and reset password tools.
  * It renders a menu in {@link #plugins.OmniBar|OmniBar} plugin.
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
            tool: connect((state) => ({
                hidden: sidebarIsActiveSelector(state),
                renderButtonContent: () => {return <Glyphicon glyph="user" />; },
                bsStyle: 'primary'
            }))(LoginNav),
            tools: [UserDetails, PasswordReset, Login],
            priority: 1
        },
        SidebarMenu: {
            name: "login",
            position: 2,
            tool: connect(() => ({
                bsStyle: 'tray',
                tooltipPosition: 'left',
                renderButtonContent: (props) => [<Glyphicon glyph="user" />, props.renderButtonText ? props.user && <span>props.user[props.displayName]</span> || <span>"Guest"</span> : null],
                renderButtonText: true,
                menuProps: {
                    noCaret: true
                }
            }))(LoginNav),
            selector: (state) => ({
                style: { display: burgerMenuSelector(state) ? 'none' : null }
            }),
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
