import Rx from "rxjs";

import { MAP_CONFIG_LOADED } from "../../../actions/config";
import { ADD_LAYER, CHANGE_LAYER_PARAMS, CHANGE_LAYER_PROPERTIES, refreshLayerVersion, REMOVE_NODE, UPDATE_NODE } from "../../../actions/layers";
import { AUTOREFRESH_START, AUTOREFRESH_STOP, AUTOREFRESH_PAUSE } from "../actions/autorefresh";
import { isActiveRefresh, isPaused, refreshableLayers } from "../selectors/autorefresh";

const TRIGGERS = [
    CHANGE_LAYER_PROPERTIES,   // visibility toggle
    CHANGE_LAYER_PARAMS,
    UPDATE_NODE,               // autoRefreshInterval update
    ADD_LAYER,
    REMOVE_NODE,
    MAP_CONFIG_LOADED,          // init
    AUTOREFRESH_START,          // initiate the flow
    AUTOREFRESH_STOP,           // stops the flow
    AUTOREFRESH_PAUSE           // ADD PAUSE ACTION THAT blocks execution if when feature editor is in edit mode, this action will be triggered by the refresh plugin itself that will listen for changes to the featuregrid.mode property and trigger it when that the mode value changes like a toggle action, the pause value can be stored inside autorefresh reducer
];

const isEqual = (a, b) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(key => a[key] === b[key]);
};

export const layersAutoRefreshEpic = (action$, store) => {
    const getLayersMap = () => isPaused(store.getState()) || !isActiveRefresh(store.getState()) ?
        {} :
        refreshableLayers(store.getState()).reduce((acc, l) => ({ ...acc, [l.id]: l.autoRefreshInterval }), {});

    // this stream should emit refreshable layers map on every possible change,
    // but not when paused or refesh is not active (toggled on)
    const active$ = action$.ofType(...TRIGGERS)
        .map(getLayersMap)
        .startWith(getLayersMap())
        .distinctUntilChanged(isEqual) // if some of the layer interval changed (or list change) triggers
        .publishReplay(1).refCount(); // activate multicast

    return active$
        .mergeMap(m => Object.keys(m).map(id => ({ id, interval: m[id] })))
        // durationSelector completes (and deregisters) the group when the layer is removed,
        // so groupBy can create a brand new group if the same id reappears later
        .groupBy(d => d.id, d => d, group$ => active$.filter(m => !m[group$.key]))
        // this merges N stream actions, 1 for each layer that needs a refresh, each one with its own timer
        .mergeMap(group$ => {
            const id = group$.key;
            const removed$ = active$.filter(m => !m[id]);   // this intercepts when a layer is not in the map anymore
            return group$
                .map(d => d.interval)
                .distinctUntilChanged()                     // if change interval, rebuild the timer
                .switchMap(interval =>
                    Rx.Observable.timer(0, interval * 1000)
                        .map(() => {
                            const time = new Date().getTime();
                            return refreshLayerVersion(id, time);
                        })
                )
                .takeUntil(removed$);
        });
};
