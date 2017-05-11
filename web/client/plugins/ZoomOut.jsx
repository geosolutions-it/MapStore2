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
const {mapSelector} = require('../selectors/map');
// TODO: make step and glyphicon configurable
const selector = createSelector([mapSelector], (map) => ({currentZoom: map && map.zoom, id: "zoomout-btn", step: -1, glyphicon: "minus"}));

const {changeZoomLevel} = require('../actions/map');

const Message = require('../components/I18N/Message');

/**
  * ZoomOut Plugin. Provides button to zoom out
  * @class  ZoomOut
  * @memberof plugins
  * @static
  *
  * @prop {object} cfg.style CSS to apply to the button
  * @prop {string} cfg.className the class name for the button
  *
  */
const ZoomOutButton = connect(selector, {
    onZoom: changeZoomLevel
})(require('../components/buttons/ZoomButton'));

require('./zoom/zoom.css');

const assign = require('object-assign');

module.exports = {
    ZoomOutPlugin: assign(ZoomOutButton, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        Toolbar: {
            name: "ZoomOut",
            position: 4,
            tooltip: "zoombuttons.zoomOutTooltip",
            help: <Message msgId="helptexts.zoomOut"/>,
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
