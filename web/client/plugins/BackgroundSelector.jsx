/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {toggleControl} = require('../actions/controls');
const {changeLayerProperties} = require('../actions/layers');
const {setLayerBackground, setStartBackground} = require('../actions/background');

const {createSelector} = require('reselect');
const {layersSelector} = require('../selectors/layers');
const {backgroundSelSelector} = require('../selectors/background');
const mapSelector = (state) => (state.map && state.map.present) || {};
const isMobileSelector = (state) => (state.browser && state.browser.mobile) || false;
const drawerControlsSelector = (state) => (state.controls && state.controls.drawer && state.controls.drawer) || {};
const backgroundControlsSelector = (state) => (state.controls && state.controls.backgroundSelector && state.controls.backgroundSelector && state.controls.backgroundSelector.enabled) || false;

const backgroundSelector = createSelector([mapSelector, layersSelector, backgroundSelSelector, isMobileSelector, drawerControlsSelector, backgroundControlsSelector],
    (map, layers, background, isMobile, drawerControls, enabled) => ({
        size: map.size || {width: 0, height: 0},
        layers: layers.filter((layer) => layer.group === "background") || [],
        tempLayer: background.tempLayer || {},
        currentLayer: background.currentLayer || {},
        start: background.start || 0,
        isMobile,
        drawerEnabled: drawerControls.enabled || false,
        drawerWidth: drawerControls.width || 0,
        enabled
    }));

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

const BackgroundSelectorPlugin = connect(backgroundSelector, {
    onToggle: toggleControl.bind(null, 'backgroundSelector', null),
    propertiesChangeHandler: changeLayerProperties,
    setLayer: setLayerBackground,
    setStart: setStartBackground
})(require('../components/background/BackgroundSelector'));

module.exports = {
    BackgroundSelectorPlugin,
    reducers: {
         background: require('../reducers/background')
    }
};
