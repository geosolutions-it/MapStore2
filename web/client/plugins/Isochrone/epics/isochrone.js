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
import sortBy from 'lodash/sortBy';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import { API } from '../../../api/searchText';
import {
    SEARCH_BY_LOCATION_NAME,
    searchResultsLoaded,
    searchError,
    SELECT_LOCATION_FROM_MAP,
    setIsochrone,
    TRIGGER_ISOCHRONE_RUN,
    ADD_AS_LAYER,
    RESET_ISOCHRONE,
    updateLocation,
    setSearchLoading,
    UPDATE_LOCATION,
    setCurrentRunParameters
} from '../actions/isochrone';
import { UPDATE_MAP_LAYOUT, updateMapLayout } from '../../../actions/maplayout';
import { changeMousePointer, CLICK_ON_MAP, panTo, zoomToExtent } from '../../../actions/map';
import { CONTROL_NAME, DEFAULT_PROVIDER_CONFIG, DEFAULT_SEARCH_CONFIG, ISOCHRONE_ROUTE_LAYER } from '../constants';
import { enabledSelector, isochroneLayersOwnerSelector, isochroneSearchConfigSelector } from '../selectors/isochrone';
import { changeMapInfoState, purgeMapInfoResults } from '../../../actions/mapInfo';
import { removeAdditionalLayer, removeAllAdditionalLayers, updateAdditionalLayer } from '../../../actions/additionallayers';
import { SET_CONTROL_PROPERTY, setControlProperty, TOGGLE_CONTROL } from '../../../actions/controls';
import { addLayer } from '../../../actions/layers';
import { DEFAULT_PANEL_WIDTH, parseLayoutValue } from '../../../utils/LayoutUtils';
import { drawerEnabledControlSelector } from '../../../selectors/controls';
import { info } from '../../../actions/notifications';
import { getMarkerLayerIdentifier } from '../utils/IsochroneUtils';
import { createMarkerSvgDataUrl } from '../../../utils/StyleUtils';
import { mapSelector } from '../../../selectors/map';
import { isInsideVisibleArea } from '../../../utils/CoordinatesUtils';
import { getCurrentResolution } from '../../../utils/MapUtils';
import { boundingMapRectSelector } from '../../../selectors/maplayout';

const OFFSET = DEFAULT_PANEL_WIDTH;

/**
 * Handles isochrone map layout updates
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `UPDATE_MAP_LAYOUT`
 * @return {external:Observable}
 */
export const isochroneMapLayoutEpic = (action$, store) =>
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
 * Adds a marker feature
 * @param {object} latlng - The latitude and longitude
 * @returns {object} The action to add the marker feature
 */
const addMarkerFeature = (latlng, identifier = "temp") => {
    return updateAdditionalLayer(
        getMarkerLayerIdentifier(identifier),
        CONTROL_NAME + '_marker',
        'overlay',
        {
            type: 'vector',
            id: uuid(),
            hideLoading: true,
            visibility: true,
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates:
                    isArray(latlng) ? latlng : [latlng.lng, latlng.lat]},
                properties: { id: "point" }
            }],
            style: {
                format: "geostyler",
                body: {
                    rules: [
                        {
                            filter: ['||', ['==', 'id', 'point']],
                            symbolizers: [
                                {
                                    kind: "Icon",
                                    image: createMarkerSvgDataUrl('#3388ff', 28),
                                    opacity: 1,
                                    size: 28,
                                    rotate: 0,
                                    msBringToFront: true,
                                    anchor: "bottom",
                                    msHeightReference: "none",
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
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `SEARCH_BY_LOCATION_NAME`
 * @return {external:Observable}
 */
export const isochroneSearchByLocationNameEpic = (action$, store) =>
    action$.ofType(SEARCH_BY_LOCATION_NAME)
        .debounceTime(500)
        .switchMap(({ location }) => {
            if (typeof location === 'string') {
                if (!location || location?.trim() === '') {
                    return Observable.of(searchResultsLoaded([]));
                }
                const {services, maxResults} = isochroneSearchConfigSelector(store.getState());
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
                    .startWith(setSearchLoading(true))
                    .takeUntil(action$.ofType(UPDATE_LOCATION, RESET_ISOCHRONE))
                    .concat([setSearchLoading(false)])
                    .catch(e => {
                        const err = {msgId: "search.generic_error", ...e, message: e.message, stack: e.stack};
                        return Observable.from([searchError(err), setSearchLoading(false)]);
                    });
            }
            const { lat, lon: lng } = get(location, 'original.properties', {});
            return Observable.of(addMarkerFeature({ lat, lng }));
        });

/**
 * Handles opening of isochrone
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @return {external:Observable}
 */
export const onOpenIsochroneEpic = (action$, {getState}) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({control}) => control === CONTROL_NAME && enabledSelector(getState()))
        .switchMap(() =>
            Observable.of(
                purgeMapInfoResults(),
                changeMapInfoState(false)
            )
        );

/**
 * Handles selection of location from map
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `SELECT_LOCATION_FROM_MAP`
 * @return {external:Observable}
 */
export const isochroneSelectLocationFromMapEpic = (action$) =>
    action$.ofType(SELECT_LOCATION_FROM_MAP)
        .switchMap(() =>
            action$.ofType(CLICK_ON_MAP)
                .take(1)
                .switchMap(({ point }) => {
                    const { latlng } = point;
                    return Observable.of(
                        changeMousePointer('auto'),
                        updateLocation([latlng.lng, latlng.lat]),
                        addMarkerFeature(latlng)
                    );
                }).startWith(changeMousePointer('pointer'))
        );

export const isochroneUpdateLocationMapEpic = (action$, store) =>
    action$.ofType(UPDATE_LOCATION)
        .filter(({ location }) => !isEmpty(location))
        .switchMap(({ location }) => {
            const state = store.getState();
            const map = mapSelector(state);
            const actions = [
                removeAdditionalLayer({id: getMarkerLayerIdentifier("temp")}),
                addMarkerFeature(location)
            ];
            // Check if location is inside visible map area
            if (map && map.bbox && map.size) {
                const boundingMapRect = boundingMapRectSelector(state);
                const resolution = getCurrentResolution(Math.round(map.zoom), 0, 21, 96);
                const layoutBounds = boundingMapRect && {
                    left: parseLayoutValue(boundingMapRect.left, map.size.width),
                    bottom: parseLayoutValue(boundingMapRect.bottom, map.size.height),
                    right: parseLayoutValue(boundingMapRect.right, map.size.width),
                    top: parseLayoutValue(boundingMapRect.top, map.size.height)
                };
                const coords = { lat: location[1], lng: location[0] };
                const isInsideVisible = isInsideVisibleArea(coords, map, layoutBounds, resolution);

                // pan to the point when location is not inside visible area
                if (!isInsideVisible) {
                    actions.push(panTo({x: coords.lng, y: coords.lat, crs: "EPSG:4326"}));
                }
            }
            return Observable.of(...actions);
        });

/**
 * Handles isochrone run
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `TRIGGER_ISOCHRONE_RUN`
 * @return {external:Observable}
 */
export const onIsochroneRunEpic = (action$) =>
    action$.ofType(TRIGGER_ISOCHRONE_RUN)
        .switchMap(({ isochrone } = {}) => {
            const { bbox, layer, data } = isochrone ?? {};
            const location = get(data, 'config.location', []);
            const runId = uuid();
            const actions = [
                removeAdditionalLayer({id: getMarkerLayerIdentifier("temp")}), // remove temp marker layer
                updateAdditionalLayer(ISOCHRONE_ROUTE_LAYER + `_run_${runId}`, CONTROL_NAME + `_run`, 'overlay', layer),
                zoomToExtent(bbox, "EPSG:4326"),
                ...(!isEmpty(location) ? [addMarkerFeature(location)] : []),
                setIsochrone({...data, id: runId})
            ];
            return Observable.of(...actions);
        });

/**
 * Handles toggling of isochrone control
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @return {external:Observable}
 */
export const onToggleControlIsochroneEpic = (action$, {getState}) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({control}) => control !== CONTROL_NAME && enabledSelector(getState()))
        .switchMap(() => {
            return Observable.of(setControlProperty(CONTROL_NAME, 'enabled', false));
        });

/**
 * Handles closing of isochrone
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `SET_CONTROL_PROPERTY`, `RESET_ISOCHRONE`
 * @return {external:Observable}
 */
export const onCloseIsochroneEpic = (action$, store) =>
    action$.ofType(SET_CONTROL_PROPERTY, RESET_ISOCHRONE, TOGGLE_CONTROL)
        .filter(({control, value, type}) =>
            (control === CONTROL_NAME && (
                (type === SET_CONTROL_PROPERTY && !value) ||
                (type === TOGGLE_CONTROL && !enabledSelector(store.getState()))
            )) || type === RESET_ISOCHRONE)
        .switchMap(({type}) => {
            const owners = isochroneLayersOwnerSelector(store.getState());
            return Observable.of(
                setIsochrone(null),
                updateLocation(null),
                searchResultsLoaded([]),
                setSearchLoading(false),
                setCurrentRunParameters({...DEFAULT_PROVIDER_CONFIG}),
                ...owners.map(owner => removeAllAdditionalLayers(owner)),
                ...(type !== RESET_ISOCHRONE ? [changeMapInfoState(true)] : [])
            );
        });

/**
 * Handles adding of route as layer
 * @memberof epics.isochrone
 * @param {external:Observable} action$ manages `ADD_AS_LAYER`
 * @return {external:Observable}
 */
export const isochroneAddAsLayerEpic = (action$, store) =>
    action$.ofType(ADD_AS_LAYER)
        .switchMap(({ layer = {} }) => {
            return Observable.defer(() => import('@turf/bbox').then(mod => mod.default))
                .switchMap((turfBbox) => {
                    const bbox = turfBbox({ type: 'FeatureCollection', features: layer.features ?? [] });
                    const [minx, miny, maxx, maxy] = bbox || [-180, -90, 180, 90];
                    const isDrawerOpen = drawerEnabledControlSelector(store.getState());
                    return Observable.of(
                        addLayer({
                            ...layer,
                            hideLoading: true,
                            bbox: {
                                crs: 'EPSG:4326',
                                bounds: { minx, miny, maxx, maxy }
                            }
                        }),
                        info({
                            title: 'isochrone.title',
                            message: 'isochrone.notification.infoLayerAdded'
                        }),
                        // Open the drawer indicating a new layer has been added
                        ...(!isDrawerOpen ? [setControlProperty('drawer', 'enabled', true)] : [])
                    );
                });
        });
