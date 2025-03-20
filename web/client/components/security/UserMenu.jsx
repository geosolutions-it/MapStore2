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

function UserMenuItem({
    href,
    glyph,
    msgId,
    text,
    onClick
}) {
    return (<>
        <MenuItem {...(href ? { href } : {})} onClick={onClick}>
            <Glyphicon glyph={glyph} />{  msgId ? <Message msgId={msgId} /> : text}
        </MenuItem>
    </>
    );
}

UserMenuItem.propTypes = {
    href: PropTypes.string,
    glyph: PropTypes.string,
    msgId: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.func
};

const UserMenu = ({
    user,
    displayName,
    providers,
    showAccountInfo,
    showPasswordChange,
    showLogout,
    hidden,
    displayUnsavedDialog,
    bsStyle,
    tooltipPosition,
    renderButtonText,
    nav,
    menuProps,
    renderButtonContent,
    onShowAccountInfo,
    onShowChangePassword,
    onShowLogin,
    onLogout,
    onCheckMapChanges,
    className,
    renderUnsavedMapChangesDialog,
    onCloseUnsavedDialog,
    isAdmin,
    managerItems
}) => {

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

        if (isAdmin) {
            if (managerItems.length > 0) {
                itemArray.push(<MenuItem key="1-divider" divider />);
            }

            managerItems?.forEach((item, key) => {
                if (item.Component) {
                    (
                        itemArray.push(
                            <item.Component
                                key={item.name || key}
                                itemComponent={UserMenuItem}
                            />
                        ));
                } else {
                    const href = item.path ? `#${item.path}` : null;
                    itemArray.push(
                        <MenuItem href={href} key={item.name || key} onClick={item.onClick}>
                            <Glyphicon glyph={item.glyph} />
                            <Message msgId={item.msgId}/>
                        </MenuItem>
                    );
                }

            });

        }

        if (showLogout) {
            if (itemArray.length > 0) {
                itemArray.push(<MenuItem key="2-divider" divider />);
            }
            itemArray.push(
                <MenuItem key="logout" onClick={checkUnsavedChanges}>
                    <Glyphicon glyph="log-out" />
                    <Message msgId="user.logout"/>
                </MenuItem>
            );
        }
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
                        onClick: logout
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


UserMenu.defaultProps = {
    displayName: "name",
    showAccountInfo: true,
    showPasswordChange: true,
    showLogout: true,
    hidden: false,
    displayUnsavedDialog: false,
    displayAttributes: () => {},
    bsStyle: "primary",
    tooltipPosition: 'bottom',
    renderButtonText: false,
    nav: false,
    menuProps: { noCaret: true },
    renderButtonContent: () => {},
    onShowAccountInfo: () => {},
    onShowChangePassword: () => {},
    onShowLogin: () => {},
    onLogout: () => {},
    onCheckMapChanges: () => {},
    className: "user-menu",
    renderUnsavedMapChangesDialog: true,
    onCloseUnsavedDialog: () => {}
};

export default UserMenu;
