import { Observable } from 'rxjs';
import uuid from 'uuid';
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
import { addMarker, resetSearch } from '../actions/search';
import { removeAdditionalLayer, updateAdditionalLayer } from '../actions/additionallayers';
import { SET_CONTROL_PROPERTY, TOGGLE_CONTROL } from '../actions/controls';
import { wrapStartStop } from '../observables/epics';
import { addLayer } from '../actions/layers';

const OFFSET = DEFAULT_PANEL_WIDTH;

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
 * Epic that handles location name search using Nominatim
 * When SEARCH_BY_LOCATION_NAME is dispatched, it:
 * 1. Debounces the search to prevent excessive API calls
 * 2. Sets loading state to true
 * 3. Performs Nominatim search
 * 4. Dispatches results or error
 * 5. Sets loading state to false
 */
export const searchByLocationNameEpic = (action$) =>
    action$.ofType(SEARCH_BY_LOCATION_NAME)
        .debounceTime(500)
        .filter(({ locationName }) => typeof locationName === 'string')
        .switchMap(({ locationName, index }) => {
            if (!locationName || locationName?.trim() === '') {
                return Observable.of(searchResultsLoaded([]));
            }

            const nominatimService = API.Utils.getService('nominatim');
            return Observable.defer(() =>
                nominatimService(locationName, {
                    limit: 10,
                    polygon_geojson: 1,
                    format: 'json'
                })
            )
                .switchMap(results =>
                    Observable.of(searchResultsLoaded(results))
                )
                .catch(error =>
                    Observable.of(searchError(error))
                )
                .let(wrapStartStop(
                    setSearchLoadingByIndex(true, index),
                    setSearchLoadingByIndex(false, index)
                ));
        });

export const onOpenItineraryEpic = (action$, {getState}) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({control}) => control === CONTROL_NAME && enabledSelector(getState()))
        .switchMap(() =>
            Observable.of(
                purgeMapInfoResults(),
                changeMapInfoState(false)
            )
        );

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
                        updateLocations(newLocations),
                        resetSearch(),
                        addMarker({latlng: point?.latlng || {}}),
                        changeMousePointer('auto')
                    );
                }).startWith(changeMousePointer('pointer'))
        );

export const onItineraryRunEpic = (action$) =>
    action$.ofType(TRIGGER_ITINERARY_RUN)
        .switchMap(({itinerary} = {}) => {
            const { bbox, layer, data } = itinerary ?? {};
            return Observable.of(
                resetSearch(),
                updateAdditionalLayer(ITINERARY_ROUTE_LAYER, CONTROL_NAME, 'overlay', layer),
                zoomToExtent(bbox, "EPSG:4326"),
                setItinerary(data)
            );
        });

export const onCloseItineraryEpic = (action$) =>
    action$.ofType(SET_CONTROL_PROPERTY, RESET_ITINERARY)
        .filter(({control, value, type}) =>
            control === CONTROL_NAME && !value || type === RESET_ITINERARY)
        .switchMap(() => {
            return Observable.of(
                setItinerary(null),
                updateLocations([]),
                removeAdditionalLayer({id: ITINERARY_ROUTE_LAYER, owner: CONTROL_NAME})
            );
        });

export const onAddRouteAsLayerEpic = (action$) =>
    action$.ofType(ADD_AS_LAYER)
        .switchMap(({ features, style }) => {
            return Observable.defer(() => import('@turf/bbox').then(mod => mod.default))
                .switchMap((turfBbox) => {
                    const collection = { type: 'FeatureCollection', features };
                    const bbox = turfBbox(collection);
                    const [minx, miny, maxx, maxy] = bbox || [-180, -90, 180, 90];
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
                        })
                    );
                });
        });
