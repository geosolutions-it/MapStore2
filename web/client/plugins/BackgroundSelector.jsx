/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {toggleControl, setControlProperty} = require('../actions/controls');
const {changeLayerProperties} = require('../actions/layers');

const BackgroundSelectorPlugin = connect((state) => ({
    layers: state.layers && state.layers.flat && state.layers.flat.filter((layer) => layer.group === "background") || [],
    drawerEnabled: state.controls && state.controls.drawer && state.controls.drawer.enabled || false,
    drawerWidth: state.controls && state.controls.drawer && state.controls.drawer.width || 0,
    enabled: state.controls && state.controls.backgroundSelector && state.controls.backgroundSelector.enabled || false,
    tempLayer: state.controls && state.controls.backgroundSelector && state.controls.backgroundSelector.tempLayer || {},
    currentLayer: state.controls && state.controls.backgroundSelector && state.controls.backgroundSelector.currentLayer || {},
    size: state.map && state.map.present && state.map.present.size || {width: 0, height: 0},
    start: state.controls && state.controls.backgroundSelector && state.controls.backgroundSelector.start || 0,
    isMobile: state.browser && state.browser.mobile || false
}), {
    onToggle: toggleControl.bind(null, 'backgroundSelector', null),
    propertiesChangeHandler: changeLayerProperties,
    setControlProperty
})(require('../components/background/BackgroundSelector'));

module.exports = {
    BackgroundSelectorPlugin,
    reducers: {}
};
