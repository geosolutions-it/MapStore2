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
import { deleteGroup, editGroup } from '../../actions/usergroups';
import usePluginItems from '../../hooks/usePluginItems';
import ConnectedResourcesGrid from './containers/ResourcesGrid';
import { hashLocationToHref } from './utils/ResourcesFiltersUtils';
import { searchResources } from '../../plugins/ResourcesCatalog/actions/resources';
import { getResourceTypesInfo, getResourceId } from './utils/ResourcesUtils';
import GeoStoreDAO from '../../api/GeoStoreDAO';
import Message from '../../components/I18N/Message';
import { Button } from 'react-bootstrap';
import { castArray } from 'lodash';
import InputControl from './components/InputControl';
import { bindActionCreators } from 'redux';
import usergroups from '../../reducers/usergroups';
import GroupDeleteConfirm from '../../plugins/manager/users/GroupDeleteConfirm';
import GroupDialog from '../../plugins/manager/users/GroupDialog';


function requestGroups({ params }) {
    const {
        page = 1,
        pageSize = 12,
        // sort = 'name',
        q
        // ...query
    } = params || {};
    return GeoStoreDAO.getGroups(q ? `*${q}*` : '*', {
        params: {
            start: parseFloat(page - 1) * pageSize,
            limit: pageSize,
            all: true
        }
    })
        .then((response) => {
            const groups = castArray(response?.ExtGroupList?.Group || []);
            const totalCount = response?.ExtGroupList?.GroupCount;
            return {
                total: totalCount,
                isNextPageAvailable: page < (totalCount / pageSize),
                resources: groups.map((group) => group)
            };
        });
}


function NewGroup({onNewGroup}) {
    return <>
        <Button onClick={onNewGroup} bsSize="sm" bsStyle="success"><Message msgId="usergroups.newGroup"/></Button>
    </>;
}

function EditGroup({ component, onEdit, resource: group}) {
    const Component = component;
    function handleClick() {
        onEdit(group);
    }
    return (<Component
        onClick={handleClick}
        glyph="wrench"
        iconType="glyphicon"
        labelId="resourcesCatalog.editResource"
        square
    />);
}

function DeleteGroup({component, onDelete, resource: group}) {
    const Component = component;
    function handleClick() {
        onDelete(group && group.id);
    }
    return (<Component
        onClick={handleClick}
        glyph="trash"
        iconType="glyphicon"
        labelId="resourcesCatalog.deleteResource"
        square
    />);
}

function GroupFilter({onSearch, query }) {
    const handleFieldChange = (params) => {
        onSearch({params: {q: params}});
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
        onEdit: editGroup,
        onDelete: deleteGroup,
        onSearch: searchResources,
        onNewGroup: editGroup.bind(null, {})
    }, dispatch);
};


const ConnectedNewGroup = connect(null, mapDispatchToProps)(NewGroup);
const ConnectedEditGroup = connect(null, mapDispatchToProps)(EditGroup);
const ConnectedDeleteGroup = connect(null, mapDispatchToProps)(DeleteGroup);
const ConnectedGroupFilter = connect(null, mapDispatchToProps)(GroupFilter);

function GroupManager({
    active = true,
    items,
    order = null,
    metadata = {
        grid: [
            {
                path: 'groupName',
                target: 'header',
                "icon": { "glyph": "1-group", "type": 'glyphicon' }
            },
            {
                path: 'description',
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
                getResourceStatus={(resource) => {
                    return {
                        items: [
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
            <GroupDialog
                showMembersTab
                showAttributesTab={false}
                attributeFields={[]}/>
            <GroupDeleteConfirm />
        </>

    );
}

const GroupManagerPlugin = connect(
    createStructuredSelector({
        location: getRouterLocation,
        resources: getResources,
        selectedResource: getSelectedResource
    })
)(GroupManager);

GroupManagerPlugin.defaultProps = {
    id: 'groups'
};

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
        resources: resourcesReducer,
        usergroups
    }
});
