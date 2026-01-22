
import { Observable } from "rxjs";
import { SET_LAYERIDS, SET_ENABLED, SET_INTERVAL, setLayerIds, setEnabled, setInterval } from "../actions/autorefresh";
import { CONTROL_NAME } from '../constants';

export const autorefreshSetLayerIdsEpic = (action$, store) =>
    action$.ofType(SET_LAYERIDS)
        .switchMap(({layerIds}) => {
            console.debug('[arxit][epic] layerIds', layerIds);

            return Observable.empty();
        });


export const autorefreshSetEnabledEpic = (action$, store) =>
    action$.ofType(SET_ENABLED)
        .switchMap(({enabled}) => {
            console.debug('[arxit][epic] enabled', enabled);

            return Observable.empty();
        });


export const autorefreshSetIntervalEpic = (action$, store) =>
    action$.ofType(SET_INTERVAL)
        .switchMap(({interval}) => {
            console.debug('[arxit][epic] interval', interval);

            return Observable.empty();
        });

