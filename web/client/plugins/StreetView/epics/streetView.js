
import Rx from 'rxjs';
import axios from 'axios';
import bbox from '@turf/bbox';
import {
    RESET_CONTROLS,
    SET_CONTROL_PROPERTIES,
    SET_CONTROL_PROPERTY,
    TOGGLE_CONTROL
} from "../../../actions/controls";
import { info, error } from '../../../actions/notifications';

import { updateAdditionalLayer, removeAdditionalLayer } from '../../../actions/additionallayers';
import {CLICK_ON_MAP, registerEventListener, unRegisterEventListener, zoomToExtent} from '../../../actions/map';


import {hideMapinfoMarker, toggleMapInfoState} from '../../../actions/mapInfo';
import { mapInfoEnabledSelector } from "../../../selectors/mapInfo";

import { CONTROL_NAME, MARKER_LAYER_ID, STREET_VIEW_OWNER, STREET_VIEW_DATA_LAYER_ID } from "../constants";
import {
    streetViewProviderSelector,
    currentProviderApiLoadedSelector,
    enabledSelector,
    getStreetViewMarkerLayer,
    getStreetViewDataLayer,
    locationSelector,
    povSelector,
    useStreetViewDataLayerSelector,
    streetViewDataLayerSelector,
    streetViewConfigurationSelector
} from "../selectors/streetView";
import {setLocation, SET_LOCATION, SET_POV, UPDATE_STREET_VIEW_LAYER } from '../actions/streetView';
import API from '../api';
import {shutdownToolOnAnotherToolDrawing} from "../../../utils/ControlUtils";
import { mapTypeSelector } from '../../../selectors/maptype';
import StreetViewCirclewIcon from '../../../product/assets/img/circle-streetview-marker-icon.png';

/**
 * Intercept on `TOGGLE_CONTROL` of street-view component
 * to deactivate and clean up mapInfo and restore it on panel close.
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @param getState
 * @return {external:Observable}
 */
export const disableGFIForStreetViewEpic = (action$, { getState = () => { } }) =>
    action$
        .ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES)
        .filter(({control}) => control === CONTROL_NAME)
        // if the enable event happens when the mapInfo is active
        .filter(() => enabledSelector(getState()))
        .filter(() => mapInfoEnabledSelector(getState()))
        .switchMap(() => {
            // deactivate feature info
            return Rx.Observable.of(hideMapinfoMarker(),
                toggleMapInfoState()
            ).merge(
                // restore feature info on close
                action$.ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES)
                    .filter(({control}) => control === CONTROL_NAME)
                    .take(1)
                    .filter(() => !enabledSelector(getState()))
                    .filter(() => !mapInfoEnabledSelector(getState()))
                    .mapTo(toggleMapInfoState())
                    .takeUntil(action$.ofType(RESET_CONTROLS))
            );
        });
/**
 * Intercept street view open/close event. Adds / Removes the additional layer from the map
 * @param {external:Observable} action$ manages `TOGGLE_CONTROL`
 * @param getState
 * @return {external:Observable}
 */
export const streetViewSetupTearDown = (action$, {getState = ()=>{}}) =>
    action$
        .ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES)
        .filter(({control}) => control === CONTROL_NAME)
        .filter(() => enabledSelector(getState()))
        .switchMap(() => {
            // setup
            let streetViewConfigration = streetViewConfigurationSelector(getState());
            let streetViewDataLayer = { ...streetViewDataLayerSelector(getState()) };
            const isMapillaryProvider = streetViewConfigration?.provider === 'mapillary';
            if (isMapillaryProvider) {
                const providedApiURL = streetViewConfigration?.providerSettings?.ApiURL;
                // show notification in case the service url is not provided
                if (!providedApiURL) {
                    return Rx.Observable.of(
                        error({title: "streetView.title", message: "streetView.messages.errorServiceUrl"})
                    );
                }
                streetViewDataLayer = { ...streetViewDataLayer, url: providedApiURL, type: streetViewConfigration?.providerSettings?.type || 'vector' };
            }
            const isMapillaryCustomLayer = streetViewDataLayer.url && isMapillaryProvider;

            // in case of mapillary custom data --> get featureCollection and pass it to layer
            return Rx.Observable.fromPromise(
                isMapillaryCustomLayer ? axios.get(streetViewDataLayer.url).then(res => res.data).catch(err => {
                    err.code = 'FAIL_TO_FETCH_DATA';
                    throw err;
                }) : new Promise(resolve => resolve())).switchMap((featureCollcetion) => {
                let actions = [];
                // in case custom layer for mapillary and feature collection data --> add zoom to extent action assuming the srs = EPSG:4326 as a default
                if (isMapillaryCustomLayer && featureCollcetion?.features?.length) actions.push(zoomToExtent(bbox(featureCollcetion), "EPSG:4326"));
                // the default actions for any streetView provider
                actions.push(registerEventListener('click', CONTROL_NAME),
                    ...(useStreetViewDataLayerSelector(getState())
                        ? [updateAdditionalLayer(
                            STREET_VIEW_DATA_LAYER_ID,
                            STREET_VIEW_OWNER,
                            'overlay',
                            {
                                id: STREET_VIEW_DATA_LAYER_ID,
                                name: STREET_VIEW_DATA_LAYER_ID,
                                visibility: true,
                                ...streetViewDataLayer,
                                features: featureCollcetion?.features || []
                            })]
                        : []
                    ),
                    updateAdditionalLayer(
                        MARKER_LAYER_ID,
                        STREET_VIEW_OWNER,
                        'overlay',
                        {
                            id: MARKER_LAYER_ID,
                            type: "vector",
                            name: MARKER_LAYER_ID,
                            visibility: true

                        })
                );
                return Rx.Observable.from(actions).concat(
                    // tear down
                    action$
                        .ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES)
                        .filter(({control}) => control === CONTROL_NAME)
                        .filter(() => !enabledSelector(getState()))
                        .merge(action$.ofType(RESET_CONTROLS))
                        .take(1)
                        .switchMap(() => {
                            return  Rx.Observable.from([
                                unRegisterEventListener('click', CONTROL_NAME),
                                ...(useStreetViewDataLayerSelector(getState()) ? [removeAdditionalLayer({id: STREET_VIEW_DATA_LAYER_ID, owner: STREET_VIEW_OWNER})] : []),
                                removeAdditionalLayer({id: MARKER_LAYER_ID, owner: STREET_VIEW_OWNER})
                            ]);
                        })
                );
            }).catch((err) => {
                return Rx.Observable.of(
                    error({title: "streetView.title", message: err.code === 'FAIL_TO_FETCH_DATA' ? "streetView.messages.errorRetriveingLayerData" : "streetView.messages.unknownError"})
                );
            });
        });
/**
 * Intercept street view Click events to retrieve location info from street view API and update
 * the state.
 * @param {external:Observable} action$ manages `CLICK_ON_MAP` when the street-view tool is active
 * @param getState
 * @return {external:Observable}
 */
export const streetViewMapClickHandler = (action$, {getState = () => {}}) => {
    return action$.ofType(CLICK_ON_MAP)
        .filter(() => enabledSelector(getState()))
        .filter(() => currentProviderApiLoadedSelector(getState()))
        .switchMap(({point}) => {
            const provider = streetViewProviderSelector(getState());
            const getLocation = API[provider]?.getLocation;
            if (!getLocation) {
                return Rx.Observable.of(
                    error({title: "streetView.title", message: "streetView.messages.providerNotSupported"})
                );
            }
            return Rx.Observable
                .defer(() => getLocation(point))
                .map(setLocation)
                .catch((e) => {
                    if (e.code === "ZERO_RESULTS") {
                        return Rx.Observable.of(
                            info({title: "streetView.title", message: "streetView.messages.noDataForPosition"})
                        );
                    }
                    console.error(e); //
                    return Rx.Observable.of(
                        error({title: "streetView.title", message: "streetView.messages.unknownError"})
                    );
                });
        });
};
/**
 * On location update events updates the map layer.
 * the state.
 * @param {external:Observable} action$ manages `SET_LOCATION`, `UPDATE_STREET_VIEW_LAYER`
 * @param getState
 * @return {external:Observable}
 */
export const streetViewSyncLayer = (action$, {getState = () => {}}) => {

    const locationToFeature = (location) => {
        if (!location) return null;
        const {lat, lng, h = 0} = location?.latLng;
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lng, lat, h],
                crs: "EPSG:4326"
            },
            properties: {
                id: "c65cadc0-9b46-11ea-a138-dd5f1faf9a0d"
            }
        };
    };
    return action$.ofType(SET_LOCATION, SET_POV).switchMap(() => {
        const state = getState();
        const mapType = mapTypeSelector(state);
        const isCesium = mapType === 'cesium';
        const location = locationSelector(state);
        const pov = povSelector(state);
        if (!location) {
            return Rx.Observable.empty();
        }
        return Rx.Observable.of(locationToFeature(location, pov, isCesium)).map((feature) => {
            const options = getStreetViewMarkerLayer(getState());
            return updateAdditionalLayer(
                MARKER_LAYER_ID,
                STREET_VIEW_OWNER,
                "overlay", {...options, features: [feature], style: {
                    format: 'geostyler',
                    body: {
                        rules: [
                            { symbolizers: [{
                                "kind": "Icon",
                                image: StreetViewCirclewIcon,
                                opacity: 1,
                                size: 100,
                                anchor: "center",
                                rotate: pov?.heading || 0,
                                msBringToFront: true,
                                msHeightReference: 'none'
                            }]
                            }]
                    }}}
            );
        });
    })
        .merge(action$.ofType(UPDATE_STREET_VIEW_LAYER).switchMap(({updates = {}}) => {
            const options = getStreetViewDataLayer(getState());
            return Rx.Observable.of(updateAdditionalLayer(
                STREET_VIEW_DATA_LAYER_ID,
                STREET_VIEW_OWNER,
                'overlay',
                {...options, ...updates}));
        }));
};

/**
 * Closes street-view tool when one of the drawing tools takes control
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
export const tearDownStreetViewOnDrawToolActive = (action$, store) => shutdownToolOnAnotherToolDrawing(action$, store, CONTROL_NAME);
