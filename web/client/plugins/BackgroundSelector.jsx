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

/**
  * BackgroundSelector Plugin.
  * @class BackgroundSelector
  * @memberof plugins
  * @static
  *
  * @prop {number} cfg.bottom plugin position from bottom of the map
  * @prop {object} cfg.desktop dimensions of buttons in desktop mode
  * @prop {object} cfg.mobile dimensions of buttons in mobile mode
  * @class
  * @example
  * {
  *   "name": "BackgroundSelector",
  *   "cfg": {
  *     "mobile": {
  *       "side": 65,
  *       "frame": 3,
  *       "margin": 5
  *     },
  *     "desktop": {
  *       "side": 78,
  *       "sidePreview": 104,
  *       "frame": 3,
  *       "margin": 5
  *     }
  *   }
  * }
  */

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
