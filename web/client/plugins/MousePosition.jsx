/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {mapSelector} = require('../selectors/map');
const {createSelector} = require('reselect');

const selector = createSelector([
    mapSelector || {},
    (state) => state.mousePosition || {}
], (map, mousePosition) => ({
    enabled: mousePosition.enabled,
    mousePosition: mousePosition.showCenter && map && map.center || mousePosition.position,
    crs: mousePosition.crs || map && map.projection || 'EPSG:3857'
}));

module.exports = {
    MousePositionPlugin: connect(selector)(require('../components/mapcontrols/mouseposition/MousePosition')),
    reducers: {mousePosition: require('../reducers/mousePosition')}
};
