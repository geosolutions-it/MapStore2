/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import Modal from '../../misc/Modal';
import Message from '../../I18N/Message';
import Button from '../../misc/Button';
/**
 * @deprecated
 */
export default ({
    title = <Message msgId="warning" />,
    cancelText = <Message msgId="no" />,
    confirmText = <Message msgId="yes" />,
    onClose = () => {},
    onConfirm = () => {},
    show,
    children,
    className = '',
    buttonSize,
    running = false
}) => {
    const footer = (<span role="footer"><div style={{"float": "left"}}></div>
        <Button
            disabled={running}
            className={className}
            key="confirmButton"
            bsStyle="primary"
            bsSize={buttonSize}
            onClick={() => {
                onConfirm();
            }}>{confirmText}</Button>
        {<Button
            key="cancelButton"
            bsSize={buttonSize}
            disabled={running}
            onClick={onClose}>{cancelText}</Button>}
    </span>);
    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header key="dialogHeader" closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
            </Modal.Body>
            <Modal.Footer>
                {footer}
            </Modal.Footer>
        </Modal>);

};
