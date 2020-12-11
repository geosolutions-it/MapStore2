import './zoom/zoom.css';

import assign from 'object-assign';
/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { changeZoomLevel } from '../actions/map';
import ZoomButton from '../components/buttons/ZoomButton';
import Message from '../components/I18N/Message';
import { mapSelector, minZoomSelector } from '../selectors/map';

// TODO: make step and glyphicon configurable
const selector = createSelector([mapSelector, minZoomSelector], (map, minZoom) => ({ currentZoom: map && map.zoom, id: "zoomout-btn", step: -1, glyphicon: "minus", minZoom}));

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
const ZoomOutButton = connect(
    selector,
    {onZoom: changeZoomLevel},
    (stateProps, dispatchProps, ownProps) => ({
        ...stateProps,
        ...dispatchProps,
        ...ownProps
    }))(ZoomButton);


export default {
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
