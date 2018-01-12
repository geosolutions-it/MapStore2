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
const assign = require('object-assign');

const annotationsLayerSelector = createSelector([
        layersSelector
    ], (layers) => head(layers.filter(l => l.id === 'annotations'))
);

const annotationsInfoSelector = (state) => (assign({}, {
    editing: state.annotations && state.annotations.editing,
    drawing: state.annotations && !!state.annotations.drawing,
    styling: state.annotations && !!state.annotations.styling,
    errors: state.annotations.validationErrors
}, (state.annotations && state.annotations.config) ? {
    config: state.annotations && state.annotations.config
} : { }));

const annotationsSelector = (state) => ({
    ...(state.annotations || {})
});

const annotationsListSelector = createSelector([
    annotationsInfoSelector,
    annotationsSelector,
    annotationsLayerSelector
], (info, annotations, layer) => (assign({}, {
    removing: annotations.removing,
    closing: !!annotations.closing,
    mode: annotations.editing && 'editing' || annotations.current && 'detail' || 'list',
    annotations: layer && layer.features || [],
    current: annotations.current || null,
    editing: info.editing,
    filter: annotations.filter || ''
    }, info.config ? {
        config: info.config
} : { })));

const annotationSelector = createSelector([annotationsListSelector], (annotations) => {
    const id = annotations.current;
    return {
        annotation: head(annotations.annotations.filter(a => a.properties.id === id))
    };
});

module.exports = {
    annotationsLayerSelector,
    annotationsInfoSelector,
    annotationsSelector,
    annotationsListSelector,
    annotationSelector
};
