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
import { editUser, deleteUser} from '../../actions/users';
import { searchResources } from '../../plugins/ResourcesCatalog/actions/resources';

import resourcesReducer from './reducers/resources';
import { castArray } from 'lodash';
import usePluginItems from '../../hooks/usePluginItems';
import ConnectedResourcesGrid from './containers/ResourcesGrid';
import { hashLocationToHref } from './utils/ResourcesFiltersUtils';
import { getResourceTypesInfo, getResourceId } from './utils/ResourcesUtils';
import GeoStoreDAO from '../../api/GeoStoreDAO';
import { Button } from 'react-bootstrap';
import InputControl from './components/InputControl';
import UserDialog from '../../plugins/manager/users/UserDialog';
import UserDeleteConfirm from '../manager/users/UserDeleteConfirm';

import { bindActionCreators } from 'redux';
import Message from '../../components/I18N/Message';


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
        const users = castArray(response?.ExtUserList?.User || []);
        return {
            total: totalCount,
            isNextPageAvailable: page < (totalCount / pageSize),
            resources: users.map((user) => user)
        };
    });
}

function convertJsonFormat(inputJson) {
    let outputJson = { ...inputJson };
    if (inputJson.groups && inputJson.groups.group) {
        outputJson.groups = [inputJson.groups.group];
    }
    return outputJson;
}

function NewUser({onNewUser}) {
    return <>
        <Button onClick={onNewUser} bsSize="sm" bsStyle="success"><Message msgId="users.newUser"/></Button>
    </>;
}
function EditUser({ component, onEdit, resource }) {
    const user = convertJsonFormat(resource);
    const Component = component;
    function handleClick() {
        onEdit(user);
    }
    return (<Component
        onClick={handleClick}
        glyph="wrench"
        iconType="glyphicon"
        labelId="resourcesCatalog.editResource"
        square
    />);
}

function DeleteUser({component, onDelete, resource}) {
    const user = convertJsonFormat(resource);
    const Component = component;
    function handleClick() {
        onDelete(user && user.id);
    }
    return (<Component
        onClick={handleClick}
        glyph="trash"
        iconType="glyphicon"
        labelId="resourcesCatalog.deleteResource"
        square
    />);
}

function UserFilter({onSearch, query }) {
    const handleFieldChange = (params) => {
        onSearch({params: {q: params}, refresh: false });
    };
    return (<InputControl
        placeholder="resourcesCatalog.search"
        style={{ maxWidth: 200 }}
        value={query.q || ''}
        debounceTime={300}
        onChange={handleFieldChange}
    />);
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        onEdit: editUser,
        onDelete: deleteUser,
        onSearch: searchResources,
        onNewUser: editUser.bind(null, {role: "USER", "enabled": true})
    }, dispatch);
};

const ConnectedNewUser = connect(null, mapDispatchToProps)(NewUser);
const ConnectedEditUser = connect(null, mapDispatchToProps)(EditUser);
const ConnectedDeleteUser = connect(null, mapDispatchToProps)(DeleteUser);
const ConnectedFilter = connect(null, mapDispatchToProps)(UserFilter);

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
        <div>
            <ConnectedResourcesGrid
                {...props}
                order={order}
                requestResources={requestUsers}
                configuredItems={[
                    ...configuredItems,
                    { Component: ConnectedEditUser, target: 'card-buttons' },
                    { Component: ConnectedDeleteUser, target: 'card-buttons' },
                    { Component: ConnectedFilter, target: 'left-menu' },
                    { Component: ConnectedNewUser, target: 'right-menu' }
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
            <UserDialog/>
            <UserDeleteConfirm  />
        </div>

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
        resources: resourcesReducer,
        users: require('../../reducers/users').default
    }
});
