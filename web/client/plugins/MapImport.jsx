/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');

const Message = require('./locale/Message');

const { onError, setLoading, setLayers, onSelectLayer, onLayerAdded, onLayerSkipped, updateBBox, onSuccess} = require('../actions/mapimport');
const {zoomToExtent} = require('../actions/map');
const {addLayer} = require('../actions/layers');
const {loadAnnotations} = require('../actions/annotations');
const {annotationsLayerSelector} = require('../selectors/annotations');
const {toggleControl} = require('../actions/controls');

const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const {mapTypeSelector} = require('../selectors/maptype');
/**
 * Allows the user to import a file into current map.
 * Supported formats are:
 * - **Maps** (current map will be overridden):
 *     - MapStore JSON format
 *     - WMC
 * - **Vector Data**:
 *     - shapefiles (must be contained in zip archives)
 *     - KML/KMZ
 *     - GeoJSON
 *     - GPX
 * @memberof plugins
 * @name MapImport
 */
module.exports = {
    MapImportPlugin: assign({loadPlugin: (resolve) => {
        require.ensure(['./import/Import'], () => {
            const Import = require('./import/Import');

            const ImportPlugin = connect((state) => (
                {
                    enabled: state.controls && state.controls.mapimport && state.controls.mapimport.enabled,
                    layers: state.mapimport && state.mapimport.layers || null,
                    selected: state.mapimport && state.mapimport.selected || null,
                    bbox: state.mapimport && state.mapimport.bbox || null,
                    success: state.mapimport && state.mapimport.success || null,
                    errors: state.mapimport && state.mapimport.errors || null,
                    shapeStyle: state.style || {},
                    mapType: mapTypeSelector(state),
                    annotationsLayer: annotationsLayerSelector(state)
                }
            ), {
                setLayers,
                onLayerAdded,
                onLayerSkipped,
                onSelectLayer,
                onError,
                onSuccess,
                addLayer,
                loadAnnotations,
                onZoomSelected: zoomToExtent,
                updateBBox,
                setLoading,
                onClose: toggleControl.bind(null, 'mapimport', null)
            })(Import);

            resolve(ImportPlugin);
        });
    }, enabler: (state) => state.mapimport && state.mapimport.enabled || state.toolbar && state.toolbar.active === 'import'}, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        BurgerMenu: {
            name: 'import',
            position: 4,
            text: <Message msgId="mapImport.title"/>,
            icon: <Glyphicon glyph="upload"/>,
            action: toggleControl.bind(null, 'mapimport', null),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {
        mapimport: require('../reducers/mapimport'),
        style: require('../reducers/style')
    }
};
