/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');

module.exports = {
    MousePositionPlugin: connect((state) => ({
        enabled: state.mousePosition.enabled,
        mousePosition: state.mousePosition.position,
        crs: state.mousePosition.crs || state.map && state.map.present && state.map.present.projection || state.map && state.map.projection || 'EPSG:3857'
    }))(require('../components/mapcontrols/mouseposition/MousePosition')),
    reducers: {mousePosition: require('../reducers/mousePosition')}
};
