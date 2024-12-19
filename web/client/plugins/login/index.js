/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { changePassword, login, loginFail, logout } from '../../actions/security';
import {onShowLogin, closeLogin, onLogout, openIDLogin} from '../../actions/login';


import { setControlProperty } from '../../actions/controls';

import { checkPendingChanges } from '../../actions/pendingChanges';
import LoginModalComp from '../../components/security/modals/LoginModal';
import PasswordResetModalComp from '../../components/security/modals/PasswordResetModal';
import UserDetailsModalComp from '../../components/security/modals/UserDetailsModal';
import UserMenuComp from '../../components/security/UserMenu';
import { unsavedMapSelector, unsavedMapSourceSelector } from '../../selectors/controls';
import ConfigUtils from '../../utils/ConfigUtils';
import { connect } from '../../utils/PluginsUtils';
import { userSelector, authProviderSelector } from '../../selectors/security';


const checkUnsavedMapChanges = (action) => {
    return dispatch => {
        dispatch(checkPendingChanges(action, 'logout'));
    };
};

export const UserMenu = connect((state) => ({
    user: userSelector(state)
}), {
    onShowLogin,
    onShowAccountInfo: setControlProperty.bind(null, "AccountInfo", "enabled", true, true),
    onShowChangePassword: setControlProperty.bind(null, "ResetPassword", "enabled", true, true),
    onLogout
})(UserMenuComp);

export const UserDetails = connect((state) => ({
    user: userSelector(state),
    show: state.controls.AccountInfo && state.controls.AccountInfo.enabled}
), {
    onClose: setControlProperty.bind(null, "AccountInfo", "enabled", false, false)
})(UserDetailsModalComp);

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

export const LoginNav = connect((state, props) => ({
    currentProvider: authProviderSelector(state),
    user: userSelector(state),
    nav: false,
    providers: ConfigUtils.getConfigProp("authenticationProviders"),
    renderButtonText: false,
    renderButtonContent: () => {return <Glyphicon glyph="user" />; },

    className: props.className || "square-button",
    renderUnsavedMapChangesDialog: ConfigUtils.getConfigProp('unsavedMapChangesDialog'),
    displayUnsavedDialog: unsavedMapSelector(state)
        && unsavedMapSourceSelector(state) === 'logout'
}), {
    onShowLogin,
    onShowAccountInfo: setControlProperty.bind(null, "AccountInfo", "enabled", true, true),
    onShowChangePassword: setControlProperty.bind(null, "ResetPassword", "enabled", true, true),
    onLogout,
    onCheckMapChanges: checkUnsavedMapChanges,
    onCloseUnsavedDialog: setControlProperty.bind(null, "unsavedMap", "enabled", false),
    onLogoutConfirm: logout.bind(null, undefined)

}, (stateProps = {}, dispatchProps = {}, ownProps = {}) => {
    const {currentProvider, providers = []} = stateProps;
    const {type, showAccountInfo = false, showPasswordChange = false} = (providers ?? []).filter(({provider: provider}) => provider === currentProvider)?.[0] ?? {};
    const isOpenID = type === "openID";
    const isNormalLDAPUser = ownProps.isUsingLDAP && !ownProps.isAdmin;
    return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        showAccountInfo: isOpenID ? showAccountInfo : ownProps.showAccountInfo,
        showPasswordChange: isOpenID ? showPasswordChange : isNormalLDAPUser ? false : ownProps.showPasswordChange
    };
})(UserMenuComp);

export default {
    UserDetails,
    UserMenu,
    PasswordReset,
    Login,
    LoginNav
};
