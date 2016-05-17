/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PasswordReset = require('../forms/PasswordReset');
const {Modal, Button} = require('react-bootstrap');

const Spinner = require('react-spinkit');

  /**
   * A Modal window to show password reset form
   */
const PasswordResetModal = React.createClass({
    propTypes: {
        // props
        user: React.PropTypes.object,
        authHeader: React.PropTypes.string,
        show: React.PropTypes.bool,
        options: React.PropTypes.object,
        onPasswordChange: React.PropTypes.func,
        onPasswordChanged: React.PropTypes.func,
        onClose: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            user: {
                name: "Guest"
            },
            onPasswordChange: () => {},
            onPasswordChanged: () => {},
            onClose: () => {},
            options: {}
        };
    },
    componentWillReceiveProps(nextProps) {
        let newUser = nextProps.user;
        let oldUser = this.props.user;
        let userChange = newUser !== oldUser;
        if ( newUser && userChange ) {
            this.props.onPasswordChanged(nextProps.user);

            this.setState({
                loading: false
            });
        }
    },
    getInitialState() {
        return {
            passwordValid: false,
            loading: false
        };
    },
    onPasswordChange() {
        this.props.onPasswordChange(this.props.user, this.refs.passwordResetForm.getPassword());
    },
    renderLoading() {
        return this.state.loading ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn/> : null;
    },
    render() {
        return (
            <Modal {...this.props.options} show={this.props.show} onHide={this.props.onClose}>
                <Modal.Header key="passwordChange" closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PasswordReset ref="passwordResetForm"
                        onChange={() => {
                            this.setState({passwordValid: this.refs.passwordResetForm.isValid()});
                        }} />
                </Modal.Body>
                <Modal.Footer>
                    <div style={{"float": "left"}}>{this.renderLoading()}</div>
                    <Button
                        ref="passwordChangeButton"
                        key="passwordChangeButton"
                        bsStyle="primary"
                        disabled={!this.state.passwordValid}
                        onClick={() => {
                            this.setState({loading: true});
                            this.onPasswordChange();
                        }}>Reset Password</Button>
                    <Button
                        key="closeButton"
                        ref="closeButton"
                        onClick={this.props.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
});

module.exports = PasswordResetModal;
