/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { MenuItem } from 'react-bootstrap';
import { changePassword, login, loginFail } from '../../actions/security';
import {onShowLogin, closeLogin, onLogout, openIDLogin} from '../../actions/login';


import { setControlProperty } from '../../actions/controls';

import LoginModalComp from '../../components/security/modals/LoginModal';
import PasswordResetModalComp from '../../components/security/modals/PasswordResetModal';
import UserDetailsModalComp from '../../components/security/modals/UserDetailsModal';
import UserMenuComp from '../../components/security/UserMenu';
import ConfigUtils from '../../utils/ConfigUtils';
import { connect } from '../../utils/PluginsUtils';
import { userSelector, authProviderSelector, isAdminUserSelector } from '../../selectors/security';
import { itemSelected } from '../../actions/manager';

const userMenuConnect = connect((state, props) => ({
    currentProvider: authProviderSelector(state),
    title: <MenuItem header>{userSelector(state)?.name}</MenuItem>,
    tooltipPosition: "bottom",
    bsStyle: "success",
    user: props.user,
    hidden: props.hidden,
    isAdmin: isAdminUserSelector(state),
    providers: ConfigUtils.getConfigProp("authenticationProviders"),
    className: props.className || "square-button"
}), {
    onShowLoggedin: onShowLogin,
    onShowAccountInfo: setControlProperty.bind(null, "AccountInfo", "enabled", true, true),
    onShowChangePassword: setControlProperty.bind(null, "ResetPassword", "enabled", true, true),
    onLoggedout: onLogout,
    onItemSelected: itemSelected
}, (stateProps = {}, dispatchProps = {}, ownProps = {}) => {
    const {currentProvider, providers = []} = stateProps;
    const {type, showAccountInfo = false, showPasswordChange = false} =
        (providers ?? []).find(({provider}) => provider === currentProvider) || {};
    const isOpenID = type === "openID";
    const isNormalLDAPUser = ownProps.isUsingLDAP && !ownProps.isAdmin;

    return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        showAccountInfo: isOpenID ? showAccountInfo : ownProps.showAccountInfo,
        showPasswordChange: isOpenID ? showPasswordChange : isNormalLDAPUser ? false : ownProps.showPasswordChange
    };
});

export const UserDetails = connect((state) => ({
    user: userSelector(state),
    show: state.controls.AccountInfo && state.controls.AccountInfo.enabled}
), {
    onClose: setControlProperty.bind(null, "AccountInfo", "enabled", false, false)
})(UserDetailsModalComp);

export const  UserDetailsMenuItem = userMenuConnect(({itemComponent, showAccountInfo, onShowAccountInfo}) => {
    const Menuitem = itemComponent;
    if (!Menuitem && !showAccountInfo) return null;
    return (<><Menuitem glyph="user" msgId= "user.info" onClick={onShowAccountInfo}/><UserDetails/></>);
});

export const PasswordReset = connect((state) => ({
    user: userSelector(state),
    show: state.controls.ResetPassword && state.controls.ResetPassword.enabled,
    changed: state.security && state.security.passwordChanged && true || false,
    error: state.security && state.security.passwordError,
    loading: state.security && state.security.changePasswordLoading || false
}), {
    onPasswordChange: (user, pass) => { return changePassword(user, pass); },
    onClose: setControlProperty.bind(null, "ResetPassword", "enabled", false, false)
})(PasswordResetModalComp);

export const PasswordResetMenuItem = userMenuConnect(({itemComponent, showPasswordChange, onShowChangePassword}) => {
    const Menuitem = itemComponent;
    if (!Menuitem && !showPasswordChange) return null;
    return (<><Menuitem glyph="asterisk" msgId= "user.changePwd" onClick={onShowChangePassword}/><PasswordReset/></>);
});

export const Login = connect((state) => ({
    providers: ConfigUtils.getConfigProp("authenticationProviders"),
    show: state.controls.LoginForm && state.controls.LoginForm.enabled,
    user: userSelector(state),
    loginError: state.security && state.security.loginError
}), {
    onLoginSuccess: setControlProperty.bind(null, 'LoginForm', 'enabled', false, false),
    openIDLogin,
    onClose: closeLogin,
    onSubmit: login,
    onError: loginFail
})(LoginModalComp);

export const LoginMenuItem = userMenuConnect(({itemComponent, showLogin, onShowLoggedin}) => {
    const Menuitem = itemComponent;
    if (!Menuitem && !showLogin) return null;
    return (<><Menuitem glyph="log-in" msgId= "user.login" onClick={onShowLoggedin}/><Login/></>);
});

export const LogoutMenuItem = userMenuConnect(({itemComponent, showLogout, onLoggedout}) => {
    const Menuitem = itemComponent;
    if (!Menuitem && !showLogout) return null;
    return (<><Menuitem glyph="log-out" msgId= "user.logout" onClick={onLoggedout}/></>);
});

export const UserMenu = userMenuConnect(UserMenuComp);

export default {
    UserDetails,
    PasswordReset,
    Login,
    UserMenu,
    UserDetailsMenuItem,
    PasswordResetMenuItem,
    LoginMenuItem,
    LogoutMenuItem
};
