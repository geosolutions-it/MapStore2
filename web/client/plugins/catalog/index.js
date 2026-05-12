/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from '../../utils/PluginsUtils';
import Message from '../../components/I18N/Message';
import { setControlProperty, setControlProperties } from '../../actions/controls';
import ConnectedCatalog from './containers/Catalog';
import { Glyphicon } from 'react-bootstrap';
import { burgerMenuSelector } from '../../selectors/controls';
import API from '../../api/catalog';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { addBackground } from '../../actions/backgroundselector';


const AddLayerButton = connect(() => ({}), {
    onClick: setControlProperties.bind(null, 'metadataexplorer', 'enabled', true, 'group')
})(({
    onClick,
    selectedNodes,
    status,
    itemComponent,
    statusTypes,
    config,
    ...props
}) => {
    const ItemComponent = itemComponent;

    // deprecated TOC configuration
    if (config.activateAddLayerButton === false) {
        return null;
    }

    if ([statusTypes.DESELECT, statusTypes.GROUP].includes(status)) {
        const group = selectedNodes?.[0]?.id;
        return (
            <ItemComponent
                {...props}
                glyph="add-layer"
                tooltipId={status === statusTypes.GROUP ? 'toc.addLayerToGroup' : 'toc.addLayer'}
                onClick={() => onClick(group)}
            />
        );
    }
    return null;
});


export const BackgroundSelectorAdd = connect(
    createStructuredSelector({
        enabled: state => state.controls && state.controls.metadataexplorer && state.controls.metadataexplorer.enabled
    }),
    {
        onAdd: addBackground
    }

)(({ source, onAdd = () => {}, itemComponent, canEdit, enabled }) => {
    const ItemComponent = itemComponent;
    return canEdit ? (
        <ItemComponent
            disabled={!!enabled}
            onClick={() => {
                onAdd(source || 'backgroundSelector');
            }}
            tooltipId="backgroundSelector.addTooltip"
            glyph="plus"
        />
    ) : null;
});

/**
 * Catalog plugin. Shows catalog results from supported services such as
 * CSW, COG, WMS, WMTS, TMS, WFS, 3D Tiles, IFC Model, ArcGIS and GeoNode.
 *
 * @class
 * @name Catalog
 * @memberof plugins
 * @prop {string} [cfg.defaultView="panel"] Initial rendering mode for the catalog. Use `"panel"` to open as a side dock (default) or `"dialog"` to open in full-width grid mode. The user can still toggle between modes at runtime.
 * @prop {boolean} [cfg.hideThumbnail=false] Global configuration for thumbnail visibility.
 * Service-specific `hideThumbnail` values take precedence over the global setting.
 * @prop {object[]} [cfg.serviceTypes] Service types available when creating a new catalog service.
 * Default: `[{ name: "csw", label: "CSW" }, { name: "cog", label: "COG" }, { name: "wms", label: "WMS" }, { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders }, { name: "wfs", label: "WFS" }, { name: "3dtiles", label: "3D Tiles" }, { name: "model", label: "IFC Model" }, { name: "arcgis", label: "ArcGIS" }, { name: "geonode", label: "GeoNode" }]`.
 * For `tms`, `allowedProviders` is a whitelist of tile providers from `ConfigProvider.js`.
 * You can set a global `allowedProviders` entry in `localConfig.json`, or use `"ALL"`
 * to expose all configured providers.
 * @prop {boolean} [cfg.hideIdentifier=false] Shows or hides the resource identifier in results.
 * @prop {boolean} [cfg.hideExpand=false] Shows or hides the full description expand action.
 * @prop {boolean} [cfg.zoomToLayer=true] Enables or disables zooming to a layer after add.
 * @prop {string[]} [cfg.editingAllowedRoles=["ALL"]] Roles that may add, edit, or delete catalog services.
 * @prop {string[]} [cfg.editingAllowedGroups] Groups that may add, edit, or delete catalog services. No restriction when omitted.
 * @prop {boolean} [cfg.autoSetVisibilityLimits=false] Enables fetching visibility limits from
 * capabilities and applying them when adding a layer. The default value is applied only to new
 * catalog services such as WMS and CSW.
 * @prop {object[]} [cfg.filterFormFields] Overrides the filter fields shown in the filter panel for **`geonode` service type only**.
 * Other service types do not expose a filter panel and ignore this option entirely.
 * When set, this replaces the default fields provided by `getCapabilities` of the GeoNode API.
 * Each entry is a field descriptor; supported types are `select` (with optional `facet` binding),
 * `date-range`, `extent`, `accordion`, `tabs`, `filter`, `group`, `divider`, and `link`.
 * @example <caption>filterFormFields: two-tab layout with standard filters and quick filter shortcuts</caption>
 * {
 *   "name": "Catalog",
 *   "cfg": {
 *     "filterFormFields": [
 *       {
 *         "type": "tabs",
 *         "id": "catalog-filter-tabs",
 *         "persistSelection": true,
 *         "items": [
 *           {
 *             "id": "filters",
 *             "label": "Filters",
 *             "items": [
 *               { "id": "category", "type": "select", "order": 5, "facet": "category", "label": "Category", "key": "filter{category.identifier.in}" },
 *               { "id": "keyword",  "type": "select", "order": 6, "facet": "keyword",  "label": "Keyword",  "key": "filter{keywords.slug.in}" },
 *               { "id": "region",   "type": "select", "order": 7, "facet": "place",    "label": "Region",   "key": "filter{regions.code.in}" },
 *               { "type": "date-range", "filterKey": "date", "labelId": "resourcesCatalog.creationFilter" },
 *               { "type": "extent",     "label": "Extent Filter" }
 *             ]
 *           },
 *           {
 *             "id": "quick-filters",
 *             "label": "Quick Filters",
 *             "items": [
 *               {
 *                 "type": "accordion", "id": "quick-categories", "label": "Category",
 *                 "items": [
 *                   { "type": "filter", "id": "boundaries", "label": "Boundaries", "filterKey": "filter{category.identifier.in}", "filterValue": "boundaries" },
 *                   { "type": "filter", "id": "economy",    "label": "Economy",    "filterKey": "filter{category.identifier.in}", "filterValue": "economy" }
 *                 ]
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 * @prop {object[]} [items] Items injected by other plugins using the `url-addon` target.
 * Injected item configuration is resolved through the plugin container system, and each add-on
 * receives its `cfg` both as expanded component props and as `pluginCfg`.
 * Allowed targets:
 * - `url-addon`: adds an add-on button in the catalog service URL field while editing a service.
 *
 * @example
 * const MyAddonComponent = connect(null, {
 *     onSetShowModal: setShowModalStatus
 * })(({ onSetShowModal, itemComponent }) => {
 *     const Component = itemComponent;
 *     return (
 *         <Component
 *             onClick={() => onSetShowModal(true)}
 *             btnClassName="btn-success"
 *             glyph="glyph"
 *             tooltipId="path"
 *         />
 *     );
 * });
 *
 * createPlugin('MyPlugin', {
 *     containers: {
 *         MetadataExplorer: {
 *             name: 'TOOLNAME',
 *             target: 'url-addon',
 *             Component: MyAddonComponent
 *         }
 *     }
 * });
 */
export default createPlugin('Catalog', {
    component: ConnectedCatalog,
    containers: {
        BurgerMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title"/>,
            tooltip: "catalog.tooltip",
            icon: <Glyphicon glyph="folder-open"/>,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            doNotHide: true,
            priority: 1
        },
        SidebarMenu: {
            name: 'metadataexplorer',
            position: 5,
            text: <Message msgId="catalog.title" />,
            tooltip: "catalog.tooltip",
            icon: <Glyphicon glyph="folder-open" />,
            action: setControlProperty.bind(null, "metadataexplorer", "enabled", true, true),
            selector: (state) => ({
                style: {
                    display: burgerMenuSelector(state) ? 'none' : null
                }
            }),
            toggle: true,
            priority: 1,
            doNotHide: true
        },
        BackgroundSelector: {
            name: 'MetadataExplorer',
            doNotHide: true,
            priority: 1,
            Component: BackgroundSelectorAdd,
            target: 'background-toolbar'
        },
        TOC: {
            name: 'MetadataExplorer',
            doNotHide: true,
            priority: 1,
            target: 'toolbar',
            Component: AddLayerButton,
            position: 2
        }
    },
    reducers: { catalog: require('../../reducers/catalog').default },
    epics: require('../../epics/catalog').default(API)
});
