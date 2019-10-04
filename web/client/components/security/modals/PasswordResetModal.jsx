const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PasswordReset = require('../forms/PasswordReset');
const Message = require('../../../components/I18N/Message');
const {Button} = require('react-bootstrap');
const Modal = require('../../misc/Modal');

const Spinner = require('react-spinkit');

/**
 * A Modal window to show password reset form
 */
class PasswordResetModal extends React.Component {
    static propTypes = {
        // props
        user: PropTypes.object,
        authHeader: PropTypes.string,
        show: PropTypes.bool,
        options: PropTypes.object,


        onPasswordChange: PropTypes.func,
        onPasswordChanged: PropTypes.func,
        onClose: PropTypes.func,
        closeGlyph: PropTypes.string,
        style: PropTypes.object,
        buttonSize: PropTypes.string,
        includeCloseButton: PropTypes.bool,
        changed: PropTypes.bool,
        error: PropTypes.object
    };

    static defaultProps = {
        user: {
            name: "Guest"
        },
        onPasswordChange: () => {},
        onPasswordChanged: () => {},
        onClose: () => {},
        options: {},
        closeGlyph: "",
        style: {},
        buttonSize: "small",
        includeCloseButton: true
    };

    state = {
        passwordValid: false,
        loading: false,
        password: ''
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        let newUser = nextProps.user;
        let oldUser = this.props.user;
        let userChange = newUser !== oldUser;
        if ( newUser && userChange ) {
            this.props.onPasswordChanged(nextProps.user);

            this.setState({
                loading: false
            });
        }
    }

    onPasswordChange = () => {
        this.props.onPasswordChange(this.props.user, this.state.password);
    };

    getFooter = () => {
        return (<span role="footer"><div style={{"float": "left"}}>{this.renderLoading()}</div>
            <Button
                ref="passwordChangeButton"
                key="passwordChangeButton"
                bsStyle="primary"
                bsSize={this.props.buttonSize}
                disabled={!this.state.passwordValid}
                onClick={() => {
                    this.setState({loading: true});
                    this.onPasswordChange();
                }}><Message msgId="user.changePwd"/></Button>
            {this.props.includeCloseButton ? <Button
                key="closeButton"
                ref="closeButton"
                bsSize={this.props.buttonSize}
                onClick={this.props.onClose}><Message msgId="close"/></Button> : <span/>}
        </span>);
    };

    getBody = () => {
        return (<PasswordReset role="body" ref="passwordResetForm"
            changed={this.props.changed}
            onChange={(password, valid) => {
                this.setState({passwordValid: valid, password});
            }} />);
    };

    renderLoading = () => {
        return this.state.loading ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn overrideSpinnerClassName="spinner"/> : null;
    };

    render() {
        return (
            <Modal {...this.props.options} show={this.props.show} onHide={this.props.onClose}>
                <Modal.Header key="passwordChange" closeButton>
                    <Modal.Title><Message msgId="user.changePwd"/></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.getBody()}
                </Modal.Body>
                <Modal.Footer>
                    {this.getFooter()}
                </Modal.Footer>
            </Modal>);
    }
}

module.exports = PasswordResetModal;
