/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const Message = require('./locale/Message');

const {onShapeError, shapeLoading, onShapeChoosen, onSelectLayer, onLayerAdded, updateShapeBBox, onShapeSuccess} = require('../actions/shapefile');
const {zoomToExtent} = require('../actions/map');
const {addLayer} = require('../actions/layers');
const {toggleControl} = require('../actions/controls');

const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');

module.exports = {
    ImportPlugin: assign({loadPlugin: (resolve) => {
        require.ensure(['./import/Import'], () => {
            const Import = require('./import/Import');

            const ImportPlugin = connect((state) => (
                {
                    enabled: state.controls && state.controls.import && state.controls.import.enabled,
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
                onClose: toggleControl.bind(null, 'import', null)
                })(Import);

            resolve(ImportPlugin);
        });
    }, enabler: (state) => state.import && state.import.enabled || state.toolbar && state.toolbar.active === 'import'}, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'import',
            position: 4,
            text: <Message msgId="shapefile.title"/>,
            icon: <Glyphicon glyph="upload"/>,
            action: toggleControl.bind(null, 'import', null),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {
        shapefile: require('../reducers/shapefile'),
        style: require('../reducers/style')
    }
};
