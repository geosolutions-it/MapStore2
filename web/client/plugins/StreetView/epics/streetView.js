
import Rx from 'rxjs';
import axios from 'axios';
import {
    RESET_CONTROLS,
    SET_CONTROL_PROPERTIES,
    SET_CONTROL_PROPERTY,
    TOGGLE_CONTROL
} from "../../../actions/controls";
import { info, error } from '../../../actions/notifications';

import { updateAdditionalLayer, removeAdditionalLayer } from '../../../actions/additionallayers';
import { CLICK_ON_MAP, registerEventListener, unRegisterEventListener } from '../../../actions/map';


import {hideMapinfoMarker, changeMapInfoState} from '../../../actions/mapInfo';
import { mapInfoEnabledSelector } from "../../../selectors/mapInfo";

import { CONTROL_NAME, STREET_VIEW_OWNER, STREET_VIEW_DATA_LAYER_ID } from "../constants";
import {
    streetViewProviderSelector,
    currentProviderApiLoadedSelector,
    enabledSelector,
    getStreetViewDataLayer,
    useStreetViewDataLayerSelector,
    streetViewDataLayerSelector
} from "../selectors/streetView";
import {setLocation, UPDATE_STREET_VIEW_LAYER } from '../actions/streetView';
import API from '../api';
import {shutdownToolOnAnotherToolDrawing} from "../../../utils/ControlUtils";

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
        .switchMap(() => {
            // deactivate feature info
            return Rx.Observable.of(hideMapinfoMarker(),
                changeMapInfoState(false) // always disable feature info
            ).merge(
                // restore feature info on close
                action$.ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY, SET_CONTROL_PROPERTIES)
                    .filter(({control}) => control === CONTROL_NAME)
                    .take(1)
                    .filter(() => !enabledSelector(getState()))
                    .filter(() => !mapInfoEnabledSelector(getState()))
                    .mapTo(changeMapInfoState(true))
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

            return Rx.Observable.defer(() => {
                const layer = streetViewDataLayerSelector(getState());
                if (layer === null) {
                    return Promise.resolve(null);
                }
                const defaultProperties = {
                    id: STREET_VIEW_DATA_LAYER_ID,
                    name: STREET_VIEW_DATA_LAYER_ID,
                    visibility: true
                };
                // if the vector layer passed by the selector has a url
                // it means that the features must be requested
                if (layer.type === 'vector' && layer.url) {
                    const { url, ...vectorLayer } = layer || {};
                    return axios.get(`${url}index.json`)
                        .then(({ data: collection }) => {
                            return {
                                ...defaultProperties,
                                ...vectorLayer,
                                features: collection?.features || {}
                            };
                        })
                        .catch(err => {
                            err.code = 'FAIL_TO_FETCH_DATA';
                            throw err;
                        });
                }
                return Promise.resolve({
                    ...defaultProperties,
                    ...layer
                });
            }).switchMap((layer) => {
                // setup
                return Rx.Observable.from([
                    registerEventListener('click', CONTROL_NAME),
                    ...(useStreetViewDataLayerSelector(getState())
                        ? [
                            ...(layer !== null ? [updateAdditionalLayer(
                                STREET_VIEW_DATA_LAYER_ID,
                                STREET_VIEW_OWNER,
                                'overlay',
                                layer
                            )] : [])
                        ]
                        : []
                    )
                ]).concat(
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
                                ...(useStreetViewDataLayerSelector(getState()) ? [removeAdditionalLayer({id: STREET_VIEW_DATA_LAYER_ID, owner: STREET_VIEW_OWNER})] : [])
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
 * @param {external:Observable} action$ manages `UPDATE_STREET_VIEW_LAYER`
 * @param getState
 * @return {external:Observable}
 */
export const streetViewSyncLayer = (action$, {getState = () => {}}) => {
    return action$.ofType(UPDATE_STREET_VIEW_LAYER)
        .switchMap(({updates = {}}) => {
            const options = getStreetViewDataLayer(getState());
            return Rx.Observable.of(updateAdditionalLayer(
                STREET_VIEW_DATA_LAYER_ID,
                STREET_VIEW_OWNER,
                'overlay',
                {...options, ...updates}));
        });
};

/**
 * Closes street-view tool when one of the drawing tools takes control
 * @param action$
 * @param store
 * @returns {Observable<unknown>}
 */
export const tearDownStreetViewOnDrawToolActive = (action$, store) => shutdownToolOnAnotherToolDrawing(action$, store, CONTROL_NAME);
