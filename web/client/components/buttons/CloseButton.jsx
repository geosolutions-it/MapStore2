/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Button} from 'react-bootstrap';
import Message from '../I18N/Message';
import ConfirmDialog from '../misc/ConfirmDialog';

export default ({
    showConfirm = false,
    onShowConfirm = () => {},
    onConfirm = () => {},
    onClose = () => {},
    onClick = () => {},
    className,
    title,
    confirmMessage
}) => (<>
        <Button
            bsStyle="primary"
            className={`square-button ${className}`}
            onClick={onClick}>
            {title}
        </Button>
        {confirmMessage && <ConfirmDialog
            modal
            show={showConfirm}
            onClose={() => {
                onClose();
                onShowConfirm(false);
            }}
            onConfirm={() => {
                onConfirm();
                onShowConfirm(false);
            }}
            confirmButtonBSStyle="default"
            confirmButtonContent={<Message msgId="confirm"/>}
            closeText={<Message msgId="cancel"/>}
            closeGlyph="1-close">
            <Message msgId={confirmMessage}/>
        </ConfirmDialog>}
</>);
