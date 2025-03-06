/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { createPlugin } from '../../utils/PluginsUtils';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import resourcesReducer from './reducers/resources';
import {
    resetSelectedResource,
    searchResources,
    setSelectedResource,
    setShowDetails,
    updateSelectedResource
} from './actions/resources';
import {
    getSelectedResource,
    getMonitoredStateSelector,
    getRouterLocation,
    getShowDetails
} from './selectors/resources';
import { getPendingChanges } from './selectors/save';
import ResourcePermissions from './containers/ResourcePermissions';
import ResourceAbout from './containers/ResourceAbout';
import { updateResource } from '../../observables/geostore';
import { userSelector } from '../../selectors/security';
import ResourcesPanelWrapper from './components/ResourcesPanelWrapper';
import TargetSelectorPortal from './components/TargetSelectorPortal';
import useResourcePanelWrapper from './hooks/useResourcePanelWrapper';
import { withResizeDetector } from 'react-resize-detector';
import { requestResource, facets } from './api/resources';
import { isEmpty } from 'lodash';
import PendingStatePrompt from './containers/PendingStatePrompt';
import ResourceDetailsComponent from './containers/ResourceDetails';
import Button from '../../components/layout/Button';
import { getResourceTypesInfo, getResourceId, parseResourceProperties } from './utils/ResourcesUtils';
import Icon from './components/Icon';
import Text from '../../components/layout/Text';
import FlexBox from '../../components/layout/FlexBox';
import tooltip from '../../components/misc/enhancers/tooltip';

const ButtonWithTooltip = tooltip(Button);

const tabComponents = {
    permissions: ResourcePermissions,
    about: ResourceAbout
};

/**
 * This plugin shows details of a resource
 * @memberof plugins
 * @class
 * @name ResourceDetails
 * @prop {object[]} cfg.tabs configuration for the available tabs
 * @prop {string} cfg.resourceType one of `MAP`, `DASHBOARD` or `GEOSTORY` when used in a viewer, if undefined can be used in the homepage
 * @prop {string} cfg.headerNodeSelector optional valid query selector for the header in the page, used to set the position of the panel
 * @prop {string} cfg.navbarNodeSelector optional valid query selector for the navbar under the header, used to set the position of the panel
 * @prop {string} cfg.footerNodeSelector optional valid query selector for the footer in the page, used to set the position of the panel
 * @prop {string} cfg.targetSelector optional valid query selector for a node used to mount the plugin root component
 * @example
 * {
 *  "name": "ResourceDetails",
 *  "cfg": {
 *      "resourceType": "MAP",
 *      "tabs": [
 *          {
 *              "type": "text",
 *              "labelId": "myMassageIdForName",
 *              "editable": true,
 *              "path": "name"
 *          },
 *          {
 *              "type": "text",
 *              "labelId": "myMassageIdForMyAttribute",
 *              "disableIf": "{!state('userrole')}",
 *              "path": "attributes.myAttribute"
 *          },
 *          {
 *              "type": "date",
 *              "labelId": "myMassageIdForCreation",
 *              "path": "creation",
 *              "format": "MMMM Do YYYY"
 *          },
 *          {
 *              "type": "tag",
 *              "labelId": "myMassageIdForTags",
 *              "path": "tags",
 *              "editable": true,
 *              "facet": "tag",
 *              "itemColor": "color",
 *              "disableIf": "{!state('userrole')}",
 *              "filter": "filter{tag.in}"
 *          },
 *          {
 *              "type": "boolean",
 *              "labelId": "myMassageIdForAdvertised",
 *              "path": "advertised",
 *              "disableIf": "{!state('resourceCanEdit')}",
 *              "editable": true
 *          }
 *      ]
 *  }
 * }
 */
function ResourceDetails({
    targetSelector,
    headerNodeSelector = '#ms-brand-navbar',
    navbarNodeSelector = '',
    footerNodeSelector = '#ms-footer',
    width,
    height,
    show,
    onShow,
    enableFilters,
    tabs = [
        {
            "type": "tab",
            "id": "info",
            "labelId": "resourcesCatalog.info",
            "items": [
                {
                    "type": "text",
                    "labelId": "resourcesCatalog.columnName",
                    "editable": true,
                    "path": "name"
                },
                {
                    "type": "text",
                    "labelId": "resourcesCatalog.columnDescription",
                    "editable": true,
                    "path": "description"
                },
                {
                    "type": "text",
                    "labelId": "resourcesCatalog.columnCreatedBy",
                    "path": "creator",
                    "disableIf": "{!state('userrole')}"
                },
                {
                    "type": "date",
                    "labelId": "resourcesCatalog.columnCreated",
                    "path": "creation"
                },
                {
                    "type": "text",
                    "labelId": "resourcesCatalog.columnLastModifiedBy",
                    "path": "editor",
                    "disableIf": "{!state('userrole')}"
                },
                {
                    "type": "date",
                    "labelId": "resourcesCatalog.columnLastModified",
                    "path": "lastUpdate"
                },
                {
                    "type": "text",
                    "labelId": "resourcesCatalog.contactDetails",
                    "path": "attributes.contactDetails",
                    "editable": true
                },
                {
                    "type": "tag",
                    "labelId": "resourcesCatalog.columnTags",
                    "path": "tags",
                    "editable": true,
                    "facet": "tag",
                    "itemColor": "color",
                    "disableIf": "{!state('userrole')}",
                    "filter": "filter{tag.in}",
                    "itemValue": "name",
                    "itemLabel": "name"
                },
                {
                    "type": "boolean",
                    "labelId": "resourcesCatalog.columnAdvertised",
                    "path": "advertised",
                    "disableIf": "{!state('resourceCanEdit')}",
                    "editable": true
                },
                {
                    "type": "boolean",
                    "labelId": "resourcesCatalog.columnFeatured",
                    "path": "attributes.featured",
                    "disableIf": "{state('userrole') !== 'ADMIN'}",
                    "editable": true
                }
            ]
        },
        {
            "type": "permissions",
            "id": "permissions",
            "labelId": "resourcesCatalog.permissions",
            "disableIf": "{!state('resourceCanEdit')}",
            "items": [true]
        },
        {
            "type": "about",
            "id": "about",
            "labelId": "resourcesCatalog.about",
            "disableIf": "{!state('resourceCanEdit') && (!state('resourceDetails') || state('resourceDetails') === 'NODATA')}",
            "items": [true]
        }
    ],
    ...props
}) {

    const {
        stickyTop,
        stickyBottom
    } = useResourcePanelWrapper({
        headerNodeSelector,
        navbarNodeSelector,
        footerNodeSelector,
        width,
        height,
        active: true
    });

    const [editing, setEditing] = useState();
    const [error, setError] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);

    useEffect(() => {
        return () => {
            props.onSelect(null, props.resourcesGridId);
            onShow(false);
        };
    }, []);

    const shouldUseConfirmModal = (force) => !force && props.resourceType === undefined && !isEmpty(props.pendingChanges?.changes);

    function handleToggleEditing(force) {
        if (editing && shouldUseConfirmModal(force)) {
            setConfirmModal('editing');
            return;
        }
        setEditing(!editing);
        setError(false);
        return;
    }

    function handleClose(force) {
        if (shouldUseConfirmModal(force)) {
            setConfirmModal('close');
            return;
        }
        if (props.resourceType === undefined) {
            props.onSelect(null, props.resourcesGridId);
        }
        onShow(false);
        setEditing(false);
        setError(false);
        return;
    }

    function handleConfirm() {
        const isClose = confirmModal === 'close';
        setConfirmModal(false);
        props.onReset();
        if (isClose) {
            handleClose(true);
            return;
        }
        handleToggleEditing(true);
    }

    return (
        <TargetSelectorPortal targetSelector={targetSelector}>
            <ResourcesPanelWrapper
                className="ms-resource-detail shadow-md"
                top={stickyTop}
                bottom={stickyBottom}
                show={show}
                editing={editing}
                enabled={show}
            >
                <ResourceDetailsComponent
                    {...props}
                    editing={editing}
                    setEditing={setEditing}
                    onToggleEditing={handleToggleEditing}
                    error={error}
                    setError={setError}
                    onClose={handleClose}
                    tabComponents={tabComponents}
                    setRequest={requestResource}
                    updateRequest={updateResource}
                    facets={facets}
                    tabs={tabs}
                    enableFilters={enableFilters}
                />
            </ResourcesPanelWrapper>
            {props.resourceType === undefined ? <PendingStatePrompt
                show={!!confirmModal}
                onCancel={() => setConfirmModal(false)}
                onConfirm={handleConfirm}
                pendingState={!isEmpty(props.pendingChanges?.changes)}
                titleId="resourcesCatalog.detailsPendingChangesTitle"
                descriptionId="resourcesCatalog.detailsPendingChangesDescription"
                cancelId="resourcesCatalog.detailsPendingChangesCancel"
                confirmId="resourcesCatalog.detailsPendingChangesConfirm"
                variant="danger"
            /> : null}
        </TargetSelectorPortal>
    );
}

const resourceDetailsConnect = connect(
    createStructuredSelector({
        resource: getSelectedResource,
        pendingChanges: getPendingChanges,
        user: userSelector,
        monitoredState: getMonitoredStateSelector,
        location: getRouterLocation,
        show: getShowDetails
    }),
    {
        onSelect: setSelectedResource,
        onChange: updateSelectedResource,
        onSearch: searchResources,
        onReset: resetSelectedResource,
        onShow: setShowDetails
    }
);

function BrandNavbarDetailsButton({
    resource: selectedResource,
    pendingChanges,
    resourceType,
    onSelect,
    onShow,
    show
}) {

    if (!resourceType) {
        return null;
    }
    const resource = selectedResource ? undefined : parseResourceProperties({
        ...pendingChanges?.initialResource,
        category: {
            name: resourceType
        }
    });
    const { title } = getResourceTypesInfo(resource || selectedResource);
    return (
        <FlexBox component="li" centerChildrenVertically gap="xs">
            <ButtonWithTooltip
                active={show}
                square
                tooltipId="resourcesCatalog.viewResourceProperties"
                tooltipPosition="bottom"
                onClick={() => {
                    if (resource) {
                        onSelect(resource);
                    }
                    onShow(true);
                }}
                borderTransparent
            >
                <Icon glyph="details" type="glyphicon" />
            </ButtonWithTooltip>
            <Text ellipsis>
                {title}
            </Text>
        </FlexBox>
    );
}

export default createPlugin('ResourceDetails', {
    component: resourceDetailsConnect(withResizeDetector(ResourceDetails)),
    containers: {
        BrandNavbar: {
            priority: 1,
            target: 'left-menu',
            Component: resourceDetailsConnect(BrandNavbarDetailsButton),
            doNotHide: true,
            position: 5
        },
        ResourcesGrid: {
            priority: 2,
            target: 'card-buttons',
            position: 2,
            Component: connect(
                createStructuredSelector({
                    selectedResource: getSelectedResource
                }),
                {
                    onSelect: setSelectedResource,
                    onShow: setShowDetails
                }
            )(({ resourcesGridId, resource, onSelect, component, selectedResource, onShow }) => {
                const Component = component;
                function handleClick() {
                    if (getResourceId(selectedResource) !== getResourceId(resource)) {
                        onSelect(resource, resourcesGridId);
                        onShow(true, resourcesGridId);
                    }
                }
                return (
                    <Component
                        onClick={handleClick}
                        glyph="details"
                        iconType="glyphicon"
                        square
                        labelId="resourcesCatalog.viewResourceProperties"
                    />
                );
            }),
            doNotHide: true
        }
    },
    epics: {},
    reducers: {
        resources: resourcesReducer
    }
});
