/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withProps, withHandlers} = require('recompose');
const {connect} = require('react-redux');
const {castArray, find} = require('lodash');
const { normalizeLayer } = require('../../../utils/LayersUtils');
const { onEditorChange } = require('../../../actions/widgets');

/**
 * Gets the editor's data and allow to do basic operations on layers
 */
module.exports = compose(
    withProps(({ editorData = {} }) => ({
        layers: editorData.map && editorData.map.layers
    })),
    connect(() => ({}), {
        setLayers: layers => onEditorChange('map.layers', layers)
    }),
    withHandlers({
        addLayer: ({ layers = [], setLayers = () => { }, catalog}) => layer => catalog.localizedLayerStyles ?
            setLayers([...layers, normalizeLayer({...layer, localizedLayerStyles: catalog.localizedLayerStyles})])
            : setLayers([...layers, normalizeLayer(layer)]),
        removeLayersById: ({ layers = [], setLayers = () => { } }) => (ids = []) => setLayers(layers.filter(l => !find(castArray(ids), id => id === l.id)))
    })
);
