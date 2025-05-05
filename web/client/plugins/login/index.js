/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { changePassword, login, loginFail, logout } from '../../actions/security';
import {onShowLogin, closeLogin, onLogout, openIDLogin} from '../../actions/login';


import { setControlProperty } from '../../actions/controls';

import { checkPendingChanges } from '../../actions/pendingChanges';
import LoginModalComp from '../../components/security/modals/LoginModal';
import PasswordResetModalComp from '../../components/security/modals/PasswordResetModal';
import UserDetailsModalComp from '../../components/security/modals/UserDetailsModal';
import UserMenuComp from '../../components/security/UserMenu';
import ConfigUtils from '../../utils/ConfigUtils';
import { connect } from '../../utils/PluginsUtils';
import { userSelector, authProviderSelector } from '../../selectors/security';
import { itemSelected } from '../../actions/manager';
import { unsavedMapSelector, unsavedMapSourceSelector } from '../../selectors/controls';


const checkUnsavedMapChanges = (action) => {
    return dispatch => {
        dispatch(checkPendingChanges(action, 'logout'));
    };
};


const userMenuConnect = connect((state, props) => ({
    currentProvider: authProviderSelector(state),
    title: userSelector(state)?.name,
    user: props.user,
    hidden: props.hidden,
    isAdmin: props.isAdmin,
    providers: ConfigUtils.getConfigProp("authenticationProviders"),
    className: props.className || "square-button",
    renderUnsavedMapChangesDialog: ConfigUtils.getConfigProp('unsavedMapChangesDialog') ?? true,
    displayUnsavedDialog: unsavedMapSelector(state)
        && unsavedMapSourceSelector(state) === 'logout'
}), {
    onShowLoggedin: onShowLogin,
    onShowAccountInfo: setControlProperty.bind(null, "AccountInfo", "enabled", true, true),
    onShowChangePassword: setControlProperty.bind(null, "ResetPassword", "enabled", true, true),
    onLoggedout: onLogout,
    onItemSelected: itemSelected,
    onCheckMapChanges: checkUnsavedMapChanges,
    onCloseUnsavedDialog: setControlProperty.bind(null, "unsavedMap", "enabled", false),
    onLogoutConfirm: logout.bind(null, undefined)
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

export const  UserDetailsMenuItem = userMenuConnect(({itemComponent, showAccountInfo = true, onShowAccountInfo}) => {
    const Menuitem = itemComponent;
    if (Menuitem && showAccountInfo) {
        return (<><Menuitem glyph="user" msgId= "user.info" onClick={onShowAccountInfo}/><UserDetails/></>);
    }
    return null;
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

export const PasswordResetMenuItem = userMenuConnect(({itemComponent, showPasswordChange = true, onShowChangePassword}) => {
    const Menuitem = itemComponent;
    if (Menuitem && showPasswordChange) {
        return (<><Menuitem glyph="asterisk" msgId= "user.changePwd" onClick={onShowChangePassword}/><PasswordReset/></>);
    }
    return null;
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

export const LoginMenuItem = userMenuConnect(({itemComponent, showLogin = true, onShowLoggedin, providers}) => {
    const Menuitem = itemComponent;
    if (Menuitem && showLogin) {
        return (<Menuitem glyph="log-in" msgId= "user.login" onClick={() => onShowLoggedin(providers)}/>);
    }
    return null;
});

export const LogoutMenuItem = userMenuConnect(({itemComponent, showLogout = true, renderUnsavedMapChangesDialog, onCheckMapChanges, onLoggedout, onCloseUnsavedDialog}) => {
    const Menuitem = itemComponent;
    const checkUnsavedChanges = () => {
        if (renderUnsavedMapChangesDialog) {
            onCheckMapChanges(onLoggedout);
        } else {
            onCloseUnsavedDialog();
            onLoggedout();
        }
    };
    if (Menuitem && showLogout) {
        return (<><Menuitem glyph="log-out" msgId= "user.logout" onClick={()=> checkUnsavedChanges()} /></>);
    }
    return null;
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
