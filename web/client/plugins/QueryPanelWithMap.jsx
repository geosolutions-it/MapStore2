/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { toggleControl } from '../actions/controls';
import { discardCurrentFilter, storeCurrentFilter } from '../actions/layerFilter';
import { initQueryPanel } from '../actions/wfsquery';
import PanelWithMap from './queryPanelWithMap/PanelWithMap';
import autocompleteEpics from '../epics/autocomplete';
import layerFilterEpics from '../epics/layerfilter';
import queryFormEpics from '../epics/queryform';
import { featureTypeSelectedEpic, redrawSpatialFilterEpic, viewportSelectedEpic, wfsQueryEpic } from '../epics/wfsquery';
import layerFilterReducers from '../reducers/layerFilter';
import queryReducers from '../reducers/query';
import draw from '../reducers/draw';
import mapReducers from '../reducers/map';
import queryformReducers from '../reducers/queryform';
import { queryPanelWithMapSelector } from '../selectors/controls';
import { isDashboardAvailable } from '../selectors/dashboard';
import { groupsSelector, selectedLayerLoadingErrorSelector } from '../selectors/layers';
import { mapSelector } from '../selectors/map';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import { appliedFilterSelector, storedFilterSelector } from '../selectors/queryform';
import { typeNameSelector } from "../selectors/query";
import MapComp from './queryPanelWithMap/MapComp';


/**
 * @class
 * @classdesc
 * QueryPanelPlugin allow to query a layer in different ways, using attributes of that layer, spatial filters
 * @name QueryPanel
 * @memberof plugins
 * @prop {boolean} cfg.activateQueryTool: Activate query tool options, default `false`
 * @prop {object[]} cfg.spatialMethodOptions: The list of geometric methods use to create/draw the spatial filter <br/>
 * Here you can configure a list of methods used to draw (BBOX, Circle, Polygon) or create (Viewport and wfsGeocoder types) regarding the wfsGeocoder. <br/>The options for wfsGeocoder are:
 * - id: id of the method
 * - name: label used in the DropdownList
 * - type: must be wfsGeocoder
 * - customItemClassName: a custom class for used for this method in the DropdownList
 * - geodesic: {bool} draw a geodesic geometry for filter (supported only for Circle)
 * - filterProps:
 *   - blacklist {string[]} a list of banned words excluded from the wfs search
 *   - maxFeatures {number} the maximum features fetched per request
 *   - predicate {string} the cql predicate
 *   - querableAttributes {string[]} list of attributes to query on.
 *   - typeName {string} the workspace + layer name on geoserver
 *   - valueField {string} the attribute from features properties used as value/label in the autocomplete list
 *   - srsName {string} The projection of the requested features fetched via wfs
 * Plugin acts as container and by default it have three panels: "AttributesFilter", "SpatialFilter" and "CrossLayerFilter" (see "standardItems" variable)
 * Panels can be customized by injection from another plugins (see example below).
 * Targets available for injection: "start", "attributes", "afterAttributes", "spatial", "afterSpatial", "layers", "end".

 * @prop {object[]} cfg.spatialOperations: The list of geometric operations use to create the spatial filter.<br/>
 * @prop {boolean} cfg.toolsOptions.hideCrossLayer force cross layer filter panel to hide (when is not used or not usable)
 * @prop {boolean} cfg.toolsOptions.hideAttributeFilter force attribute filter panel to hide (when is not used or not usable). In general any `hide${CapitailizedItemId}` works to hide a particular panel of the query panel.
 * @prop {boolean} cfg.toolsOptions.hideSpatialFilter force spatial filter panel to hide (when is not used or not usable)
 *
 * @example
 * // This example configure a layer with polygons geometry as spatial filter method
 * "spatialOperations": [
 *      {"id": "INTERSECTS", "name": "queryform.spatialfilter.operations.intersects"},
 *      {"id": "BBOX", "name": "queryform.spatialfilter.operations.bbox"},
 *      {"id": "CONTAINS", "name": "queryform.spatialfilter.operations.contains"},
 *      {"id": "WITHIN", "name": "queryform.spatialfilter.operations.within"},
 *      {"id": "DWITHIN", "name": "queryform.spatialfilter.operations.dwithin"}
 * ],
 * "spatialMethodOptions": [
 *    {"id": "Viewport", "name": "queryform.spatialfilter.methods.viewport"},
 *    {"id": "BBOX", "name": "queryform.spatialfilter.methods.box"},
 *    {"id": "Circle", "name": "queryform.spatialfilter.methods.circle"},
 *    {"id": "Polygon", "name": "queryform.spatialfilter.methods.poly"},
 *    {
 *        "id": "methodId",
 *        "name": "methodName",
 *        "type": "wfsGeocoder",
 *        "url": "urlToGeoserver",
 *        "crossLayer": { // if this is present, allows to optimize the filter using crossLayerFilter functinalities instead of geometry. The server must support them
 *           "cqlTemplate": "ATTRIBUTE_Y = '${properties.ATTRIBUTE_Y}'", // a template to generate the filter from the feature properties
 *           "geometryName": "GEOMETRY",
 *           "typeName": "workspace:typeName"
 *        },
 *        "filterProps": {
 *            "blacklist": [],
 *            "maxFeatures": 5,
 *            "predicate": "LIKE",
 *            "queriableAttributes": ["ATTRIBUTE_X"],
 *            "typeName": "workspace:typeName",
 *            "valueField": "ATTRIBUTE_Y",
 *            "srsName": "EPSG:3857"
 *        },
 *        "customItemClassName": "customItemClassName"
 *    }
 *
 * @example
 * // customize the QueryPanels UI via plugin(s)
 * import {createPlugin} from "../utils/PluginsUtils";
 *
 * export default createPlugin('QueryPanelCustomizations', {
 *     component: () => null,
 *     containers: {
 *         QueryPanel: [
 *             // Hide the attribute filter by injecting a `component: () => null` for one of the default panels, e.g. `attributeFilter`.
 *             {
 *                 id: 'attributeFilter',
 *                 component: () => null,
 *                 target: 'attributes',
 *                 position: 0,
 *                 layerNameRegex: "^gs:us_states__[0-9]*"
 *             },
 *             // adds a panel after the attribute panel (if present) at position `0`
 *             {
 *                 id: 'attributeFilterNew',
 *                 component: () => 'Sample text',
 *                 target: 'attributes',
 *                 position: 0
 *             },
 *             {
 *                 id: 'customPanel',
 *                 component: () => 'Panel content; Added to attributes target',
 *                 target: 'attributes',
 *                 position: 3
 *             },
 *             {
 *                 id: 'customPanel2',
 *                 component: () => 'Another panel added to start',
 *                 target: 'start',
 *                 position: 3
 *             }
 *         ]
 *     }
 * });
 */


const QueryPanelWithMapPlugin = connect(
    createSelector(
        [
            mapSelector,
            (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
            groupsSelector,
            queryPanelWithMapSelector,
            state => mapLayoutValuesSelector(state, {height: true}),
            isDashboardAvailable,
            appliedFilterSelector,
            storedFilterSelector,
            (state) => state && state.query && state.query.isLayerFilter,
            selectedLayerLoadingErrorSelector,
            typeNameSelector
        ], (map, enabled, groups, queryPanelEnabled, layoutHeight, dashboardAvailable, appliedFilter, storedFilter, advancedToolbar, loadingError, selectedLayer) => ({
            map,
            enabled,
            groups,
            queryPanelEnabled,
            layout: !dashboardAvailable ? layoutHeight : {},
            mapComp: MapComp,
            appliedFilter,
            storedFilter,
            advancedToolbar,
            loadingError,
            selectedLayer
        })
    ), {
        onToggleQuery: toggleControl.bind(null, 'queryPanelWithMap', null),
        onInit: initQueryPanel,
        onSaveFilter: storeCurrentFilter,
        onRestoreFilter: discardCurrentFilter
    })(PanelWithMap);


export default {
    QueryPanelWithMapPlugin,
    reducers: {
        draw,
        queryform: queryformReducers,
        map: mapReducers,
        query: queryReducers,
        layerFilter: layerFilterReducers
    },
    epics: {featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic, redrawSpatialFilterEpic, ...autocompleteEpics, ...queryFormEpics, ...layerFilterEpics}
};
