/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {connect} = require('react-redux');
const security = require('../../actions/security');
const {setControlProperty} = require('../../actions/controls');

const UserMenu = connect((state) => ({
    user: state.userDetails && state.userDetails.user
}), {
    onShowLogin: setControlProperty.bind(null, "LoginForm", "enabled", true),
    onShowAccountInfo: setControlProperty.bind(null, "AccountInfo", "enabled", true),
    onShowChangePassword: setControlProperty.bind(null, "ResetPassword", "enabled", true),
    onLogout: () => {security.logout(); }
})(require('../../components/security/UserMenu'));

const UserDetails = connect((state) => ({
    user: state.userDetails && state.userDetails.user,
    show: state.controls.AccountInfo && state.controls.AccountInfo.enabled}
), {
    onClose: setControlProperty.bind(null, "AccountInfo", "enabled", false)
})(require('../../components/security/modals/UserDetailsModal'));

const PasswordReset = connect((state) => ({
    user: state.userDetails && state.userDetails.user,
    show: state.controls.ResetPassword && state.controls.ResetPassword.enabled
}), {
    onPasswordChange: (user, pass) => { return security.geoStoreChangePassword(user, pass); },
    onClose: setControlProperty.bind(null, "ResetPassword", "enabled", false)
})(require('../../components/security/modals/PasswordResetModal'));

const Login = connect((state) => ({
    show: state.controls.LoginForm && state.controls.LoginForm.enabled,
    userDetails: state.userDetails
}), {
    onLoginSuccess: setControlProperty.bind(null, 'LoginForm', 'enabled', false),
    onClose: setControlProperty.bind(null, 'LoginForm', 'enabled', false),
    onSubmit: security.geoStoreLoginSubmit,
    onError: security.loginFail
})(require('../../components/security/modals/LoginModal'));

module.exports = {
    UserDetails,
    UserMenu,
    PasswordReset,
    Login
};
