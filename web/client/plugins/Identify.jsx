/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const {mapSelector} = require('../selectors/map');
const {layersSelector} = require('../selectors/layers');

const {getFeatureInfo, purgeMapInfoResults, showMapinfoMarker, hideMapinfoMarker} = require('../actions/mapInfo');
const {changeMousePointer} = require('../actions/map');

const selector = createSelector([
    (state) => (state.mapInfo && state.mapInfo.enabled) || (state.controls && state.controls.info && state.controls.info.enabled) || false,
    (state) => state.mapInfo && state.mapInfo.responses || [],
    (state) => state.mapInfo && state.mapInfo.requests || {length: 0},
    (state) => state.mapInfo && state.mapInfo.infoFormat,
    mapSelector,
    layersSelector,
    (state) => state.mapInfo && state.mapInfo.clickPoint

], (enabled, responses, requests, format, map, layers, point) => ({
    enabled, responses, requests, format, map, layers, point
}));

module.exports = {
    IdentifyPlugin: connect(selector, {
        sendRequest: getFeatureInfo,
        purgeResults: purgeMapInfoResults,
        changeMousePointer,
        showMarker: showMapinfoMarker,
        hideMarker: hideMapinfoMarker
    })(require('../components/data/identify/Identify')),
    reducers: {mapInfo: require('../reducers/mapInfo')}
};
