/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { Glyphicon } from "react-bootstrap";
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { ANNOTATIONS, isAnnotationLayer } from '../utils/AnnotationsUtils';
import MSButton from '../../../components/misc/Button';
import tooltip from '../../../components/misc/enhancers/tooltip';
import {
    download,
    newAnnotation,
    editAnnotation
} from '../actions/annotations';
import { annotationsLayersSelector } from '../selectors/annotations';
import { createControlEnabledSelector } from '../../../selectors/controls';

const Button = tooltip(MSButton);

function AnnotationsTOCButton({
    status,
    selectedLayers,
    onAdd = () => {},
    onDownload = () => {},
    onEdit = () => {},
    annotationLayers = []
}) {
    if (status === 'DESELECT') {
        return (
            <>
                <Button
                    key="annotations"
                    bsStyle="primary"
                    className="square-button-md"
                    tooltipId="toc.addAnnotations"
                    onClick={() => onAdd()}>
                    <Glyphicon glyph="add-comment"/>
                </Button>
                {annotationLayers.length > 0 && <Button
                    key="annotations-download"
                    bsStyle="primary"
                    className="square-button-md"
                    tooltipId="annotations.downloadtooltip"
                    onClick={() => onDownload(annotationLayers)}>
                    <Glyphicon glyph="download-comment"/>
                </Button>}
            </>
        );
    }
    if (status === 'LAYER' && isAnnotationLayer(selectedLayers[0])) {
        return (
            <>
                <Button
                    key="annotations-edit"
                    bsStyle="primary"
                    className="square-button-md"
                    tooltipId="toc.editAnnotations"
                    onClick={() => onEdit(selectedLayers[0].id)}>
                    <Glyphicon glyph="pencil"/>
                </Button>
                <Button
                    key="annotations-download"
                    bsStyle="primary"
                    className="square-button-md"
                    tooltipId="annotations.downloadcurrenttooltip"
                    onClick={() => onDownload([selectedLayers[0]])}>
                    <Glyphicon glyph="download-comment"/>
                </Button>
            </>
        );
    }
    const selectedAnnotationsLayers =  status === 'LAYERS'
        ? selectedLayers.filter(isAnnotationLayer)
        : [];
    if (selectedAnnotationsLayers.length) {
        return (
            <>
                <Button
                    key="annotations-download"
                    bsStyle="primary"
                    className="square-button-md"
                    tooltipId="annotations.downloadtooltip"
                    onClick={() => onDownload(selectedAnnotationsLayers)}>
                    <Glyphicon glyph="download-comment"/>
                </Button>
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
