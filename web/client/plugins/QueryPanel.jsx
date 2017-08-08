const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {Button, Glyphicon} = require('react-bootstrap');
const Sidebar = require('react-sidebar').default;
const {createSelector} = require('reselect');
const {changeLayerProperties, changeGroupProperties, toggleNode,
       sortNode, showSettings, hideSettings, updateSettings, updateNode, removeNode} = require('../actions/layers');
const Message = require('./locale/Message');

const {getLayerCapabilities} = require('../actions/layerCapabilities');

const {zoomToExtent} = require('../actions/map');
const {toggleControl} = require('../actions/controls');

const {groupsSelector} = require('../selectors/layers');

const LayersUtils = require('../utils/LayersUtils');

// include application component
const QueryBuilder = require('../components/data/query/QueryBuilder');

const {featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic} = require('../epics/wfsquery');
const autocompleteEpics = require('../epics/autocomplete');
const {bindActionCreators} = require('redux');
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
    selectSpatialMethod,
    selectViewportSpatialMethod,
    selectSpatialOperation,
    removeSpatialSelection,
    showSpatialSelectionDetails,
    reset,
    changeDwithinValue,
    zoneGetValues,
    zoneSearch,
    zoneChange,
    toggleMenu
} = require('../actions/queryform');

const {createQuery} = require('../actions/wfsquery');

const {
    changeDrawingStatus,
    endDrawing
} = require('../actions/draw');

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
        maxHeight: state.map && state.map.present && state.map.present.size && state.map.present.size.height
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
            onExpandSpatialFilterPanel: expandSpatialFilterPanel,
            onSelectSpatialMethod: selectSpatialMethod,
            onSelectViewportSpatialMethod: selectViewportSpatialMethod,
            onSelectSpatialOperation: selectSpatialOperation,
            onChangeDrawingStatus: changeDrawingStatus,
            onRemoveSpatialSelection: removeSpatialSelection,
            onShowSpatialSelectionDetails: showSpatialSelectionDetails,
            onEndDrawing: endDrawing,
            onChangeDwithinValue: changeDwithinValue,
            zoneFilter: zoneGetValues,
            zoneSearch,
            zoneChange
        }, dispatch),
        queryToolbarActions: bindActionCreators({
            onQuery: createQuery,
            onReset: reset,
            onChangeDrawingStatus: changeDrawingStatus
        }, dispatch)
    };
})(QueryBuilder);

const tocSelector = createSelector(
    [
        (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
        groupsSelector,
        (state) => state.layers && state.layers.settings || {expanded: false, options: {opacity: 1}},
        (state) => state.controls && state.controls.queryPanel && state.controls.queryPanel.enabled || false
    ], (enabled, groups, settings, querypanelEnabled) => ({
        enabled,
        groups,
        settings,
        querypanelEnabled
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
        settingsOptions: PropTypes.object
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
        updateNode: () => {},
        removeNode: () => {},
        activateLegendTool: true,
        activateZoomTool: true,
        activateSettingsTool: true,
        activateRemoveLayer: true,
        visibilityCheckType: "checkbox",
        settingsOptions: {},
        querypanelEnabled: false
    };

    getNoBackgroundLayers = (group) => {
        return group.name !== 'background';
    };

    renderSidebar = () => {
        return (
            <Sidebar
                open={this.props.querypanelEnabled}
                sidebar={this.renderQueryPanel()}
                styles={{
                    sidebar: {
                        backgroundColor: 'white',
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

    renderQueryPanel = () => {
        return (<div>
            <Button id="toc-query-close-button" bsStyle="primary" key="menu-button" className="square-button" onClick={() => this.props.onToggleQuery()}><Glyphicon glyph="arrow-left"/></Button>
            <SmartQueryForm
                spatialOperations={this.props.spatialOperations}
                spatialMethodOptions={this.props.spatialMethodOptions}
                featureTypeErrorText={<Message msgId="layerProperties.featureTypeError"/>}/>
        </div>);
    };

    render() {
        return this.renderSidebar();
    }
}

const QueryPanelPlugin = connect(tocSelector, {
    groupPropertiesChangeHandler: changeGroupProperties,
    layerPropertiesChangeHandler: changeLayerProperties,
    retrieveLayerData: getLayerCapabilities,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode),
    onToggleQuery: toggleControl.bind(null, 'queryPanel', null),
    onSort: LayersUtils.sortUsing(LayersUtils.sortLayers, sortNode),
    onSettings: showSettings,
    onZoomToExtent: zoomToExtent,
    hideSettings,
    updateSettings,
    updateNode,
    removeNode
})(QueryPanel);

module.exports = {
    QueryPanelPlugin,
    reducers: {
        queryform: require('../reducers/queryform'),
        query: require('../reducers/query')
    },
    epics: {featureTypeSelectedEpic, wfsQueryEpic, viewportSelectedEpic, ...autocompleteEpics}
};
