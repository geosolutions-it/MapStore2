const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {FormControl, FormGroup, ControlLabel, Alert} = require('react-bootstrap');
const Message = require('../../../components/I18N/Message');
const LocaleUtils = require('../../../utils/LocaleUtils');

/**
 * A DropDown menu for user details:
 */
class PasswordReset extends React.Component {
    static propTypes = {
        // config
        minPasswordSize: PropTypes.number,
        // CALLBACKS
        onChange: PropTypes.func,

        // I18N
        newPasswordText: PropTypes.node,
        passwordCheckText: PropTypes.node,
        changed: PropTypes.bool,
        error: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        // config
        minPasswordSize: 6,

        // CALLBACKS
        onChange: () => {},

        // I18N
        newPasswordText: <Message msgId="user.newPwd"/>,
        passwordCheckText: <Message msgId="user.retypePwd"/>
    };

    state = {
        password: '',
        passwordcheck: ''
    };

    getPwStyle = () => {
        if (!this.state.password) {
            return null;
        }
        if (this.state.password.length === 0) {
            return null;
        }
        return this.isMainPasswordValid() ? "success" : "error";
    };

    renderWarning = () => {
        if (!this.state.password) {
            return null;
        }
        let pw = this.state.password;
        if (pw !== null && pw.length < this.props.minPasswordSize && pw.length > 0) {
            return <Alert bsStyle="danger"><Message msgId="user.passwordMinlenght" msgParams={{minSize: this.props.minPasswordSize}}/></Alert>;
        } else if (!this.isMainPasswordValid()) {
            return <Alert bsStyle="danger"><Message msgId="user.passwordInvalid" /></Alert>;
        } else if (pw !== null && pw !== this.state.passwordcheck ) {
            return <Alert bsStyle="danger"><Message msgId="user.passwordCheckFail" /></Alert>;
        }
        return null;
    };

    renderStatus = () => {
        if (this.props.changed) {
            return <Alert bsStyle="success"><Message msgId="user.passwordChanged"/></Alert>;
        }
        if (this.props.error) {
            return <Alert bsStyle="danger"><Message msgId="user.passwordError"/></Alert>;
        }
        return null;
    };

    render() {
        return (<form ref="loginForm" onSubmit={this.handleSubmit}>
            <FormGroup validationState={this.getPwStyle()}>
                <ControlLabel>{this.props.newPasswordText}</ControlLabel>
                <FormControl ref="password"
                    key="password"
                    type="password"
                    hasFeedback
                    onChange={this.changePassword}
                    placeholder={LocaleUtils.getMessageById(this.context.messages, "user.newPwd")} />
            </FormGroup>
            <FormGroup validationState={this.isValid(this.state.password, this.state.passwordcheck) && this.getPwStyle() ? "success" : "error"}>
                <ControlLabel>{this.props.passwordCheckText}</ControlLabel>
                <FormControl ref="passwordcheck"
                    key="passwordcheck"
                    hasFeedback
                    type="password"
                    label={this.props.passwordCheckText}
                    onChange={this.changePasswordCheck}
                    placeholder={LocaleUtils.getMessageById(this.context.messages, "user.retypePwd")} />
            </FormGroup>
            {this.renderWarning()}
            {this.renderStatus()}
        </form>);
    }

    isMainPasswordValid = (password) => {
        let p = password || this.state.password;
        return (p.length >= this.props.minPasswordSize) && !(/[^a-zA-Z0-9\!\@\#\$\%\&\*]/.test(p));
    };

    isValid = (password, passwordcheck) => {
        let p = password || this.state.password;
        let p2 = passwordcheck || this.state.passwordcheck;
        if (!p) {
            return false;
        }
        return p !== null && this.isMainPasswordValid(p) && p === p2;
    };

    changePassword = (e) => {
        this.setState({
            password: e.target.value
        });
        this.props.onChange(e.target.value, this.isValid(e.target.value, this.state.passwordcheck));
    };

    changePasswordCheck = (e) => {
        this.setState({
            passwordcheck: e.target.value
        });
        this.props.onChange(this.state.password, this.isValid(this.state.password, e.target.value));
    };
}

module.exports = PasswordReset;
