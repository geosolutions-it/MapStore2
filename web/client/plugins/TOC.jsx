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
const {createSelector} = require('reselect');
const {Button, Glyphicon} = require('react-bootstrap');

const {changeLayerProperties, changeGroupProperties, toggleNode, contextNode,
       sortNode, showSettings, hideSettings, updateSettings, updateNode, removeNode, browseData} = require('../actions/layers');
const {getLayerCapabilities} = require('../actions/layerCapabilities');
const {zoomToExtent} = require('../actions/map');
const {groupsSelector, layersSelector} = require('../selectors/layers');
const {mapSelector} = require('../selectors/map');

const LayersUtils = require('../utils/LayersUtils');
const mapUtils = require('../utils/MapUtils');

const Message = require('./locale/Message');
const assign = require('object-assign');

const layersIcon = require('./toolbar/assets/img/layers.png');

const {isObject} = require('lodash');

const {toggleControl, setControlProperty} = require('../actions/controls');

const {refreshLayers} = require('../actions/layers');

const refreshSelector = createSelector([
    (state) => state.controls && state.controls.RefreshLayers || {},
    layersSelector,
    (state) => state.layers && state.layers.refreshing || [],
    (state) => state.layers && state.layers.refreshError || []
], (control, layers, refreshing, error) => ({
    show: control.enabled === true,
    options: control.options || {},
    layers: layers.filter((l) => l.type === 'wms' && l.group !== 'background'),
    refreshing,
    error
}));

const refreshLayerSelector = createSelector([
    (state) => state.controls && state.controls.RefreshLayers || {},
    (state) => state.layers && state.layers.refreshing || [],
    (state) => state.layers && state.layers.refreshError || []
], (control, layers, refreshing, error) => ({
    show: isObject(control.enabled) || false,
    options: control.options || {},
    layers: [control.enabled],
    refreshing,
    error
}));

const RefreshLayers = connect(refreshSelector, {
    onClose: toggleControl.bind(null, 'RefreshLayers', 'enabled'),
    onRefresh: refreshLayers,
    onUpdateOptions: setControlProperty.bind(null, 'RefreshLayers', 'options')
})(require('../components/TOC/fragments/RefreshLayers'));

const RefreshLayer = connect(refreshLayerSelector, {
    onClose: toggleControl.bind(null, 'RefreshLayers', 'enabled'),
    onRefresh: refreshLayers,
    onUpdateOptions: setControlProperty.bind(null, 'RefreshLayers', 'options')
})(require('../components/TOC/fragments/RefreshLayers'));

const tocSelector = createSelector(
    [
        (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
        groupsSelector,
        (state) => state.layers && state.layers.settings || {expanded: false, options: {opacity: 1}},
        mapSelector
    ], (enabled, groups, settings, map) => ({
        enabled,
        groups,
        settings,
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

class LayerTree extends React.Component {
    static propTypes = {
        id: PropTypes.number,
        buttonContent: PropTypes.node,
        groups: PropTypes.array,
        settings: PropTypes.object,
        refreshMapEnabled: PropTypes.bool,
        groupStyle: PropTypes.object,
        groupPropertiesChangeHandler: PropTypes.func,
        layerPropertiesChangeHandler: PropTypes.func,
        onToggleGroup: PropTypes.func,
        onToggleLayer: PropTypes.func,
        onContextMenu: PropTypes.func,
        onBrowseData: PropTypes.func,
        onZoomToExtent: PropTypes.func,
        retrieveLayerData: PropTypes.func,
        onSort: PropTypes.func,
        onSettings: PropTypes.func,
        onRefresh: PropTypes.func,
        onRefreshLayer: PropTypes.func,
        hideSettings: PropTypes.func,
        updateSettings: PropTypes.func,
        updateNode: PropTypes.func,
        removeNode: PropTypes.func,
        activateRemoveLayer: PropTypes.bool,
        activateLegendTool: PropTypes.bool,
        activateZoomTool: PropTypes.bool,
        activateQueryTool: PropTypes.bool,
        activateSettingsTool: PropTypes.bool,
        activateRefreshTool: PropTypes.bool,
        visibilityCheckType: PropTypes.string,
        settingsOptions: PropTypes.object,
        chartStyle: PropTypes.object,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array,
        layerOptions: PropTypes.object,
        spatialOperations: PropTypes.array,
        spatialMethodOptions: PropTypes.array,
        groupOptions: PropTypes.object
    };

    static defaultProps = {
        groupPropertiesChangeHandler: () => {},
        layerPropertiesChangeHandler: () => {},
        retrieveLayerData: () => {},
        onToggleGroup: () => {},
        onToggleLayer: () => {},
        onContextMenu: () => {},
        onToggleQuery: () => {},
        onZoomToExtent: () => {},
        onSettings: () => {},
        onRefresh: () => {},
        onRefreshLayer: () => {},
        updateNode: () => {},
        removeNode: () => {},
        activateLegendTool: true,
        activateZoomTool: true,
        activateSettingsTool: true,
        activateRemoveLayer: true,
        activateQueryTool: false,
        activateRefreshTool: false,
        visibilityCheckType: "glyph",
        settingsOptions: {
            includeCloseButton: false,
            closeGlyph: "1-close",
            buttonSize: "small"
        },
        refreshMapEnabled: false,
        layerOptions: {},
        groupOptions: {},
        spatialOperations: [
            {"id": "INTERSECTS", "name": "queryform.spatialfilter.operations.intersects"},
            {"id": "BBOX", "name": "queryform.spatialfilter.operations.bbox"},
            {"id": "CONTAINS", "name": "queryform.spatialfilter.operations.contains"},
            {"id": "WITHIN", "name": "queryform.spatialfilter.operations.within"}
        ],
        spatialMethodOptions: [
            {"id": "Viewport", "name": "queryform.spatialfilter.methods.viewport"},
            {"id": "BBOX", "name": "queryform.spatialfilter.methods.box"},
            {"id": "Circle", "name": "queryform.spatialfilter.methods.circle"},
            {"id": "Polygon", "name": "queryform.spatialfilter.methods.poly"}
        ]
    };

    getNoBackgroundLayers = (group) => {
        return group.name !== 'background';
    };

    renderRefreshMap = () => {
        return (
            <div>
                <Button onClick={this.props.onRefresh} bsSize="xsmall"><Glyphicon glyph="refresh"/></Button>
                <RefreshLayers/>
                <RefreshLayer/>
            </div>
        );
    };

    renderTOC = () => {
        const Group = (<DefaultGroup onSort={this.props.onSort}
                                  {...this.props.groupOptions}
                                  propertiesChangeHandler={this.props.groupPropertiesChangeHandler}
                                  onToggle={this.props.onToggleGroup}
                                  style={this.props.groupStyle}
                                  groupVisibilityCheckbox
                                  visibilityCheckType={this.props.visibilityCheckType}
                                  />);
        const Layer = (<DefaultLayer
                            {...this.props.layerOptions}
                            settingsOptions={this.props.settingsOptions}
                            onToggle={this.props.onToggleLayer}
                            onContextMenu={this.props.onContextMenu}
                            onBrowseData={this.props.onBrowseData}
                            onZoom={this.props.onZoomToExtent}
                            onSettings={this.props.onSettings}
                            onRefresh={this.props.onRefreshLayer}
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
                            activateRefreshTool={this.props.activateRefreshTool}
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
            <div className="mapstore-toc">
                {this.props.refreshMapEnabled ? this.renderRefreshMap() : null}
                <TOC onSort={this.props.onSort} filter={this.getNoBackgroundLayers}
                    nodes={this.props.groups}>
                    <DefaultLayerOrGroup groupElement={Group} layerElement={Layer}/>
                </TOC>
            </div>
        );
    };

    render() {
        if (!this.props.groups) {
            return <div />;
        }
        return this.renderTOC();
    }
}
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
    onBrowseData: browseData,
    onSort: LayersUtils.sortUsing(LayersUtils.sortLayers, sortNode),
    onSettings: showSettings,
    onRefresh: toggleControl.bind(null, 'RefreshLayers', 'enabled'),
    onRefreshLayer: setControlProperty.bind(null, 'RefreshLayers', 'enabled'),
    onZoomToExtent: zoomToExtent,
    hideSettings,
    updateSettings,
    updateNode,
    removeNode
})(LayerTree);

const {refresh} = require('../epics/layers');

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
    },
    epics: assign({}, {refresh})
};
