/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const {changeLocateState} = require('../../actions/locate');
const {changeMeasurementState} = require('../../actions/measurement');
const {changeLayerProperties, toggleNode, sortNode} = require('../../actions/layers');
const {onCreateSnapshot, changeSnapshotState, saveImage} = require('../../actions/snapshot');
const {goToPage} = require('../../actions/router');
const {mapSelector} = require('../../selectors/map');
const {layersSelector, groupsSelector} = require('../../selectors/layers');

const LayersUtils = require('../../utils/LayersUtils');

const Message = require('../Message');

const {Glyphicon} = require('react-bootstrap');

const Locate = connect((state) => ({
    locate: state.locate && state.locate.state || 'DISABLED'
}), {
    onClick: changeLocateState
})(require('../../components/mapcontrols/locate/LocateBtn'));

const tocSelector = createSelector(
    [
        (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
        groupsSelector
    ], (enabled, groups) => ({
        enabled,
        groups
    })
);

const TOC = connect(tocSelector, {
    propertiesChangeHandler: changeLayerProperties,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode),
    onSort: LayersUtils.sortUsing(LayersUtils.sortLayers, sortNode)
})(require('./LayerTree'));

const BackgroundSwitcher = connect((state) => ({
    layers: state.layers && state.layers.flat && state.layers.flat.filter((layer) => layer.group === "background") || []
}), {
    propertiesChangeHandler: changeLayerProperties
})(require('../../components/TOC/background/BackgroundSwitcher'));

const MeasureComponent = connect((state) => {
    return {
        measurement: state.measurement || {},
        lineMeasureEnabled: state.measurement && state.measurement.lineMeasureEnabled || false,
        areaMeasureEnabled: state.measurement && state.measurement.areaMeasureEnabled || false,
        bearingMeasureEnabled: state.measurement && state.measurement.bearingMeasureEnabled || false
    };
}, {
    toggleMeasure: changeMeasurementState
})(require('./MeasureComponent'));

const {PrintPlugin} = require('../Print');

const snapshotSelector = createSelector([
    mapSelector,
    layersSelector,
    (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === "snapshot",
    (state) => state.browser,
    (state) => state.snapshot || {queue: []}
], (map, layers, active, browser, snapshot) => ({
    map,
    layers,
    active,
    browser,
    snapshot
}));

const SnapshotPanel = connect(snapshotSelector, {
    onCreateSnapshot: onCreateSnapshot,
    onStatusChange: changeSnapshotState,
    downloadImg: saveImage
})(require("../../components/mapcontrols/Snapshot/SnapshotPanel"));

const Settings = require('./Settings');

const HelpTextPanel = connect((state) => ({
    isVisible: state.controls.help && state.controls.help.enabled || false,
    helpText: state.help && state.help.helpText
}))(require('../../components/help/HelpTextPanel'));

const layersIcon = require('./assets/img/layers.png');
const lineRuleIcon = require('./assets/img/line-ruler.png');

module.exports = (context) => ([{
    name: 'home',
    tooltip: "gohome",
    icon: <Glyphicon glyph="home"/>,
    help: <Message msgId="helptexts.gohome"/>,
    action: goToPage.bind(null, '/', context.router)
}, {
    name: 'locate',
    tool: Locate,
    tooltip: "locate.tooltip",
    icon: <Glyphicon glyph="screenshot"/>,
    help: <Message msgId="helptexts.locateBtn"/>
}, {
    name: 'info',
    tooltip: "info.tooltip",
    icon: <Glyphicon glyph="info-sign"/>,
    help: <Message msgId="helptexts.infoButton"/>,
    toggle: true
}, {
    name: 'toc',
    exclusive: true,
    panel: TOC,
    help: <Message msgId="helptexts.layerSwitcher"/>,
    tooltip: "layers",
    wrap: true,
    title: 'layers',
    icon: <img src={layersIcon}/>
}, {
    name: 'backgroundswitcher',
    exclusive: true,
    panel: BackgroundSwitcher,
    help: <Message msgId="helptexts.backgroundSwitcher"/>,
    tooltip: "backgroundSwither.tooltip",
    icon: <Glyphicon glyph="globe"/>,
    wrap: true,
    title: 'background'
}, {
    name: 'measurement',
    panel: MeasureComponent,
    exclusive: true,
    wrap: true,
    help: <Message msgId="helptexts.measureComponent"/>,
    tooltip: "measureComponent.tooltip",
    icon: <img src={lineRuleIcon} />,
    title: "measureComponent.title"
}, {
    name: 'print',
    help: <Message msgId="helptexts.print"/>,
    tooltip: "printbutton",
    icon: <Glyphicon glyph="print"/>,
    exclusive: true,
    panel: PrintPlugin
}, {
    name: 'snapshot',
    panel: SnapshotPanel,
    help: <Message msgId="helptexts.snapshot"/>,
    tooltip: "snapshot.tooltip",
    icon: <Glyphicon glyph="camera"/>,
    wrap: true,
    title: "snapshot.title",
    exclusive: true
}, {
    name: 'settings',
    tooltip: "settings",
    help: <Message msgId="helptexts.settingsPanel"/>,
    icon: <Glyphicon glyph="cog"/>,
    panel: Settings,
    wrap: true,
    exclusive: true
}, {
    name: 'help',
    icon: <Glyphicon glyph="question-sign"/>,
    tooltip: "help",
    toggle: true,
    panel: HelpTextPanel
}]);
