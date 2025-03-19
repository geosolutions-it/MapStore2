import PropTypes from 'prop-types';

/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { DropdownButton, MenuItem, NavDropdown, Glyphicon } from 'react-bootstrap';
import Message from '../I18N/Message';
import ConfirmModal from '../misc/ResizableModal';
import tooltip from "../misc/enhancers/tooltip";

const TNavDropdown = tooltip(NavDropdown);
const TDropdownButton = tooltip(DropdownButton);

import  usePluginItems  from '../../hooks/usePluginItems';


/**
 * A DropDown menu for user details:
 */

const UserMenu = ({
    // Props with default values
    user = {},
    tooltipPosition = 'bottom',
    showAccountInfo = true,
    showPasswordChange = true,
    showLogout = true,
    onLogout = () => {},
    onCheckMapChanges = () => {},
    onCloseUnsavedDialog = () => {},
    displayName = "name",
    bsStyle = "primary",
    displayAttributes = (attr) => attr.name === "email",
    className = "user-menu",
    menuProps = { noCaret: true },
    renderUnsavedMapChangesDialog = true,
    renderButtonText = false,
    hidden = false,
    displayUnsavedDialog = false,
    // Other props
    nav,
    providers,
    onShowLogin,
    onShowAccountInfo,
    onShowChangePassword,
    renderButtonContent,
    onLogoutConfirm,
    entries,
    enableRulesManager,
    enableImporter,
    onItemSelected,
    items = []
}, context) => {
    const { loadedPlugins } = context;

    const configuredItems = usePluginItems({ items, loadedPlugins });


    const managerItems = [
        ...entries
            .filter(e => enableRulesManager || e.path !== '/rules-manager')
            .filter(e => enableImporter || e.path !== '/importer')
            .map(e => ({...e, onClick: () => onItemSelected(e.id)})),
        ...configuredItems.filter(({ target }) => target === 'manager-menu')
    ].sort((a, b) => a.position - b.position);

    const logout = () => {
        onCloseUnsavedDialog();
        onLogout();
    };

    const checkUnsavedChanges = () => {
        if (renderUnsavedMapChangesDialog) {
            onCheckMapChanges(onLogout);
        } else {
            logout();
        }
    };

    const renderButtonText_ = () => {
        return renderButtonContent
            ? renderButtonContent({ user, renderButtonText, displayName })
            : [
                <Glyphicon key="icon" glyph="user" />,
                renderButtonText ? (user?.[displayName] || "Guest") : null
            ];
    };

    const renderGuestTools = () => {
        const DropDown = nav ? TNavDropdown : TDropdownButton;
        return (
            <DropDown
                className={className}
                pullRight
                bsStyle={bsStyle}
                title={renderButtonText_()}
                id="dropdown-basic-primary"
                tooltipId="user.login"
                tooltipPosition={tooltipPosition}
                {...menuProps}>
                <MenuItem onClick={() => onShowLogin(providers)}>
                    <Glyphicon glyph="log-in" />
                    <Message msgId="user.login"/>
                </MenuItem>
            </DropDown>
        );
    };

    const renderLoggedTools = () => {
        const DropDown = nav ? TNavDropdown : TDropdownButton;
        const itemArray = [];

        if (showAccountInfo) {
            itemArray.push(
                <MenuItem key="accountInfo" onClick={onShowAccountInfo}>
                    <Glyphicon glyph="user" />
                    <Message msgId="user.info"/>
                </MenuItem>
            );
        }

        if (showPasswordChange) {
            itemArray.push(
                <MenuItem key="passwordChange" onClick={onShowChangePassword}>
                    <Glyphicon glyph="asterisk" />
                    <Message msgId="user.changePwd"/>
                </MenuItem>
            );
        }

        if (managerItems.length > 0) {
            itemArray.push(<MenuItem key="divider" divider />);
        }

        managerItems?.forEach((item) => {
            itemArray.push(
                <MenuItem key={item.name} onClick={item.action}>
                    <Glyphicon glyph={item.glyph} />
                    <Message msgId={item.msgId}/>
                </MenuItem>
            );
        });

        if (showLogout) {
            if (itemArray.length > 0) {
                itemArray.push(<MenuItem key="divider" divider />);
            }
            itemArray.push(
                <MenuItem key="logout" onClick={checkUnsavedChanges}>
                    <Glyphicon glyph="log-out" />
                    <Message msgId="user.logout"/>
                </MenuItem>
            );
        }

        console.log("managerItems", managerItems);


        return (
            <React.Fragment>
                <DropDown
                    id="loginButton"
                    className={className}
                    pullRight
                    bsStyle="success"
                    title={renderButtonText_()}
                    tooltipId="user.userMenu"
                    tooltipPosition={tooltipPosition}
                    {...menuProps}
                >
                    <span key="logged-user">
                        <MenuItem header>{user.name}</MenuItem>
                    </span>
                    {itemArray}
                </DropDown>
                <ConfirmModal
                    show={displayUnsavedDialog || false}
                    onClose={onCloseUnsavedDialog}
                    title={<Message msgId="resources.maps.unsavedMapConfirmTitle" />}
                    buttons={[{
                        bsStyle: "primary",
                        text: <Message msgId="resources.maps.unsavedMapConfirmButtonText" />,
                        onClick: onLogoutConfirm
                    }, {
                        text: <Message msgId="resources.maps.unsavedMapCancelButtonText" />,
                        onClick: onCloseUnsavedDialog
                    }]}
                    fitContent
                >
                    <div className="ms-detail-body">
                        <Message msgId="resources.maps.unsavedMapConfirmMessage" />
                    </div>
                </ConfirmModal>
            </React.Fragment>
        );
    };

    if (hidden) return null;
    return user?.[displayName] ? renderLoggedTools() : renderGuestTools();
};

UserMenu.propTypes = {
    user: PropTypes.object,
    displayName: PropTypes.string,
    providers: PropTypes.array,
    showAccountInfo: PropTypes.bool,
    showPasswordChange: PropTypes.bool,
    showLogout: PropTypes.bool,
    hidden: PropTypes.bool,
    displayUnsavedDialog: PropTypes.bool,
    displayAttributes: PropTypes.func,
    bsStyle: PropTypes.string,
    tooltipPosition: PropTypes.string,
    renderButtonText: PropTypes.bool,
    nav: PropTypes.bool,
    menuProps: PropTypes.object,
    renderButtonContent: PropTypes.func,
    onShowAccountInfo: PropTypes.func,
    onShowChangePassword: PropTypes.func,
    onShowLogin: PropTypes.func,
    onLogout: PropTypes.func,
    onCheckMapChanges: PropTypes.func,
    className: PropTypes.string,
    renderUnsavedMapChangesDialog: PropTypes.bool,
    onLogoutConfirm: PropTypes.func,
    onCloseUnsavedDialog: PropTypes.func
};

UserMenu.contextTypes = {
    loadedPlugins: PropTypes.object
};

UserMenu.defaultProps = {
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
    ]
};

export default UserMenu;
