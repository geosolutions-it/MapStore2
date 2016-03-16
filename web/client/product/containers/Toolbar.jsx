/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const MapToolBar = require("../components/viewer/MapToolBar");

const Home = require('../components/viewer/Home');
const Settings = require('./toolbar/Settings');

const {Glyphicon} = require('react-bootstrap');

const {changeHelpwinVisibility, changeHelpText} = require('../../actions/help');
const {toggleControl} = require('../actions/controls');
const {changeLocateState} = require('../../actions/locate');
const {changeMapInfoState} = require('../../actions/mapInfo');
const {changeLayerProperties, toggleNode, sortNode} = require('../../actions/layers');
const {changeMeasurementState} = require('../../actions/measurement');

const Message = require('../../components/I18N/Message');

const LayersUtils = require('../../utils/LayersUtils');

const HelpToggleBtn = connect((state) => ({
    pressed: state.controls.help.enabled
}), {
    changeHelpState: toggleControl.bind(null, 'help'),
    changeHelpwinVisibility
})(require('../../components/help/HelpToggleBtn'));

const LocateBtn = connect((state) => ({
    locate: state.locate && state.locate.state || 'DISABLED'
}), {
    onClick: changeLocateState
})(require('../../components/mapcontrols/locate/LocateBtn'));

const Info = connect((state) => ({
    pressed: state.mapInfo && state.mapInfo.enabled
}), {
    onClick: changeMapInfoState
})(require('../../components/buttons/ToggleButton'));

const layersIcon = require('../assets/img/layers.png');
const lineRuleIcon = require('../assets/img/line-ruler.png');

const LayerTree = connect((state) => ({
    groups: state.layers && state.layers.groups && LayersUtils.denormalizeGroups(state.layers.flat, state.layers.groups).groups || []
}), {
    propertiesChangeHandler: changeLayerProperties,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode),
    onSort: LayersUtils.sortUsing(LayersUtils.sortLayers, sortNode)
})(require('../components/viewer/LayerTree'));

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

const LocateHelp = connect((state) => ({
    isVisible: state.controls.help.enabled
}), {
    changeHelpText,
    changeHelpwinVisibility
})(require('../../components/help/HelpBadge'));

const InfoHelp = connect((state) => ({
    isVisible: state.controls.help.enabled
}), {
    changeHelpText,
    changeHelpwinVisibility
})(require('../../components/help/HelpBadge'));

const {onCreateSnapshot, changeSnapshotState, saveImage} = require('../../actions/snapshot');

const SnapshotPanel = connect((state) => ({
    map: state.map && state.map.present,
    active: state.controls.toolbar.active === "snapshotPanel",
    layers: state.layers && state.layers.flat || [],
    browser: state.browser,
    snapshot: state.snapshot || {queue: []}
}), {
    onCreateSnapshot: onCreateSnapshot,
    onStatusChange: changeSnapshotState,
    downloadImg: saveImage
})(require("../../components/mapcontrols/Snapshot/SnapshotPanel"));

const Toolbar = React.createClass({
    render() {
        return (
            <MapToolBar key="mapToolbar">
                <Home key="home"
                    buttonTooltip={<Message msgId="gohome" />}
                    helpText={<Message msgId="helptexts.gohome"/>}
                    />
                <LocateBtn
                        text={<LocateHelp
                            className="mapstore-tb-helpbadge"
                            helpText={<Message msgId="helptexts.locateBtn"/>}/>}
                        key="locate"
                        tooltip={<Message msgId="locate.tooltip"/>}/>
                <Info
                    text={<InfoHelp
                        className="mapstore-tb-helpbadge"
                        helpText={<Message msgId="helptexts.infoButton"/>}
                        />}
                    key="infoButton"
                    isButton={true}
                    glyphicon="info-sign"
                    helpText={<Message msgId="helptexts.infoButton"/>}/>
                <LayerTree
                    key="layerSwitcher"
                    isPanel={true}
                    buttonTooltip={<Message msgId="layers"/>}
                    title={<Message msgId="layers"/>}
                    helpText={<Message msgId="helptexts.layerSwitcher"/>}
                    icon={<img src={layersIcon}/>}
                    />
                <BackgroundSwitcher
                    key="backgroundSwitcher"
                    isPanel={true}
                    title={<div><Message msgId="background"/></div>}
                    helpText={<Message msgId="helptexts.backgroundSwitcher"/>}
                    buttonTooltip={<Message msgId="backgroundSwither.tooltip"/>}
                    icon={<Glyphicon glyph="globe"/>}
                />
                <MeasureComponent
                    key="measureComponent"
                    icon={<img src={lineRuleIcon} />}
                    isPanel={true}
                    title={<div><Message msgId="measureComponent.title"/></div>}
                    buttonTooltip={<Message msgId="measureComponent.tooltip"/>}
                    helpText={<Message msgId="helptexts.measureComponent"/>}
                    lengthButtonText={<Message msgId="measureComponent.lengthButtonText"/>}
                    areaButtonText={<Message msgId="measureComponent.areaButtonText"/>}
                    resetButtonText={<Message msgId="measureComponent.resetButtonText"/>}
                    lengthLabel={<Message msgId="measureComponent.lengthLabel"/>}
                    areaLabel={<Message msgId="measureComponent.areaLabel"/>}
                    bearingLabel={<Message msgId="measureComponent.bearingLabel"/>}
                />
                <SnapshotPanel
                    title={<div><Message msgId="snapshot.title"/></div>}
                    buttonTooltip={<Message msgId="snapshot.tooltip"/>}
                    googleBingErrorMsg={<Message msgId="snapshot.googleBingError" />}
                    saveBtnText={<Message msgId="snapshot.save" />}
                    downloadingMsg={<Message msgId="snapshot.downloadingSnapshots" />}
                    helpText={<Message msgId="helptexts.snapshot"/>}
                    isPanel={true}
                    key="snapshotPanel"
                    icon={<Glyphicon glyph="camera"/>}
                    />
                <Settings key="settingsPanel"
                    isPanel={true}
                    buttonTooltip={<Message msgId="settings" />}
                    helpText={<Message msgId="helptexts.settingsPanel"/>}
                    icon={<Glyphicon glyph="cog"/>}
                    />
                <HelpToggleBtn key="help"/>
            </MapToolBar>
        );
    }

});

module.exports = Toolbar;
