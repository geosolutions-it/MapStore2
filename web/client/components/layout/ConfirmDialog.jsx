/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Modal from '../../components/misc/Modal';
import Message from '../../components/I18N/Message';
import Button from './Button';
import FlexBox from './FlexBox';
import Text from './Text';
import Spinner from './Spinner';
import { Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

function ConfirmDialog({
    show,
    onCancel,
    onConfirm,
    titleId,
    descriptionId,
    errorId,
    disabled,
    cancelId,
    confirmId,
    variant,
    loading,
    children,
    preventHide,
    titleParams,
    descriptionParams
}) {

    function handleHide() {
        if (!loading && !preventHide) {
            onCancel();
        }
    }

    if (!show) {
        return null;
    }
    return (
        <Modal
            show={show}
            onHide={handleHide}
        >
            <FlexBox classNames={['_padding-lr-lg', '_padding-tb-md']} column gap="md">
                <Text fontSize="lg" strong>
                    {titleId ? <Message msgId={titleId} msgParams={titleParams} /> : null}
                </Text>
                {descriptionId ? <Text>
                    <Message msgId={descriptionId} msgParams={descriptionParams} />
                </Text> : null}
                {children}
                {errorId
                    ? <Alert className="_padding-sm" bsStyle="danger">
                        <Message msgId={errorId} />
                    </Alert>
                    : null}
                <FlexBox centerChildrenVertically gap="sm">
                    <FlexBox.Fill />
                    <Button disabled={loading} onClick={() => onCancel()}>
                        <Message msgId={cancelId} />
                    </Button>
                    <Button disabled={disabled || loading} variant={variant} onClick={() => onConfirm()}>
                        <Message msgId={confirmId} />
                        {loading ? <>{' '}<Spinner /></> : null}
                    </Button>
                </FlexBox>
            </FlexBox>
        </Modal>
    );
}

export default ConfirmDialog;

ConfirmDialog.defaultProps = {
    show: false,
    onCancel: () => {},
    onConfirm: () => {},
    titleId: '',
    descriptionId: '',
    errorId: '',
    disabled: false,
    loading: false,
    preventHide: true,
    cancelId: 'cancel',
    confirmId: 'confirm',
    variant: 'danger'
};

ConfirmDialog.propTypes = {
    show: PropTypes.bool,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    titleId: PropTypes.string,
    descriptionId: PropTypes.string,
    errorId: PropTypes.string,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    preventHide: PropTypes.bool,
    cancelId: PropTypes.string,
    confirmId: PropTypes.string,
    variant: PropTypes.string,
    children: PropTypes.node
};

