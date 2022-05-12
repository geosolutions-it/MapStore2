/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Rx, {Observable} from 'rxjs';
import uuidv1 from 'uuid/v1';

import {convertMeasuresToGeoJSON, getGeomTypeSelected} from '../utils/MeasurementUtils';
import {validateCoord} from '../utils/MeasureUtils';
import {
    ADD_MEASURE_AS_ANNOTATION,
    ADD_AS_LAYER,
    SET_ANNOTATION_MEASUREMENT,
    setMeasurementConfig,
    changeMeasurement,
    changeCoordinates
} from '../actions/measurement';
import {addLayer} from '../actions/layers';
import {STYLE_TEXT} from '../utils/AnnotationsUtils';
import {
    toggleControl,
    setControlProperty,
    SET_CONTROL_PROPERTY,
    TOGGLE_CONTROL,
    SET_CONTROL_PROPERTIES
} from '../actions/controls';
import {closeFeatureGrid, OPEN_FEATURE_GRID} from '../actions/featuregrid';
import {purgeMapInfoResults, hideMapinfoMarker} from '../actions/mapInfo';
import {createControlEnabledSelector, measureSelector} from '../selectors/controls';
import {geomTypeSelector, isActiveSelector} from '../selectors/measurement';
import { CLICK_ON_MAP } from '../actions/map';
import {
    newAnnotation,
    setEditingFeature,
    cleanHighlight,
    toggleVisibilityAnnotation, START_DRAWING
} from '../actions/annotations';
import {findIndex, get, keys} from "lodash";
import {shutdownTool} from "../utils/EpicsUtils";
import {CHANGE_DRAWING_STATUS} from "../actions/draw";

const dockPanels = ['mapCatalog', 'mapTemplates', 'metadataexplorer', 'userExtensions', 'details', 'cadastrapp'];

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
            return Rx.Observable.of(closeFeatureGrid(), purgeMapInfoResults(), hideMapinfoMarker());
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
            return Rx.Observable.of(changeMeasurement(newMeasureState), cleanHighlight());
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

/**
 * Closes measure dock (coordinates editor is active in config) when another dock panel is open
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
export const tearDownMeasureDockOnAnotherDockOpen = (action$, store) =>
    shutdownTool(
        action$,
        store,
        [SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL],
        'measure',
        dockPanels,
        ({control, property, properties = [], type}) => {
            const state = store.getState();
            const controlState = state.controls[control].enabled;
            switch (type) {
            case SET_CONTROL_PROPERTY:
            case TOGGLE_CONTROL:
                return (property === 'enabled' || !property) && controlState && dockPanels.includes(control);
            default:
                return findIndex(keys(properties), prop => prop === 'enabled') > -1 && controlState && dockPanels.includes(control);
            }
        }
    );

/**
 * Closes measure tool when another drawing tool is open
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
export const tearDownMeasureOnDrawToolOpen = (action$, store) =>
    shutdownTool(
        action$,
        store,
        [SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL, OPEN_FEATURE_GRID],
        'measure',
        ['street-view']
    );

/**
 * Closes measurement tool when annotations coordinate editor is open
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
export const tearDownMeasureOnAnnotationsDrawing = (action$, store) =>
    action$.ofType(START_DRAWING, CHANGE_DRAWING_STATUS)
        .filter(({type, status, owner}) => {
            const isActive = createControlEnabledSelector("measure")(store.getState());
            switch (type) {
            case CHANGE_DRAWING_STATUS:
                return isActive &&
                    ((status === 'drawOrEdit' && owner === 'annotations') || (status === 'start' && owner === 'queryform'));
            case START_DRAWING:
            default:
                return isActive;
            }
        })
        .switchMap( () => {
            let actions = [
                setControlProperty("measure", "enabled", null)
            ];
            return Rx.Observable.from(actions);
        });

/**
 * Closes another docks when measure dock (coordinates editor is active in config) is open
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
export const tearDownAnotherDockOnMeasurementOpen = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTIES, SET_CONTROL_PROPERTY, TOGGLE_CONTROL)
        .filter(() => {
            const {showCoordinateEditor, enabled} = store.getState()?.controls?.measure || {};
            return showCoordinateEditor && enabled;
        })
        .switchMap(() => {
            const actions = [];
            const state = store.getState();
            dockPanels.forEach((controlName) => {
                const enabled = get(state, ['controls', controlName, 'enabled'], false);
                enabled && actions.push(setControlProperty(controlName, 'enabled', null));
            });
            return Observable.from(actions);
        });
export default {
    addAnnotationFromMeasureEpic,
    addAsLayerEpic,
    openMeasureEpic,
    closeMeasureEpics,
    setMeasureStateFromAnnotationEpic,
    addCoordinatesEpic,
    tearDownMeasureDockOnAnotherDockOpen,
    tearDownAnotherDockOnMeasurementOpen,
    tearDownMeasureOnDrawToolOpen,
    tearDownMeasureOnAnnotationsDrawing
};
