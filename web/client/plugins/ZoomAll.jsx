/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './zoomall/zoomall.css';

import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { changeMapView } from '../actions/map';
import ZoomToMaxExtentButtonComp from '../components/buttons/ZoomToMaxExtentButton';
import Message from '../components/I18N/Message';
import { mapSelector } from '../selectors/map';

const selector = createSelector([mapSelector, state => state.mapInitialConfig], (map, mapInitialConfig) => ({mapConfig: map, mapInitialConfig: mapInitialConfig}));

const ZoomToMaxExtentButton = connect(selector, {
    changeMapView
})(ZoomToMaxExtentButtonComp);


class ZoomAllPlugin extends React.Component {
    render() {
        return (
            <ZoomToMaxExtentButton
                key="zoomToMaxExtent" {...this.props} useInitialExtent/>);
    }
}

/**
 * Button to zoom to map max Extent.
 * @name ZoomAll
 * @class
 * @memberof plugins
 */
export default {
    ZoomAllPlugin: Object.assign(ZoomAllPlugin, {
        Toolbar: {
            name: "ZoomAll",
            position: 7,
            tooltip: "zoombuttons.zoomAllTooltip",
            icon: <Glyphicon glyph="resize-full"/>,
            help: <Message msgId="helptexts.zoomToMaxExtentButton"/>,
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
