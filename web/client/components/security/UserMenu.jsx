const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {DropdownButton, MenuItem, NavDropdown, Glyphicon} = require('react-bootstrap');
const Message = require('../../components/I18N/Message');
const ConfirmModal = require('../../components/misc/ResizableModal');


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
        /**
         * displayAttributes function to filter attributes to show
         */
        displayAttributes: PropTypes.func,
        bsStyle: PropTypes.string,
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
        onLogoutConfirm: PropTypes.func
    };

    static defaultProps = {
        user: {
        },
        showAccountInfo: true,
        showPasswordChange: true,
        showLogout: true,
        onLogout: () => {},
        onCheckMapChanges: () => {},
        onPasswordChange: () => {},
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
        renderUnsavedMapChangesDialog: true
    };

    checkUnsavedChanges = () => {
        if (this.props.renderUnsavedMapChangesDialog) {
            this.props.onCheckMapChanges(this.props.onLogout);
        } else {
            this.logout();
        }
    }

    logout = () => {
        this.props.onCloseUnsavedDialog();
        this.props.onLogout();
    }

    renderGuestTools = () => {
        let DropDown = this.props.nav ? NavDropdown : DropdownButton;
        return (<DropDown className={this.props.className} pullRight bsStyle={this.props.bsStyle} title={this.renderButtonText()} id="dropdown-basic-primary" {...this.props.menuProps}>
            <MenuItem onClick={this.props.onShowLogin}><Glyphicon glyph="log-in" /><Message msgId="user.login"/></MenuItem>
        </DropDown>);
    };

    renderLoggedTools = () => {
        let DropDown = this.props.nav ? NavDropdown : DropdownButton;
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
                <DropDown id="loginButton" className={this.props.className} pullRight bsStyle="success" title={this.renderButtonText()} {...this.props.menuProps} >
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
            this.props.renderButtonContent() :
            [<Glyphicon glyph="user" />, this.props.renderButtonText ? this.props.user && this.props.user[this.props.displayName] || "Guest" : null];
    };

    render() {
        return this.props.user && this.props.user[this.props.displayName] ? this.renderLoggedTools() : this.renderGuestTools();
    }
}

module.exports = UserMenu;
