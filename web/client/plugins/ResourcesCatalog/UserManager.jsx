/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import { createPlugin } from '../../utils/PluginsUtils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getResources, getRouterLocation, getSelectedResource } from './selectors/resources';
import resourcesReducer from './reducers/resources';
import { castArray } from 'lodash';
import usePluginItems from '../../hooks/usePluginItems';
import ConnectedResourcesGrid from './containers/ResourcesGrid';
import { hashLocationToHref } from './utils/ResourcesFiltersUtils';
import { requestResources } from './api/resources';
import { getResourceTypesInfo, getResourceStatus, getResourceId } from './utils/ResourcesUtils';
import GeoStoreDAO from '../../api/GeoStoreDAO';
import Message from '../../components/I18N/Message';
import { Glyphicon, Button } from 'react-bootstrap';
import InputControl from './components/InputControl';
function requestUsers({ params }) {
    const {
        page = 1,
        pageSize = 12,
        // sort = 'name',
        q
        // ...query
    } = params || {};
    return GeoStoreDAO.getUsers(q ? `*${q}*` : '*', {
        params: {
            start: parseFloat(page - 1) * pageSize,
            limit: pageSize
        }
    }).then((response) => {
        const totalCount = response?.ExtUserList?.UserCount;
        const users = castArray(response?.ExtUserList?.User);
        return {
            total: totalCount,
            isNextPageAvailable: page < (totalCount / pageSize),
            resources: users.map((user) => user)
        };
    });
}

function EditUser({ component }) {
    const Component = component;
    return (<Component
        glyph="wrench"
        iconType="glyphicon"
        labelId="resourcesCatalog.deleteResource"
        square
    />);
}

function Filter() {

    return <InputControl placeholder="Search" style={{ maxWidth: 200 }}/>;
}

function NewUser() {
    return <Button bsSize="sm" bsStyle="success">New user</Button>;
}

function DeleteUser({component}) {
    const Component = component;
    return (<Component
        glyph="trash"
        iconType="glyphicon"
        labelId="resourcesCatalog.deleteResource"
        square
    />);
}

function UserManager({
    active = true,
    items,
    order = null,
    metadata = {
        grid: [
            {
                path: 'name',
                target: 'header',
                "icon": { "glyph": "user", "type": 'glyphicon' }
            },
            {
                path: 'groups.group',
                itemValue: 'groupName',
                type: 'tag',
                showFullContent: true,
                target: 'footer'
            }
        ]
    },
    ...props
}, context) {

    const { loadedPlugins } = context;

    const configuredItems = usePluginItems({ items, loadedPlugins }, []);

    const updatedLocation = useRef();
    updatedLocation.current = props.location;
    function handleFormatHref(options) {
        return hashLocationToHref({
            location: updatedLocation.current,
            excludeQueryKeys: ['page'],
            ...options
        });
    }

    if (!active) {
        return null;
    }

    return (
        <ConnectedResourcesGrid
            {...props}
            order={order}
            requestResources={requestUsers}
            configuredItems={[
                ...configuredItems,
                { Component: EditUser, target: 'card-buttons' },
                { Component: DeleteUser, target: 'card-buttons' },
                { Component: Filter, target: 'left-menu' },
                { Component: NewUser, target: 'right-menu' }
            ]}
            metadata={metadata}
            getResourceStatus={(resource) => {
                return {
                    items: [
                        ...(resource.role === 'ADMIN' ? [{
                            type: 'icon',
                            tooltipId: 'Admin',
                            glyph: 'shield'
                        }] : []),
                        ...(resource.enabled === true ? [{
                            type: 'icon',
                            tooltipId: 'Active',
                            glyph: 'ok-sign',
                            iconType: 'glyphicon',
                            variant: 'success'
                        }] : [{
                            type: 'icon',
                            tooltipId: 'Inactive',
                            glyph: 'minus-sign',
                            iconType: 'glyphicon',
                            variant: 'danger'
                        }])
                    ]
                };
            }}
            formatHref={handleFormatHref}
            getResourceTypesInfo={getResourceTypesInfo}
            getResourceId={getResourceId}
            cardLayoutStyle="grid"
            hideThumbnail
        />
    );
}

const UserManagerPlugin = connect(
    createStructuredSelector({
        location: getRouterLocation,
        resources: getResources,
        selectedResource: getSelectedResource
    })
)(UserManager);

UserManagerPlugin.defaultProps = {
    id: 'users'
};

export default createPlugin('UserManager', {
    component: UserManagerPlugin,
    containers: {
        Manager: {
            name: 'usermanager',
            position: 1,
            priority: 1,
            glyph: "1-user-mod"
        }
    },
    epics: {},
    reducers: {
        resources: resourcesReducer
    }
});
