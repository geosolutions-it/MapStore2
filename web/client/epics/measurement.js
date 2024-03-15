/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';
import uuidv1 from 'uuid/v1';

import {
    convertMeasuresToGeoJSON,
    convertMeasuresToAnnotation,
    getGeomTypeSelected
} from '../utils/MeasurementUtils';
import {validateCoord} from '../utils/MeasureUtils';
import {
    ADD_MEASURE_AS_ANNOTATION,
    ADD_AS_LAYER,
    SET_ANNOTATION_MEASUREMENT,
    changeMeasurement,
    changeCoordinates
} from '../actions/measurement';
import { addLayer } from '../actions/layers';
import {
    setControlProperty,
    SET_CONTROL_PROPERTY,
    TOGGLE_CONTROL
} from '../actions/controls';
import {purgeMapInfoResults, hideMapinfoMarker} from '../actions/mapInfo';
import {createControlEnabledSelector, measureSelector} from '../selectors/controls';
import {geomTypeSelector, isActiveSelector} from '../selectors/measurement';
import {CLICK_ON_MAP, registerEventListener, unRegisterEventListener} from '../actions/map';
import {
    editAnnotation,
    mergeAnnotationsFeatures
} from '../plugins/Annotations/actions/annotations';
import {updateDockPanelsList} from "../actions/maplayout";
import { getSelectedAnnotationLayer } from '../plugins/Annotations/selectors/annotations';
import {shutdownToolOnAnotherToolDrawing} from "../utils/ControlUtils";
import { ANNOTATIONS } from '../plugins/Annotations/utils/AnnotationsUtils';

export const addAnnotationFromMeasureEpic = (action$, store) =>
    action$.ofType(ADD_MEASURE_AS_ANNOTATION)
        .switchMap((action) => {
            // transform measure feature into geometry collection
            // add feature property to manage text annotation with value and uom
            const { features, textLabels, uom, properties } = action;
            const { id = uuidv1(), visibility = true } = properties || {};
            const annotation = convertMeasuresToAnnotation(features, textLabels, uom, id, 'Annotations created from measurements');
            const state = store.getState();
            const selected = getSelectedAnnotationLayer(state);
            const commonActions = [
                changeMeasurement(null),
                changeMeasurement('LineString')
            ];
            if (selected && createControlEnabledSelector(ANNOTATIONS)(state)) {
                return Rx.Observable.of(
                    ...commonActions,
                    mergeAnnotationsFeatures(selected.id, annotation)
                );
            }
            return Rx.Observable.of(
                ...commonActions,
                addLayer({
                    ...annotation,
                    visibility
                }),
                editAnnotation(annotation.id)
            );
        });

export const addAsLayerEpic = (action$) =>
    action$.ofType(ADD_AS_LAYER)
        .switchMap(({ features, uom, textLabels }) => {
            return Rx.Observable.defer(() => import('@turf/bbox').then(mod => mod.default))
                .switchMap((turfBbox) => {
                    const collection = convertMeasuresToGeoJSON(features, textLabels, uom);
                    const bbox = turfBbox(collection);
                    const [minx, miny, maxx, maxy] = bbox || [-180, -90, 180, 90];
                    return Rx.Observable.of(
                        addLayer({
                            type: 'vector',
                            id: uuidv1(),
                            name: 'measurements',
                            title: 'Measurements',
                            hideLoading: true,
                            features: collection?.features || [],
                            visibility: true,
                            style: collection.style,
                            bbox: {
                                crs: 'EPSG:4326',
                                bounds: { minx, miny, maxx, maxy }
                            }
                        })
                    );
                });
        });

export const openMeasureEpic = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
        .filter((action) => action.control === "measure" && isActiveSelector(store.getState()))
        .switchMap(() => {
            const actions = [purgeMapInfoResults(), hideMapinfoMarker(),
                registerEventListener('click', 'measure')];
            const {showCoordinateEditor} = store.getState()?.controls?.measure || {};
            if (showCoordinateEditor) {
                actions.push(updateDockPanelsList('measure', 'add', 'right'));
            }
            return Rx.Observable.from(actions);
        });

export const closeMeasureEpics = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
        .filter(action => action.control === "measure" && !measureSelector(store.getState()))
        .switchMap(() => {
            const newMeasureState = {
                lineMeasureEnabled: false,
                areaMeasureEnabled: false,
                bearingMeasureEnabled: false,
                geomType: null,
                // reset old measurements
                len: 0,
                area: 0,
                bearing: 0
            };
            const actions = [changeMeasurement(newMeasureState), unRegisterEventListener('click', 'measure')];

            const {showCoordinateEditor} = store.getState()?.controls?.measure || {};
            if (showCoordinateEditor) {
                actions.push(updateDockPanelsList('measure', 'remove', 'right'));
            }
            return Rx.Observable.from(actions);
        });

export const setMeasureStateFromAnnotationEpic = (action$, store) =>
    action$.ofType(SET_ANNOTATION_MEASUREMENT)
        .switchMap(({features}) => {
            const isGeomSelected = geomTypeSelector(store.getState()) === getGeomTypeSelected(features)?.[0];
            return Rx.Observable.of( !isGeomSelected && changeMeasurement({geomType: getGeomTypeSelected(features)?.[0]}),
                setControlProperty("measure", "enabled", true),
                setControlProperty("annotations", "enabled", false));
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

/**
 * Closes measurement tool when one of the drawing tools takes control
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
export const tearDownMeasureOnDrawToolActive = (action$, store) => shutdownToolOnAnotherToolDrawing(action$, store, 'measure');

export default {
    addAnnotationFromMeasureEpic,
    addAsLayerEpic,
    openMeasureEpic,
    closeMeasureEpics,
    setMeasureStateFromAnnotationEpic,
    addCoordinatesEpic,
    tearDownMeasureOnDrawToolActive
};
