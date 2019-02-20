/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {createSelector} = require('reselect');
const {layersSelector} = require('./layers');
const {isOpenlayers} = require('./maptype');
const {isMapInfoOpen} = require('./mapInfo');
const {head, get} = require('lodash');
const assign = require('object-assign');

const annotationsLayerSelector = createSelector([
        layersSelector
    ], (layers) => head(layers.filter(l => l.id === 'annotations'))
);

const removingSelector = (state) => get(state, "annotations.removing");
const formatSelector = (state) => get(state, "annotations.format");
const aeronauticalOptionsSelector = (state) => get(state, "annotations.aeronauticalOptions");
const showUnsavedChangesModalSelector = (state) => get(state, "annotations.showUnsavedChangesModal", false);
const showUnsavedStyleModalSelector = (state) => get(state, "annotations.showUnsavedStyleModal", false);
const showUnsavedGeometryModalSelector = (state) => get(state, "annotations.showUnsavedGeometryModal", false);
const showDeleteFeatureModalSelector = (state) => get(state, "annotations.showDeleteFeatureModal", false);
const closingSelector = (state) => !!get(state, "annotations.closing");
const editingSelector = (state) => get(state, "annotations.editing");
const featureTypeSelector = (state) => get(state, "annotations.featureType");
const coordinateEditorEnabledSelector = (state) => get(state, "annotations.coordinateEditorEnabled");
const drawingSelector = (state) => !!get(state, "annotations.drawing");
const stylerTypeSelector = (state) => get(state, "annotations.stylerType");
const drawingTextSelector = (state) => get(state, "annotations.drawingText");
const currentSelector = (state) => get(state, "annotations.current");
const modeSelector = (state) => editingSelector(state) && 'editing' || currentSelector(state) && 'detail' || 'list';
const editedFieldsSelector = (state) => get(state, "annotations.editedFields", {});
const stylingSelector = (state) => !!get(state, "annotations.styling");
const selectedSelector = (state) => get(state, "annotations.selected", null);
const unsavedChangesSelector = (state) => get(state, "annotations.unsavedChanges", false);
const unsavedGeometrySelector = (state) => get(state, "annotations.unsavedGeometry", false);
const unsavedStyleSelector = (state) => get(state, "annotations.unsavedStyle", false);
const errorsSelector = (state) => get(state, "annotations.validationErrors", {});
const configSelector = (state) => get(state, "annotations.config", {});
const symbolListSelector = (state) => get(state, "annotations.symbolList", []);
const symbolErrorsSelector = (state) => get(state, "annotations.symbolErrors", []);

const annotationsInfoSelector = (state) => (assign({}, {
    symbolErrors: symbolErrorsSelector(state),
    showEdit: isOpenlayers(state),
    mouseHoverEvents: isMapInfoOpen(state),
    closing: closingSelector(state),
    format: formatSelector(state),
    aeronauticalOptions: aeronauticalOptionsSelector(state),
    config: configSelector(state),
    drawing: drawingSelector(state),
    drawingText: drawingTextSelector(state),
    errors: errorsSelector(state),
    editing: editingSelector(state),
    coordinateEditorEnabled: coordinateEditorEnabledSelector(state),
    editedFields: editedFieldsSelector(state),
    mode: modeSelector(state),
    selected: selectedSelector(state),
    featureType: featureTypeSelector(state),
    removing: removingSelector(state),
    showUnsavedChangesModal: showUnsavedChangesModalSelector(state),
    showDeleteFeatureModal: showDeleteFeatureModalSelector(state),
    showUnsavedGeometryModal: showUnsavedGeometryModalSelector(state),
    showUnsavedStyleModal: showUnsavedStyleModalSelector(state),
    stylerType: stylerTypeSelector(state),
    styling: stylingSelector(state),
    unsavedChanges: unsavedChangesSelector(state),
    unsavedGeometry: unsavedGeometrySelector(state),
    unsavedStyle: unsavedStyleSelector(state),
    symbolList: symbolListSelector(state)
    }) );

const annotationsSelector = (state) => ({
    ...(state.annotations || {})
});

const annotationsListSelector = createSelector([
    annotationsInfoSelector,
    annotationsSelector,
    annotationsLayerSelector
], (info, annotations, layer) => (assign({}, {
    format: annotations.format,
    aeronauticalOptions: annotations.aeronauticalOptions,
    removing: annotations.removing,
    showUnsavedChangesModal: annotations.showUnsavedChangesModal,
    showUnsavedGeometryModal: annotations.showUnsavedGeometryModal,
    showUnsavedStyleModal: annotations.showUnsavedStyleModal,
    showDeleteFeatureModal: annotations.showDeleteFeatureModal,
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
    symbolErrorsSelector,
    annotationsLayerSelector,
    annotationsInfoSelector,
    aeronauticalOptionsSelector,
    annotationsSelector,
    annotationsListSelector,
    annotationSelector,
    removingSelector,
    showUnsavedChangesModalSelector,
    showUnsavedStyleModalSelector,
    closingSelector,
    editingSelector,
    drawingSelector,
    stylerTypeSelector,
    drawingTextSelector,
    currentSelector,
    modeSelector,
    editedFieldsSelector,
    stylingSelector,
    unsavedChangesSelector,
    showUnsavedGeometryModalSelector,
    unsavedGeometrySelector,
    unsavedStyleSelector,
    formatSelector,
    errorsSelector,
    configSelector,
    symbolListSelector
};
