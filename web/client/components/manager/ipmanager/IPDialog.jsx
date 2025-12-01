/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { Button, Glyphicon, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import Modal from '../../misc/Modal';
import Message from '../../I18N/Message';
import ConfirmDialog from '../../layout/ConfirmDialog';
import Text from '../../layout/Text';
import { validateIPAddress } from '../../../utils/IPValidationUtils';

/**
 * Dialog for creating/editing IP ranges
 */
export default function IPDialog({ show, ip, onSave, onClose, loading = false }) {
    const [ipAddress, setIpAddress] = useState(ip?.cidr || '');
    const [description, setDescription] = useState(ip?.description || '');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        setIpAddress(ip?.cidr || '');
        setDescription(ip?.description || '');
        setValidationError('');
    }, [ip, show]);

    const handleSave = () => {
        // Clear previous errors
        setValidationError('');

        // Validate IP address
        const ipValidation = validateIPAddress(ipAddress);
        if (!ipValidation.isValid) {
            setValidationError(ipValidation.error);
            return;
        }

        // If validation passes, save
        onSave({ id: ip?.id, ipAddress, description });
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    <Message msgId={ip ? 'ipManager.editTitle' : 'ipManager.newIP'} />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormGroup validationState={validationError ? 'error' : null}>
                    <ControlLabel><Message msgId="ipManager.ipAddress" /></ControlLabel>
                    <FormControl
                        type="text"
                        value={ipAddress}
                        onChange={e => setIpAddress(e.target.value)}
                        placeholder="e.g., 192.168.1.1/32 or 192.168.1.0/24"
                    />
                    {validationError && (
                        <HelpBlock>
                            <Message msgId={validationError} />
                        </HelpBlock>
                    )}
                </FormGroup>
                <FormGroup>
                    <ControlLabel><Message msgId="ipManager.description" /></ControlLabel>
                    <FormControl
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="(Optional) Enter description"
                    />
                </FormGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose} disabled={loading}>
                    <Message msgId="ipManager.cancel" />
                </Button>
                <Button bsStyle="primary" onClick={handleSave} disabled={loading}>
                    {loading && <Glyphicon glyph="refresh" className="spinner" />}
                    {' '}
                    <Message msgId="ipManager.save" />
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * Delete confirmation dialog for IP ranges
 */
export function DeleteConfirm({ show, ip, onDelete, onClose, loading = false }) {
    return (
        <ConfirmDialog
            show={show}
            onCancel={onClose}
            onConfirm={() => onDelete(ip)}
            titleId="ipManager.deleteTitle"
            loading={loading}
            cancelId="ipManager.cancel"
            confirmId="ipManager.deleteButton"
            variant="danger"
        >
            <Text><Message msgId="ipManager.deleteConfirm" /> <b>{ip?.cidr}</b>?</Text>
        </ConfirmDialog>
    );
}

