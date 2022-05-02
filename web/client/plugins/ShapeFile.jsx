/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Promise } from 'es6-promise';
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';

import { toggleControl } from '../actions/controls';
import { addLayer } from '../actions/layers';
import { zoomToExtent } from '../actions/map';
import {
    onLayerAdded,
    onSelectLayer,
    onShapeChoosen,
    onShapeError,
    onShapeSuccess,
    shapeLoading,
    updateShapeBBox
} from '../actions/shapefile';
import { createPlugin } from '../utils/PluginsUtils';
import Message from './locale/Message';

const loader = () => new Promise((resolve) => {
    require.ensure(['./shapefile/ShapeFile'], () => {
        const ShapeFile = require('./shapefile/ShapeFile').default;

        const ShapeFilePlugin = connect((state) => (
            {
                visible: state.controls && state.controls.shapefile && state.controls.shapefile.enabled,
                layers: state.shapefile && state.shapefile.layers || null,
                selected: state.shapefile && state.shapefile.selected || null,
                bbox: state.shapefile && state.shapefile.bbox || null,
                success: state.shapefile && state.shapefile.success || null,
                error: state.shapefile && state.shapefile.error || null,
                shapeStyle: state.style || {}
            }
        ), {
            onShapeChoosen: onShapeChoosen,
            onLayerAdded: onLayerAdded,
            onSelectLayer: onSelectLayer,
            onShapeError: onShapeError,
            onShapeSuccess: onShapeSuccess,
            addShapeLayer: addLayer,
            onZoomSelected: zoomToExtent,
            updateShapeBBox: updateShapeBBox,
            shapeLoading: shapeLoading,
            toggleControl: toggleControl.bind(null, 'shapefile', null)
        })(ShapeFile);

        resolve(ShapeFilePlugin);
    });
});

export default createPlugin(
    'ShapeFile',
    {
        lazy: true,
        enabler: (state) => state.shapefile && state.shapefile.enabled || state.toolbar && state.toolbar.active === 'shapefile',
        loader,
        options: {
            disablePluginIf: "{state('mapType') === 'cesium'}"
        },
        containers: {
            Toolbar: {
                name: 'shapefile',
                position: 9,
                panel: true,
                help: <Message msgId="helptexts.shapefile" />,
                title: "shapefile.title",
                tooltip: "shapefile.tooltip",
                wrap: false,
                icon: <Glyphicon glyph="open-file" />,
                exclusive: true,
                priority: 1
            },
            BurgerMenu: {
                name: 'shapefile',
                position: 4,
                text: <Message msgId="shapefile.title" />,
                icon: <Glyphicon glyph="upload" />,
                action: toggleControl.bind(null, 'shapefile', null),
                priority: 3,
                doNotHide: true
            },
            SidebarMenu: {
                name: 'shapefile',
                position: 4,
                text: <Message msgId="shapefile.title" />,
                icon: <Glyphicon glyph="upload" />,
                action: toggleControl.bind(null, 'shapefile', null),
                toggle: true,
                priority: 2,
                doNotHide: true
            }
        },
        reducers: {
            shapefile: require('../reducers/shapefile').default,
            style: require('../reducers/style').default
        }
    }
);
