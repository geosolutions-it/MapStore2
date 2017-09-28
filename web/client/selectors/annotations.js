/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {createSelector} = require('reselect');
const {layersSelector} = require('./layers');
const {head} = require('lodash');

const annotationsLayerSelector = createSelector([
        layersSelector
    ], (layers) => head(layers.filter(l => l.id === 'annotations'))
);

const annotationsInfoSelector = (state) => ({
    config: state.annotations && state.annotations.config,
    editing: state.annotations && state.annotations.editing,
    drawing: state.annotations && !!state.annotations.drawing,
    styling: state.annotations && !!state.annotations.styling,
    errors: state.annotations.validationErrors
});

const annotationsSelector = (state) => ({
    ...(state.annotations || {})
});

const annotationsListSelector = createSelector([
    annotationsInfoSelector,
    annotationsSelector,
    annotationsLayerSelector
], (info, annotations, layer) => ({
    removing: annotations.removing,
    closing: !!annotations.closing,
    mode: annotations.editing && 'editing' || annotations.current && 'detail' || 'list',
    config: info.config,
    annotations: layer && layer.features || [],
    current: annotations.current || null,
    editing: info.editing,
    filter: annotations.filter || ''
}));

module.exports = {
    annotationsLayerSelector,
    annotationsInfoSelector,
    annotationsSelector,
    annotationsListSelector
};
