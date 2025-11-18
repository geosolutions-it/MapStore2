/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import epics from '../epics/login';
import { comparePendingChanges } from '../epics/pendingChanges';
import security from '../reducers/security';
import { UserMenu, UserDetailsMenuItem, PasswordResetMenuItem, LoginMenuItem, LogoutMenuItem, Login } from './login/index';
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
  * Login Plugin. Allow to login/logout or show user info and reset password tools. If the user role is admin it will also show the manager tools. (manage accounts, manage tags and rules manager)
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
  * @class
  * @memberof plugins
  * @static
  * @name Login
  *
  * @prop {string} cfg.id identifier of the Plugin, by default `"mapstore-login-menu"`
  * @prop {boolean} cfg.isUsingLDAP flag refers to if the user with type LDAP or not to manage show/hide change psasword, by default: false
  * @prop {object[]} items this property contains the items injected from the other plugins
  *  * using the `containers` option in the plugin that want to inject the new menu items.
  * ```javascript
  * const MyMenuItemComponent = connect(selector, { onActivateTool })(({
  *  itemComponent, // default component that provides a consistent UI (see ManagerMenuItem in ManagerMenu plugin for props)
  *  onItemSelected, // callback to trigger the menu manager action on click, an id should be passed as argument
  *  onActivateTool, // example of a custom connected action
  * }) => {
  *  const ItemComponent = itemComponent;
  *  return (
  *      <ItemComponent
  *          glyph="heart"
  *          msgId="myMessageId"
  *          href="myMessageId"
  *          onClick={() => onActivateTool()}
  *      />
  *  );
  * });
  * createPlugin(
  *  'MyPlugin',
  *  {
  *      containers: {
  *          Login: {
  *              target: 'manager-menu', // or also "user-menu" if you want item for user(role is not admin) for admin role use "manager-menu",
  *              name: "TOOLNAME", // a name for the current tool.
  *              Component: MyMenuItemComponent
  *          },
  * // ...
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
    isAdmin,
    displayName,
    showAccountInfo,
    bsStyle,
    className
}, context) {

    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });
    const showPasswordChange = !(!isAdmin && isUsingLDAP);
    const authenticated = user?.[displayName];
    const userItems = authenticated ? [
        { name: 'UserDetails', Component: UserDetailsMenuItem, position: 1},
        { name: 'PasswordReset', Component: PasswordResetMenuItem, position: 2},
        ...configuredItems.filter(({ target }) => target === 'user-menu')
    ].sort((a, b) => a.position - b.position) : [];

    const managerItems = authenticated && isAdmin ? [
        ...entries
            .filter(e => enableRulesManager || e.path !== '/rules-manager')
            .filter(e => enableImporter || e.path !== '/importer')
            .map(e => ({...e, onClick: () => onItemSelected(e.id)})),
        ...configuredItems.filter(({ target }) => target === 'manager-menu')
    ].sort((a, b) => a.position - b.position) : [];

    const authItem = authenticated ? [{ name: 'Logout', Component: LogoutMenuItem }] : [{ name: 'Login', Component: LoginMenuItem}];

    const menuItems = [
        ...userItems,
        ...(userItems.length ? [{ type: 'divider' }] : []),
        ...managerItems,
        ...(managerItems.length ? [{ type: 'divider' }] : []),
        ...authItem
    ];

    return (
        <>
            <UserMenu
                key={authenticated ? 'authenticated' : '' }
                user={user}
                hidden={hidden}
                menuItems={menuItems}
                id={id}
                className={className}
                tooltipPosition={"bottom"}
                bsStyle={authenticated ? "success" : bsStyle}
                isAdmin={isAdmin}
                showPasswordChange={showPasswordChange}
                showAccountInfo={showAccountInfo}
                isUsingLDAP={isUsingLDAP}
            />
            <Login/>
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
    isUsingLDAP: PropTypes.bool,
    displayName: PropTypes.string,
    className: PropTypes.string
};

LoginPlugin.defaultProps = {
    id: 'mapstore-login-menu',
    displayName: "name",
    user: {},
    entries: [
        {
            name: 'users.title',
            msgId: 'users.title',
            glyph: '1-user-mod',
            path: '/manager/usermanager',
            position: 1
        },
        {
            name: 'usergroups.title',
            msgId: 'usergroups.title',
            glyph: '1-group-mod',
            path: '/manager/groupmanager',
            position: 2
        },
        {
            name: 'resourcesCatalog.manageTags',
            msgId: 'resourcesCatalog.manageTags',
            glyph: 'tags',
            path: '/manager/tagsmanager',
            position: 3
        },
        {
            name: 'resourcesCatalog.manageIPs',
            msgId: 'resourcesCatalog.manageIPs',
            glyph: 'globe',
            path: '/manager/ipmanager',
            position: 4
        },
        {
            name: 'rulesmanager.menutitle',
            msgId: 'rulesmanager.menutitle',
            glyph: 'admin-geofence',
            path: '/rules-manager',
            position: 4
        },
        {
            name: 'importer.title',
            msgId: 'importer.title',
            glyph: 'upload',
            path: '/importer',
            position: 5
        }
    ],
    onItemSelected: () => {},
    items: [],
    enableRulesManager: false,
    enableImporter: false,
    hidden: false,
    isAdmin: false,
    isUsingLDAP: false,
    className: 'square-button'
};


export default createPlugin('Login', {
    component: ConnectedLoginPlugin,
    containers: {
        OmniBar: {
            name: "login",
            position: 3,
            tool: ConnectedLoginPlugin,
            priority: 1
        },
        BrandNavbar: {
            target: 'right-menu',
            position: 9,
            priority: 3,
            // TODO: remove square-button-md as soon all square button size are aligned
            Component: connect(() => ({ className: 'square-button-md' }))(ConnectedLoginPlugin)
        },
        SidebarMenu: {
            name: "login",
            position: 2,
            tool: ConnectedLoginPlugin,
            selector: (state) => ({
                style: { display: burgerMenuSelector(state) ? 'none' : null }
            }),
            priority: 2
        }
    },
    reducers: {security},
    epics: {
        ...epics,
        comparePendingChanges
    }
});
