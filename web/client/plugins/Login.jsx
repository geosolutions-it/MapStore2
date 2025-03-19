/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './login/login.css';
import React from 'react';
import PropTypes from 'prop-types';

import epics from '../epics/login';
import { comparePendingChanges } from '../epics/pendingChanges';
import security from '../reducers/security';
import { Login, UserMenu, PasswordReset, UserDetails, UserDetailsMenuItem, PasswordResetMenuItem, LoginMenuItem, LogoutMenuItem } from './login/index';
import {createPlugin} from "../utils/PluginsUtils";
import {burgerMenuSelector} from "../selectors/controls";
import {userSelector, isAdminUserSelector} from "../selectors/security";
import  usePluginItems  from '../hooks/usePluginItems';
import { connect } from 'react-redux';
import { itemSelected } from '../actions/manager';
import { isPageConfigured } from '../selectors/plugins';

const IMPORTER_ID = 'importer';
const RULE_MANAGER_ID = 'rulesmanager';

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

function LoginPlugin({
    id,
    user,
    entries,
    enableRulesManager,
    enableImporter,
    onItemSelected,
    hidden,
    items,
    isUsingLDAP,
    isAdmin
}, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });
    const showPasswordChange = !(!isAdmin && isUsingLDAP);

    const userItems = user && user.id ? [
        { name: 'UserDetails', Component: UserDetailsMenuItem, position: 1},
        ...(showPasswordChange ? [
            { name: 'PasswordReset', Component: PasswordResetMenuItem, position: 2}
        ] : []),
        ...configuredItems.filter(({ target }) => target === 'user-menu')
    ].sort((a, b) => a.position - b.position) : [];

    const managerItems = user && user.id && isAdmin ? [
        ...entries
            .filter(e => enableRulesManager || e.path !== '/rules-manager')
            .filter(e => enableImporter || e.path !== '/importer')
            .map(e => ({...e, onClick: () => onItemSelected(e.id)})),
        ...configuredItems.filter(({ target }) => target === 'manager-menu')
    ].sort((a, b) => a.position - b.position) : [];

    const authItem = user && user.id ? [{ name: 'Logout', Component: LogoutMenuItem }] : [{ name: 'Login', Component: LoginMenuItem}];

    const menuItems = [
        ...userItems,
        ...(userItems.length ? [{ type: 'divider' }] : []),
        ...managerItems,
        ...(managerItems.length ? [{ type: 'divider' }] : []),
        ...authItem
    ];

    return (
        <>
            <UserMenu user={user} isAdmin={isAdmin} hidden={hidden} menuItems={menuItems} id={id}  className="square-button-md"/>
        </>
    );
}


const ConnectedLoginPlugin = connect((state) => ({
    hidden: false,
    user: userSelector(state),
    enableRulesManager: isPageConfigured(RULE_MANAGER_ID)(state),
    enableImporter: isPageConfigured(IMPORTER_ID)(state),
    isAdmin: isAdminUserSelector(state)
}), {
    onItemSelected: itemSelected
})(LoginPlugin);

LoginPlugin.contextTypes = {
    loadedPlugins: PropTypes.object
};

LoginPlugin.propTypes = {
    id: PropTypes.string,
    entries: PropTypes.array,
    onItemSelected: PropTypes.func,
    enableRulesManager: PropTypes.bool,
    enableImporter: PropTypes.bool,
    items: PropTypes.array,
    user: PropTypes.object,
    hidden: PropTypes.bool,
    isAdmin: PropTypes.bool,
    isUsingLDAP: PropTypes.bool
};

LoginPlugin.defaultProps = {
    id: 'mapstore-login-menu',
    user: {},
    entries: [
        {
            name: 'users.title',
            msgId: 'users.title',
            glyph: '1-group-mod',
            path: '/manager/usermanager',
            position: 1
        },
        {
            name: 'rulesmanager.menutitle',
            msgId: 'rulesmanager.menutitle',
            glyph: 'admin-geofence',
            path: '/rules-manager',
            position: 2
        },
        {
            name: 'importer.title',
            msgId: 'importer.title',
            glyph: 'upload',
            path: '/importer',
            position: 3
        }
    ],
    onItemSelected: () => {},
    items: [],
    enableRulesManager: false,
    enableImporter: false,
    hidden: false,
    isAdmin: false,
    isUsingLDAP: true
};


export default createPlugin('Login', {
    component: ConnectedLoginPlugin,
    containers: {
        OmniBar: {
            name: "login",
            position: 3,
            tool: ConnectedLoginPlugin,
            tools: [UserDetails, PasswordReset, Login],
            priority: 1
        },
        BrandNavbar: {
            target: 'right-menu',
            position: 9,
            priority: 3,
            Component: ConnectedLoginPlugin
        },
        SidebarMenu: {
            name: "login",
            position: 2,
            tool: ConnectedLoginPlugin,
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
