/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';
import uuidv1 from 'uuid/v1';

import {convertMeasuresToGeoJSON, getGeomTypeSelected} from '../utils/MeasurementUtils';
import {ADD_MEASURE_AS_ANNOTATION, ADD_AS_LAYER, SET_ANNOTATION_MEASUREMENT, setMeasurementConfig, changeMeasurement} from '../actions/measurement';
import {addLayer} from '../actions/layers';
import {STYLE_TEXT} from '../utils/AnnotationsUtils';
import {toggleControl, setControlProperty, SET_CONTROL_PROPERTY, TOGGLE_CONTROL} from '../actions/controls';
import {closeFeatureGrid} from '../actions/featuregrid';
import {purgeMapInfoResults, hideMapinfoMarker} from '../actions/mapInfo';
import {showCoordinateEditorSelector, measureSelector} from '../selectors/controls';
import {geomTypeSelector} from '../selectors/measurement';
import {newAnnotation, setEditingFeature, cleanHighlight} from '../actions/annotations';

export const addAnnotationFromMeasureEpic = (action$) =>
    action$.ofType(ADD_MEASURE_AS_ANNOTATION)
        .switchMap((a) => {
            // transform measure feature into geometry collection
            // add feature property to manage text annotation with value and uom
            const {features, textLabels, uom, save, properties} = a;
            const {id = uuidv1(), visibility = true} = properties || {};
            const newFeature = {
                ...convertMeasuresToGeoJSON(features, textLabels, uom, id, 'Annotations created from measurements', STYLE_TEXT),
                newFeature: save,
                visibility
            };

            return Rx.Observable.of(
                toggleControl('annotations', null),
                newAnnotation(),
                setMeasurementConfig("exportToAnnotation", false),
                setEditingFeature(newFeature)
            );
        });

export const addAsLayerEpic = (action$) =>
    action$.ofType(ADD_AS_LAYER)
        .switchMap(({features, textLabels, uom}) => {
            const layerFeature = convertMeasuresToGeoJSON(features, textLabels, uom, uuidv1());
            return Rx.Observable.of(
                addLayer({
                    type: 'vector',
                    id: uuidv1(),
                    name: 'Measurements',
                    hideLoading: true,
                    features: [layerFeature],
                    visibility: true
                })
            );
        });

export const openMeasureEpic = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY)
        .filter((action) => action.control === "measure" && action.value && showCoordinateEditorSelector(store.getState()))
        .switchMap(() => {
            return Rx.Observable.of(closeFeatureGrid(), purgeMapInfoResults(), hideMapinfoMarker());
        });

export const closeMeasureEpics = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(action => action.control === "measure" && !measureSelector(store.getState()))
        .switchMap(() => {
            return Rx.Observable.of(cleanHighlight());
        });

export const setMeasureStateFromAnnotationEpic = (action$, store) =>
    action$.ofType(SET_ANNOTATION_MEASUREMENT)
        .switchMap(({features}) => {
            const isGeomSelected = geomTypeSelector(store.getState()) === getGeomTypeSelected(features)?.[0];
            return Rx.Observable.of( !isGeomSelected && changeMeasurement({geomType: getGeomTypeSelected(features)?.[0]}),
                setControlProperty("measure", "enabled", true),
                setControlProperty("annotations", "enabled", false));
        });

export default {
    addAnnotationFromMeasureEpic,
    addAsLayerEpic,
    openMeasureEpic,
    closeMeasureEpics,
    setMeasureStateFromAnnotationEpic
};
