/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { createSelector } from 'reselect';

import { layersSelector } from './layers';
import { projectionSelector } from './map';
import { isOpenlayers } from './maptype';
import { isMapInfoOpen } from './mapInfo';
import { head, get } from 'lodash';
import assign from 'object-assign';
import { getConfigProp } from '../utils/ConfigUtils';

export const annotationsLayerSelector = createSelector([
    layersSelector
], (layers) => head(layers.filter(l => l.id === 'annotations'))
);

export const multiGeometrySelector = (state) => get(state, 'annotations.config.multiGeometry', false);
export const removingSelector = (state) => get(state, "annotations.removing");
export const formatSelector = (state) => get(state, "annotations.format");
export const aeronauticalOptionsSelector = (state) => get(state, "annotations.aeronauticalOptions");
export const showUnsavedChangesModalSelector = (state) => get(state, "annotations.showUnsavedChangesModal", false);
export const showUnsavedStyleModalSelector = (state) => get(state, "annotations.showUnsavedStyleModal", false);
export const showUnsavedGeometryModalSelector = (state) => get(state, "annotations.showUnsavedGeometryModal", false);
export const showDeleteFeatureModalSelector = (state) => get(state, "annotations.showDeleteFeatureModal", false);
export const closingSelector = (state) => !!get(state, "annotations.closing");
export const editingSelector = (state) => get(state, "annotations.editing");
export const editGeometrySelector = (state) => get(state, "annotations.editGeometry", true);
export const featureTypeSelector = (state) => get(state, "annotations.featureType");
export const coordinateEditorEnabledSelector = (state) => get(state, "annotations.coordinateEditorEnabled");
export const drawingSelector = (state) => !!get(state, "annotations.drawing");
export const stylerTypeSelector = (state) => get(state, "annotations.stylerType");
export const drawingTextSelector = (state) => get(state, "annotations.drawingText");
export const currentSelector = (state) => get(state, "annotations.current");
export const editedFieldsSelector = (state) => get(state, "annotations.editedFields", {});
export const stylingSelector = (state) => !!get(state, "annotations.styling");
export const selectedSelector = (state) => get(state, "annotations.selected", null);
export const unsavedChangesSelector = (state) => get(state, "annotations.unsavedChanges", false);
export const unsavedGeometrySelector = (state) => get(state, "annotations.unsavedGeometry", false);
export const unsavedStyleSelector = (state) => get(state, "annotations.unsavedStyle", false);
export const errorsSelector = (state) => get(state, "annotations.validationErrors", {});
export const configSelector = (state) => get(state, "annotations.config", {});
export const symbolListSelector = (state) => get(state, "annotations.symbolList", []);
export const symbolErrorsSelector = (state) => get(state, "annotations.symbolErrors", []);
export const modeSelector = (state) => editingSelector(state) && 'editing' || annotationsLayerSelector(state) && currentSelector(state) && 'detail' || 'list';
export const defaultStylesSelector = state => state.annotations.defaultStyles;
export const loadingSelector = state => state.annotations.loading;
export const showAgainSelector = (state) => get(state, "annotations.showAgain", false);
export const showPopupWarningSelector = (state) => get(state, "annotations.showPopupWarning", true);

export const annotationsInfoSelector = (state) => (assign({}, {
    symbolErrors: symbolErrorsSelector(state),
    showEdit: isOpenlayers(state),
    canEdit: editGeometrySelector(state),
    mouseHoverEvents: isMapInfoOpen(state),
    closing: closingSelector(state),
    format: formatSelector(state) || getConfigProp("defaultCoordinateFormat"),
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
    mapProjection: projectionSelector(state),
    showUnsavedChangesModal: showUnsavedChangesModalSelector(state),
    showDeleteFeatureModal: showDeleteFeatureModalSelector(state),
    showUnsavedGeometryModal: showUnsavedGeometryModalSelector(state),
    showUnsavedStyleModal: showUnsavedStyleModalSelector(state),
    stylerType: stylerTypeSelector(state),
    styling: stylingSelector(state),
    unsavedChanges: unsavedChangesSelector(state),
    unsavedGeometry: unsavedGeometrySelector(state),
    unsavedStyle: unsavedStyleSelector(state),
    symbolList: symbolListSelector(state),
    showAgain: showAgainSelector(state),
    showPopupWarning: showPopupWarningSelector(state)
}) );

export const annotationsSelector = (state) => ({
    ...(state.annotations || {})
});

export const annotationsListSelector = createSelector([
    annotationsInfoSelector,
    annotationsSelector,
    annotationsLayerSelector,
    modeSelector
], (info, annotations, layer, mode) => (assign({}, {
    format: annotations.format,
    aeronauticalOptions: annotations.aeronauticalOptions,
    removing: annotations.removing,
    showUnsavedChangesModal: annotations.showUnsavedChangesModal,
    showUnsavedGeometryModal: annotations.showUnsavedGeometryModal,
    showUnsavedStyleModal: annotations.showUnsavedStyleModal,
    showDeleteFeatureModal: annotations.showDeleteFeatureModal,
    closing: !!annotations.closing,
    mode,
    annotations: layer && layer.features || [],
    current: annotations.current || null,
    editing: info.editing,
    selected: info.selected,
    filter: annotations.filter || '',
    defaultStyles: annotations.defaultStyles,
    loading: annotations.loading
}, info.config ? {
    config: info.config
} : { })));

export const annotationSelector = createSelector([annotationsListSelector], (annotations) => {
    const id = annotations.current;
    return {
        annotation: head(annotations.annotations.filter(a => a.properties.id === id))
    };
});
