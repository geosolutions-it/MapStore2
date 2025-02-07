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

import usePluginItems from '../../hooks/usePluginItems';
import ConnectedResourcesGrid from './containers/ResourcesGrid';
import { hashLocationToHref } from './utils/ResourcesFiltersUtils';
import { requestResources } from './api/resources';
import { getResourceTypesInfo, getResourceStatus, getResourceId } from './utils/ResourcesUtils';

/**
* @module ResourcesGrid
*/

/**
 * renders a grid of resource cards, providing the ability to create pages to show a filtered / curated list of resources. For example, a landing page showing only geostories, one page per category or group with a title, some text, etc.
  * @name ResourcesGrid.
  * @prop {string} defaultQuery The pre-set filter to be applied by default
  * @prop {object} order an object defining sort options for resource grid.
  * @prop {object} extent the extent used in filters side menu to limit search within set bounds.
  * @prop {array} menuItems contains menu for Add resources button.
  * @prop {array} filtersFormItems Provides config for various filter metrics.
  * @prop {number} pageSize number of resources per page. Used in pagination.
  * @prop {string} targetSelector selector for parent node of resource
  * @prop {string} headerNodeSelector selector for rendered header.
  * @prop {string} navbarNodeSelector selector for rendered navbar.
  * @prop {string} footerNodeSelector selector for rendered footer.
  * @prop {string} containerSelector selector for rendered resource card grid container.
  * @prop {string} scrollContainerSelector selector for outer container of resource cards rendered. This is the parent on which scrolling takes place.
  * @prop {boolean} pagination Provides a config to allow for pagination
  * @prop {boolean} disableDetailPanel Provides a config to allow resource details to be viewed when selected.
  * @prop {boolean} disableFilters Provides a config to enable/disable filtering of resources
  * @prop {array} resourceCardActionsOrder order in which `cfg.items` will be rendered
  * @prop {boolean} enableGeoNodeCardsMenuItems Provides a config to allow for card menu items to be enabled/disabled.
  * @prop {boolean} panel when enabled, the component render the list of resources, filters and details preview inside a panel
  * @prop {string} cardLayoutStyle when specified, the card layout option is forced and the button to toggle card layout is hidden
  * @prop {string} defaultCardLayoutStyle default layout card style. One of 'list'|'grid'
  * @prop {array} detailsTabs array of tab object representing the structure of the displayed info properties (see tabs in {@link module:DetailViewer})
  * @example
  * {
  *   "name": "ResourcesGrid",
  *    "cfg": {
  *        targetSelector: '#custom-resources-grid',
  *        containerSelector: '.ms-container',
  *        menuItems: [],
  *        filtersFormItems: [],
  *        defaultQuery: {
  *          f: 'dataset'
  *        },
  *        pagination: false,
  *        disableDetailPanel: true,
  *        disableFilters: true,
  *        enableGeoNodeCardsMenuItems: true
  *    }
  * }
  */
function ResourcesGrid({
    items,
    order = {
        defaultLabelId: 'resourcesCatalog.orderBy',
        options: [
            {
                label: 'Most recent',
                labelId: 'resourcesCatalog.mostRecent',
                value: '-creation'
            },
            {
                label: 'Less recent',
                labelId: 'resourcesCatalog.lessRecent',
                value: 'creation'
            },
            {
                label: 'A Z',
                labelId: 'resourcesCatalog.aZ',
                value: 'name'
            },
            {
                label: 'Z A',
                labelId: 'resourcesCatalog.zA',
                value: '-name'
            }
        ]
    },
    metadata = {
        list: [
            {
                path: 'name',
                target: 'header',
                width: 20,
                labelId: 'resourcesCatalog.columnName'
            },
            {
                path: 'description',
                width: 40,
                labelId: 'resourcesCatalog.columnDescription'
            },
            {
                path: 'lastUpdate',
                type: 'date',
                format: 'MMM Do YY, h:mm:ss a',
                width: 20,
                icon: { glyph: 'clock-o' },
                labelId: 'resourcesCatalog.columnLastModified',
                noDataLabelId: 'resourcesCatalog.emptyNA'
            },
            {
                path: 'creator',
                target: 'footer',
                filter: 'filter{creator.in}',
                icon: { glyph: 'user', type: 'glyphicon' },
                width: 20,
                labelId: 'resourcesCatalog.columnCreatedBy',
                noDataLabelId: 'resourcesCatalog.emptyUnknown',
                disableIf: '{!state("userrole")}'
            }
        ],
        grid: [
            {
                path: 'name',
                target: 'header'
            },
            {
                path: 'creator',
                target: 'footer',
                filter: 'filter{creator.in}',
                icon: { glyph: 'user', type: 'glyphicon' },
                noDataLabelId: 'resourcesCatalog.emptyUnknown',
                disableIf: '{!state("userrole")}',
                tooltipId: 'resourcesCatalog.columnCreatedBy'
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

    return (
        <ConnectedResourcesGrid
            {...props}
            order={order}
            requestResources={requestResources}
            configuredItems={configuredItems}
            metadata={metadata}
            getResourceStatus={getResourceStatus}
            formatHref={handleFormatHref}
            getResourceTypesInfo={getResourceTypesInfo}
            getResourceId={getResourceId}
        />
    );
}

const ResourcesGridPlugin = connect(
    createStructuredSelector({
        location: getRouterLocation,
        resources: getResources,
        selectedResource: getSelectedResource
    })
)(ResourcesGrid);

export default createPlugin('ResourcesGrid', {
    component: ResourcesGridPlugin,
    containers: {},
    epics: {},
    reducers: {
        resources: resourcesReducer
    }
});
