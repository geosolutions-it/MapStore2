/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Button from '../misc/Button';
import ConfirmDialog from '../layout/ConfirmDialog';
import Portal from '../misc/Portal';

export default ({
    style,
    showConfirm = false,
    onShowConfirm = () => {},
    onConfirm = () => {},
    onClose = () => {},
    onClick = () => {},
    className = "",
    title,
    confirmMessage,
    bsStyle = "default",
    bsSize = "sm"
}) => (<>
    <Button
        style={style}
        bsSize={bsSize}
        bsStyle={bsStyle}
        className={className}
        onClick={onClick}>
        {title}
    </Button>
    {confirmMessage && <Portal>
        <ConfirmDialog
            show={showConfirm}
            onCancel={() => {
                onClose();
                onShowConfirm(false);
            }}
            onConfirm={() => {
                onConfirm();
                onShowConfirm(false);
            }}
            titleId={confirmMessage}
            preventHide
            variant="danger"
            confirmId="confirm"
            cancelId="cancel">
        </ConfirmDialog>
    </Portal>}
</>);
