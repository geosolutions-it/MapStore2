/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Sidebar from 'react-sidebar';
import { bindActionCreators } from 'redux';
import { createSelector } from 'reselect';

import standardItems from './querypanel/index';
import { toggleControl } from '../actions/controls';
import { changeDrawingStatus } from '../actions/draw';
import { getLayerCapabilities } from '../actions/layerCapabilities';
import { queryPanelSelector } from '../selectors/controls';
import { applyFilter, discardCurrentFilter, storeCurrentFilter } from '../actions/layerFilter';

import {
    changeGroupProperties,
    changeLayerProperties,
    hideSettings,
    removeNode,
    showSettings,
    sortNode,
    toggleNode,
    updateNode,
    updateSettings
} from '../actions/layers';
import { zoomToExtent } from '../actions/map';
import {
    addCrossLayerFilterField,
    addFilterField,
    addGroupField,
    changeCascadingValue,
    changeDwithinValue,
    changeSpatialFilterValue,
    expandAttributeFilterPanel,
    expandCrossLayerFilterPanel,
    expandSpatialFilterPanel,
    removeCrossLayerFilterField,
    removeFilterField,
    removeGroupField,
    removeSpatialSelection,
    reset,
    resetCrossLayerFilter,
    search,
    selectSpatialMethod,
    selectSpatialOperation,
    selectViewportSpatialMethod,
    setCrossLayerFilterParameter,
    showSpatialSelectionDetails,
    toggleMenu,
    updateCrossLayerFilterField,
    updateExceptionField,
    updateFilterField,
    updateLogicCombo,
    zoneChange,
    zoneGetValues,
    zoneSearch
} from '../actions/queryform';
import { initQueryPanel } from '../actions/wfsquery';
import QueryBuilder from '../components/data/query/QueryBuilder';
import QueryPanelHeader from '../components/data/query/QueryPanelHeader';
import Portal from '../components/misc/Portal';
import ResizableModal from '../components/misc/ResizableModal';
import autocompleteEpics from '../epics/autocomplete';
import layerFilterEpics from '../epics/layerfilter';
import queryFormEpics from '../epics/queryform';
import {featureTypeSelectedEpic, redrawSpatialFilterEpic, viewportSelectedEpic, wfsQueryEpic} from '../epics/wfsquery';
import layerFilterReducers from '../reducers/layerFilter';
import queryReducers from '../reducers/query';
import drawReducers from '../reducers/draw';
import queryformReducers from '../reducers/queryform';
import { isDashboardAvailable } from '../selectors/dashboard';
import { groupsSelector, selectedLayerLoadingErrorSelector } from '../selectors/layers';
import { mapSelector } from '../selectors/map';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import {
    appliedFilterSelector,
    availableCrossLayerFilterLayersSelector,
    crossLayerFilterSelector,
    storedFilterSelector
} from '../selectors/queryform';
import { sortLayers, sortUsing, toggleByType } from '../utils/LayersUtils';
import Message from './locale/Message';
import {typeNameSelector} from "../selectors/query";

// include application component


const onReset = reset.bind(null, "query");
// connecting a Dumb component to the store
// makes it a smart component
// we both connect state => props
// and actions to event handlers
const SmartQueryForm = connect((state) => {
    return {
        // QueryBuilder props
        useMapProjection: state.queryform.useMapProjection,
        groupLevels: state.queryform.groupLevels,
        groupFields: state.queryform.groupFields,
        filterFields: state.queryform.filterFields,
        attributes: state.query && state.query.typeName && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].attributes,
        featureTypeError: state.query && state.query.typeName && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].error,
        spatialField: state.queryform.spatialField,
        filters: state.queryform.filters,
        showDetailsPanel: state.queryform.showDetailsPanel,
        toolbarEnabled: state.queryform.toolbarEnabled,
        attributePanelExpanded: state.queryform.attributePanelExpanded,
        autocompleteEnabled: state.queryform.autocompleteEnabled,
        crossLayerExpanded: state.queryform.crossLayerExpanded,
        crossLayerFilterOptions: {
            layers: availableCrossLayerFilterLayersSelector(state),
            crossLayerFilter: crossLayerFilterSelector(state),
            ...(state.queryform.crossLayerFilterOptions || {})
        },
        maxFeaturesWPS: state.queryform.maxFeaturesWPS,
        spatialPanelExpanded: state.queryform.spatialPanelExpanded,
        featureTypeConfigUrl: state.query && state.query.url,
        searchUrl: state.query && state.query.url,
        featureTypeName: state.query && state.query.typeName,
        ogcVersion: "1.1.0",
        params: {typeName: state.query && state.query.typeName},
        resultTitle: "Query Result",
        showGeneratedFilter: false,
        allowEmptyFilter: true,
        emptyFilterWarning: true,
        maxHeight: state.map && state.map.present && state.map.present.size && state.map.present.size.height,
        zoom: (mapSelector(state) || {}).zoom,
        projection: (mapSelector(state) || {}).projection
    };
}, dispatch => {
    return {
        attributeFilterActions: bindActionCreators({
            onAddGroupField: addGroupField,
            onAddFilterField: addFilterField,
            onRemoveFilterField: removeFilterField,
            onUpdateFilterField: updateFilterField,
            onUpdateExceptionField: updateExceptionField,
            onUpdateLogicCombo: updateLogicCombo,
            onRemoveGroupField: removeGroupField,
            onChangeCascadingValue: changeCascadingValue,
            toggleMenu: toggleMenu,
            onExpandAttributeFilterPanel: expandAttributeFilterPanel
        }, dispatch),
        spatialFilterActions: bindActionCreators({
            onChangeSpatialFilterValue: changeSpatialFilterValue,
            onExpandSpatialFilterPanel: expandSpatialFilterPanel,
            onSelectSpatialMethod: selectSpatialMethod,
            onSelectViewportSpatialMethod: selectViewportSpatialMethod,
            onSelectSpatialOperation: selectSpatialOperation,
            onChangeDrawingStatus: changeDrawingStatus,
            onRemoveSpatialSelection: removeSpatialSelection,
            onShowSpatialSelectionDetails: showSpatialSelectionDetails,
            onChangeDwithinValue: changeDwithinValue,
            zoneFilter: zoneGetValues,
            zoneSearch,
            zoneChange
        }, dispatch),
        queryToolbarActions: bindActionCreators({
            onQuery: search,
            onReset,
            onSaveFilter: storeCurrentFilter,
            onRestoreFilter: discardCurrentFilter,
            storeAppliedFilter: applyFilter,
            onChangeDrawingStatus: changeDrawingStatus

        }, dispatch),
        crossLayerFilterActions: bindActionCreators({
            expandCrossLayerFilterPanel,
            setCrossLayerFilterParameter,
            addCrossLayerFilterField,
            updateCrossLayerFilterField,
            removeCrossLayerFilterField,
            resetCrossLayerFilter,
            toggleMenu: (rowId, status) => toggleMenu(rowId, status,  "crossLayer")
        }, dispatch),
        controlActions: bindActionCreators({onToggleQuery: toggleControl.bind(null, 'queryPanel', null)}, dispatch)
    };
})(QueryBuilder);

const tocSelector = createSelector(
    [
        (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
        groupsSelector,
        (state) => state.layers && state.layers.settings,
        queryPanelSelector,
        state => mapLayoutValuesSelector(state, {height: true}),
        isDashboardAvailable,
        appliedFilterSelector,
        storedFilterSelector,
        (state) => state && state.query && state.query.isLayerFilter,
        selectedLayerLoadingErrorSelector,
        typeNameSelector
    ], (enabled, groups, settings, queryPanelEnabled, layoutHeight, dashboardAvailable, appliedFilter, storedFilter, advancedToolbar, loadingError, selectedLayer) => ({
        enabled,
        groups,
        settings,
        queryPanelEnabled,
        layout: !dashboardAvailable ? layoutHeight : {},
        appliedFilter,
        storedFilter,
        advancedToolbar,
        loadingError,
        selectedLayer
    })
);

class QueryPanel extends React.Component {
    static propTypes = {
        advancedToolbar: PropTypes.bool,
        appliedFilter: PropTypes.object,
        items: PropTypes.array,
        layout: PropTypes.object,
        loadingError: PropTypes.bool,
        onInit: PropTypes.func,
        onRestoreFilter: PropTypes.func,
        onSaveFilter: PropTypes.func,
        onToggleQuery: PropTypes.func,
        queryPanelEnabled: PropTypes.bool,
        selectedLayer: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        spatialMethodOptions: PropTypes.array,
        spatialOperations: PropTypes.array,
        storedFilter: PropTypes.object,
        toolsOptions: PropTypes.object
    };

    static defaultProps = {
        groupPropertiesChangeHandler: () => {},
        layerPropertiesChangeHandler: () => {},
        retrieveLayerData: () => {},
        onToggleGroup: () => {},
        onToggleLayer: () => {},
        onToggleQuery: () => {},
        onZoomToExtent: () => {},
        onSettings: () => {},
        onInit: () => {},
        updateNode: () => {},
        removeNode: () => {},
        activateLegendTool: true,
        activateZoomTool: true,
        activateSettingsTool: true,
        activateRemoveLayer: true,
        visibilityCheckType: "checkbox",
        settingsOptions: {},
        queryPanelEnabled: false,
        layout: {},
        toolsOptions: {},
        onSaveFilter: () => {},
        onRestoreFilter: () => {},
        items: [],
        selectedLayer: false
    };
    constructor(props) {
        super(props);
        this.state = {showModal: false};
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        // triggering the init only if not using the embedded map since this was happening too early
        // making the redraw of spatial filter not happening
        if (!newProps.toolsOptions.useEmbeddedMap && newProps.queryPanelEnabled === true && this.props.queryPanelEnabled === false) {
            this.props.onInit();
        }
    }

    getNoBackgroundLayers = (group) => {
        return group.name !== 'background';
    };

    renderSidebar = () => {
        return (
            <Sidebar
                open={this.props.queryPanelEnabled}
                sidebar={this.renderQueryPanel()}
                sidebarClassName="query-form-panel-container"
                touch={false}
                rootClassName="query-form-root"
                styles={{
                    sidebar: {
                        ...this.props.layout,
                        zIndex: 1044,
                        width: 600
                    },
                    overlay: {
                        zIndex: 1023,
                        width: 0
                    },
                    root: {
                        right: this.props.queryPanelEnabled ? 0 : 'auto',
                        width: '0',
                        overflow: 'visible'
                    },
                    content: {
                        overflowY: 'auto'
                    }
                }}
            >
                <div/>
            </Sidebar>
        );
    };
    onToggle = () => {
        if (this.props.advancedToolbar && !isEqual(this.props.appliedFilter, this.props.storedFilter)) {
            this.setState(() => ({showModal: true}));
        } else {
            this.props.onToggleQuery();
        }
    }
    restoreAndClose = () => {
        this.setState(() => ({showModal: false}));
        this.props.onRestoreFilter();
        this.props.onToggleQuery();
    }
    storeAndClose = () => {
        this.setState(() => ({showModal: false}));
        this.props.onSaveFilter();
        this.props.onToggleQuery();
    }

    renderQueryPanel = () => {
        return (<div className="mapstore-query-builder">
            <SmartQueryForm
                queryPanelEnabled={this.props.queryPanelEnabled}
                header={<QueryPanelHeader loadingError={this.props.loadingError} onToggleQuery={this.onToggle} />}
                spatialOperations={this.props.spatialOperations}
                spatialMethodOptions={this.props.spatialMethodOptions}
                toolsOptions={this.props.toolsOptions}
                featureTypeErrorText={<Message msgId="layerProperties.featureTypeError"/>}
                appliedFilter={this.props.appliedFilter}
                storedFilter={this.props.storedFilter}
                advancedToolbar={this.props.advancedToolbar}
                loadingError={this.props.loadingError}
                items={this.props.items}
                selectedLayer={this.props.selectedLayer}
                standardItems={standardItems}
            />
            <Portal>
                <ResizableModal
                    fade
                    show={this.state.showModal}
                    title={<Message msgId="queryform.changedFilter"/>}
                    size="xs"
                    onClose={() => this.setState(() => ({showModal: false}))}
                    buttons={[
                        {
                            bsStyle: 'primary',
                            text: <Message msgId="yes"/>,
                            onClick: this.storeAndClose
                        },
                        {
                            bsStyle: 'primary',
                            text: <Message msgId="no" />,
                            onClick: this.restoreAndClose
                        }
                    ]}>
                    <div className="ms-alert">
                        <div className="ms-alert-center">
                            <Message msgId={this.props.loadingError && "queryform.changedFilterWithErrorAlert" || "queryform.changedFilterAlert"}/>
                        </div>
                    </div>
                </ResizableModal>
            </Portal>
        </div>);
    };


    render() {
        return this.renderSidebar();
    }
}

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
 * Targets available for injection: "start", "attributes", "afterAttributes", "spatial", "afterSpatial", "layers", "end", "map"

 * @prop {object[]} cfg.spatialOperations: The list of geometric operations use to create the spatial filter.<br/>
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
 * @prop {boolean} cfg.toolsOptions.hideCrossLayer force cross layer filter panel to hide (when is not used or not usable)
 * @prop {boolean} cfg.toolsOptions.hideAttributeFilter force attribute filter panel to hide (when is not used or not usable). In general any `hide${CapitailizedItemId}` works to hide a particular panel of the query panel.
 * @prop {boolean} cfg.toolsOptions.hideSpatialFilter force spatial filter panel to hide (when is not used or not usable)
 * @prop {boolean} cfg.toolsOptions.useEmbeddedMap if spatial filter panel is present, this option allows to use the embedded map instead of the map plugin
 * @prop {boolean} cfg.toolsOptions.quickDateTimeSelectors selectors allow quick selection of configured date/date-time in both single and range Date/DateTime picker.
 * The quick time selectors basically uses the template string `{predefinedPlaceholds}[+/-][durationExpression]` to define selectors. Range is denoted as `{startDate}/{endDate}` using the same template string format
 * - predefinedPlaceholds: `today`, `now`, `thisWeekStart`, `thisWeekEnd`, `thisMonthStart`, `thisMonthEnd`, `thisYearStart`, `thisYearEnd`
 * - durationExpression: duration expression uses ISO 8601 (https://en.wikipedia.org/wiki/ISO_8601#Durations) format `P[n]Y[n]M[n]DT[n]H[n]M[n]S` or `P[n]W`
 *
 * *Note*: `now` - uses current date time (for range, start time - 'current time' and end time - '23:59') where `today` uses 00:00 time of the current day (for range, start time - '00:00' and end time - '23:59')
 * @example
 * single - `{now}`, `{today}`, `{today}+P1D` - Tomorrow, `{now}-P10M` - 10 months from now
 * range - `{now}/{now}+P1D` - start date is current date time and end date is tomorrow
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
const QueryPanelPlugin = connect(tocSelector, {
    groupPropertiesChangeHandler: changeGroupProperties,
    layerPropertiesChangeHandler: changeLayerProperties,
    retrieveLayerData: getLayerCapabilities,
    onToggleGroup: toggleByType('groups', toggleNode),
    onToggleLayer: toggleByType('layers', toggleNode),
    onToggleQuery: toggleControl.bind(null, 'queryPanel', null),
    onSort: sortUsing(sortLayers, sortNode),
    onSettings: showSettings,
    onInit: initQueryPanel,
    onZoomToExtent: zoomToExtent,
    hideSettings,
    updateSettings,
    updateNode,
    removeNode,
    onSaveFilter: storeCurrentFilter,
    onRestoreFilter: discardCurrentFilter
})(QueryPanel);


export default {
    QueryPanelPlugin,
    reducers: {
        draw: drawReducers,
        queryform: queryformReducers,
        query: queryReducers,
        layerFilter: layerFilterReducers
    },
    epics: {featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic, redrawSpatialFilterEpic, ...autocompleteEpics, ...queryFormEpics, ...layerFilterEpics}
};
