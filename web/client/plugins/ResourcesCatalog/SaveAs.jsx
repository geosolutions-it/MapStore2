/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { createPlugin } from "../../utils/PluginsUtils";
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { isEmpty, omit } from 'lodash';
import { getPendingChanges } from './selectors/save';
import Persistence from '../../api/persistence';
import { setSelectedResource } from './actions/resources';
import { mapSaveError, mapSaved, mapInfoLoaded, configureMap } from '../../actions/config';
import { userSelector } from '../../selectors/security';
import { push } from 'connected-react-router';
import { getResourceTypesInfo } from './utils/ResourcesUtils';
import { storySaved, geostoryLoaded, setResource as setGeoStoryResource, setCurrentStory, saveGeoStoryError } from '../../actions/geostory';
import { dashboardSaveError, dashboardSaved, dashboardLoaded } from '../../actions/dashboard';
import { convertDependenciesMappingForCompatibility } from '../../utils/WidgetsUtils';
import { show } from '../../actions/notifications';
import InputControl from './components/InputControl';
import ConfirmDialog from '../../components/layout/ConfirmDialog';

function parseResourcePayload(resource, { name, resourceType } = {}) {
    return {
        ...resource,
        permission: undefined,
        category: resourceType,
        metadata: {
            ...resource?.metadata,
            name,
            attributes: omit(resource?.metadata?.attributes || {}, ['thumbnail', 'details'])
        }
    };
}

/**
 * Plugin to create/clone a resource. Saves the new resource using the persistence API.
 * @memberof plugins
 * @class
 * @name SaveAs
 * @prop {string} cfg.resourceType one of `MAP`, `DASHBOARD` or `GEOSTORY` based on the viewer in use
 */
function SaveAs({
    pendingChanges,
    resourceType,
    onSelect,
    onSuccess,
    onError,
    user,
    onPush,
    onNotification,
    component,
    menuItem
}) {

    const saveResource = pendingChanges.saveResource;

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');

    const changes = !isEmpty(pendingChanges.changes);

    function handleSaveAs() {
        if (saveResource) {
            setLoading(true);
            const api = Persistence.getApi();
            const contextId = saveResource?.metadata?.attributes?.context;
            Promise.all([
                api.createResource(parseResourcePayload(saveResource, { name, resourceType })).toPromise()
                    .then((resourceId) => api.getResource(resourceId, { includeAttributes: true, withData: false }).toPromise()),
                contextId !== undefined
                    ? api.getResource(contextId, { withData: false }).toPromise()
                    : Promise.resolve(null)
            ])
                .then(([resource, context]) => ({
                    ...resource,
                    category: { name: resourceType },
                    ...(context !== null && {
                        '@extras': {
                            context
                        }
                    })
                }))
                .then((resource) => {
                    onSelect(resource);
                    onSuccess(resourceType, resource, saveResource?.data);
                    onNotification({
                        id: 'RESOURCE_SAVE_SUCCESS',
                        title: 'saveDialog.saveSuccessTitle',
                        message: 'saveDialog.saveSuccessMessage'
                    }, 'success');
                    setShowModal(false);
                    setName('');
                    const { viewerPath } = getResourceTypesInfo(resource);
                    if (viewerPath) {
                        onPush(viewerPath);
                    }
                })
                .catch((error) => {
                    onError(resourceType, error);
                    onNotification({
                        id: 'RESOURCE_SAVE_ERROR',
                        title: `resourcesCatalog.resourceError.errorTitle`,
                        message: `resourcesCatalog.resourceError.error${error.status || 'Default'}`
                    }, 'error');
                })
                .finally(() => setLoading(false));
        }
    }

    function handleCancel() {
        setShowModal(false);
    }

    function handleConfirm() {
        handleSaveAs();
    }

    function handleShowModal() {
        // use the currently edited name and fallback to empty name
        setName(pendingChanges?.changes?.name || '');
        setShowModal(true);
    }

    if (!((pendingChanges?.resource?.canCopy || pendingChanges?.resource?.canEdit) && user)) {
        return null;
    }

    const hideIndicator = !!pendingChanges?.resource?.canEdit;

    const messagePrefix = pendingChanges?.initialResource?.id === undefined
        ? 'createNewResource'
        : 'copyResource';

    const Component = component;
    return (
        <>
            <Component
                className={changes && !hideIndicator ? 'ms-notification-circle warning' : ''}
                onClick={handleShowModal}
                labelId="saveDialog.saveAsTooltip"
                menuItem={menuItem}
                glyph="floppy-open"
                loading={loading}
            />
            <ConfirmDialog
                show={showModal}
                loading={loading}
                disabled={!name}
                preventHide
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                titleId={`resourcesCatalog.${messagePrefix}Title`}
                descriptionId={`resourcesCatalog.${messagePrefix}Description`}
                cancelId={`resourcesCatalog.${messagePrefix}Cancel`}
                confirmId={`resourcesCatalog.${messagePrefix}Confirm`}
                variant="success"
            >
                <InputControl
                    value={name}
                    onChange={setName}
                    debounceTime={300}
                />
            </ConfirmDialog>
        </>
    );
}

const saveAsConnect = connect(
    createStructuredSelector({
        user: userSelector,
        pendingChanges: getPendingChanges
    }),
    {
        onNotification: show,
        onPush: push,
        onSelect: setSelectedResource,
        onSuccess: (resourceType, resource, data) => {
            return (dispatch) => {
                if (resourceType === 'MAP') {
                    dispatch(configureMap(data, resource.id));
                    dispatch(mapInfoLoaded(resource, resource.id));
                    dispatch(mapSaved(resource.id));
                    return;
                }
                if (resourceType === 'DASHBOARD') {
                    dispatch(dashboardSaved(resource.id));
                    dispatch(dashboardLoaded(resource, convertDependenciesMappingForCompatibility(data)));
                    return;
                }
                if (resourceType === 'GEOSTORY') {
                    dispatch(storySaved(resource.id));
                    dispatch(geostoryLoaded(resource.id));
                    dispatch(setCurrentStory(data));
                    dispatch(setGeoStoryResource(resource));
                    return;
                }
            };
        },
        onError: (resourceType, error) => {
            return (dispatch) => {
                const { status, statusText, data, message, ...other} = error;
                if (resourceType === 'MAP') {
                    dispatch(mapSaveError(status ? { status, statusText, data } : message || other));
                    return;
                }
                if (resourceType === 'DASHBOARD') {
                    dispatch(dashboardSaveError(status ? { status, statusText, data } : message || other));
                }
                if (resourceType === 'GEOSTORY') {
                    dispatch(saveGeoStoryError(status ? { status, statusText, data } : message || other));
                    return;
                }
            };
        }
    }
);

const SaveAsPlugin = saveAsConnect(SaveAs);

SaveAsPlugin.defaultProps = {
    resourceType: 'MAP'
};

export default createPlugin('SaveAs', {
    component: () => null,
    containers: {
        BrandNavbar: {
            target: 'left-menu',
            position: 3,
            priority: 3,
            Component: SaveAsPlugin
        },
        BurgerMenu: {
            position: 31,
            tool: SaveAsPlugin,
            priority: 2
        },
        SidebarMenu: {
            position: 31,
            tool: SaveAsPlugin,
            priority: 1
        }
    }
});
