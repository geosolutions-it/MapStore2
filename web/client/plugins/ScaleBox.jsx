/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('../utils/PluginsUtils');
const {createSelector} = require('reselect');

const {mapSelector, minZoomSelector} = require('../selectors/map');
const {changeZoomLevel} = require('../actions/map');

const HelpWrapper = require('./help/HelpWrapper');
const Message = require('./locale/Message');
const ScaleBox = require("../components/mapcontrols/scale/ScaleBox");

const mapUtils = require('../utils/MapUtils');
const assign = require('object-assign');

const selector = createSelector([mapSelector, minZoomSelector], (map, minZoom) => ({
    minZoom,
    currentZoomLvl: map && map.zoom,
    scales: mapUtils.getScales(
        map && map.projection || 'EPSG:3857',
        map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
    )
}));

require('./scalebox/scalebox.css');

class ScaleBoxTool extends React.Component {
    render() {
        return (<HelpWrapper id="mapstore-scalebox-container"
            key="scalebox-help"
            helpText={<Message msgId="helptexts.scaleBox"/>}>
            <ScaleBox key="scaleBox" label={<Message msgId="mapScale"/>} {...this.props}/>
        </HelpWrapper>);
    }
}

/**
  * ScaleBox Plugin. Provides a selector for the scale of the map.
  * @class  ScaleBox
  * @memberof plugins
  * @static
  *
  * @prop {object} cfg.style CSS to apply to the scalebox
  * @prop {Boolean} cfg.readOnly the selector is readonly
  * @prop {string} cfg.label label for the selector
  * @prop {Boolean} cfg.useRawInput set true if you want to use an normal html input object
  *
  */
const ScaleBoxPlugin = connect(selector, {
    onChange: changeZoomLevel
})(ScaleBoxTool);
module.exports = {
    ScaleBoxPlugin: assign(ScaleBoxPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}"
    }, {
        MapFooter: {
            name: 'scale',
            position: 1,
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
