/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
 /**
 * Plugin for Zoom out
 */
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {mapSelector} = require('../selectors/map');

const selector = createSelector([mapSelector], (map) => ({currentZoom: map && map.zoom, id: "zoomin-btn"}));

const {changeZoomLevel} = require('../actions/map');

const ZoomOutButton = connect(selector, {
    onZoom: changeZoomLevel
})(require('../components/buttons/ZoomButton'));

const assign = require('object-assign');

module.exports = {
    ZoomOutPlugin: assign(ZoomOutButton, {
        Toolbar: {
            name: "ZoomOut",
            position: 2,
            tool: true,
            tooltip: "zoombuttons.zoomOutTooltip",
            hide: true
        }
    }),
    reducers: {zoomOut: require("../reducers/map")}
};
