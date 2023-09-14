/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import uuidv1 from 'uuid/v1';
import { saveAs } from 'file-saver';

import { setControlProperty } from '../../../actions/controls';
import { addLayer, updateNode, removeLayer, selectNode } from '../../../actions/layers';
import { error } from '../../../actions/notifications';
import {
    hideMapinfoMarker,
    closeIdentify,
    purgeMapInfoResults
} from '../../../actions/mapInfo';
import {
    EDIT_ANNOTATION,
    DOWNLOAD,
    LOAD_ANNOTATIONS,
    NEW_ANNOTATION,
    CONFIRM_CLOSE_ANNOTATIONS,
    REMOVE_ANNOTATION,
    MERGE_ANNOTATIONS_FEATURES,
    storeAnnotationsSession
} from '../actions/annotations';
import {
    ANNOTATIONS,
    annotationsToGeoJSON,
    createAnnotationId
} from '../utils/AnnotationsUtils';
import {
    annotationsLayersSelector,
    getAnnotationsSession
} from '../selectors/annotations';
import { mapNameSelector } from '../../../selectors/map';
import {
    getSelectedLayer,
    getLayerFromId
} from '../../../selectors/layers';

/**
 * Handles the editing of an annotation, performing action such as node selection and control enable
 */
export const editAnnotationEpic = (action$, { getState }) =>
    action$.ofType(EDIT_ANNOTATION)
        .switchMap((action) => {
            const selected = getSelectedLayer(getState());
            return Rx.Observable.of(
                hideMapinfoMarker(),
                ...(selected?.id !== action?.id
                    ? [selectNode(action.id, 'layer')]
                    : []),
                setControlProperty(ANNOTATIONS, 'enabled', true)
            );
        });
/**
 * Handles the creation of a new layer annotation including the initial actions to edit the layer
 */
export const newAnnotationEpic = (action$) =>
    action$.ofType(NEW_ANNOTATION)
        .switchMap(() => {
            const newLayer = {
                id: createAnnotationId(uuidv1()),
                title: 'New annotations',
                type: 'vector',
                features: [],
                style: {},
                visibility: true,
                rowViewer: ANNOTATIONS
            };
            return Rx.Observable.of(
                hideMapinfoMarker(),
                addLayer(newLayer),
                selectNode(newLayer.id, 'layer'),
                setControlProperty(ANNOTATIONS, 'enabled', true)
            );
        });
/**
 * Handles all the action to close the annotation panel and clean the annotation layer from all the invalid features
 */
export const confirmCloseAnnotationsEpic = (action$) =>
    action$.ofType(CONFIRM_CLOSE_ANNOTATIONS)
        .switchMap(({ layer }) => {
            return Rx.Observable.of(
                setControlProperty(ANNOTATIONS, 'enabled', false),
                layer?.features?.length
                    ? updateNode(layer.id, 'layer', {
                        invalidFeatures: null
                    })
                    : removeLayer(layer.id)
            );
        });
/**
 * Handles the removal of an annotation layer
 */
export const removeAnnotationsEpic = (action$) =>
    action$.ofType(REMOVE_ANNOTATION)
        .switchMap((action) => {
            return Rx.Observable.of(
                purgeMapInfoResults(),
                closeIdentify(),
                removeLayer(action.id)
            );
        });
/**
 * Handles the download of annotations layers converting them to a GeoJSON FeatureCollection file
 */
export const downloadAnnotationsEpic = (action$, { getState }) =>
    action$.ofType(DOWNLOAD)
        .switchMap(({ annotations }) => {
            try {
                const geoJSON = annotationsToGeoJSON(annotations);
                const mapName = mapNameSelector(getState());
                saveAs(new Blob([JSON.stringify(geoJSON)], {type: 'application/json;charset=utf-8' }), `${ mapName.length > 0 && mapName || ANNOTATIONS}.json`);
                return Rx.Observable.empty();
            } catch (e) {
                return Rx.Observable.of(error({
                    title: 'annotations.title',
                    message: 'annotations.downloadError',
                    autoDismiss: 5,
                    position: 'tr'
                }));
            }
        });
/**
 * Handles the import of annotations in a map
 */
export const loadAnnotationsEpic = (action$, { getState }) =>
    action$.ofType(LOAD_ANNOTATIONS)
        .switchMap(({ features, override }) => {
            const currentAnnotationsLayers = annotationsLayersSelector(getState());
            if (!override) {
                const currentIds = currentAnnotationsLayers.map(({ id }) => id);
                return Rx.Observable.of(
                    ...features.map((annotationLayer) =>
                        currentIds.includes(annotationLayer.id)
                            ? updateNode(annotationLayer.id, 'layer', {
                                title: annotationLayer.title,
                                description: annotationLayer.description,
                                style: annotationLayer.style,
                                features: annotationLayer.features
                            })
                            : addLayer(annotationLayer)
                    )
                );
            }
            return Rx.Observable.of(
                ...currentAnnotationsLayers.map((annotationLayer) => removeLayer(annotationLayer.id)),
                ...features.map((annotationLayer) => addLayer(annotationLayer))
            );
        });
/**
 * Handles the merge of feature inside an annotation, an example are the measurement features converted into an annotation
 */
export const mergeAnnotationsFeaturesEpic = (action$, { getState }) =>
    action$.ofType(MERGE_ANNOTATIONS_FEATURES)
        .switchMap((action) => {
            const { annotation } = action;
            const updateSession = (source) => ({
                features: [
                    ...(source?.features || []),
                    ...(annotation?.features || [])
                ],
                style: {
                    ...annotation?.style,
                    ...source?.style,
                    body: {
                        ...annotation?.style?.body,
                        ...source?.style?.body,
                        rules: [
                            ...(source?.style?.body?.rules || []),
                            ...(annotation?.style?.body?.rules || [])
                        ]
                    }
                }
            });
            const state = getState();
            const selected = getLayerFromId(state, action.id);
            const session = getAnnotationsSession(state);
            return Rx.Observable.of(
                ...(session ? [ storeAnnotationsSession(updateSession(session)) ] : []),
                updateNode(selected.id, 'layer', {
                    _v_: uuidv1(),
                    ...updateSession(selected)
                })
            );
        });

export default {
    loadAnnotationsEpic,
    newAnnotationEpic,
    editAnnotationEpic,
    downloadAnnotationsEpic,
    confirmCloseAnnotationsEpic,
    removeAnnotationsEpic,
    mergeAnnotationsFeaturesEpic
};
