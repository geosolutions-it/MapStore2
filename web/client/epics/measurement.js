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
import {validateCoord} from '../utils/MeasureUtils';
import {ADD_MEASURE_AS_ANNOTATION, ADD_AS_LAYER, SET_ANNOTATION_MEASUREMENT, setMeasurementConfig, changeMeasurement, changeCoordinates} from '../actions/measurement';
import {addLayer} from '../actions/layers';
import {STYLE_TEXT} from '../utils/AnnotationsUtils';
import {toggleControl, setControlProperty, SET_CONTROL_PROPERTY, TOGGLE_CONTROL} from '../actions/controls';
import {closeFeatureGrid} from '../actions/featuregrid';
import {purgeMapInfoResults, hideMapinfoMarker} from '../actions/mapInfo';
import {measureSelector} from '../selectors/controls';
import {geomTypeSelector, isActiveSelector} from '../selectors/measurement';
import { CLICK_ON_MAP } from '../actions/map';
import {
    newAnnotation,
    setEditingFeature,
    cleanHighlight,
    toggleVisibilityAnnotation
} from '../actions/annotations';

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
    action$.ofType(SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
        .filter((action) => action.control === "measure" && isActiveSelector(store.getState()))
        .switchMap(() => {
            return Rx.Observable.of(closeFeatureGrid(), purgeMapInfoResults(), hideMapinfoMarker(), setControlProperty('annotations', 'enabled', false));
        });

export const closeMeasureEpics = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(action => action.control === "measure" && !measureSelector(store.getState()))
        .switchMap(() => {
            return Rx.Observable.of(cleanHighlight());
        });

export const setMeasureStateFromAnnotationEpic = (action$, store) =>
    action$.ofType(SET_ANNOTATION_MEASUREMENT)
        .switchMap(({features, properties}) => {
            const isGeomSelected = geomTypeSelector(store.getState()) === getGeomTypeSelected(features)?.[0];
            return Rx.Observable.of( !isGeomSelected && changeMeasurement({geomType: getGeomTypeSelected(features)?.[0]}),
                setControlProperty("measure", "enabled", true),
                setControlProperty("annotations", "enabled", false),
                toggleVisibilityAnnotation(properties.id, false));
        });

export const addCoordinatesEpic = (action$, {getState = () => {}}) =>
    action$.ofType(CLICK_ON_MAP)
        .filter(() => {
            const { showCoordinateEditor, enabled } = getState()?.controls?.measure || {};
            return showCoordinateEditor && enabled;
        } )
        .switchMap(({point}) => {
            const { currentFeature: index, features = [], geomType } = getState()?.measurement || {};
            const { lng: lon, lat } = point?.latlng || {};
            let coordinates = features[index]?.geometry?.coordinates || [];
            coordinates = geomType === 'Polygon' ? coordinates[0] : coordinates;
            const invalidCoordinateIndex = coordinates !== undefined ? coordinates.findIndex(c=> !validateCoord(c)) : -1;
            if (invalidCoordinateIndex !== -1) {
                coordinates = coordinates.map(c=> ({lon: c[0], lat: c[1]}));
                coordinates[invalidCoordinateIndex] = {lon, lat};
                return Rx.Observable.of(changeCoordinates(coordinates));
            }
            return Rx.Observable.empty();
        });

export default {
    addAnnotationFromMeasureEpic,
    addAsLayerEpic,
    openMeasureEpic,
    closeMeasureEpics,
    setMeasureStateFromAnnotationEpic,
    addCoordinatesEpic
};
