/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {Glyphicon, InputGroup, ControlLabel, FormGroup, FormControl as FormControlRB} from 'react-bootstrap';
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
    loading,
    preventHide,
    titleParams,
    service,
    debounceTime,
    maxLength,
    showPassword,
    setShowPassword = () => {}
}) {

    const [creds, setCreds] = useState(getCredentials(service?.protectedId));
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
    function handleConfirm() {
        onConfirm(creds);
        setCreds({});
    }

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
                                onChange={(username) => setCreds({...creds, username})}
                                maxLength={maxLength}
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
                                    onChange={(password) => setCreds({...creds, password })}
                                    maxLength={maxLength}
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
                                onClick={handleClear} tooltipId="securityPopup.remove" >
                                <Glyphicon glyph="trash"/>
                            </Button>
                        </FormGroup>
                    </FlexBox>
                    <FlexBox centerChildrenVertically gap="sm">
                        <FlexBox.Fill />
                        <Button id="security-confirm"
                            disabled={disabled || loading} variant={variant} onClick={handleConfirm}>
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
    titleId: '',
    errorId: '',
    disabledClose: false,
    loading: false,
    preventHide: true,
    confirmId: 'confirm',
    variant: 'danger'
};

SecurityPopupDialog.propTypes = {
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    onClear: PropTypes.func,
    titleId: PropTypes.string,
    loading: PropTypes.bool,
    preventHide: PropTypes.bool,
    confirmId: PropTypes.string,
    variant: PropTypes.string,
    children: PropTypes.node
};

