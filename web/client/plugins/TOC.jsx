/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {Button, Glyphicon} = require('react-bootstrap');

const {changeLayerProperties, changeGroupProperties, toggleNode, contextNode,
       sortNode, showSettings, hideSettings, updateSettings, updateNode, removeNode} = require('../actions/layers');
const {getLayerCapabilities} = require('../actions/layerCapabilities');
const {zoomToExtent} = require('../actions/map');
const {groupsSelector} = require('../selectors/layers');
const {mapSelector} = require('../selectors/map');

const LayersUtils = require('../utils/LayersUtils');
const mapUtils = require('../utils/MapUtils');

const Message = require('./locale/Message');
const assign = require('object-assign');

const layersIcon = require('./toolbar/assets/img/layers.png');

// include application component
const QueryBuilder = require('../components/data/query/QueryBuilder');

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
    zoneChange
} = require('../actions/queryform');

const {createQuery, toggleQueryPanel} = require('../actions/wfsquery');

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
        (state) => state.controls && state.controls.queryPanel && state.controls.queryPanel.enabled || false,
        mapSelector
    ], (enabled, groups, settings, querypanelEnabled, map) => ({
        enabled,
        groups,
        settings,
        querypanelEnabled,
        currentZoomLvl: map && map.zoom,
        scales: mapUtils.getScales(
            map && map.projection || 'EPSG:3857',
            map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
        )
    })
);

const TOC = require('../components/TOC/TOC');
const DefaultGroup = require('../components/TOC/DefaultGroup');
const DefaultLayer = require('../components/TOC/DefaultLayer');
const DefaultLayerOrGroup = require('../components/TOC/DefaultLayerOrGroup');

const LayerTree = React.createClass({
    propTypes: {
        id: React.PropTypes.number,
        buttonContent: React.PropTypes.node,
        groups: React.PropTypes.array,
        settings: React.PropTypes.object,
        querypanelEnabled: React.PropTypes.bool,
        groupStyle: React.PropTypes.object,
        groupPropertiesChangeHandler: React.PropTypes.func,
        layerPropertiesChangeHandler: React.PropTypes.func,
        onToggleGroup: React.PropTypes.func,
        onToggleLayer: React.PropTypes.func,
        onContextMenu: React.PropTypes.func,
        onToggleQuery: React.PropTypes.func,
        onZoomToExtent: React.PropTypes.func,
        retrieveLayerData: React.PropTypes.func,
        onSort: React.PropTypes.func,
        onSettings: React.PropTypes.func,
        hideSettings: React.PropTypes.func,
        updateSettings: React.PropTypes.func,
        updateNode: React.PropTypes.func,
        removeNode: React.PropTypes.func,
        activateRemoveLayer: React.PropTypes.bool,
        activateLegendTool: React.PropTypes.bool,
        activateZoomTool: React.PropTypes.bool,
        activateQueryTool: React.PropTypes.bool,
        activateSettingsTool: React.PropTypes.bool,
        visibilityCheckType: React.PropTypes.string,
        settingsOptions: React.PropTypes.object,
        chartStyle: React.PropTypes.object,
        currentZoomLvl: React.PropTypes.number,
        scales: React.PropTypes.array,
        layerOptions: React.PropTypes.object,
        groupOptions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            groupPropertiesChangeHandler: () => {},
            layerPropertiesChangeHandler: () => {},
            retrieveLayerData: () => {},
            onToggleGroup: () => {},
            onToggleLayer: () => {},
            onContextMenu: () => {},
            onToggleQuery: () => {},
            onZoomToExtent: () => {},
            onSettings: () => {},
            updateNode: () => {},
            removeNode: () => {},
            activateLegendTool: true,
            activateZoomTool: true,
            activateSettingsTool: true,
            activateRemoveLayer: true,
            activateQueryTool: false,
            visibilityCheckType: "glyph",
            settingsOptions: {
                includeCloseButton: false,
                closeGlyph: "1-close",
                buttonSize: "small"
            },
            querypanelEnabled: false,
            layerOptions: {},
            groupOptions: {}
        };
    },
    getNoBackgroundLayers(group) {
        return group.name !== 'background';
    },
    renderTOC() {
        const Group = (<DefaultGroup onSort={this.props.onSort}
                                  {...this.props.groupOptions}
                                  propertiesChangeHandler={this.props.groupPropertiesChangeHandler}
                                  onToggle={this.props.onToggleGroup}
                                  style={this.props.groupStyle}
                                  groupVisibilityCheckbox={true}
                                  visibilityCheckType={this.props.visibilityCheckType}
                                  />);
        const Layer = (<DefaultLayer
                            {...this.props.layerOptions}
                            settingsOptions={this.props.settingsOptions}
                            onToggle={this.props.onToggleLayer}
                            onContextMenu={this.props.onContextMenu}
                            onToggleQuerypanel={this.props.onToggleQuery }
                            onZoom={this.props.onZoomToExtent}
                            onSettings={this.props.onSettings}
                            propertiesChangeHandler={this.props.layerPropertiesChangeHandler}
                            hideSettings={this.props.hideSettings}
                            settings={this.props.settings}
                            updateSettings={this.props.updateSettings}
                            updateNode={this.props.updateNode}
                            removeNode={this.props.removeNode}
                            visibilityCheckType={this.props.visibilityCheckType}
                            activateRemoveLayer={this.props.activateRemoveLayer}
                            activateLegendTool={this.props.activateLegendTool}
                            activateZoomTool={this.props.activateZoomTool}
                            activateQueryTool={this.props.activateQueryTool}
                            activateSettingsTool={this.props.activateSettingsTool}
                            retrieveLayerData={this.props.retrieveLayerData}
                            chartStyle={this.props.chartStyle}
                            settingsText={<Message msgId="layerProperties.windowTitle"/>}
                            opacityText={<Message msgId="opacity"/>}
                            elevationText={<Message msgId="elevation"/>}
                            saveText={<Message msgId="save"/>}
                            closeText={<Message msgId="close"/>}
                            groups={this.props.groups}
                            currentZoomLvl={this.props.currentZoomLvl}
                            scales={this.props.scales}/>);
        return (
            <div>
                <TOC onSort={this.props.onSort} filter={this.getNoBackgroundLayers}
                    nodes={this.props.groups}>
                    <DefaultLayerOrGroup groupElement={Group} layerElement={Layer}/>
                </TOC>
            </div>
        );
    },
    renderQueryPanel() {
        return (
            <div id="toc-query-container">
                <Button id="toc-query-close-button" bsStyle="primary" key="menu-button" className="square-button" onClick={this.props.onToggleQuery.bind(this, null, null)}><Glyphicon glyph="arrow-left"/></Button>
                <SmartQueryForm
                    featureTypeErrorText={<Message msgId="layerProperties.featureTypeError"/>}/>
            </div>
        );
    },
    render() {
        if (!this.props.groups) {
            return <div></div>;
        }
        if (this.props.querypanelEnabled) {
            return this.renderQueryPanel();
        }
        return this.renderTOC();
    }
});
/**
 * TOC plugins
 * @name TOC
 * @class
 * @memberof plugins
 * @prop {boolean} cfg.activateQueryTool
 * @prop {object} cfg.layerOptions: options to pass to the layer.
 * Some of the layerOptions are: `legendContainerStyle`, `legendStyle`. These 2 allow to customize the legend:
 * For instance you can pass some stying props to the legend.
 * this example is to make the legend scrollable horizontally
 * ```
 * "layerOptions": {
 *  "legendOptions": {
 *    "legendContainerStyle": {
 *     "overflowX": "auto"
 *    },
 *    "legendStyle": {
 *      "maxWidth": "250%"
 *    }
 *   }
 *  }
```
 */
const TOCPlugin = connect(tocSelector, {
    groupPropertiesChangeHandler: changeGroupProperties,
    layerPropertiesChangeHandler: changeLayerProperties,
    retrieveLayerData: getLayerCapabilities,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode),
    onContextMenu: contextNode,
    onToggleQuery: toggleQueryPanel,
    onSort: LayersUtils.sortUsing(LayersUtils.sortLayers, sortNode),
    onSettings: showSettings,
    onZoomToExtent: zoomToExtent,
    hideSettings,
    updateSettings,
    updateNode,
    removeNode
})(LayerTree);

module.exports = {
    TOCPlugin: assign(TOCPlugin, {
        Toolbar: {
            name: 'toc',
            position: 7,
            exclusive: true,
            panel: true,
            help: <Message msgId="helptexts.layerSwitcher"/>,
            tooltip: "layers",
            wrap: true,
            title: 'layers',
            icon: <Glyphicon glyph="1-layer"/>,
            priority: 1
        },
        DrawerMenu: {
            name: 'toc',
            position: 1,
            glyph: "1-layer",
            icon: <img src={layersIcon}/>,
            title: 'layers',
            buttonConfig: {
                buttonClassName: "square-button no-border",
                tooltip: "toc.layers"
            },
            priority: 2
        }
    }),
    reducers: {
        queryform: require('../reducers/queryform'),
        query: require('../reducers/query')
    }
};
