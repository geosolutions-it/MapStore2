/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { connect } from '../utils/PluginsUtils';
import { createSelector } from 'reselect';
import { mapSelector, minZoomSelector } from '../selectors/map';
import { changeZoomLevel } from '../actions/map';
import HelpWrapper from './help/HelpWrapper';
import Message from './locale/Message';
import ScaleBox from '../components/mapcontrols/scale/ScaleBox';
import { getScales } from '../utils/MapUtils';

const selector = createSelector([mapSelector, minZoomSelector], (map, minZoom) => ({
    minZoom,
    currentZoomLvl: map && map.zoom,
    scales: getScales(
        map && map.projection || 'EPSG:3857',
        map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
    )
}));

import './scalebox/scalebox.css';

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

export default {
    ScaleBoxPlugin: Object.assign(ScaleBoxPlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}"
    }, {
        MapFooter: {
            name: 'scale',
            position: 1,
            target: 'right-footer',
            priority: 1
        }
    }),
    reducers: {}
};
