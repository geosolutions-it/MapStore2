/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ANNOTATIONS, isAnnotationLayer } from '../utils/AnnotationsUtils';
import {
    download,
    newAnnotation,
    editAnnotation
} from '../actions/annotations';
import { annotationsLayersSelector } from '../selectors/annotations';
import { createControlEnabledSelector } from '../../../selectors/controls';

function AnnotationsTOCButton({
    status,
    selectedLayers,
    onAdd = () => {},
    onDownload = () => {},
    onEdit = () => {},
    annotationLayers = [],
    statusTypes,
    itemComponent,
    ...props
}) {
    const ItemComponent = itemComponent;
    if (status === statusTypes.DESELECT) {
        return (
            <>
                <ItemComponent
                    {...props}
                    key="annotations"
                    tooltipId="toc.addAnnotations"
                    onClick={() => onAdd()}
                    glyph="add-comment"
                />
                {annotationLayers.length > 0 && <ItemComponent
                    {...props}
                    key="annotations-download"
                    glyph="download-comment"
                    tooltipId="annotations.downloadtooltip"
                    onClick={() => onDownload(annotationLayers)}
                />}
            </>
        );
    }
    if (status === statusTypes.LAYER && isAnnotationLayer(selectedLayers[0])) {
        return (
            <>
                <ItemComponent
                    {...props}
                    key="annotations-edit"
                    glyph="pencil"
                    tooltipId="toc.editAnnotations"
                    onClick={() => onEdit(selectedLayers[0].id)}/>
                <ItemComponent
                    {...props}
                    key="annotations-download"
                    tooltipId="annotations.downloadcurrenttooltip"
                    onClick={() => onDownload([selectedLayers[0]])}
                    glyph="download-comment" />
            </>
        );
    }
    const selectedAnnotationsLayers =  status === statusTypes.LAYERS
        ? selectedLayers.filter(isAnnotationLayer)
        : [];
    if (selectedAnnotationsLayers.length) {
        return (
            <>
                <ItemComponent
                    {...props}
                    key="annotations-download"
                    tooltipId="annotations.downloadtooltip"
                    onClick={() => onDownload(selectedAnnotationsLayers)}
                    glyph="download-comment" />
            </>
        );
    }
    return null;
}

const ConnectedAnnotationsTOCButton = connect(
    createSelector([
        annotationsLayersSelector,
        createControlEnabledSelector(ANNOTATIONS)
    ],
    (annotationLayers, enabled) => ({
        annotationLayers,
        enabled
    })),
    {
        onAdd: newAnnotation,
        onDownload: download,
        onEdit: editAnnotation
    }
)(AnnotationsTOCButton);

export default ConnectedAnnotationsTOCButton;
