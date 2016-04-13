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

const {changeHelpwinVisibility, changeHelpText} = require('../../actions/help');
const {changeLocateState} = require('../../actions/locate');
const {changeMapInfoState} = require('../../actions/mapInfo');
const {changeMeasurementState} = require('../../actions/measurement');
const {toggleControl} = require('../../actions/controls');
const {changeLayerProperties, toggleNode, sortNode} = require('../../actions/layers');
const {onCreateSnapshot, changeSnapshotState, saveImage} = require('../../actions/snapshot');

const {mapSelector} = require('../../selectors/map');
const {layersSelector, groupsSelector} = require('../../selectors/layers');

const LayersUtils = require('../../utils/LayersUtils');

const Message = require('../../components/I18N/Message');

const {Glyphicon} = require('react-bootstrap');

const Home = connect(() => ({}), {
    changeHelpwinVisibility,
    changeHelpText
})(require('./Home'));

const Locate = connect((state) => ({
    locate: state.locate && state.locate.state || 'DISABLED'
}), {
    onClick: changeLocateState
})(require('./Locate'));

const Info = connect((state) => ({
    pressed: state.mapInfo && state.mapInfo.enabled
}), {
    onClick: changeMapInfoState
})(require('./Info'));

const tocSelector = createSelector(
    [groupsSelector], (groups) => ({
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
})(require('../../components/mapcontrols/measure/MeasureComponent'));

const Print = connect((state) => ({
    enabled: state.controls && state.controls.print && state.controls.print.enabled || false
}), {
    onToggle: toggleControl.bind(null, "print", null)
})(require('./Print'));

const PrintPanel = require('../Print');

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

const HelpToggleBtn = connect((state) => ({
    pressed: state.controls.help && state.controls.help.enabled
}), {
    changeHelpState: toggleControl.bind(null, 'help', null),
    changeHelpwinVisibility
})(require('../../components/help/HelpToggleBtn'));

const layersIcon = require('./assets/img/layers.png');
const lineRuleIcon = require('./assets/img/line-ruler.png');

module.exports = [{
    name: 'home',
    tool: Home,
    help: <Message msgId="helptexts.gohome"/>
}, {
    name: 'locate',
    tool: Locate,
    help: <Message msgId="helptexts.locateBtn"/>
}, {
    name: 'info',
    tool: Info,
    help: <Message msgId="helptexts.infoButton"/>
}, {
    name: 'toc',
    tool: TOC,
    help: <Message msgId="helptexts.layerSwitcher"/>,
    props: {
        isPanel: true,
        buttonContent: <img src={layersIcon}/>,
        buttonTooltip: <Message msgId="layers"/>,
        title: <Message msgId="layers"/>
    }
}, {
    name: 'backgroundswitcher',
    tool: BackgroundSwitcher,
    help: <Message msgId="helptexts.backgroundSwitcher"/>,
    props: {
        isPanel: true,
        icon: <Glyphicon glyph="globe"/>,
        title: <Message msgId="background"/>,
        buttonTooltip: <Message msgId="backgroundSwither.tooltip"/>
    }
}, {
    name: 'measurement',
    tool: MeasureComponent,
    help: <Message msgId="helptexts.measureComponent"/>,
    props: {
        icon: <img src={lineRuleIcon} />,
        isPanel: true,
        title: <Message msgId="measureComponent.title"/>,
        buttonTooltip: <Message msgId="measureComponent.tooltip"/>,
        lengthButtonText: <Message msgId="measureComponent.lengthButtonText"/>,
        areaButtonText: <Message msgId="measureComponent.areaButtonText"/>,
        resetButtonText: <Message msgId="measureComponent.resetButtonText"/>,
        lengthLabel: <Message msgId="measureComponent.lengthLabel"/>,
        areaLabel: <Message msgId="measureComponent.areaLabel"/>,
        bearingLabel: <Message msgId="measureComponent.bearingLabel"/>
    }
}, {
    name: 'print',
    tool: Print,
    help: <Message msgId="helptexts.print"/>,
    props: {
        isPanel: false,
        icon: <Glyphicon glyph="print"/>,
        buttonTooltip: <Message msgId="printbutton" />
    },
    panel: {
        name: "print_panel",
        panel: PrintPanel
    }
}, {
    name: 'snapshot',
    tool: SnapshotPanel,
    help: <Message msgId="helptexts.snapshot"/>,
    props: {
        title: <Message msgId="snapshot.title"/>,
        buttonTooltip: <Message msgId="snapshot.tooltip"/>,
        googleBingErrorMsg: <Message msgId="snapshot.googleBingError" />,
        saveBtnText: <Message msgId="snapshot.save" />,
        downloadingMsg: <Message msgId="snapshot.downloadingSnapshots" />,
        isPanel: true,
        icon: <Glyphicon glyph="camera"/>
    }
}, {
    name: 'settings',
    tool: Settings,
    help: <Message msgId="helptexts.settingsPanel"/>,
    props: {
        isPanel: true,
        buttonTooltip: <Message msgId="settings" />,
        icon: <Glyphicon glyph="cog"/>
    }
}, {
    name: 'help',
    tool: HelpToggleBtn
}];
