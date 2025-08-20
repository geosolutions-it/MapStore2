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
import { API } from '../api/searchText';
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
    RESET_ITINERARY
} from '../plugins/Itinerary/actions/itinerary';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '../actions/maplayout';
import { changeMousePointer, CLICK_ON_MAP, zoomToExtent } from '../actions/map';
import { CONTROL_NAME, ITINERARY_ROUTE_LAYER } from '../plugins/Itinerary/constants';
import { enabledSelector, locationsSelector } from '../plugins/Itinerary/selectors/itinerary';
import { DEFAULT_PANEL_WIDTH } from '../utils/LayoutUtils';
import { changeMapInfoState, purgeMapInfoResults } from '../actions/mapInfo';
import { removeAdditionalLayer, removeAllAdditionalLayers, updateAdditionalLayer } from '../actions/additionallayers';
import { SET_CONTROL_PROPERTY, setControlProperty, TOGGLE_CONTROL } from '../actions/controls';
import { wrapStartStop } from '../observables/epics';
import { addLayer } from '../actions/layers';
import { createMarkerSvgDataUrl, getMarkerColor } from '../plugins/Itinerary/utils/ItineraryUtils';
import { drawerEnabledControlSelector } from '../selectors/controls';
import { info } from '../actions/notifications';

const OFFSET = DEFAULT_PANEL_WIDTH;

/**
 * Handles itinerary map layout updates
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `UPDATE_MAP_LAYOUT`
 * @return {external:Observable}
 */
export const itineraryMapLayoutEpic = (action$, store) =>
    action$.ofType(UPDATE_MAP_LAYOUT)
        .filter(({source}) => enabledSelector(store.getState()) &&  source !== CONTROL_NAME)
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
                geometry: { type: 'Point', coordinates: [latlng.lng, latlng.lat]},
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
export const searchByLocationNameEpic = (action$) =>
    action$.ofType(SEARCH_BY_LOCATION_NAME)
        .debounceTime(500)
        .switchMap(({ location, index }) => {
            if (typeof location === 'string') {
                if (!location || location?.trim() === '') {
                    return Observable.of(searchResultsLoaded([]));
                }

                const nominatimService = API.Utils.getService('nominatim');
                return Observable.defer(() =>
                    nominatimService(location, {
                        limit: 10,
                        polygon_geojson: 1,
                        format: 'json'
                    })
                )
                    .switchMap(results => Observable.of(searchResultsLoaded(results)))
                    .catch(error => Observable.of(searchError(error)))
                    .let(wrapStartStop(
                        setSearchLoadingByIndex(true, index),
                        setSearchLoadingByIndex(false, index)
                    ));
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
export const selectLocationFromMapEpic = (action$, { getState }) =>
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
            );
        });

/**
 * Handles itinerary close
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `SET_CONTROL_PROPERTY` or `RESET_ITINERARY`
 * @return {external:Observable}
 */
export const onCloseItineraryEpic = (action$) =>
    action$.ofType(SET_CONTROL_PROPERTY, RESET_ITINERARY)
        .filter(({control, value, type}) =>
            control === CONTROL_NAME && !value || type === RESET_ITINERARY)
        .switchMap(() => {
            return Observable.of(
                setItinerary(null),
                updateLocations([]),
                removeAdditionalLayer({id: ITINERARY_ROUTE_LAYER, owner: CONTROL_NAME}),
                removeAllAdditionalLayers(CONTROL_NAME + '_waypoint_marker')
            );
        });

/**
 * Handles add route as layer
 * @memberof epics.itinerary
 * @param {external:Observable} action$ manages `ADD_AS_LAYER`
 * @return {external:Observable}
 */
export const onAddRouteAsLayerEpic = (action$, store) =>
    action$.ofType(ADD_AS_LAYER)
        .switchMap(({ features, style }) => {
            return Observable.defer(() => import('@turf/bbox').then(mod => mod.default))
                .switchMap((turfBbox) => {
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
        });
