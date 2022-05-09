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
import Message from '../../components/I18N/Message';
import ConfirmModal from '../../components/misc/ResizableModal';
import tooltip from "../misc/enhancers/tooltip";

const TNavDropdown = tooltip(NavDropdown);
const TDropdownButton = tooltip(DropdownButton);

/**
 * A DropDown menu for user details:
 */
class UserMenu extends React.Component {
    static propTypes = {
        // PROPS
        user: PropTypes.object,
        displayName: PropTypes.string,
        showAccountInfo: PropTypes.bool,
        showPasswordChange: PropTypes.bool,
        showLogout: PropTypes.bool,
        hidden: PropTypes.bool,
        displayUnsavedDialog: PropTypes.bool,
        /**
         * displayAttributes function to filter attributes to show
         */
        displayAttributes: PropTypes.func,
        bsStyle: PropTypes.string,
        tooltipPosition: PropTypes.string,
        renderButtonText: PropTypes.bool,
        nav: PropTypes.bool,
        menuProps: PropTypes.object,

        // FUNCTIONS
        renderButtonContent: PropTypes.func,
        // CALLBACKS
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

    static defaultProps = {
        user: {
        },
        tooltipPosition: 'bottom',
        showAccountInfo: true,
        showPasswordChange: true,
        showLogout: true,
        onLogout: () => {},
        onCheckMapChanges: () => {},
        onPasswordChange: () => {},
        onCloseUnsavedDialog: () => {},
        displayName: "name",
        bsStyle: "primary",
        displayAttributes: (attr) => {
            return attr.name === "email";
        },
        className: "user-menu",
        menuProps: {
            noCaret: true
        },
        toolsCfg: [{
            buttonSize: "small",
            includeCloseButton: false,
            useModal: false,
            closeGlyph: "1-close"
        }, {
            buttonSize: "small",
            includeCloseButton: false,
            useModal: false,
            closeGlyph: "1-close"
        }, {
            buttonSize: "small",
            includeCloseButton: false,
            useModal: false,
            closeGlyph: "1-close"
        }],
        renderUnsavedMapChangesDialog: true,
        renderButtonText: false,
        hidden: false,
        displayUnsavedDialog: false
    };

    renderGuestTools = () => {
        let DropDown = this.props.nav ? TNavDropdown : TDropdownButton;
        return (
            <DropDown
                className={this.props.className}
                pullRight
                bsStyle={this.props.bsStyle}
                title={this.renderButtonText()}
                id="dropdown-basic-primary"
                tooltipId="user.login"
                tooltipPosition={this.props.tooltipPosition}
                {...this.props.menuProps}>
                <MenuItem onClick={this.props.onShowLogin}><Glyphicon glyph="log-in" /><Message msgId="user.login"/></MenuItem>
            </DropDown>);
    };

    renderLoggedTools = () => {
        let DropDown = this.props.nav ? TNavDropdown : TDropdownButton;
        let itemArray = [];
        if (this.props.showAccountInfo) {
            itemArray.push(<MenuItem key="accountInfo" onClick={this.props.onShowAccountInfo}> <Glyphicon glyph="user" /><Message msgId="user.info"/></MenuItem>);
        }
        if (this.props.showPasswordChange) {
            itemArray.push(<MenuItem key="passwordChange" onClick={this.props.onShowChangePassword}> <Glyphicon glyph="asterisk" /> <Message msgId="user.changePwd"/></MenuItem>);
        }
        if (this.props.showLogout) {
            if (itemArray.length > 0) {
                itemArray.push(<MenuItem key="divider" divider />);
            }
            itemArray.push(<MenuItem key="logout" onClick={this.checkUnsavedChanges}><Glyphicon glyph="log-out" /> <Message msgId="user.logout"/></MenuItem>);
        }
        return (
            <React.Fragment>
                <DropDown
                    id="loginButton"
                    className={this.props.className}
                    pullRight
                    bsStyle="success"
                    title={this.renderButtonText()}
                    tooltipId="user.userMenu"
                    tooltipPosition={this.props.tooltipPosition}
                    {...this.props.menuProps}
                >
                    <span key="logged-user"><MenuItem header>{this.props.user.name}</MenuItem></span>
                    {itemArray}
                </DropDown>
                <ConfirmModal
                    ref="unsavedMapModal"
                    show={this.props.displayUnsavedDialog || false}
                    onClose={this.props.onCloseUnsavedDialog}
                    title={<Message msgId="resources.maps.unsavedMapConfirmTitle" />}
                    buttons={[{
                        bsStyle: "primary",
                        text: <Message msgId="resources.maps.unsavedMapConfirmButtonText" />,
                        onClick: this.props.onLogoutConfirm
                    }, {
                        text: <Message msgId="resources.maps.unsavedMapCancelButtonText" />,
                        onClick: this.props.onCloseUnsavedDialog
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

    renderButtonText = () => {

        return this.props.renderButtonContent ?
            this.props.renderButtonContent(this.props) :
            [<Glyphicon glyph="user" />, this.props.renderButtonText ? this.props.user && this.props.user[this.props.displayName] || "Guest" : null];
    };

    render() {
        if (this.props.hidden) return false;
        return this.props.user && this.props.user[this.props.displayName] ? this.renderLoggedTools() : this.renderGuestTools();
    }

    logout = () => {
        this.props.onCloseUnsavedDialog();
        this.props.onLogout();
    }

    checkUnsavedChanges = () => {
        if (this.props.renderUnsavedMapChangesDialog) {
            this.props.onCheckMapChanges(this.props.onLogout);
        } else {
            this.logout();
        }
    }
}

export default UserMenu;
