/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './zoom/zoom.css';

import assign from 'object-assign';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { changeZoomLevel } from '../actions/map';
import ZoomButtonComp from '../components/buttons/ZoomButton';
import Message from '../components/I18N/Message';
import { mapSelector } from '../selectors/map';

// TODO: make step and glyphicon configurable
const selector = createSelector([mapSelector], (map) => ({currentZoom: map && map.zoom, id: "zoomin-btn", step: 1, glyphicon: "plus"}));

/**
  * ZoomIn Plugin. Provides button to zoom in
  * @class  ZoomIn
  * @memberof plugins
  * @static
  *
  * @prop {object} cfg.style CSS to apply to the button
  * @prop {string} cfg.className the class name for the button
  *
  */
const ZoomInButton = connect(selector, {
    onZoom: changeZoomLevel
})(ZoomButtonComp);

export default {
    ZoomInPlugin: assign(ZoomInButton, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        Toolbar: {
            name: "ZoomIn",
            position: 3,
            tooltip: "zoombuttons.zoomInTooltip",
            help: <Message msgId="helptexts.zoomIn"/>,
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
