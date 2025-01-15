/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import uuid from 'uuid/v1';
import { createPlugin } from "../../utils/PluginsUtils";
import Button from './components/Button';
import Icon from './components/Icon';
import PendingStatePrompt from './containers/PendingStatePrompt';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { isEmpty } from 'lodash';
import { getPendingChanges } from './selectors/save';
import Persistence from '../../api/persistence';
import Spinner from './components/Spinner';
import { setSelectedResource } from './actions/resources';
import { mapSaveError, mapSaved, mapInfoLoaded, configureMap } from '../../actions/config';
import { userSelector } from '../../selectors/security';
import { storySaved, geostoryLoaded, setResource as setGeoStoryResource, setCurrentStory, saveGeoStoryError } from '../../actions/geostory';
import { dashboardSaveError, dashboardSaved, dashboardLoaded } from '../../actions/dashboard';
import { convertDependenciesMappingForCompatibility } from '../../utils/WidgetsUtils';
import { show } from '../../actions/notifications';

function addNameToResource(resource) {
    return {
        ...resource,
        metadata: {
            ...resource?.metadata,
            name: resource?.metadata?.name || `${resource?.category || 'Resource'}-${uuid()}`
        }
    };
}

function Save({
    pendingChanges,
    resourceType,
    onSelect,
    onSuccess,
    onError,
    user,
    onNotification
}) {
    const [loading, setLoading] = useState(false);

    const changes = !isEmpty(pendingChanges.changes);
    const saveResource = pendingChanges.saveResource;

    function handleSave() {
        if (saveResource && !loading) {
            setLoading(true);
            const api = Persistence.getApi();
            api.updateResource(addNameToResource(saveResource))
                .toPromise()
                .then((resourceId) => api.getResource(resourceId, { includeAttributes: true, withData: false }).toPromise())
                .then(resource => ({ ...resource, category: { name: resourceType } }))
                .then((resource) => {
                    onSelect(resource);
                    onSuccess(resourceType, resource, saveResource?.data);
                    onNotification({
                        id: 'RESOURCE_SAVE_SUCCESS',
                        title: 'saveDialog.saveSuccessTitle',
                        message: 'saveDialog.saveSuccessMessage'
                    }, 'success');
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

    if (!(user && pendingChanges?.resource?.canEdit)) {
        return null;
    }
    return (
        <>
            <Button
                square
                className={changes ? 'ms-notification-circle warning' : ''}
                onClick={handleSave}
                borderTransparent
            >
                {loading ? <Spinner /> : <Icon glyph="floppy-disk" type="glyphicon" />}
            </Button>
            <PendingStatePrompt
                pendingState={changes}
                titleId="resourcesCatalog.detailsPendingChangesTitle"
                descriptionId="resourcesCatalog.detailsPendingChangesDescription"
                cancelId="resourcesCatalog.detailsPendingChangesCancel"
                confirmId="resourcesCatalog.detailsPendingChangesConfirm"
                variant="danger"
            />
        </>
    );
}

const saveConnect = connect(
    createStructuredSelector({
        user: userSelector,
        pendingChanges: getPendingChanges
    }),
    {
        onSelect: setSelectedResource,
        onNotification: show,
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

const SavePlugin = saveConnect(Save);

SavePlugin.defaultProps = {
    resourceType: 'MAP'
};

export default createPlugin('Save', {
    component: SavePlugin,
    containers: {
        BrandNavbar: {
            target: 'right-menu',
            position: -2,
            priority: 1
        }
    }
});
