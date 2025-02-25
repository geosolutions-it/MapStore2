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
 * This plugins allows to render a resources grid, it could be configured multiple times in the localConfig with different id
 * @memberof plugins
 * @class
 * @name ResourcesGrid
 * @prop {string} cfg.id (required) identifier of the resources grid
 * @prop {string} cfg.titleId title of the resources grid
 * @prop {number} cfg.pageSize page size of the resources grid
 * @prop {string} cfg.cardLayoutStyle one of `list` or `grid`, if undefined will render a button to select the style from UI
 * @prop {bool} cfg.hideWithNoResults if true hides the resources grid when there aren't results
 * @prop {object} cfg.defaultQuery a default query always included in the request
 * @prop {boolean} cfg.queryPage if true the page params will be managed in the url query
 * @prop {object[]} cfg.menuItems additional menu items configuration to include on the right side of the resources menu
 * @prop {object} cfg.order configuration for the order by menu (if `null` it will not render)
 * @prop {object} cfg.order.defaultLabelId default message to show on the menu toggle
 * @prop {string} cfg.order.align if `right` will move the menu on the right
 * @prop {object[]} cfg.order.options options available in the order by menu
 * @prop {object|object[]} cfg.metadata configuration of the metadata visible on the card
 * @prop {string} cfg.headerNodeSelector optional valid query selector for the header in the page, used to set the position of the panel
 * @prop {string} cfg.navbarNodeSelector optional valid query selector for the navbar under the header, used to set the position of the panel
 * @prop {string} cfg.footerNodeSelector optional valid query selector for the footer in the page, used to set the position of the panel
 * @prop {string} cfg.targetSelector optional valid query selector for a node used to mount the plugin root component
 * @prop {object[]} items this property contains the items injected from the other plugins,
 * using the `containers` option in the plugin that want to inject new menu items.
 * The supported targets are:
 * - `card-options` target adds a menu item in the hidden dropdown list in the card
 * ```javascript
 * const MyCardOption = connect(selector, { onActivateTool })(({
 *  component, // default component that provides a consistent UI (see BrandNavbarMenuItem in BrandNavbar plugin for props)
 *  resource, // current resource
 *  viewerUrl, // url to open the viewer
 *  renderType, // it could be menuItem or undefined
 *  active, // example of a custom connected prop
 *  onActivateTool, // example of a custom connected action
 * }) => {
 *  const ItemComponent = component;
 *  return (
 *      <ItemComponent
 *          glyph="heart"
 *          iconType="glyphicon"
 *          labelId="resourcesCatalog.deleteResource"
 *          active={active}
 *          onClick={() => onActivateTool()}
 *      />
 *  );
 * });
 * createPlugin(
 *  'MyPlugin',
 *  {
 *      containers: {
 *          ResourcesGrid: {
 *              name: "TOOLNAME", // a name for the current tool.
 *              target: 'card-options',
 *              Component: MyCardOption
 *          },
 * // ...
 * ```
 * - `card-buttons` target adds a visible button on the card
 * ```javascript
 * const MyCardButton = connect(selector, { onActivateTool })(({
 *  component, // default component that provides a consistent UI (see BrandNavbarMenuItem in BrandNavbar plugin for props)
 *  resource, // current resource
 *  viewerUrl, // url to open the viewer
 *  renderType, // it could be menuItem or undefined
 *  active, // example of a custom connected prop
 *  onActivateTool, // example of a custom connected action
 * }) => {
 *  const ItemComponent = component;
 *  return (
 *      <ItemComponent
 *          glyph="heart"
 *          iconType="glyphicon"
 *          labelId="resourcesCatalog.deleteResource"
 *          active={active}
 *          square
 *          onClick={() => onActivateTool()}
 *      />
 *  );
 * });
 * createPlugin(
 *  'MyPlugin',
 *  {
 *      containers: {
 *          ResourcesGrid: {
 *              name: "TOOLNAME", // a name for the current tool.
 *              target: 'card-buttons',
 *              Component: MyCardButton
 *          },
 * // ...
 * ```
 * - `left-menu` target adds a new item in the resource card menu, near the resources count
 * ```javascript
 * const MyMenuItem = connect(selector, { onActivateTool })(({
 *  query, // current query
 *  onActivateTool, // example of a custom connected action
 * }) => {
 *  return (
 *      <button onClick={() => onActivateTool()}>My Button</button>
 *  );
 * });
 * createPlugin(
 *  'MyPlugin',
 *  {
 *      containers: {
 *          ResourcesGrid: {
 *              name: "TOOLNAME", // a name for the current tool.
 *              target: 'left-menu',
 *              Component: MyMenuItem
 *          },
 * // ...
 * ```
 * - `card` target replace the resource card component wrapper (only the first available item with this target will be used)
 * ```javascript
 * const MyCard = forwardRef(({
 *  children, // content of the resource card
 *  resource, // current resource
 *  viewerUrl, // url to open the viewer
 *  readOnly, // if true a resource is in read only mode
 *  active, // if true a resource is selected
 *  interactive, // if true a resource card is interactive
 *  className // default class names
 * }, ref) => {
 *  return (
 *      <div ref={ref} className={className}>
 *          {children}
 *      </div>
 *  );
 * });
 * createPlugin(
 *  'MyPlugin',
 *  {
 *      containers: {
 *          ResourcesGrid: {
 *              name: "TOOLNAME", // a name for the current tool.
 *              target: 'card',
 *              Component: MyCard
 *          },
 * // ...
 * ```
 * @example
 * {
 *  "name": "ResourcesGrid",
 *  "cfg": {
 *      "id": "featured",
 *      "titleId": "manager.featuredMaps",
 *      "pageSize": 4,
 *      "cardLayoutStyle": "grid",
 *      "order": null,
 *      "hideWithNoResults": true,
 *      "defaultQuery": {
 *          "f": "featured"
 *      }
 *  }
 * },
 * {
 *  "name": "ResourcesGrid",
 *  "cfg": {
 *      "id": "maps",
 *      "titleId": "manager.featuredMaps",
 *      "pageSize": 4,
 *      "order": null,
 *      "metadata": {
 *          "list": [
 *              {
 *                  "path": "name",
 *                  "target": "header",
 *                  "width": 20,
 *                  "labelId": "resourcesCatalog.columnName"
 *              },
 *              {
 *                  "path": "description",
 *                  "width": 40,
 *                  "labelId": "resourcesCatalog.columnDescription"
 *              },
 *              {
 *                  "path": "lastUpdate",
 *                  "type": "date",
 *                  "format": "MMM Do YY, h:mm:ss a",
 *                  "width": 20,
 *                  "icon": { "glyph": "clock-o" },
 *                  "labelId": "resourcesCatalog.columnLastModified",
 *                  "noDataLabelId": "resourcesCatalog.emptyNA"
 *              },
 *              {
 *                  "path": "creator",
 *                  "target": "footer",
 *                  "filter": "filter{creator.in}",
 *                  "icon": { "glyph": "user", "type": "glyphicon" },
 *                  "width": 20,
 *                  "labelId": "resourcesCatalog.columnCreatedBy",
 *                  "noDataLabelId": "resourcesCatalog.emptyUnknown",
 *                  "disableIf": "{!state('userrole')}"
 *              }
 *          ],
 *          "grid": [
 *              {
 *                  "path": "name",
 *                  "target": "header"
 *              },
 *              {
 *                  "path": "creator",
 *                  "target": "footer",
 *                  "filter": "filter{creator.in}",
 *                  "icon": { "glyph": "user", "type": 'glyphicon' },
 *                  "noDataLabelId": "resourcesCatalog.emptyUnknown",
 *                  "disableIf": "{!state('userrole')}",
 *                  "tooltipId": "resourcesCatalog.columnCreatedBy"
 *              }
 *          ]
 *      },
 *      "defaultQuery": {
 *          "f": "map"
 *      }
 *  }
 * },
 * {
 *  "name": "ResourcesGrid",
 *  "cfg": {
 *      "id": "catalog",
 *      "titleId": "resources.contents.title",
 *      "queryPage": true,
 *      "cardLayoutStyle": "list",
 *      "order": {
 *          "defaultLabelId": "resourcesCatalog.orderBy",
 *          "align": "right",
 *          "options": [
 *              {
 *                  "label": "Most recent",
 *                  "labelId": "resourcesCatalog.mostRecent",
 *                  "value": "-creation"
 *              },
 *              {
 *                  "label": "Less recent",
 *                  "labelId": "resourcesCatalog.lessRecent",
 *                  "value": "creation"
 *              },
 *              {
 *                  "label": "A Z",
 *                  "labelId": "resourcesCatalog.aZ",
 *                  "value": "name"
 *              },
 *              {
 *                  "label": "Z A",
 *                  "labelId": "resourcesCatalog.zA",
 *                  "value": "-name"
 *              }
 *          ]
 *      },
 *      "menuItems": [
 *          {
 *              "labelId": "resourcesCatalog.addResource",
 *              "disableIf": "{!state('userrole')}",
 *              "type": "dropdown",
 *              "variant": "primary",
 *              "size": "sm",
 *              "responsive": true,
 *              "noCaret": true,
 *              "items": [
 *                  {
 *                      "labelId": "resourcesCatalog.createMap",
 *                      "type": "link",
 *                      "href": "#/viewer/new"
 *                  },
 *                  {
 *                      "labelId": "resourcesCatalog.createDashboard",
 *                      "type": "link",
 *                      "href": "#/dashboard/"
 *                  },
 *                  {
 *                      "labelId": "resourcesCatalog.createGeoStory",
 *                      "type": "link",
 *                      "href": "#/geostory/newgeostory/",
 *                      "disableIf": "{state('userrole') !== 'ADMIN'}"
 *                  }
 *              ]
 *          }
 *      ]
 *  }
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
                width: 20,
                labelId: 'resourcesCatalog.columnDescription'
            },
            {
                path: 'tags',
                filter: 'filter{tag.in}',
                itemValue: 'name',
                itemColor: 'color',
                width: 30,
                type: 'tag',
                noDataLabelId: 'resourcesCatalog.emptyNA',
                labelId: 'resourcesCatalog.columnTags'
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
                width: 10,
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
                path: 'tags',
                filter: 'filter{tag.in}',
                itemValue: 'name',
                itemColor: 'color',
                type: 'tag',
                showFullContent: true
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
