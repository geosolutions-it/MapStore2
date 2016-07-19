/**
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
const {layersSelector} = require('../selectors/layers');

const {getFeatureInfo, getVectorInfo, purgeMapInfoResults, showMapinfoMarker, hideMapinfoMarker, showMapinfoRevGeocode, hideMapinfoRevGeocode} = require('../actions/mapInfo');
const {changeMousePointer} = require('../actions/map');
const {changeMapInfoFormat} = require('../actions/mapInfo');

const Message = require('./locale/Message');

const {Glyphicon} = require('react-bootstrap');

const assign = require('object-assign');

require('./identify/identify.css');

const selector = createSelector([
    (state) => (state.mapInfo && state.mapInfo.enabled) || (state.controls && state.controls.info && state.controls.info.enabled) || false,
    (state) => state.mapInfo && state.mapInfo.responses || [],
    (state) => state.mapInfo && state.mapInfo.requests || [],
    (state) => state.mapInfo && state.mapInfo.infoFormat,
    mapSelector,
    layersSelector,
    (state) => state.mapInfo && state.mapInfo.clickPoint,
    (state) => state.mapInfo && state.mapInfo.showModalReverse,
    (state) => state.mapInfo && state.mapInfo.reverseGeocodeData

], (enabled, responses, requests, format, map, layers, point, showModalReverse, reverseGeocodeData) => ({
    enabled, responses, requests, format, map, layers, point, showModalReverse, reverseGeocodeData
}));
// result panel
const IdentifyPlugin = connect(selector, {
    sendRequest: getFeatureInfo,
    localRequest: getVectorInfo,
    purgeResults: purgeMapInfoResults,
    changeMousePointer,
    showMarker: showMapinfoMarker,
    hideMarker: hideMapinfoMarker,
    showRevGeocode: showMapinfoRevGeocode,
    hideRevGeocode: hideMapinfoRevGeocode
})(require('../components/data/identify/Identify'));
// configuration UI
const FeatureInfoFormatSelector = connect((state) => ({
    infoFormat: state.mapInfo && state.mapInfo.infoFormat
}), {
    onInfoFormatChange: changeMapInfoFormat
})(require("../components/misc/FeatureInfoFormatSelector"));

module.exports = {
    IdentifyPlugin: assign(IdentifyPlugin, {
        Toolbar: {
            name: 'info',
            position: 6,
            tooltip: "info.tooltip",
            icon: <Glyphicon glyph="info-sign"/>,
            help: <Message msgId="helptexts.infoButton"/>,
            toggle: true
        },
        Settings: {
            tool: <FeatureInfoFormatSelector
                key="featureinfoformat"
                inputProps={{
                    label: <Message msgId="infoFormatLbl" />
            }}/>,
            position: 3
        }
    }),
    reducers: {mapInfo: require('../reducers/mapInfo')}
};
