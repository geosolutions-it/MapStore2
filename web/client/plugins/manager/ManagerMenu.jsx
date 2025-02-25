/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createPlugin } from '../../utils/PluginsUtils';
import usePluginItems from '../../hooks/usePluginItems';
import { itemSelected } from '../../actions/manager';
import { isPageConfigured } from '../../selectors/plugins';
import tooltip from '../../components/misc/enhancers/tooltip';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import Message from '../../components/I18N/Message';
const TDropdownButton = tooltip(DropdownButton);

const IMPORTER_ID = 'importer';
const RULE_MANAGER_ID = 'rulesmanager';

function ManagerMenuItem({
    href,
    onClick,
    glyph,
    msgId,
    text
}) {
    return (
        <MenuItem href={href} onClick={onClick}>
            <Glyphicon glyph={glyph} />{msgId ? <Message msgId={msgId} /> : text}
        </MenuItem>
    );
}

ManagerMenuItem.propTypes = {
    href: PropTypes.string,
    glyph: PropTypes.string,
    msgId: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.func
};

ManagerMenuItem.defaultProps = {
    onClick: () => {}
};

function ManagerMenu({
    id,
    role,
    entries,
    enableRulesManager,
    enableImporter,
    title,
    onItemSelected,
    items
}, context) {

    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });

    if (role !== 'ADMIN') {
        return null;
    }

    const defaultItems = [
        ...entries
            .filter(e => enableRulesManager || e.path !== '/rules-manager')
            .filter(e => enableImporter || e.path !== '/importer'),
        ...configuredItems
    ]
        .sort((a, b) => a.position - b.position);

    return (
        <TDropdownButton
            id={id}
            noCaret
            pullRight
            bsStyle="primary"
            title={<Glyphicon glyph="1-menu-manage"/>}
            tooltipId="manager.managerMenu"
            tooltipPosition="bottom"
            className="square-button-md"
        >
            {title}
            {defaultItems.map((entry, key) => {
                if (entry.Component) {
                    return (
                        <entry.Component
                            key={entry.name || key}
                            onItemSelected={onItemSelected}
                            itemComponent={ManagerMenuItem}
                        />
                    );
                }
                const href = `#${entry.path}`;
                return (
                    <ManagerMenuItem
                        key={`${href}:${key}`}
                        href={href}
                        onClick={() => onItemSelected(entry.id)}
                        glyph={entry.glyph}
                        msgId={entry.msgId}
                        text={entry.text}
                    />
                );
            })}
        </TDropdownButton>
    );
}

ManagerMenu.propTypes = {
    id: PropTypes.string,
    role: PropTypes.string,
    entries: PropTypes.array,
    title: PropTypes.node,
    onItemSelected: PropTypes.func,
    enableRulesManager: PropTypes.bool,
    enableImporter: PropTypes.bool
};

ManagerMenu.contextTypes = {
    loadedPlugins: PropTypes.object
};

ManagerMenu.defaultProps = {
    id: 'mapstore-manager-menu',
    entries: [
        {
            msgId: 'users.title',
            glyph: '1-group-mod',
            path: '/manager/usermanager',
            position: 1
        },
        {
            msgId: 'rulesmanager.menutitle',
            glyph: 'admin-geofence',
            path: '/rules-manager',
            position: 2
        },
        {
            msgId: 'importer.title',
            glyph: 'upload',
            path: '/importer',
            position: 3
        }
    ],
    role: '',
    onItemSelected: () => {},
    title: <MenuItem header>Manager</MenuItem>
};

const ConnectedManagerMenu = connect((state) => ({
    enableRulesManager: isPageConfigured(RULE_MANAGER_ID)(state),
    enableImporter: isPageConfigured(IMPORTER_ID)(state),
    role: state.security && state.security.user && state.security.user.role
}), {
    onItemSelected: itemSelected
})(ManagerMenu);

/**
 * This plugin provides a special Manager dropdown menu, that contains various administration tools
 * @memberof plugins
 * @class
 * @name ManagerMenu
 * @prop {object[]} items this property contains the items injected from the other plugins,
 * using the `containers` option in the plugin that want to inject the new menu items.
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
 *          ManagerMenu: {
 *              name: "TOOLNAME", // a name for the current tool.
 *              Component: MyMenuItemComponent
 *          },
 * // ...
 */
export default createPlugin('ManagerMenu', {
    component: ConnectedManagerMenu,
    containers: {
        BrandNavbar: {
            target: 'right-menu',
            position: 7,
            priority: 3
        }
    }
});
