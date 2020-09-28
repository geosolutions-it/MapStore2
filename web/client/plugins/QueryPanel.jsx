/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const {connect} = require('react-redux');

const Sidebar = require('react-sidebar').default;
const {createSelector} = require('reselect');
const {changeLayerProperties, changeGroupProperties, toggleNode,
    sortNode, showSettings, hideSettings, updateSettings, updateNode, removeNode} = require('../actions/layers');
const Message = require('./locale/Message');


const {getLayerCapabilities} = require('../actions/layerCapabilities');

const {storeCurrentFilter, discardCurrentFilter, applyFilter} = require('../actions/layerFilter');


const {zoomToExtent} = require('../actions/map');
const {toggleControl} = require('../actions/controls');

const {groupsSelector, selectedLayerLoadingErrorSelector} = require('../selectors/layers');
const {mapSelector} = require('../selectors/map');
const {isDashboardAvailable} = require('../selectors/dashboard');
const {
    crossLayerFilterSelector,
    availableCrossLayerFilterLayersSelector,
    storedFilterSelector,
    appliedFilterSelector
} = require('../selectors/queryform');

const {isEqual} = require('lodash');
const LayersUtils = require('../utils/LayersUtils');

// include application component
const QueryBuilder = require('../components/data/query/QueryBuilder');
const QueryPanelHeader = require('../components/data/query/QueryPanelHeader');
const {featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic, redrawSpatialFilterEpic} = require('../epics/wfsquery');
const autocompleteEpics = require('../epics/autocomplete');
const {bindActionCreators} = require('redux');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const layerFilterEpics = require('../epics/layerfilter');

const ResizableModal = require('../components/misc/ResizableModal');
const Portal = require('../components/misc/Portal');


const {
    // QueryBuilder action functions
    addGroupField,
    addFilterField,
    removeFilterField,
    updateFilterField,
    updateExceptionField,
    updateLogicCombo,
    removeGroupField,
    changeCascadingValue,
    expandAttributeFilterPanel,
    expandSpatialFilterPanel,
    expandCrossLayerFilterPanel,
    selectSpatialMethod,
    selectViewportSpatialMethod,
    selectSpatialOperation,
    removeSpatialSelection,
    changeSpatialFilterValue,
    showSpatialSelectionDetails,
    setCrossLayerFilterParameter,
    addCrossLayerFilterField,
    updateCrossLayerFilterField,
    removeCrossLayerFilterField,
    resetCrossLayerFilter,
    search,
    reset,
    changeDwithinValue,
    zoneGetValues,
    zoneSearch,
    zoneChange,
    toggleMenu
} = require('../actions/queryform');

const {initQueryPanel} = require('../actions/wfsquery');

const {changeDrawingStatus} = require('../actions/draw');
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
            resetCrossLayerFilter
        }, dispatch)
    };
})(QueryBuilder);

const tocSelector = createSelector(
    [
        (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
        groupsSelector,
        (state) => state.layers && state.layers.settings || {expanded: false, options: {opacity: 1}},
        (state) => state.controls && state.controls.queryPanel && state.controls.queryPanel.enabled || false,
        state => mapLayoutValuesSelector(state, {height: true}),
        isDashboardAvailable,
        appliedFilterSelector,
        storedFilterSelector,
        (state) => state && state.query && state.query.isLayerFilter,
        selectedLayerLoadingErrorSelector
    ], (enabled, groups, settings, querypanelEnabled, layoutHeight, dashboardAvailable, appliedFilter, storedFilter, advancedToolbar, loadingError) => ({
        enabled,
        groups,
        settings,
        querypanelEnabled,
        layout: !dashboardAvailable ? layoutHeight : {},
        appliedFilter,
        storedFilter,
        advancedToolbar,
        loadingError
    })
);

class QueryPanel extends React.Component {
    static propTypes = {
        id: PropTypes.number,
        buttonContent: PropTypes.node,
        groups: PropTypes.array,
        settings: PropTypes.object,
        querypanelEnabled: PropTypes.bool,
        groupStyle: PropTypes.object,
        groupPropertiesChangeHandler: PropTypes.func,
        layerPropertiesChangeHandler: PropTypes.func,
        onToggleGroup: PropTypes.func,
        onToggleLayer: PropTypes.func,
        onToggleQuery: PropTypes.func,
        onZoomToExtent: PropTypes.func,
        retrieveLayerData: PropTypes.func,
        onSort: PropTypes.func,
        onInit: PropTypes.func,
        onSettings: PropTypes.func,
        hideSettings: PropTypes.func,
        updateSettings: PropTypes.func,
        updateNode: PropTypes.func,
        removeNode: PropTypes.func,
        activateRemoveLayer: PropTypes.bool,
        activateLegendTool: PropTypes.bool,
        activateZoomTool: PropTypes.bool,
        activateSettingsTool: PropTypes.bool,
        visibilityCheckType: PropTypes.string,
        settingsOptions: PropTypes.object,
        layout: PropTypes.object,
        toolsOptions: PropTypes.object,
        appliedFilter: PropTypes.object,
        storedFilter: PropTypes.object,
        advancedToolbar: PropTypes.bool,
        onSaveFilter: PropTypes.func,
        onRestoreFilter: PropTypes.func
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
        querypanelEnabled: false,
        layout: {},
        toolsOptions: {},
        onSaveFilter: () => {},
        onRestoreFilter: () => {}
    };
    constructor(props) {
        super(props);
        this.state = {showModal: false};
    }
    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.querypanelEnabled === true && this.props.querypanelEnabled === false) {
            this.props.onInit();
        }
    }
    getNoBackgroundLayers = (group) => {
        return group.name !== 'background';
    };

    renderSidebar = () => {
        return (
            <Sidebar
                open={this.props.querypanelEnabled}
                sidebar={this.renderQueryPanel()}
                sidebarClassName="query-form-panel-container"
                touch={false}
                styles={{
                    sidebar: {
                        ...this.props.layout,
                        zIndex: 1024,
                        width: 600
                    },
                    overlay: {
                        zIndex: 1023,
                        width: 0
                    },
                    root: {
                        right: this.props.querypanelEnabled ? 0 : 'auto',
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
                header={<QueryPanelHeader loadingError={this.props.loadingError} onToggleQuery={this.onToggle} />}
                spatialOperations={this.props.spatialOperations}
                spatialMethodOptions={this.props.spatialMethodOptions}
                toolsOptions={this.props.toolsOptions}
                featureTypeErrorText={<Message msgId="layerProperties.featureTypeError"/>}
                appliedFilter={this.props.appliedFilter}
                storedFilter={this.props.storedFilter}
                advancedToolbar={this.props.advancedToolbar}
                loadingError={this.props.loadingError}/>
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
 *
 * @prop {object[]} cfg.spatialOperations: The list of geometric operations use to create the spatial filter.<br/>
 * @prop {boolean} cfg.toolsOptions.hideCrossLayer force cross layer to hide
 * @prop {boolean} cfg.toolsOptions.hideCrossLayer force cross layer filter panel to hide (when is not used or not usable)
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
 */
const QueryPanelPlugin = connect(tocSelector, {
    groupPropertiesChangeHandler: changeGroupProperties,
    layerPropertiesChangeHandler: changeLayerProperties,
    retrieveLayerData: getLayerCapabilities,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode),
    onToggleQuery: toggleControl.bind(null, 'queryPanel', null),
    onSort: LayersUtils.sortUsing(LayersUtils.sortLayers, sortNode),
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


module.exports = {
    QueryPanelPlugin,
    reducers: {
        queryform: require('../reducers/queryform'),
        query: require('../reducers/query'),
        layerFilter: require('../reducers/layerFilter')
    },
    epics: {featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic, redrawSpatialFilterEpic, ...autocompleteEpics, ...require('../epics/queryform'), ...layerFilterEpics}
};
