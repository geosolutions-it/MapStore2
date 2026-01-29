/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { createPlugin } from "../../utils/PluginsUtils";
import ConfirmDialog from '../../components/layout/ConfirmDialog';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import Persistence from '../../api/persistence';
import { searchResources } from './actions/resources';
import {setPendingChanges as setPendingChangesAction} from './actions/save';
import { getResourceInfoByType } from './selectors/save';
import { push } from 'connected-react-router';
import useIsMounted from '../../hooks/useIsMounted';
import { userSelector } from '../../selectors/security';

/**
 * Plugin to delete a resource
 * @memberof plugins
 * @class
 * @name DeleteResource
 * @prop {string} cfg.resourceType one of `MAP`, `DASHBOARD` or `GEOSTORY` when used in a viewer, if undefined can be used in the homepage
 * @prop {string} cfg.redirectTo optional redirect path after delete completion
 */
function DeleteResource({
    user,
    resource,
    component,
    onRefresh,
    redirectTo,
    onPush,
    setPendingChanges
}) {
    const Component = component;
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errorId, setErrorId] = useState("");
    const isMounted = useIsMounted();

    function handleCancel() {
        setShowModal(false);
    }
    function handleDelete() {
        if (!deleting) {
            setDeleting(true);
            setErrorId(false);
            Persistence.getApi()
                .deleteResource({ id: resource.id }, { deleteLinkedResources: true })
                .toPromise()
                .then((response) => response?.toPromise ? response.toPromise() : response)
                .then(() => isMounted(() => {
                    setPendingChanges({});
                    if (redirectTo) {
                        onPush(redirectTo);
                    } else {
                        onRefresh();
                        setShowModal(false);
                    }
                }))
                .catch((error) => isMounted(() => {
                    setErrorId(`resourcesCatalog.deleteError.error${error.status || 'default'}`);
                }))
                .finally(() => isMounted(() => {
                    setDeleting(false);
                }));
        }
    }
    if (!(user && resource?.id && resource?.canDelete)) {
        return null;
    }
    return (
        <>
            {Component ? <Component
                glyph="trash"
                labelId="resourcesCatalog.deleteResource"
                square
                active={!!showModal}
                onClick={() => setShowModal(true)}
            /> : null}
            <ConfirmDialog
                show={!!showModal}
                onCancel={handleCancel}
                onConfirm={handleDelete}
                titleId="resourcesCatalog.deleteResourceTitle"
                descriptionId="resourcesCatalog.deleteResourceDescription"
                cancelId="resourcesCatalog.deleteResourceCancel"
                confirmId="resourcesCatalog.deleteResourceConfirm"
                variant="danger"
                errorId={errorId}
                loading={deleting}
            />
        </>
    );
}

const deleteResourcesConnect = connect(
    createStructuredSelector({
        resource: (state, props) => {
            if (props.resource) {
                return props.resource;
            }
            const { resource } = getResourceInfoByType(state, { resourceType: 'MAP', ...props });
            return resource;
        },
        user: userSelector
    }),
    {
        onRefresh: searchResources.bind(null, { refresh: true }),
        onPush: push,
        setPendingChanges: setPendingChangesAction
    }
);

const DeleteResourcePlugin = deleteResourcesConnect(DeleteResource);

export default createPlugin('DeleteResource', {
    component: () => null,
    containers: {
        ResourcesGrid: {
            target: 'card-options',
            position: 1,
            priority: 4,
            Component: DeleteResourcePlugin
        },
        BrandNavbar: {
            target: 'left-menu',
            position: 4,
            priority: 3,
            Component: DeleteResourcePlugin
        },
        SidebarMenu: {
            position: 300,
            tool: DeleteResourcePlugin,
            priority: 1
        },
        BurgerMenu: {
            position: 5,
            tool: DeleteResourcePlugin,
            priority: 2
        }
    }
});
