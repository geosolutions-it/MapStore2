const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const LoginForm = require('../forms/LoginForm');
const {Button} = require('react-bootstrap');
const Modal = require('../../misc/Modal');
const Message = require('../../../components/I18N/Message');
const LocaleUtils = require('../../../utils/LocaleUtils');

require('../css/security.css');

/**
 * A Modal window to show password reset form
 */
class LoginModal extends React.Component {
    static propTypes = {
        // props
        user: PropTypes.object,
        loginError: PropTypes.object,
        show: PropTypes.bool,
        options: PropTypes.object,

        // CALLBACKS
        onLoginSuccess: PropTypes.func,
        onSubmit: PropTypes.func,
        onError: PropTypes.func,
        onClose: PropTypes.func,
        closeGlyph: PropTypes.string,
        style: PropTypes.object,
        buttonSize: PropTypes.string,
        includeCloseButton: PropTypes.bool
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        onLoginSuccess: () => {},
        onSubmit: () => {},
        onError: () => {},
        onClose: () => {},
        options: {},
        closeGlyph: "",
        style: {},
        buttonSize: "large",
        includeCloseButton: true
    };

    getForm = () => {
        return (<LoginForm
            role="body"
            ref="loginForm"
            showSubmitButton={false}
            user={this.props.user}
            loginError={this.props.loginError}
            onLoginSuccess={this.props.onLoginSuccess}
            onSubmit={this.props.onSubmit}
            onError={this.props.onError}
        />);
    };

    getFooter = () => {
        return (<span role="footer">
            <Button
                ref="submit"
                value={LocaleUtils.getMessageById(this.context.messages, "user.signIn")}
                bsStyle="primary"
                bsSize={this.props.buttonSize}
                className="pull-left"
                onClick={this.loginSubmit}
                key="submit">{LocaleUtils.getMessageById(this.context.messages, "user.signIn")}</Button>
            {this.props.includeCloseButton ? <Button
                key="closeButton"
                ref="closeButton"
                bsSize={this.props.buttonSize}
                onClick={this.handleOnHide}><Message msgId="close"/></Button> : <span/>}
        </span>);
    };

    render() {
        return (<Modal {...this.props.options} backdrop="static" show={this.props.show} onHide={this.handleOnHide}>
            <Modal.Header key="passwordChange" closeButton>
                <Modal.Title><Message msgId="user.login"/></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {this.getForm()}
            </Modal.Body>
            <Modal.Footer>
                {this.getFooter()}
            </Modal.Footer>
        </Modal>);
    }

    /**
     * This is called when close button clicked or
     * when user click out(modal overlay). Hide when
     * it is triggered from button otherwise don't hide the
     * modal
     */
    handleOnHide = (event) => {
        if (event) {
            // it is coming from the hide or close button
            this.props.onClose();
        }
    }

    loginSubmit = () => {
        this.refs.loginForm.submit();
    };
}

module.exports = LoginModal;
