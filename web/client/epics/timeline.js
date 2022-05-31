
import Rx from 'rxjs';
import { isString, get, head, castArray } from 'lodash';
import moment from 'moment';
import { wrapStartStop } from '../observables/epics';
import { CHANGE_MAP_VIEW } from '../actions/map';

import {
    SELECT_TIME,
    RANGE_CHANGED,
    ENABLE_OFFSET,
    SET_MAP_SYNC,
    AUTOSELECT,
    timeDataLoading,
    rangeDataLoaded,
    onRangeChanged,
    selectLayer,
    SELECT_LAYER
} from '../actions/timeline';

import { setCurrentTime, UPDATE_LAYER_DIMENSION_DATA, setCurrentOffset } from '../actions/dimension';
import { REMOVE_NODE, CHANGE_LAYER_PROPERTIES } from '../actions/layers';
import { error } from '../actions/notifications';
import { getLayerFromId } from '../selectors/layers';

import {
    expandLimitSelector,
    rangeSelector,
    selectedLayerName,
    selectedLayerUrl,
    isAutoSelectEnabled,
    selectedLayerSelector,
    snapTypeSelector,
    timelineLayersSelector,
    multidimOptionsSelectorCreator,
    isMapSync
} from '../selectors/timeline';

import {
    layerTimeSequenceSelectorCreator,
    timeDataSelector,
    offsetTimeSelector,
    currentTimeSelector
} from '../selectors/dimension';

import { getNearestDate, roundRangeResolution, isTimeDomainInterval } from '../utils/TimeUtils';
import { getHistogram, describeDomains } from '../api/MultiDim';
import { getTimeDomainsObservable } from '../observables/multidim';

const TIME_DIMENSION = "time";
// const DEFAULT_RESOLUTION = "P1W";
// const MAX_ITEMS_PER_LAYER = 20;
const MAX_HISTOGRAM = 20;

/**
 * Gets the getDomain args for retrieve **single** value surrounding current time for the selected layer
 * @param {object} state application state
 * @param {object} paginationOptions
 */
// TODO: there is another function called with the same name in epics/p
const domainArgs = (getState, paginationOptions = {}) => {
    const id = selectedLayerSelector(getState());
    const layerName = selectedLayerName(getState());
    const layerUrl = selectedLayerUrl(getState());
    const bboxOptions = multidimOptionsSelectorCreator(id)(getState());
    const fromEnd = snapTypeSelector(getState()) === 'end';
    return [layerUrl, layerName, "time", {
        limit: 1,
        ...paginationOptions,
        fromEnd
    }, bboxOptions];
};
/**
 * creates an observable that emit a time that snap the values of the selected layer to the current time
 */
const snapTime = (getState, group, time) => {
    // TODO: evaluate to snap to clicked layer instead of current selected layer, and change layer selection
    // TODO: support local list of values for no multidim-extension.
    const state = getState();
    if (selectedLayerName(state)) {
        const snapType = snapTypeSelector(state);
        return getTimeDomainsObservable(domainArgs, false, getState, snapType, time).map(values => {
            return getNearestDate(values.filter(v => !!v), time, snapType) || time;
        });
    }

    const timeValues = layerTimeSequenceSelectorCreator(getLayerFromId(state, group))(state);
    return Rx.Observable.of(getNearestDate(timeValues, time) || time);

};
const snap = true; // TODO: externalize to make this configurable.

const toISOString = date => isString(date) ? date : date.toISOString();

/**
 * Creates a stream to retrieve histogram/domain values.
 *
 * @param {string} id layer id
 * @param {object} timeData the object that represent the domain source. Contains the URL to the service
 * @param {function} getState return the state of the application
 * @returns a stream of data with histogram and/or domain values
 */
const loadRangeData = (id, timeData, getState) => {
    /**
     * when there is no timeline state rangeSelector(getState()) returns undefined, so instead we use the timeData[id] range
     */
    const dataRange = timeData.domain.split('--');

    const initialRange = rangeSelector(getState()) || {start: new Date(dataRange[0]), end: new Date(dataRange[1])};

    const {range, resolution} = roundRangeResolution( initialRange, MAX_HISTOGRAM);
    const layerName = getLayerFromId(getState(), id).name;
    const expandLimit = expandLimitSelector(getState());
    const filter = {
        [TIME_DIMENSION]: `${toISOString(range.start)}/${toISOString(range.end)}`
    };
    return getHistogram(
        timeData.source.url,
        layerName,
        TIME_DIMENSION,
        {
            [TIME_DIMENSION]: `${toISOString(range.start)}/${toISOString(range.end)}`
        },
        resolution,
        multidimOptionsSelectorCreator(id)(getState())
    )
        .merge(
            describeDomains(
                timeData.source.url,
                layerName,
                filter,
                {
                    ...multidimOptionsSelectorCreator(id)(getState()),
                    expandLimit
                }
            )
        )
        .scan((acc, val) => ({...acc, ...val}), {})
        .switchMap(({ Histogram: histogram, Domains: domains }) => {
            const domain = get(
                head(
                    castArray(
                        get(domains, "DimensionDomain") || []
                    ).filter(
                        ({ Identifier } = {}) => Identifier === TIME_DIMENSION
                    )
                ),
                "Domain"
            );
            let values;
            try {
                values = histogram && histogram.Values && histogram.Values.split(',').map(v => parseInt(v, 10)) || [];
            } catch (e) {
                values = []; // TODO notify some issue
            }

            const domainValues = domain && domain.indexOf('--') < 0 && domain.split(',');

            /*
         * shape of range: {start: "T_START", end: "T_END"}
         * shape of histogram {values: [1, 2, 3], domain: "T_START/T_END/RESOLUTION" }
         * shape of domain: {values: ["T1", "T2", ....]}, present only if not in the form "T1--T2"
         */
            return Rx.Observable.of({
                range,
                histogram: histogram && histogram.Domain
                    ? {
                        values,
                        domain: histogram.Domain
                    }
                    : undefined,
                domain: domain
                    ? {
                        values: domainValues
                    }
                    : undefined
            });
        });
};


/**
 * when a time is selected from timeline, tries to snap to nearest value and set the current time
 */
export const setTimelineCurrentTime = (action$, {getState = () => {}} = {}) =>
    action$.ofType(SELECT_TIME)
        .throttleTime(100) // avoid multiple request in case of mouse events drag and click
        .switchMap( ({time, group}) => {
            const state = getState();

            if (snap && group) {
                return snapTime(getState, group, time)
                    .switchMap( t => {
                        const currentViewRange = rangeSelector(state);
                        const {
                            start,
                            end
                        } = currentViewRange || {};
                        let actions = [];
                        // re- center the view is snapped time is out of view range
                        if (start && end && (moment(t).isBefore(start) || moment(t).isAfter(end))) {
                            const rangeDistance = moment(end).diff(start);
                            actions = [onRangeChanged({
                                start: moment(t).subtract(rangeDistance / 2),
                                end: moment(t).add(rangeDistance / 2)
                            })];
                        }
                        return Rx.Observable.from([...actions, setCurrentTime(t)]);
                    })
                    .let(wrapStartStop(timeDataLoading(false, true), timeDataLoading(false, false)))
                ;
            }
            return Rx.Observable.of(setCurrentTime(time));
        });
/**
 * Initialize the time line and syncs the timeline guide layers on certain layer events
 * @memberof epics.timeline
 * @param {observable} action$ manages `AUTOSELECT` `REMOVE_NODE` `CHANGE_LAYER_PROPERTIES` `SELECT_LAYER`
 * @param {function} getState to fetch the store object
 * @return {observable}
 */
export const syncTimelineGuideLayer = (action$, { getState = () => { } } = {}) =>
    action$.ofType(AUTOSELECT)// Initializes timeline
        .merge(
            action$.ofType(REMOVE_NODE, CHANGE_LAYER_PROPERTIES) // Or when the guide layer is removed or hidden
                .withLatestFrom(action$.ofType(SELECT_LAYER), (_, {layerId: _layer})  =>
                    _layer && !timelineLayersSelector(getState()).some(l=>l.id === _layer) // Retain selection when guide layer present
                )
                .filter(layer => !!layer) // Emit only if a guide layer was selected before remove node or change layer's visibility
        )
        .switchMap(() => {
            const state = getState();
            const firstTimeLayer = get(timelineLayersSelector(state), "[0].id");
            if (isAutoSelectEnabled(state) && firstTimeLayer) {
                return Rx.Observable.of(selectLayer(firstTimeLayer)); // Select the first guide layer from the list and snap time
            }
            return Rx.Observable.empty();
        });

/**
 * Snap time of the selected layer
 * @memberof epics.timeline
 * @param {observable} action$ manages `SELECT_LAYER`
 * @param {function} getState to fetch the store object
 * @return {observable}
 */
export const snapTimeGuideLayer = (action$, { getState = () => { } } = {}) =>
    action$.ofType(SELECT_LAYER)
        .filter((action)=> action?.layerId && isAutoSelectEnabled(getState()))
        .switchMap(({layerId}) => snapTime(getState, layerId, currentTimeSelector(getState()) || new Date().toISOString())
            .filter(v => v)
            .map(time => setCurrentTime(time))
        );

/**
 * When offset is initiated this epic sets both initial current time and offset if any does not exist
 * The policy is:
 *  - if current time is not defined, it will be placed to the center of the current timeline's viewport. If the viewport is undefined it is set to "now"
 *  - if offsetTime is not defined, it will be placed at 1/ RATIO * (current viewport size) distance from current time (to make it visible). If viewport is not defined, 1 day from the current time
 *  - At the end, if the viewport is not defined, it will be placed to center the current time. This way the range will be visible when the timeline is available.
 *
 */
export const settingInitialOffsetValue = (action$, {getState = () => {}} = {}) =>
    action$.ofType(ENABLE_OFFSET)
        .switchMap( (action) => {
            const RATIO = 5; // ratio of the size of the offset to set relative to the current viewport, if set
            const state = getState();
            const time = currentTimeSelector(state);
            const currentViewRange = rangeSelector(state);
            // find out current viewport range, if exist, to define a good offset to use as default
            if (action.enabled) {
                const {
                    start = 0,
                    end = 1000 * 60 * 60 * 24 * RATIO // this makes the offset 1 day by default, if timeline is not initialized
                } = currentViewRange || {};
                const currentOffset = offsetTimeSelector(state);
                const rangeDistance = moment(end).diff(start);
                // Set current moment, if not set yet, to current viewport center. otherwise, it is set to now.
                let currentMoment = currentViewRange ? moment(start).add(rangeDistance / 2).toISOString() : moment(new Date()).toISOString();

                const initialOffsetTime = moment(time ? time : currentMoment).add(rangeDistance / RATIO);
                let setTime = action.enabled && !time ? Rx.Observable.of(setCurrentTime(currentMoment)) : Rx.Observable.empty();
                let setOff = action.enabled && !currentOffset || action.enabled && moment(currentOffset).diff(time) < 0 ? Rx.Observable.of(setCurrentOffset(initialOffsetTime.toISOString()))
                    : Rx.Observable.empty();
                const centerToCurrentViewRange = currentViewRange ? Rx.Observable.empty() : Rx.Observable.of(
                    onRangeChanged({
                        start: moment(currentMoment).add(-1 * rangeDistance / 2),
                        end: moment(currentMoment).add(rangeDistance / 2)
                    })
                );
                return setTime.concat(setOff).concat(centerToCurrentViewRange);
            }
            return Rx.Observable.of(setCurrentOffset());
        // disable by setting off the offset
        });
/**
 * Update the time data when the timeline range changes, or when the layer dimension data is
 * updated (for instance when a layer is added to the map)
 */
export const updateRangeDataOnRangeChange = (action$, { getState = () => { } } = {}) =>
    action$.ofType(RANGE_CHANGED)
        .merge(
            action$.ofType(CHANGE_MAP_VIEW).filter(() => isMapSync(getState())),
            action$.ofType(SET_MAP_SYNC)
        )
        .debounceTime(400)
        .merge(action$.ofType(UPDATE_LAYER_DIMENSION_DATA).debounceTime(50))
        .switchMap( () => {
            const timeData = timeDataSelector(getState()) || {};
            const layerIds = Object.keys(timeData).filter(id => timeData[id] && timeData[id].domain
                // when data is already fully downloaded, no need to refresh, except if the mapSync is active
                && (isTimeDomainInterval(timeData[id].domain)) || isMapSync(getState()));
            // update range data for every layer that need to sync with histogram/domain
            return Rx.Observable.merge(
                ...layerIds.map(id =>
                    loadRangeData(id, timeData[id], getState).map(({ range, histogram, domain }) => rangeDataLoaded(
                        id,
                        range,
                        histogram,
                        domain
                    ))
                        .startWith(timeDataLoading(id, true))
                        .catch(() => Rx.Observable.of(error({
                            uid: "error_with_timeline_update",
                            title: "timeline.errors.multidim_error_title",
                            message: "timeline.errors.multidim_error_message"
                        })))
                        .concat( Rx.Observable.of(timeDataLoading(id, false)))
                ));

        });

export default {
    setTimelineCurrentTime,
    settingInitialOffsetValue,
    updateRangeDataOnRangeChange,
    syncTimelineGuideLayer,
    snapTimeGuideLayer
};
