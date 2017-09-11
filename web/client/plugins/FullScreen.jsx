/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');

const {toggleFullscreen} = require('../actions/fullscreen');
const {toggleFullscreenEpic} = require('../epics/fullscreen');

const assign = require('object-assign');


const FullScreenButton = require('../components/buttons/FullScreenButton');

/**
  * FullScreen Plugin. A button that toggles to fullscreen mode
  * @class FullScreen
  * @memberof plugins
  * @static
  *
  * @prop {string} cfg.id identifier of the Plugin
  * @prop {boolean} cfg.options.querySelector query selector to get the element to zoom. By default .ms2 > div
  *
  */
const FullScreen = connect( ({controls = {}} = {}) => ({
    active: controls.fullscreen && controls.fullscreen.enabled
}), {
    onClick: (pressed, options) => toggleFullscreen(pressed, options.querySelector)
})(FullScreenButton);

// removed because it is not supported yet
// http://caniuse.com/#feat=fullscreen

module.exports = {
    FullScreenPlugin: assign(FullScreen, {
        disablePluginIf: "{state('browser') && state('browser').safari}",
        Toolbar: {
            name: 'fullscreen',
            position: 5,
            alwaysVisible: true,
            tool: true,
            priority: 1
        }
    }),
    reducers: {},
    epics: {
        toggleFullscreenEpic
    }
};
