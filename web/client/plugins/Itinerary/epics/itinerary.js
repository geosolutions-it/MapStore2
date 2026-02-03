/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import uuid from 'uuid';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import sortBy from 'lodash/sortBy';
import isNil from 'lodash/isNil';
import turfBbox from '@turf/bbox';
import { API } from '../../../api/searchText';
import {
    SEARCH_BY_LOCATION_NAME,
    setSearchLoadingByIndex,
    searchResultsLoaded,
    searchError,
    updateLocations,
    SELECT_LOCATION_FROM_MAP,
    setItinerary,
    TRIGGER_ITINERARY_RUN,
    ADD_AS_LAYER,
    RESET_ITINERARY,
    UPDATE_LOCATIONS,
    SET_ITINERARY_ERROR
} from '../actions/itinerary';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '../../../actions/maplayout';
import { changeMousePointer, CLICK_ON_MAP, zoomToExtent } from '../../../actions/map';
import { CONTROL_NAME, DEFAULT_SEARCH_CONFIG, ITINERARY_ROUTE_LAYER } from '../constants';
import { enabledSelector, itinerarySearchConfigSelector, locationsSelector } from '../selectors/itinerary';
import { DEFAULT_PANEL_WIDTH } from '../../../utils/LayoutUtils';
import { changeMapInfoState, purgeMapInfoResults } from '../../../actions/mapInfo';
import { removeAdditionalLayer, removeAllAdditionalLayers, updateAdditionalLayer } from '../../../actions/additionallayers';
import { SET_CONTROL_PROPERTY, setControlProperty, TOGGLE_CONTROL } from '../../../actions/controls';
import { addLayer } from '../../../actions/layers';
import { getMarkerColor } from '../utils/ItineraryUtils';
import { drawerEnabledControlSelector } from '../../../selectors/controls';
import { info, error as errorNotification } from '../../../actions/notifications';
import { createMarkerSvgDataUrl } from '../../../utils/StyleUtils';

const OFFSET = DEFAULT_PANEL_WIDTH;

/**
 * Handles itinerary map layout updates
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `UPDATE_MAP_LAYOUT`
 * @return {external:Observable}
 */
export const itineraryMapLayoutEpic = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(({source}) => enabledSelector(store.getState()) && isNil(source))
        .map(({layout}) => {
            const action = updateMapLayout({
                ...layout,
                right: OFFSET + (layout?.boundingSidebarRect?.right ?? 0),
                boundingMapRect: {
                    ...(layout.boundingMapRect || {}),
                    right: OFFSET + (layout?.boundingSidebarRect?.right ?? 0)
                },
                rightPanel: true
            });
            return { ...action, source: CONTROL_NAME };
        });

/**
 * Adds a marker feature to the itinerary route layer
 * @param {object} latlng - The latitude and longitude of the marker
 * @param {number} index - The index of the marker
 * @returns {object} The updated additional layer
 */
const addMarkerFeature = (latlng, index) => {
    return updateAdditionalLayer(
        ITINERARY_ROUTE_LAYER + `_waypoint_marker_${index}`,
        CONTROL_NAME + '_waypoint_marker',
        'overlay',
        {
            type: 'vector',
            id: uuid(),
            hideLoading: true,
            visibility: true,
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: isArray(latlng) ? latlng : [latlng.lng, latlng.lat]},
                properties: { id: "point" }
            }],
            style: {
                format: "geostyler",
                body: {
                    rules: [
                        {
                            filter: [ '==', 'id', 'point' ],
                            symbolizers: [
                                {
                                    kind: 'Icon',
                                    image: createMarkerSvgDataUrl(getMarkerColor(index), 28),
                                    size: 28,
                                    opacity: 1,
                                    msClampToGround: true
                                }
                            ]
                        }
                    ]
                }
            }
        }
    );
};

/**
 * Handles search by location name
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `SEARCH_BY_LOCATION_NAME`
 * @return {external:Observable}
 */
export const itinerarySearchByLocationNameEpic = (action$, store) =>
    action$.ofType(SEARCH_BY_LOCATION_NAME)
        .debounceTime(500)
        .switchMap(({ location, index }) => {
            if (typeof location === 'string') {
                if (!location || location?.trim() === '') {
                    return Observable.of(searchResultsLoaded([]));
                }
                const {services, maxResults} = itinerarySearchConfigSelector(store.getState());
                const searchServices = services || DEFAULT_SEARCH_CONFIG;
                return Observable.from(
                    searchServices.map((service) => {
                        const serviceInstance = API.Utils.getService(service.type);
                        if (!serviceInstance) {
                            const err = new Error("Service Missing");
                            err.msgId = "search.service_missing";
                            err.serviceType = service.type;
                            return Observable.of(err).do((e) => {throw e; });
                        }
                        return Observable.defer(() =>
                            serviceInstance(location, service.options)
                                .then( (response = []) => response
                                    .map(result => ({...result, __PRIORITY__: service.priority || 0}))
                                ))
                            .retryWhen(errors => errors.delay(200).scan((count, err) => {
                                if ( count >= 2) {
                                    throw err;
                                }
                                return count + 1;
                            }, 0));
                    })
                ).mergeAll()
                    .scan((oldRes, newRes) => sortBy([...oldRes, ...newRes], ["__PRIORITY__"]))
                    .map((results) => searchResultsLoaded(results.slice(0, maxResults || 15), false))
                    .startWith(setSearchLoadingByIndex(true, index))
                    .takeUntil(action$.ofType(UPDATE_LOCATIONS, RESET_ITINERARY))
                    .concat([setSearchLoadingByIndex(false, index)])
                    .catch(e => {
                        const err = {msgId: "search.generic_error", ...e, message: e.message, stack: e.stack};
                        return Observable.from([searchError(err), setSearchLoadingByIndex(false, index)]);
                    });
            }
            const { lat, lon: lng } = get(location, 'original.properties', {});
            return Observable.of(addMarkerFeature({ lat, lng }, index));
        });

/**
 * Handles itinerary open
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @return {external:Observable}
 */
export const onOpenItineraryEpic = (action$, {getState}) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({control}) => control === CONTROL_NAME && enabledSelector(getState()))
        .switchMap(() =>
            Observable.of(
                purgeMapInfoResults(),
                changeMapInfoState(false)
            )
        );

/**
 * Handles select a location from map
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `SELECT_LOCATION_FROM_MAP`
 * @return {external:Observable}
 */
export const itinerarySelectLocationFromMapEpic = (action$, { getState }) =>
    action$.ofType(SELECT_LOCATION_FROM_MAP)
        .switchMap(({ index }) =>
            action$.ofType(CLICK_ON_MAP)
                .take(1)
                .switchMap(({ point }) => {
                    const { latlng } = point;
                    const state = getState();
                    const locations = locationsSelector(state);
                    const newLocations = [...locations];
                    newLocations[index] = [latlng.lng, latlng.lat];
                    return Observable.of(
                        changeMousePointer('auto'),
                        updateLocations(newLocations),
                        addMarkerFeature(latlng, index)
                    );
                }).startWith(changeMousePointer('pointer'))
        );

/**
 * Handles itinerary run
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `TRIGGER_ITINERARY_RUN`
 * @return {external:Observable}
 */
export const onItineraryRunEpic = (action$) =>
    action$.ofType(TRIGGER_ITINERARY_RUN)
        .switchMap(({itinerary} = {}) => {
            const { bbox, layer, data } = itinerary ?? {};
            return Observable.of(
                removeAllAdditionalLayers(CONTROL_NAME + '_waypoint_marker'),
                updateAdditionalLayer(ITINERARY_ROUTE_LAYER, CONTROL_NAME, 'overlay', layer),
                zoomToExtent(bbox, "EPSG:4326"),
                setItinerary(data)
            ).startWith(setItinerary(null));
        });

/**
 * Handles toggling of itinerary control
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @return {external:Observable}
 */
export const onToggleControlItineraryEpic = (action$, {getState}) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({control}) => control !== CONTROL_NAME && enabledSelector(getState()))
        .switchMap(() => {
            return Observable.of(setControlProperty(CONTROL_NAME, 'enabled', false));
        });

/**
 * Handles itinerary close
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `SET_CONTROL_PROPERTY` | `RESET_ITINERARY` | `UPDATE_LOCATIONS` | `SET_ITINERARY_ERROR`
 * @return {external:Observable}
 */
export const onCloseItineraryEpic = (action$, {getState}) =>
    action$.ofType(SET_CONTROL_PROPERTY, RESET_ITINERARY, UPDATE_LOCATIONS, SET_ITINERARY_ERROR, TOGGLE_CONTROL)
        .filter(({control, value, type}) =>
            (control === CONTROL_NAME && (
                (type === SET_CONTROL_PROPERTY && !value) ||
                (type === TOGGLE_CONTROL && !enabledSelector(getState()))
            )) ||
        [RESET_ITINERARY, UPDATE_LOCATIONS, SET_ITINERARY_ERROR].includes(type))
        .switchMap(({type, locations = []}) => {
            let $actions = [
                setItinerary(null),
                removeAdditionalLayer({id: ITINERARY_ROUTE_LAYER, owner: CONTROL_NAME}),
                removeAllAdditionalLayers(CONTROL_NAME + '_waypoint_marker')
            ].concat(
                // Add markers for locations based on updated locations to keep map and itinerary data consistent
                locations.filter(Boolean).map((location, index) => addMarkerFeature(location, index))
            ).concat([SET_CONTROL_PROPERTY, TOGGLE_CONTROL].includes(type) ? [changeMapInfoState(true)] : []);

            // Retain location when locations are updated or on itinerary run error
            if (![UPDATE_LOCATIONS, SET_ITINERARY_ERROR].includes(type)) {
                $actions.push(updateLocations([]));
            }
            return Observable.of(...$actions);
        });

/**
 * Handles itinerary error
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `SET_ITINERARY_ERROR`
 * @return {external:Observable}
 */
export const onItineraryErrorEpic = (action$) =>
    action$.ofType(SET_ITINERARY_ERROR)
        .switchMap(({error}) => {
            const message = get(error, 'data.message',
                "itinerary.notification.errorItineraryError"
            );
            return Observable.of(errorNotification({
                title: "itinerary.notification.error",
                message,
                autoDismiss: 8,
                position: "tc"
            }));
        });

/**
 * Handles add route as layer
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `ADD_AS_LAYER`
 * @return {external:Observable}
 */
export const itineraryAddRouteAsLayerEpic = (action$, store) =>
    action$.ofType(ADD_AS_LAYER)
        .switchMap(({ features, style }) => {
            const collection = { type: 'FeatureCollection', features };
            const bbox = turfBbox(collection);
            const [minx, miny, maxx, maxy] = bbox || [-180, -90, 180, 90];
            const isDrawerOpen = drawerEnabledControlSelector(store.getState());
            return Observable.of(
                addLayer({
                    type: 'vector',
                    id: uuid(),
                    name: ITINERARY_ROUTE_LAYER,
                    title: CONTROL_NAME,
                    hideLoading: true,
                    features: collection?.features || [],
                    visibility: true,
                    style: style ?? {},
                    bbox: {
                        crs: 'EPSG:4326',
                        bounds: { minx, miny, maxx, maxy }
                    }
                }),
                info({
                    title: 'itinerary.title',
                    message: 'itinerary.notification.infoLayerAdded'
                }),
                // Open the drawer indicating a new layer has been added
                ...(!isDrawerOpen ? [setControlProperty('drawer', 'enabled', true)] : [])
            );
        });

export const itineraryUpdateLocationEpic = (action$) =>
    action$.ofType(UPDATE_LOCATIONS)
        .filter(({ locations = [] }) => locations.length > 0)
        .switchMap(({ locations }) => {
            const features = locations.map((coordinates) => ({ type: 'Feature', geometry: { type: 'Point', coordinates} }));
            const collection = { type: 'FeatureCollection', features };
            const bbox = turfBbox(collection);
            return Observable.of(
                ...locations.map((location, index) => addMarkerFeature(location, index)),
                ...(locations.length > 1 ? [zoomToExtent(bbox, "EPSG:4326")] : [])
            );
        });
