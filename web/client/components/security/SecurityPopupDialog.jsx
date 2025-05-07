/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {Glyphicon} from 'react-bootstrap';

import Modal from '../misc/Modal';
import Message from '../I18N/Message';
import Button from '../layout/Button';
import FlexBox from '../layout/FlexBox';
import Text from '../layout/Text';
import Spinner from '../layout/Spinner';


function SecurityPopupDialog({
    show,
    showClose,
    disabledClose,
    onCancel,
    onConfirm,
    titleId,
    disabled,
    confirmId,
    variant,
    loading,
    children,
    preventHide,
    titleParams
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
                <FlexBox centerChildrenVertically gap="sm">
                    <Text fontSize="lg" strong component={FlexBox.Fill}>
                        {titleId ? <Message msgId={titleId} msgParams={titleParams} /> : null}
                    </Text>
                    {showClose && onCancel &&
                        <Button square borderTransparent disabled={disabledClose} onClick={onCancel}>
                            <Glyphicon glyph="1-close"/>
                        </Button>
                    }
                </FlexBox>
                {children}
                <FlexBox centerChildrenVertically gap="sm">
                    <FlexBox.Fill />
                    <Button disabled={disabled || loading} variant={variant} onClick={() => onConfirm()}>
                        <Message msgId={confirmId} />
                        {loading ? <>{' '}<Spinner /></> : null}
                    </Button>
                </FlexBox>
            </FlexBox>
        </Modal>
    );
}

export default SecurityPopupDialog;

SecurityPopupDialog.defaultProps = {
    show: false,
    showClose: false,
    onCancel: () => {},
    onConfirm: () => {},
    titleId: '',
    errorId: '',
    disabled: false,
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
    titleId: PropTypes.string,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    preventHide: PropTypes.bool,
    confirmId: PropTypes.string,
    variant: PropTypes.string,
    children: PropTypes.node
};

