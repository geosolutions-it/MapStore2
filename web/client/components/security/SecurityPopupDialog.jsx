/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {Glyphicon, InputGroup, ControlLabel, FormGroup, FormControl as FormControlRB, Alert} from 'react-bootstrap';
import Portal from '../misc/Portal';

import Modal from '../misc/Modal';
import Message from '../I18N/Message';
import _Button from '../layout/Button';
import FlexBox from '../layout/FlexBox';
import Text from '../layout/Text';
import Spinner from '../layout/Spinner';
import uuidv1 from 'uuid/v1';
import tooltip from '../misc/enhancers/tooltip';
import withDebounceOnCallback from '../misc/enhancers/withDebounceOnCallback';
import localizedProps from '../misc/enhancers/localizedProps';
import { getCredentials } from '../../utils/SecurityUtils';

const FormControl = localizedProps('placeholder')(FormControlRB);

function _InputControl({ onChange, value, ...props }) {
    return <FormControl {...props} value={value} onChange={event => onChange(event.target.value)}/>;
}

const InputControl = withDebounceOnCallback('onChange', 'value')(_InputControl);

const Button = tooltip(_Button);

function SecurityPopupDialog({
    show,
    showClose,
    disabledClose,
    onCancel,
    onConfirm,
    onClear,
    titleId,
    confirmId,
    variant,
    preventHide,
    titleParams,
    service,
    debounceTime,
    maxLength,
    showPassword,
    setShowPassword = () => {},
    onValidateCreds
}) {
    const [creds, setCreds] = useState(getCredentials(service?.protectedId));
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const disabled = !(creds.username && creds.password);
    function handleCancel() {
        onCancel();
    }

    function handleHide() {
        if (!loading && !preventHide) {
            handleCancel();
        }
    }
    function handleClear() {
        onClear();
        setCreds({});
    }
    const handleSubmit = async() => {
        if (!onValidateCreds || disabled) return;

        setLoading(true);
        setError(null);

        const result = await onValidateCreds(creds);

        if (result.ok) {
            await onConfirm(creds);
        } else {
            setError(result.error);
            setLoading(false);
        }
    };
    const updateCreds = (field, value) => {
        setCreds({ ...creds, [field]: value });
        if (error) setError(null);
    };
    if (!show) {
        return null;
    }
    return (
        <Portal className="portal-security-popup-dialog">
            <Modal
                containerClassName="containerClassName"
                backdropClassName="backdropClassName"
                dialogClassName="dialogClassName"
                className="security-popup-dialog"
                show={show}
                onHide={handleHide}
                animation={false}
            >
                <FlexBox classNames={['_padding-lr-lg', '_padding-tb-md']} column gap="md">
                    <FlexBox centerChildrenVertically gap="sm">
                        <Text fontSize="lg" strong component={FlexBox.Fill}>
                            {titleId ? <Message msgId={titleId} msgParams={titleParams} /> : null}
                        </Text>
                        {showClose && onCancel &&
                        <Button id="security-close-btn" square borderTransparent disabled={disabledClose} onClick={handleCancel}>
                            <Glyphicon glyph="1-close"/>
                        </Button>
                        }
                    </FlexBox>
                    <FormGroup>
                        <InputGroup>
                            {service?.url}
                        </InputGroup>
                    </FormGroup>
                    {error && (
                        <Alert bsStyle="danger">
                            <Glyphicon glyph="exclamation-sign"/> <Message msgId={error} />
                        </Alert>
                    )}
                    <FlexBox inline>
                        <FormGroup style={{
                            flex: 1,
                            padding: "0px 5px 0px 0px"
                        }}>
                            <ControlLabel>
                                <Message msgId="securityPopup.username" />
                            </ControlLabel>
                            <InputControl
                                name={`username_${uuidv1()}`}
                                value={creds.username}
                                debounceTime={debounceTime}
                                onChange={(username) => updateCreds("username", username)}
                                maxLength={maxLength}
                                disabled={loading}
                            />
                        </FormGroup>
                        <FormGroup style={{
                            flex: 1,
                            padding: "0px 5px 0px 0px"
                        }}>
                            <ControlLabel>
                                <Message msgId="securityPopup.pwd" />
                            </ControlLabel>
                            <InputGroup style={{width: "100%"}}>
                                <InputControl
                                    name={`password_${uuidv1()}`}
                                    autoComplete="new-password"
                                    type={showPassword ? "text" : "password"}
                                    value={creds.password}
                                    debounceTime={debounceTime}
                                    onChange={(password) => updateCreds('password', password)}
                                    maxLength={maxLength}
                                    disabled={loading}
                                />
                                <InputGroup.Addon>
                                    <Button
                                        id="security-show-hide"
                                        tooltipId={showPassword ? "securityPopup.hide" : "securityPopup.show" }
                                        onClick={() => {setShowPassword(!showPassword);}}>
                                        <Glyphicon glyph={!showPassword ? "eye-open" : "eye-close"}/>
                                    </Button>
                                </InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                        <FormGroup style={{alignContent: "flex-end"}}>
                            <Button
                                id="security-clear"
                                disabled={loading}
                                onClick={handleClear} tooltipId="securityPopup.remove" >
                                <Glyphicon glyph="trash"/>
                            </Button>
                        </FormGroup>
                    </FlexBox>
                    <FlexBox centerChildrenVertically gap="sm">
                        <FlexBox.Fill />
                        <Button id="security-confirm"
                            disabled={disabled || loading} variant={error ? "danger" : variant} onClick={handleSubmit}>
                            <Message msgId={confirmId} />
                            {loading ? <>{' '}<Spinner /></> : null}
                        </Button>
                    </FlexBox>
                </FlexBox>
            </Modal>
        </Portal>
    );
}

export default SecurityPopupDialog;

SecurityPopupDialog.defaultProps = {
    show: false,
    showClose: false,
    onCancel: () => {},
    onConfirm: () => {},
    onClear: () => {},
    onValidateCreds: () => {},
    titleId: '',
    errorId: '',
    disabledClose: false,
    preventHide: true,
    confirmId: 'confirm',
    variant: 'danger'
};

SecurityPopupDialog.propTypes = {
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    onClear: PropTypes.func,
    onValidateCreds: PropTypes.func,
    titleId: PropTypes.string,
    preventHide: PropTypes.bool,
    confirmId: PropTypes.string,
    variant: PropTypes.string,
    children: PropTypes.node
};

