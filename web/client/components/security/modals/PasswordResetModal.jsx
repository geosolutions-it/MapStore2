
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import Spinner from '../../layout/Spinner';
import React from 'react';

import PasswordReset from '../forms/PasswordReset';
import Message from '../../../components/I18N/Message';
import Button from '../../layout/Button';
import Modal from '../../misc/Modal';
import FlexBox from '../../layout/FlexBox';

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
        error: PropTypes.object,
        loading: PropTypes.bool
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
        includeCloseButton: true,
        loading: false
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
        return (<FlexBox centerChildrenVertically  gap="sm">
            <FlexBox.Fill />
            {this.props.includeCloseButton ? <Button
                key="closeButton"
                ref="closeButton"
                onClick={this.props.onClose}><Message msgId="close"/></Button> : <span/>}
            <Button
                value={"user.changePwd"}
                ref="passwordChangeButton"
                key="passwordChangeButton"
                variant="success"
                disabled={!this.state.passwordValid || this.props.loading}
                onClick={() => {
                    this.setState({loading: true});
                    this.onPasswordChange();
                }}><Message msgId="user.changePwd"/></Button>
        </FlexBox>);
    };

    getBody = () => {
        return (<PasswordReset error={this.props.error} role="body" ref="passwordResetForm"
            changed={this.props.changed}
            onChange={(password, valid) => {
                this.setState({passwordValid: valid, password});
            }} />);
    };

    renderLoading = () => {
        return this.props.loading ? <Spinner/> : null;
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

export default PasswordResetModal;
