/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import { createPlugin } from '../../utils/PluginsUtils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { getRouterLocation } from './selectors/resources';
import {
    editUser,
    deleteUser,
    changeUserMetadata,
    saveUser,
    loadingUsers,
    updateUsers,
    updateUsersMetadata,
    resetSearchUsers,
    searchUsers
} from '../../actions/users';

import { castArray, findIndex } from 'lodash';
import usePluginItems from '../../hooks/usePluginItems';
import ConnectedResourcesGrid from './containers/ResourcesGrid';
import { hashLocationToHref } from '../../utils/ResourcesFiltersUtils';
import GeoStoreDAO from '../../api/GeoStoreDAO';
import { Button } from 'react-bootstrap';
import InputControl from './components/InputControl';
import Message from '../../components/I18N/Message';

import UserDeleteConfirm from '../../components/manager/users/UserDeleteConfirm';
import UserDialog from '../../components/manager/users/UserDialog';
import usersReducer from '../../reducers/users';
import {
    getTotalUsers,
    getUsersLoading,
    getUsers,
    getUsersError,
    getIsFirstRequest,
    getCurrentPage,
    getSearch,
    getCurrentParams
} from '../../selectors/users';
import { userSelector } from '../../selectors/security';

const ConnectedUserDialog = connect((state) => {
    const users = state && state.users;
    return {
        modal: true,
        show: users && !!users.currentUser,
        user: users && users.currentUser,
        groups: users && users.groups,
        hidePasswordFields: users && users.currentUser && state.security && state.security.user && state.security.user.id === users.currentUser.id
    };
}, {
    onChange: changeUserMetadata.bind(null),
    onClose: editUser.bind(null, null),
    onSave: saveUser.bind(null)
})(UserDialog);

const ConnectedUserDeleteConfirm = connect((state) => {
    const usersState = state && state.users;
    if (!usersState) return {};
    const users = getUsers(state);
    const deleteId = usersState.deletingUser && usersState.deletingUser.id;
    if (users && deleteId) {
        const index = findIndex(users, (user) => user.id === deleteId);
        const user = users[index];
        return {
            user,
            deleteId,
            deleteError: usersState.deletingUser.error,
            deleteStatus: usersState.deletingUser.status
        };
    }
    return {
        deleteId
    };
}, {
    deleteUser
})(UserDeleteConfirm);

function requestUsers({ params }) {
    const {
        page = 1,
        pageSize = 12,
        q
    } = params || {};
    return GeoStoreDAO.getUsers(q ? `*${q}*` : '*', {
        params: {
            start: parseFloat(page - 1) * pageSize,
            limit: pageSize
        }
    }).then((response) => {
        const totalCount = response?.ExtUserList?.UserCount;
        const users = castArray(response?.ExtUserList?.User || []);
        const transformedUsers = users.map(user => ({
            ...user,
            groups: user?.groups?.group
                ? Array.isArray(user.groups.group)
                    ? user.groups.group
                    : [user.groups.group].filter(Boolean)
                : [],
            '@extras': {
                status: {
                    items: [
                        ...(user.role === 'ADMIN' ? [{
                            type: 'icon',
                            tooltipId: 'users.admin',
                            glyph: 'shield'
                        }] : []),
                        ...(user.enabled === true ? [{
                            type: 'icon',
                            tooltipId: 'users.active',
                            glyph: 'ok-sign',
                            variant: 'success'
                        }] : [{
                            type: 'icon',
                            tooltipId: 'users.inactive',
                            glyph: 'minus-sign',
                            variant: 'danger'
                        }])
                    ]
                }
            }
        }));
        return {
            total: totalCount,
            isNextPageAvailable: page < (totalCount / pageSize),
            resources: transformedUsers
        };
    });
}

function NewUser({onNewUser}) {
    return <>
        <Button onClick={onNewUser} bsSize="sm" bsStyle="success"><Message msgId="users.newUser"/></Button>
    </>;
}

function EditUser({ component, onEdit, resource: user }) {
    const Component = component;
    function handleClick() {
        onEdit(user);
    }
    if (user.role === 'GUEST') {
        return null;
    }
    return (<Component
        onClick={handleClick}
        glyph="wrench"
        labelId="users.editUser"
        square
    />);
}

function DeleteUser({component, onDelete, resource: user, user: myUser }) {
    const Component = component;
    function handleClick() {
        onDelete(user && user.id);
    }
    if (user.role === 'GUEST' || myUser?.id === user.id) {
        return null;
    }
    return (<Component
        onClick={handleClick}
        glyph="trash"
        labelId="users.deleteUser"
        square
    />);
}

function UserFilter({onSearch, query }) {
    const handleFieldChange = (params) => {
        onSearch({ params: { q: params } });
    };
    return (<InputControl
        placeholder="users.searchUsers"
        style={{ maxWidth: 200 }}
        value={query.q || ''}
        debounceTime={300}
        onChange={handleFieldChange}
    />);
}

const usersToolsConnect = connect(createStructuredSelector({
    user: userSelector
}), {
    onEdit: editUser,
    onDelete: deleteUser,
    onSearch: searchUsers,
    onNewUser: editUser.bind(null, { role: "USER", "enabled": true })
});

const ConnectedNewUser = usersToolsConnect(NewUser);
const ConnectedEditUser = usersToolsConnect(EditUser);
const ConnectedDeleteUser = usersToolsConnect(DeleteUser);
const ConnectedFilter = usersToolsConnect(UserFilter);

function UserManager({
    active = true,
    items,
    order = null,
    metadata = {
        grid: [
            {
                path: 'name',
                target: 'header',
                icon: { glyph: 'user' }
            },
            {
                path: 'groups',
                itemValue: 'groupName',
                type: 'tag',
                showFullContent: true,
                target: 'footer'
            }
        ]
    },
    attributeFields,
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
                    { Component: ConnectedEditUser, target: 'card-buttons', name: "EditUser" },
                    { Component: ConnectedDeleteUser, target: 'card-buttons', name: "DeleteUser" },
                    { Component: ConnectedFilter, target: 'left-menu', name: "FilterUsers" },
                    { Component: ConnectedNewUser, target: 'right-menu', name: "NewUser" }
                ]}
                metadata={metadata}
                formatHref={handleFormatHref}
                cardLayoutStyle="grid"
                hideThumbnail
                resourcesFoundMsgId="users.usersFound"
            />
            <ConnectedUserDialog attributeFields={attributeFields}/>
            <ConnectedUserDeleteConfirm />
        </div>

    );
}

const UserManagerPlugin = connect(
    createStructuredSelector({
        totalResources: getTotalUsers,
        loading: getUsersLoading,
        location: getRouterLocation,
        resources: getUsers,
        error: getUsersError,
        isFirstRequest: getIsFirstRequest,
        page: getCurrentPage,
        search: getSearch,
        storedParams: getCurrentParams
    }),
    {
        setLoading: loadingUsers,
        setResources: updateUsers,
        setResourcesMetadata: updateUsersMetadata,
        onResetSearch: resetSearchUsers
    }
)(UserManager);


UserManagerPlugin.defaultProps = {
    id: 'users'
};

/**
 * Allows an administrator to browse users.
 * Renders in {@link #plugins.Manager|Manager} plugin.
 * @deprecated
 * @name UserManager
 * @memberof plugins
 * @property {object[]} cfg.attributeFields attributes that should be shown in attributes tab of user dialog.
 * @class
 */
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
        users: usersReducer
    }
});
