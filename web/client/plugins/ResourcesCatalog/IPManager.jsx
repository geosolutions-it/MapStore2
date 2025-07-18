/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { createPlugin } from '../../utils/PluginsUtils';
import { Button } from 'react-bootstrap';
import InputControl from './components/InputControl';
import Message from '../../components/I18N/Message';
import Text from '../../components/layout/Text';
import ConnectedResourcesGrid from './containers/ResourcesGrid';
import { getIPs, addIP, updateIP, deleteIP } from './mockIPService';

// IP validation function
function validateIPAddress(ipAddress) {
    if (!ipAddress || typeof ipAddress !== 'string') {
        return { isValid: false, error: 'IP address is required' };
    }

    // Check if it's CIDR notation (IP/mask) or single IP
    const parts = ipAddress.split('/');

    if (parts.length === 2) {
        // CIDR notation: IP/mask
        const ip = parts[0];
        const mask = parseInt(parts[1], 10);

        // Validate mask
        if (isNaN(mask) || mask < 0 || mask > 32) {
            return { isValid: false, error: 'Subnet mask must be between 0 and 32' };
        }

        // Validate IP address format
        const ipParts = ip.split('.');
        if (ipParts.length !== 4) {
            return { isValid: false, error: 'Invalid IP address format' };
        }

        for (let i = 0; i < 4; i++) {
            const octet = parseInt(ipParts[i], 10);
            if (isNaN(octet) || octet < 0 || octet > 255) {
                return { isValid: false, error: 'Each octet must be between 0 and 255' };
            }
        }

        return { isValid: true, error: null };
    }

    // Single IP address
    const ip = parts[0];
    const ipParts = ip.split('.');

    if (ipParts.length !== 4) {
        return { isValid: false, error: 'Invalid IP address format' };
    }

    for (let i = 0; i < 4; i++) {
        const octet = parseInt(ipParts[i], 10);
        if (isNaN(octet) || octet < 0 || octet > 255) {
            return { isValid: false, error: 'Each octet must be between 0 and 255' };
        }
    }

    return { isValid: true, error: null };
}

function IPDialog({ show, ip, onSave, onClose }) {
    const [ipAddress, setIpAddress] = useState(ip?.ipAddress || '');
    const [description, setDescription] = useState(ip?.description || '');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        setIpAddress(ip?.ipAddress || '');
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

    if (!show) return null;
    return (
        <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">
                            <Message msgId={ip ? 'ipmanager.editIP' : 'ipmanager.newIP'} />
                        </h4>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label><Message msgId="ipmanager.ipAddress" /></label>
                            <input
                                className={`form-control ${validationError ? 'has-error' : ''}`}
                                value={ipAddress}
                                onChange={e => setIpAddress(e.target.value)}
                                placeholder="e.g., 192.168.1.1 or 192.168.1.0/24"
                            />
                            {validationError && (
                                <div className="text-danger" style={{ fontSize: '12px', marginTop: '5px' }}>
                                    {validationError}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label><Message msgId="ipmanager.description" /></label>
                            <input
                                className="form-control"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="(Optional) Enter description"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button onClick={onClose}><Message msgId="ipmanager.cancel" /></Button>
                        <Button bsStyle="primary" onClick={handleSave}>
                            <Message msgId="ipmanager.save" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeleteConfirm({ show, ip, onDelete, onClose }) {
    if (!show) return null;
    return (
        <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title"><Message msgId="ipmanager.deleteTitle" /></h4>
                    </div>
                    <div className="modal-body">
                        <Text><Message msgId="ipmanager.deleteConfirm" /> <b>{ip?.ipAddress}</b>?</Text>
                    </div>
                    <div className="modal-footer">
                        <Button onClick={onClose}><Message msgId="ipmanager.cancel" /></Button>
                        <Button bsStyle="danger" onClick={() => onDelete(ip)}><Message msgId="ipmanager.delete" /></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// New: requestIPs function for ResourcesGrid
function requestIPs({ params }) {
    return getIPs(params);
}

// Local stateful components for actions
function NewIP({ onNewIP }) {
    return <Button onClick={onNewIP} bsSize="sm" bsStyle="success"><Message msgId="ipmanager.newIP" /></Button>;
}
function EditIP({ component, onEdit, resource: ip }) {
    const Component = component;
    return <Component onClick={() => onEdit(ip)} glyph="wrench" labelId="ipmanager.edit" square />;
}
function DeleteIP({ component, onDelete, resource: ip }) {
    const Component = component;
    return <Component onClick={() => onDelete(ip)} glyph="trash" labelId="ipmanager.delete" square bsStyle="danger" />;
}
function IPFilter({ onSearch, query }) {
    const handleFieldChange = (params) => {
        onSearch({ params: { q: params } });
    };
    return <InputControl placeholder="ipmanager.search" style={{ maxWidth: 200 }} value={query.q || ''} debounceTime={300} onChange={handleFieldChange} />;
}

function IPManager() {
    const [ips, setIPs] = useState([]);
    const [search, setSearch] = useState({ q: '' });
    const [editingIP, setEditingIP] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [deletingIP, setDeletingIP] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(0); // to trigger refresh after CRUD

    useEffect(() => {
        getIPs({ ...search }).then(data => setIPs(data.resources));
    }, [search, refreshFlag]);

    function handleSave(ip) {
        const action = ip.id ? updateIP : addIP;
        action(ip).then(() => {
            setShowDialog(false);
            setEditingIP(null);
            setRefreshFlag(f => f + 1);
        });
    }
    function handleDelete(ip) {
        deleteIP(ip.id).then(() => {
            setShowDelete(false);
            setDeletingIP(null);
            setRefreshFlag(f => f + 1);
        });
    }

    // Metadata for IP cards
    const metadata = [
        {
            path: 'ipAddress',
            target: 'header',
            showFullContent: true,
            icon: { glyph: 'globe' }
        },
        {
            path: 'description',
            showFullContent: true,
            target: 'footer'
        }
    ];

    // Configured items for ResourcesGrid
    const configuredItems = [
        { Component: (props) => <EditIP {...props} onEdit={(ip) => { setEditingIP(ip); setShowDialog(true); }} />, target: 'card-buttons', name: 'editip' },
        { Component: (props) => <DeleteIP {...props} onDelete={(ip) => { setDeletingIP(ip); setShowDelete(true); }} />, target: 'card-buttons', name: 'deleteip' },
        { Component: (props) => <IPFilter {...props} query={search} onSearch={({ params }) => setSearch(params)} />, target: 'left-menu', name: 'ipfilter' },
        { Component: (props) => <NewIP {...props} onNewIP={() => { setEditingIP(null); setShowDialog(true); }} />, target: 'right-menu', name: 'newip' }
    ];

    return (
        <div className="ms-ipmanager-panel _padding-md" style={{ width: '100%' }}>
            <ConnectedResourcesGrid
                id="ipmanager"
                requestResources={requestIPs}
                configuredItems={configuredItems}
                metadata={metadata}
                search={search}
                onResetSearch={() => setSearch({ q: '' })}
                resourcesFoundMsgId="ipmanager.ipsFound"
                hideThumbnail
                cardLayoutStyle="grid"
                resources={ips} // pass the fetched IPs
                totalResource={ips?.length}
            />
            <IPDialog
                show={showDialog}
                ip={editingIP}
                onSave={handleSave}
                onClose={() => { setShowDialog(false); setEditingIP(null); }}
            />
            <DeleteConfirm
                show={showDelete}
                ip={deletingIP}
                onDelete={handleDelete}
                onClose={() => { setShowDelete(false); setDeletingIP(null); }}
            />
        </div>
    );
}

export default createPlugin('IPManager', {
    component: IPManager,
    containers: {
        Manager: {
            name: 'ipmanager',
            position: 4,
            priority: 2,
            glyph: '1-ip-mod',
            labelId: 'messages.manager.ipmanagertab'
        }
    },
    epics: {},
    reducers: {}
});
