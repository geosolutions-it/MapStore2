/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { createPlugin } from '../../utils/PluginsUtils';
import { castArray } from 'lodash';
import ConnectedResourcesGrid from './containers/ResourcesGrid';
import GeoStoreDAO from '../../api/GeoStoreDAO';
import IPDialog, { DeleteConfirm } from '../../components/manager/ipmanager/IPDialog';
import { NewIP, EditIP, DeleteIP, IPFilter } from '../../components/manager/ipmanager/IPActions';
import { show } from '../../actions/notifications';

const pageSize = 16;
function IPManager({ onNotification }) {
    const [searchQuery, setSearchQuery] = useState({ q: '' });
    const [editingIP, setEditingIP] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [deletingIP, setDeletingIP] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(0); // to trigger refresh after CRUD
    const [allIPRanges, setAllIPRanges] = useState([]); // Store all IPs
    const [loading, setLoading] = useState(false);
    const [isFirstRequest, setIsFirstRequest] = useState(true);
    const [page, setPage] = useState(1);
    const [savingIP, setSavingIP] = useState(false); // Loading state for save and delete operations

    // Fetch all data once on mount or refresh
    useEffect(() => {
        setLoading(true);
        GeoStoreDAO.getIPRanges()
            .then((response) => {
                const ipRanges = castArray(response?.IPRangeList?.IPRange || []);
                setAllIPRanges(ipRanges);
                setIsFirstRequest(false);
            })
            .catch((error) => {
                console.error('Error fetching IP ranges:', error);
                setAllIPRanges([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [refreshFlag]);

    // Client-side filtering and pagination (computed with useMemo to prevent re-renders)
    const filteredIPRanges = useMemo(() => {
        const q = searchQuery?.q;
        if (!q) return allIPRanges;
        const lowerQ = q.toLowerCase();
        return allIPRanges.filter(ip =>
            ip.cidr?.toLowerCase().includes(lowerQ) ||
            ip.description?.toLowerCase().includes(lowerQ)
        );
    }, [allIPRanges, searchQuery.q]);

    const totalResources = filteredIPRanges.length;

    const resources = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredIPRanges.slice(start, end);
    }, [filteredIPRanges, page, pageSize]);

    // Handler to update search and reset page to 1 (memoized to prevent re-renders)
    const handleSearchChange = useCallback((newSearch) => {
        setSearchQuery(newSearch);
        setPage(1);
    }, []);

    const handleSave = useCallback((ip) => {
        const payload = {
            cidr: ip.ipAddress,
            description: ip.description || ""
        };

        setSavingIP(true);

        if (ip.id) {
            GeoStoreDAO.updateIPRange(ip.id, payload)
                .then(() => {
                    setShowDialog(false);
                    setEditingIP(null);
                    setPage(1);
                    setRefreshFlag(f => f + 1);
                    onNotification({
                        title: 'ipManager.notification.updateSuccessTitle',
                        message: 'ipManager.notification.updateSuccessMessage',
                        autoDismiss: 6,
                        position: 'tr'
                    }, 'success');
                })
                .catch((error) => {
                    console.error('Error updating IP range:', error);
                    onNotification({
                        title: 'ipManager.notification.updateErrorTitle',
                        message: 'ipManager.notification.updateErrorMessage',
                        autoDismiss: 6,
                        position: 'tr'
                    }, 'error');
                })
                .finally(() => {
                    setSavingIP(false);
                });
        } else {
            GeoStoreDAO.createIPRange(payload)
                .then(() => {
                    setShowDialog(false);
                    setEditingIP(null);
                    setPage(1);
                    setRefreshFlag(f => f + 1);
                    onNotification({
                        title: 'ipManager.notification.createSuccessTitle',
                        message: 'ipManager.notification.createSuccessMessage',
                        autoDismiss: 6,
                        position: 'tr'
                    }, 'success');
                })
                .catch((error) => {
                    console.error('Error creating IP range:', error);
                    onNotification({
                        title: 'ipManager.notification.createErrorTitle',
                        message: 'ipManager.notification.createErrorMessage',
                        autoDismiss: 6,
                        position: 'tr'
                    }, 'error');
                })
                .finally(() => {
                    setSavingIP(false);
                });
        }
    }, [onNotification]);

    const handleDelete = useCallback((ip) => {
        setSavingIP(true);

        GeoStoreDAO.deleteIPRange(ip.id)
            .then(() => {
                setShowDelete(false);
                setDeletingIP(null);
                setPage(1);
                setRefreshFlag(f => f + 1);
                onNotification({
                    title: 'ipManager.notification.deleteSuccessTitle',
                    message: 'ipManager.notification.deleteSuccessMessage',
                    autoDismiss: 6,
                    position: 'tr'
                }, 'success');
            })
            .catch((error) => {
                console.error('Error deleting IP range:', error);
                onNotification({
                    title: 'ipManager.notification.deleteErrorTitle',
                    message: 'ipManager.notification.deleteErrorMessage',
                    autoDismiss: 6,
                    position: 'tr'
                }, 'error');
            })
            .finally(() => {
                setSavingIP(false);
            });
    }, [onNotification]);

    // Metadata for IP cards
    const metadata = [
        {
            path: 'cidr',
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

    // Handle pagination clicks from ResourcesGrid (memoized)
    const handleResourcesRequest = useCallback(({ params }) => {
        // Update page if it changed
        if (params?.page !== undefined && params.page !== page) {
            setPage(params.page);
        }
        // Return resolved promise immediately (data is already computed above)
        return Promise.resolve({
            total: totalResources,
            resources: resources,
            isNextPageAvailable: page < Math.ceil(totalResources / pageSize)
        });
    }, [page, totalResources, resources, pageSize]);

    // Handlers for UI actions (memoized)
    const handleEditIP = useCallback((ip) => {
        setEditingIP(ip);
        setShowDialog(true);
    }, []);

    const handleDeleteIP = useCallback((ip) => {
        setDeletingIP(ip);
        setShowDelete(true);
    }, []);

    const handleNewIP = useCallback(() => {
        setEditingIP(null);
        setShowDialog(true);
    }, []);

    const handleResetSearch = useCallback(() => {
        setSearchQuery({ q: '' });
        setPage(1);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setShowDialog(false);
        setEditingIP(null);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setShowDelete(false);
        setDeletingIP(null);
    }, []);


    const configuredItems = useMemo(() => [
        { Component: (props) => <EditIP {...props} onEdit={handleEditIP} />, target: 'card-buttons', name: 'editip' },
        { Component: (props) => <DeleteIP {...props} onDelete={handleDeleteIP} />, target: 'card-buttons', name: 'deleteip' },
        { Component: (props) => <IPFilter {...props} query={searchQuery} onSearch={({ params }) => handleSearchChange(params)} />, target: 'left-menu', name: 'ipfilter' },
        { Component: (props) => <NewIP {...props} onNewIP={handleNewIP} />, target: 'right-menu', name: 'newip' }
    ], [handleSearchChange, handleEditIP, handleDeleteIP, handleNewIP]);

    return (
        <div className="ms-ipManager-panel _padding-md" style={{ width: '100%' }}>
            <ConnectedResourcesGrid
                id="ipmanager"
                key={refreshFlag}
                requestResources={handleResourcesRequest}
                configuredItems={configuredItems}
                metadata={metadata}
                onResetSearch={handleResetSearch}
                resourcesFoundMsgId="ipManager.ipsFound"
                hideThumbnail
                cardLayoutStyle="grid"
                resources={resources}
                totalResources={totalResources}
                loading={loading}
                isFirstRequest={isFirstRequest}
                page={page}
                pageSize={pageSize}
                setLoading={() => {}}
                setResources={() => {}}
                setResourcesMetadata={() => {}}
            />
            <IPDialog
                show={showDialog}
                ip={editingIP}
                onSave={handleSave}
                onClose={handleCloseDialog}
                loading={savingIP}
            />
            <DeleteConfirm
                show={showDelete}
                ip={deletingIP}
                onDelete={handleDelete}
                onClose={handleCloseDeleteDialog}
                loading={savingIP}
            />
        </div>
    );
}

const ConnectedIPManager = connect(
    null,
    {
        onNotification: show
    }
)(IPManager);

export default createPlugin('IPManager', {
    component: ConnectedIPManager,
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
