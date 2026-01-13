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
import usePluginItems from '../../hooks/usePluginItems';
import ConnectedResourcesGrid from './containers/ResourcesGrid';
import { hashLocationToHref } from '../../utils/ResourcesFiltersUtils';
import GeoStoreDAO from '../../api/GeoStoreDAO';
import Message from '../../components/I18N/Message';
import { Button } from 'react-bootstrap';
import { castArray, findIndex } from 'lodash';
import InputControl from './components/InputControl';
import usergroupsReducer from '../../reducers/usergroups';
import GroupDeleteConfirm from '../../components/manager/users/GroupDeleteConfirm';
import GroupDialog from '../../components/manager/users/GroupDialog';

import {
    changeGroupMetadata,
    saveGroup,
    searchUsers,
    deleteGroup,
    editGroup,
    searchUserGroups,
    loadingUserGroups,
    updateUserGroups,
    updateUserGroupsMetadata,
    resetSearchUserGroups
} from '../../actions/usergroups';

import {
    getTotalUserGroups,
    getUserGroupsLoading,
    getUserGroups,
    getUserGroupsError,
    getIsFirstRequest,
    getCurrentPage,
    getSearch,
    getCurrentParams
} from '../../selectors/usergroups';
import SecurityUtils from '../../utils/SecurityUtils';

const ConnectedGroupDialog = connect((state) => {
    const usergroups = state && state.usergroups;
    return {
        modal: true,
        availableUsers: usergroups && usergroups.availableUsers,
        availableUsersCount: usergroups && usergroups.availableUsersCount,
        availableUsersLoading: usergroups && usergroups.availableUsersLoading,
        show: usergroups && !!usergroups.currentGroup,
        group: usergroups && usergroups.currentGroup
    };
}, {
    searchUsers: searchUsers.bind(null),
    onChange: changeGroupMetadata.bind(null),
    onClose: editGroup.bind(null, null),
    onSave: saveGroup.bind(null)
})(GroupDialog);

const ConnectedGroupDeleteConfirm = connect((state) => {
    const groupsstate = state && state.usergroups;
    if (!groupsstate) return {};
    const groups = getUserGroups(state);
    const deleteId = groupsstate.deletingGroup && groupsstate.deletingGroup.id;
    if (groups && deleteId) {
        const index = findIndex(groups, (user) => user.id === deleteId);
        const group = groups[index];
        return {
            group,
            deleteId,
            deleteError: groupsstate.deletingGroup.error,
            deleteStatus: groupsstate.deletingGroup.status
        };
    }
    return {
        deleteId
    };
}, {
    deleteGroup
})(GroupDeleteConfirm);

function requestGroups({ params }) {
    const {
        page = 1,
        pageSize = 12,
        q
    } = params || {};
    return GeoStoreDAO.getGroups(q ? `*${q}*` : '*', {
        params: {
            start: parseFloat(page - 1) * pageSize,
            limit: pageSize
        }
    })
        .then((response) => {
            const groups = castArray(response?.ExtGroupList?.Group || []);
            const totalCount = response?.ExtGroupList?.GroupCount;
            return {
                total: totalCount,
                isNextPageAvailable: page < (totalCount / pageSize),
                resources: groups.map((group) => ({
                    ...group,
                    '@extras': {
                        status: {
                            items: [
                                ...(group.enabled === true ? [{
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
                }))
            };
        });
}


function NewGroup({onNewGroup}) {
    return <>
        <Button onClick={onNewGroup} bsSize="sm" bsStyle="success"><Message msgId="usergroups.newGroup"/></Button>
    </>;
}

function EditGroup({ component, onEdit, resource: group }) {
    const Component = component;
    function handleClick() {
        onEdit(group);
    }
    if (group?.groupName === SecurityUtils.USER_GROUP_ALL) {
        return null;
    }
    return (<Component
        onClick={handleClick}
        glyph="wrench"
        labelId="usergroups.editGroup"
        square
    />);
}

function DeleteGroup({component, onDelete, resource: group}) {
    const Component = component;
    function handleClick() {
        onDelete(group && group.id);
    }
    if (group?.groupName === SecurityUtils.USER_GROUP_ALL) {
        return null;
    }
    return (<Component
        onClick={handleClick}
        glyph="trash"
        labelId="usergroups.deleteGroup"
        square
    />);
}

function GroupFilter({onSearch, query }) {
    const handleFieldChange = (params) => {
        onSearch({params: { q: params }});
    };
    return (<InputControl
        placeholder="usergroups.searchGroups"
        style={{ maxWidth: 200 }}
        value={query.q || ''}
        debounceTime={300}
        onChange={handleFieldChange}
    />);
}

const userGroupsToolsConnect = connect(null, {
    onEdit: editGroup,
    onDelete: deleteGroup,
    onSearch: searchUserGroups,
    onNewGroup: editGroup.bind(null, {})
});

const ConnectedNewGroup = userGroupsToolsConnect(NewGroup);
const ConnectedEditGroup = userGroupsToolsConnect(EditGroup);
const ConnectedDeleteGroup = userGroupsToolsConnect(DeleteGroup);
const ConnectedGroupFilter = userGroupsToolsConnect(GroupFilter);

function GroupManager({
    active = true,
    items,
    order = null,
    metadata = {
        grid: [
            {
                path: 'groupName',
                target: 'header',
                showFullContent: true,
                icon: { glyph: 'group' }
            },
            {
                path: 'description',
                showFullContent: true,
                target: 'footer'
            }
        ]
    },
    showMembersTab,
    showAttributesTab,
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
        <>
            <ConnectedResourcesGrid
                {...props}
                order={order}
                requestResources={requestGroups}
                configuredItems={[
                    ...configuredItems,
                    { Component: ConnectedEditGroup, target: 'card-buttons', name: "editgroup" },
                    { Component: ConnectedDeleteGroup, target: 'card-buttons', name: "deletegroup" },
                    { Component: ConnectedGroupFilter, target: 'left-menu', name: "groupfilter" },
                    { Component: ConnectedNewGroup, target: 'right-menu', name: "newgroup" }
                ]}
                metadata={metadata}
                formatHref={handleFormatHref}
                cardLayoutStyle="grid"
                hideThumbnail
                resourcesFoundMsgId="usergroups.userGroupsFound"
            />
            <ConnectedGroupDialog
                showMembersTab={showMembersTab}
                showAttributesTab={showAttributesTab}
                attributeFields={attributeFields}/>
            <ConnectedGroupDeleteConfirm />
        </>

    );
}

const GroupManagerPlugin = connect(
    createStructuredSelector({
        totalResources: getTotalUserGroups,
        loading: getUserGroupsLoading,
        location: getRouterLocation,
        resources: getUserGroups,
        error: getUserGroupsError,
        isFirstRequest: getIsFirstRequest,
        page: getCurrentPage,
        search: getSearch,
        storedParams: getCurrentParams
    }),
    {
        setLoading: loadingUserGroups,
        setResources: updateUserGroups,
        setResourcesMetadata: updateUserGroupsMetadata,
        onResetSearch: resetSearchUserGroups
    }
)(GroupManager);

GroupManagerPlugin.defaultProps = {
    id: 'groups'
};

/**
 * Allows an administrator to browse user groups.
 * Renders in {@link #plugins.Manager|Manager} plugin.
 * @name GroupManager
 * @deprecated
 * @property {object[]} cfg.attributeFields attributes that should be shown in attributes tab of group manager. By default this array contains one `notes` attribute with `controlType`: `text`. Every object in this array can contain:
 * - `name`: the name of the attribute
 * - `title`: the string to show as label for the attribute.  If not present, `name` property will be used.
 * - `controlType`: The input control to use. can be : `string` (input), `text` (text area), `date` (date picker) and `select`. By default it is `string`
 * - `controlAttributes`: attributes specific of the `controlType`. For instance the `options` for the `select` control. See the examples for more details.
 * @property {boolean} cfg.showMembersTab shows/hides group members tab, default true
 * @property {boolean} cfg.showAttributesTab shows/hides group attributes tab, default false
 * @memberof plugins
 * @class
 * @example
 * { "name": "GroupManager",
 *   "cfg": {
 *        "showMembersTab": false,
 *        "showAttributesTab": true,
 *        "attributeFields": [
 *             {
 *                 "title": "Simple text",
 *                 "name": "normalString",
 *                 "controlType": "string"
 *             },
 *             {
 *                 "title": "Input creates different attributes entries, separated by ;",
 *                 "name": "multistring",
 *                 "controlType": "string",
 *                 "controlAttributes": {
 *                     "multiAttribute": true,
 *                     "separator": ";"
 *                 }
 *             },
 *             {
 *                 "title": "Notes",
 *                 "name": "notes",
 *                 "controlType": "text"
 *             },
 *             {
 *                 "title": "Notes, multiple entries, separated by new-line",
 *                 "name": "multiple-notes",
 *                 "controlType": "text",
 *                 "controlAttributes": {
 *                     "multiAttribute": true,
 *                     "separator": "\n"
 *                 }
 *             },
 *             {
 *                 "title": "Single select with options in",
 *                 "name": "select",
 *                 "controlType": "select",
 *                 "options": [
 *                     {
 *                         "label": "Option 1",
 *                         "value": "opt1"
 *                     },
 *                     {
 *                         "label": "Option 2",
 *                         "value": "opt2"
 *                     }
 *                 ]
 *             },
 *             {
 *                 "title": "Multiple selections in multiple attributes (using remote service)",
 *                 "name": "organizations",
 *                 "controlType": "select",
 *                 "source": {
 *                     "url": "assets/json/organizations.json",
 *                     "path": "organizations",
 *                     "valueAttribute": "value",
 *                     "labelAttribute": "label"
 *                 },
 *                 "controlAttributes": {
 *                     "multiAttribute": true,
 *                     "isMulti": true
 *                 }
 *             },
 *             {
 *                 "title": "Multiple selections in single attribute, concatenated (using remote service)",
 *                 "name": "organizations_dependent",
 *                 "controlType": "select",
 *                 "source": {
 *                     "url": "assets/json/organizations.json",
 *                     "path": "organizations",
 *                     "valueAttribute": "value",
 *                     "labelAttribute": "label"
 *                 },
 *                     "controlAttributes": {
 *                     "separator": ";",
 *                     "isMulti": true
 *                 }
 *             }
 *         ]
 *     }
 * }
 */
export default createPlugin('GroupManager', {
    component: GroupManagerPlugin,
    containers: {
        Manager: {
            name: 'groupmanager',
            position: 2,
            priority: 1,
            glyph: "1-user-mod"
        }
    },
    epics: {},
    reducers: {
        usergroups: usergroupsReducer
    }
});
