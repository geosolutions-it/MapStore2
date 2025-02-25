/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from '../../utils/PluginsUtils';
import url from 'url';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import resourcesReducer from './reducers/resources';
import FiltersForm from './components/FiltersForm';
import { getMonitoredStateSelector, getRouterLocation, getShowFiltersForm } from './selectors/resources';
import { searchResources, setShowFiltersForm  } from './actions/resources';
import ResourcesFiltersFormButton from './containers/ResourcesFiltersFormButton';
import useParsePluginConfigExpressions from './hooks/useParsePluginConfigExpressions';
import useFilterFacets from './hooks/useFilterFacets';
import { facetsRequest } from './api/resources';
import ResourcesPanelWrapper from './components/ResourcesPanelWrapper';
import TargetSelectorPortal from './components/TargetSelectorPortal';
import useResourcePanelWrapper from './hooks/useResourcePanelWrapper';
import { withResizeDetector } from 'react-resize-detector';
import { userSelector } from '../../selectors/security';

/**
 * This plugin renders a side panel with configurable input filters
 * @memberof plugins
 * @class
 * @name ResourcesFiltersForm
 * @prop {string} cfg.resourcesGridId (required) parent catalog identifier
 * @prop {string} cfg.headerNodeSelector optional valid query selector for the header in the page, used to set the position of the panel
 * @prop {string} cfg.navbarNodeSelector optional valid query selector for the navbar under the header, used to set the position of the panel
 * @prop {string} cfg.footerNodeSelector optional valid query selector for the footer in the page, used to set the position of the panel
 * @prop {string} cfg.targetSelector optional valid query selector for a node used to mount the plugin root component
 * @prop {object[]} cfg.fields array of filter object configurations
 * @example
 * {
 *  "name": "ResourcesFiltersForm",
 *  "cfg": {
 *      "resourcesGridId": "catalog",
 *      "fields": [
 *          {
 *              "type": "search"
 *          },
 *          {
 *              "type": "group",
 *              "labelId": "resourcesCatalog.customFiltersTitle",
 *              "items": [
 *                  {
 *                      "id": "my-resources",
 *                      "labelId": "resourcesCatalog.myResources",
 *                      "type": "filter",
 *                      "disableIf": "{!state('userrole')}"
 *                  },
 *                  {
 *                      "id": "map",
 *                      "labelId": "resourcesCatalog.mapsFilter",
 *                      "type": "filter"
 *                  },
 *                  {
 *                      "id": "dashboard",
 *                      "labelId": "resourcesCatalog.dashboardsFilter",
 *                      "type": "filter"
 *                  },
 *                  {
 *                      "id": "geostory",
 *                      "labelId": "resourcesCatalog.geostoriesFilter",
 *                      "type": "filter"
 *                  },
 *                  {
 *                      "id": "context",
 *                      "labelId": "resourcesCatalog.contextsFilter",
 *                      "type": "filter"
 *                  }
 *              ]
 *          },
 *          {
 *              "type": "divider"
 *          },
 *          {
 *              "type": "select",
 *              "facet": "group",
 *              "disableIf": "{!state("userrole")}"
 *          },
 *          {
 *              "type": "select",
 *              "facet": "context"
 *          },
 *          {
 *              "type": "date-range",
 *              "filterKey": "creation",
 *              "labelId": "resourcesCatalog.creationFilter"
 *          }
 *      ]
 *  }
 * }
 */
function ResourcesFiltersForm({
    id = 'ms-filter-form',
    resourcesGridId,
    onClose,
    onSearch,
    extent = {
        layers: [
            {
                type: 'osm',
                title: 'Open Street Map',
                name: 'mapnik',
                source: 'osm',
                group: 'background',
                visibility: true
            }
        ],
        style: {
            color: '#397AAB',
            opacity: 0.8,
            fillColor: '#397AAB',
            fillOpacity: 0.4,
            weight: 4
        }
    },
    fields: fieldsProp = [
        {
            type: 'search'
        },
        {
            type: 'group',
            labelId: 'resourcesCatalog.customFiltersTitle',
            items: [
                {
                    id: 'my-resources',
                    labelId: 'resourcesCatalog.myResources',
                    type: 'filter',
                    disableIf: '{!state("userrole")}'
                },
                {
                    id: 'favorite',
                    labelId: 'resourcesCatalog.favorites',
                    type: 'filter',
                    disableIf: '{!state("userrole")}'
                },
                {
                    id: 'map',
                    labelId: 'resourcesCatalog.mapsFilter',
                    type: 'filter'
                },
                {
                    id: 'dashboard',
                    labelId: 'resourcesCatalog.dashboardsFilter',
                    type: 'filter'
                },
                {
                    id: 'geostory',
                    labelId: 'resourcesCatalog.geostoriesFilter',
                    type: 'filter'
                },
                {
                    id: 'context',
                    labelId: 'resourcesCatalog.contextsFilter',
                    type: 'filter'
                }
            ]
        },
        {
            type: 'divider'
        },
        {
            type: 'select',
            facet: "group",
            disableIf: '{!state("userrole")}'
        },
        {
            type: 'select',
            facet: "tag"
        },
        {
            type: 'select',
            facet: "context"
        },
        {
            type: 'date-range',
            filterKey: 'creation',
            labelId: 'resourcesCatalog.creationFilter'
        }
    ],
    monitoredState,
    customFilters,
    location,
    show,
    targetSelector,
    headerNodeSelector = '#ms-brand-navbar',
    navbarNodeSelector = '',
    footerNodeSelector = '#ms-footer',
    width,
    height,
    user
}) {

    const { query } = url.parse(location.search, true);

    const parsedConfig = useParsePluginConfigExpressions(monitoredState, {
        extent,
        fields: fieldsProp
    });

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

    const {
        fields
    } = useFilterFacets({
        query,
        fields: parsedConfig.fields,
        request: facetsRequest,
        customFilters,
        visible: !!show
    }, [user]);

    return (
        <TargetSelectorPortal targetSelector={targetSelector}>
            <ResourcesPanelWrapper
                className="ms-resources-filter shadow-md"
                top={stickyTop}
                bottom={stickyBottom}
                show={!!show}
                enabled={!!show}
            >
                <FiltersForm
                    id={id}
                    extentProps={parsedConfig.extent}
                    fields={fields}
                    query={query}
                    onChange={(params) => onSearch({ params }, resourcesGridId)}
                    onClear={() => onSearch({ clear: true }, resourcesGridId)}
                    onClose={() => onClose(resourcesGridId)}
                />
            </ResourcesPanelWrapper>
        </TargetSelectorPortal>
    );
}

const ResourcesGridPlugin = connect(
    createStructuredSelector({
        user: userSelector,
        location: getRouterLocation,
        monitoredState: getMonitoredStateSelector,
        show: getShowFiltersForm
    }),
    {
        onClose: setShowFiltersForm.bind(null, false),
        onSearch: searchResources
    }
)(withResizeDetector(ResourcesFiltersForm));

export default createPlugin('ResourcesFiltersForm', {
    component: ResourcesGridPlugin,
    containers: {
        ResourcesGrid: {
            target: 'left-menu',
            Component: ResourcesFiltersFormButton
        }
    },
    epics: {},
    reducers: {
        resources: resourcesReducer
    }
});
