
import Rx from 'rxjs';
import { isString, get, head, castArray, isEmpty, isNil } from 'lodash';
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
    SELECT_LAYER,
    INIT_TIMELINE,
    RESET_TIMELINE,
    initializeSelectLayer,
    INIT_SELECT_LAYER,
    initializeRange,
    SET_RANGE_INIT,
    autoselect,
    setEndValuesSupport,
    setSnapRadioButtonEnabled,
    selectTime,
    setTimeLayers
} from '../actions/timeline';

import { setCurrentTime, UPDATE_LAYER_DIMENSION_DATA, setCurrentOffset } from '../actions/dimension';
import { REMOVE_NODE, CHANGE_LAYER_PROPERTIES, UPDATE_NODE } from '../actions/layers';
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
    isMapSync,
    settingsSelector,
    endValuesSupportSelector,
    timelineLayersSetting
} from '../selectors/timeline';

import {
    layerTimeSequenceSelectorCreator,
    timeDataSelector,
    offsetTimeSelector,
    currentTimeSelector,
    visibleLayersWithTimeDataSelector,
    layerDimensionDataSelectorCreator,
    offsetEnabledSelector,
    layersWithTimeDataSelector
} from '../selectors/dimension';

import { getNearestDate, roundRangeResolution, isTimeDomainInterval, getStartEndDomainValues } from '../utils/TimeUtils';
import { getHistogram, describeDomains } from '../api/MultiDim';
import { getNearestTimesObservable } from '../observables/multidim';
import { MAP_CONFIG_LOADED } from '../actions/config';

const TIME_DIMENSION = "time";
// const DEFAULT_RESOLUTION = "P1W";
// const MAX_ITEMS_PER_LAYER = 20;
const MAX_HISTOGRAM = 20;

/**
 * Gets the getDomain args for retrieve **single** value surrounding current time for the selected layer
 * @param {object} getState application state
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
        return getNearestTimesObservable(domainArgs, true, getState, snapType, time).map(values => {
            return getNearestDate(values.filter(v => !!v), time, snapType) || time;
        });
    }

    const timeValues = layerTimeSequenceSelectorCreator(getLayerFromId(state, group))(state);
    return Rx.Observable.of(getNearestDate(timeValues, time) || time);

};
const snap = true; // TODO: externalize to make this configurable.

const toISOString = date => isString(date) ? date : date.toISOString();

const RATIO = 5; // ratio of the size of the offset to set relative to the current viewport, if set

/**
 * Creates a stream to retrieve histogram/domain values.
 *
 * @param {string} id layer id
 * @param {object} timeData the object that represent the domain source. Contains the URL to the service
 * @param {function} getState return the state of the application
 * @returns {*} a stream of data with histogram and/or domain values
 */
const loadRangeData = (id, timeData, getState) => {
    let initialRange = rangeSelector(getState());
    // when there is no timeline state rangeSelector(getState()) returns undefined, so instead we use the timeData[id] range
    if (!initialRange) {
        const dataRange = getStartEndDomainValues(timeData.domain);
        // dateRange is only 1 value for single values (extreme case, to avoid errors)
        initialRange = {start: new Date(dataRange[0]), end: new Date(dataRange[1] || dataRange[0])};
    }

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
 * Update timeline with current, offset and the range data
 * on range initialization
 * @param state application state
 * @param {string|string[]} value the range values. It can be an array or a domain string. (`start--end`, `start,x1,x2,x3,end` or `start,end`)
 * @param {string} [currentTime]
 * @returns {Observable}
 */
const updateRangeOnInit = (state, value, currentTime) => {
    const { isFullRange, offsetTime } = state;
    // The startTime and endTime is full range of the layer
    let values;

    // convert to array (evaluate to use getStartEndDomainValues instead)
    if (isString(value)) {
        if (value.indexOf('--') > 0) {
            values = value.split('--');
        } else if (value.indexOf(',') > 0) {
            values = value.split(',');
        } else {
            values = [value]; // single value is the last chance
        }
    } else {
        values = value;
    }
    // if values are intervals (separated by /) spread them in the array
    values = values.reduce((acc, v) => acc.concat(v.split('/')), []);
    if (values.length > 2) {
        values = [values[0], values[values.length - 1]]; // more than 2 values, start and end are the first and last values
    }

    let [startTime, endTime] = values?.filter(v => !!v) || [];
    const start = isFullRange ? startTime ?? currentTime : currentTime;

    // Set the offset 1 day by default
    const rangeDistance = moment(1000 * 60 * 60 * 24 * RATIO).diff(0);
    const defaultOffset = moment(new Date()).add(rangeDistance / RATIO).toISOString();

    const end = isFullRange ? endTime ?? defaultOffset : (offsetTime ?? defaultOffset);
    const difference = moment(end).diff(moment(start));
    const nextEnd = moment(start).add(difference).toISOString();
    // Set current, offset and the range of the timeline
    return Rx.Observable.of(setCurrentTime(start))
        .concat(Rx.Observable.of(setCurrentOffset(end)))
        .concat(Rx.Observable.of(
            onRangeChanged({
                start: startTime,
                end: nextEnd
            })
        ));
};

/**
 * Initialize the layer selected
 * with first layer from the list of time layers
 * @param {object} state
 * @param {boolean} allowSnap control the snap time operation
 * @return {{layerId: string, type: string, snap: boolean}}
 */
const initializeSelectLayerWithSnap = (state, allowSnap) =>
    initializeSelectLayer(get(visibleLayersWithTimeDataSelector(state), "[0].id"), allowSnap);

/**
 * Updates timeline state for layers that has multidimensional extension
 * @param action$
 * @return {observable}
 */
export const updateTimelineDataOnMapLoad = (action$) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .filter(({config} = {}) => !isEmpty(config))
        .switchMap(({config} = {}) => {
            const selectedLayer = config?.timelineData?.selectedLayer;
            const currentTime = config?.dimensionData?.currentTime;
            const endValuesSupport = config?.timelineData?.endValuesSupport;
            const snapRadioButtonEnabled = config?.timelineData?.snapRadioButtonEnabled;
            const layers = config?.timelineData?.layers;
            return Rx.Observable.of(
                ...(!isEmpty(selectedLayer) ? [initializeSelectLayer(selectedLayer)] : []),
                ...(!isNil(endValuesSupport) ? [setEndValuesSupport(endValuesSupport)] : []),
                ...(!isNil(snapRadioButtonEnabled) ? [setSnapRadioButtonEnabled(snapRadioButtonEnabled)] : []),
                ...(!isEmpty(layers) ? [setTimeLayers(layers)] : [])
            ).concat(Rx.Observable.of(...(isEmpty(currentTime) ? [autoselect()] : [])));
        });

/**
 * Update timeline when the layer dimension data is updated
 * (i.e. when a layer is added to the map)
 * @param action$
 * @param getState
 * @return {observable}
 */
export const onUpdateLayerDimensionData = (action$, {getState = () => {}} = {}) =>
    action$.ofType(UPDATE_LAYER_DIMENSION_DATA)
        .filter(({data}) => data?.name === "time" && !selectedLayerSelector(getState()))
        .switchMap(({data} = {}) => {
            return !isEmpty(data)
                ?  Rx.Observable.of(
                    autoselect(),
                    ...(endValuesSupportSelector(getState()) === undefined ? [setEndValuesSupport(data?.source?.version === "1.2")] : [])
                )
                : Rx.Observable.empty();
        });

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
    action$.ofType(SELECT_LAYER, INIT_SELECT_LAYER)
        .filter((action)=> action?.layerId && isAutoSelectEnabled(getState()) && action?.snap)
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
        .switchMap( (action) => {
            // we should force the range data update when we turn off the map sync
            const resetMapSync = action.mapSync === false;
            const timeData = timeDataSelector(getState()) || {};
            const layerIds = Object.keys(timeData).filter(id => timeData[id] && timeData[id].domain
                // when data is already fully downloaded, no need to refresh, except if the mapSync is active
                && (isTimeDomainInterval(timeData[id].domain)) || isMapSync(getState()) || resetMapSync);
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

/**
 * Set range of the timeline on initialization
 * Triggered based on initial timeline configuration (i.e. mode and snap)
 * @param action$
 * @param {function} getState returns the state
 * @return {observable}
 */
export const setRangeOnInit = (action$, { getState = () => { } } = {}) =>
    action$.ofType(SET_RANGE_INIT)
        .switchMap(({value: rangeType} = {}) => {
            const state = getState();
            const snapType = snapTypeSelector(state);
            const layerId = selectedLayerSelector(state);
            const rangeState = {
                isFullRange: [rangeType, settingsSelector(state)?.initialSnap].includes('fullRange'),
                offsetTime: offsetTimeSelector(state)
            };
            const { domain } = layerDimensionDataSelectorCreator(layerId, "time")(state) || {};
            const currentTime = currentTimeSelector(state);
            const getTimeDomain = (time) => getNearestTimesObservable(domainArgs, false, getState, snapType, time);
            const updateRangeObs = (time) => getTimeDomain().switchMap((values) => updateRangeOnInit(rangeState, values, time));

            if (!isEmpty(domain) && !isEmpty(currentTime)) {
                // Update range when domain and current time present
                return updateRangeOnInit(rangeState, domain, currentTime);
            } else if ((isEmpty(domain) && !isEmpty(currentTime)) || rangeState.isFullRange) {
                //  Get time domain and set range
                return updateRangeObs(currentTime);
            }

            // Get time domain and nearest time to set range
            const time = new Date().toISOString();
            return getTimeDomain(time)
                .switchMap(values => {
                    const nearestTime = getNearestDate(values.filter(v => !!v), time, snapType) || time;
                    return updateRangeObs(nearestTime);
                });
        });

/**
 * Reset timeline based on current mode and layer selection
 * @param action$
 * @param {function} getState returns the state
 * @return {observable}
 */
export const resetTimeline = (action$, { getState = () => { } } = {}) =>
    action$.ofType(RESET_TIMELINE)
        .switchMap(() => {
            const state = getState();
            const isRange = offsetEnabledSelector(state);
            const selectedLayer = selectedLayerSelector(state);
            if (isRange) {
                // Set guide layer when snap is configured
                return Rx.Observable.of(
                    isEmpty(selectedLayer)
                        ? initializeSelectLayerWithSnap(state, false)
                        : initializeRange('fullRange')
                );
            }
            const currentViewRange = rangeSelector(state) || {};
            const nowTime = new Date();
            const isInViewRange = moment(currentViewRange.end) > moment(nowTime);
            return Rx.Observable.of(selectTime(nowTime.toISOString(), selectedLayer))
                .concat(
                    ...(isInViewRange ? []
                        : [Rx.Observable.of(
                            onRangeChanged({
                                start: currentViewRange.start,
                                end: moment(nowTime).add(1000 * 60 * 60 * 24 * RATIO)
                            })
                        )]
                    )
                );
        });

/**
 * Triggered on initialization of timeline with initial snap and mode
 * @param action$
 * @param {function} getState returns the state
 * @return {observable}
 */
export const onInitTimeLine = (action$, { getState = () => { } } = {}) =>
    action$.ofType(INIT_TIMELINE).debounceTime(500)
        .switchMap(({config} = {}) => {
            const state = getState();
            const selectedLayer = selectedLayerName(state);
            const { initialMode, initialSnap } = config;
            const defaultSnapMode = initialMode === "single" && initialSnap === "now";
            if (defaultSnapMode) {
                return Rx.Observable.of(...(isEmpty(selectedLayer) ? [initializeSelectLayerWithSnap(state)] : []));
            }
            if (initialMode === "range" && !isEmpty(initialSnap)) {
                const allowSnap = initialSnap !== 'fullRange';
                // Set guide layer when snap is configured
                return Rx.Observable.of(
                    isEmpty(selectedLayer)
                        ? initializeSelectLayerWithSnap(state, allowSnap)
                        : initializeRange()
                );
            }
            return Rx.Observable.empty();
        });

/**
 * Set range on initialization of guide layer
 * when initial snap and mode configured
 * @param action$
 * @param {function} getState returns the state
 * @return {observable}
 */
export const rangeOnInitSelectLayer = (action$, { getState = () => { } } = {}) =>
    action$.ofType(INIT_SELECT_LAYER)
        .filter(() =>
            // Allow when range is active or init mode is 'range'
            offsetEnabledSelector(getState()) || settingsSelector(getState())?.initialMode === "range"
        ).switchMap(({snap: allowSnap} = {}) =>
            Rx.Observable.of(initializeRange(!isNil(allowSnap) && !allowSnap ? "fullRange" : "now"))
        );

/**
 * Set time layers with settings
 * on change of action with respect to the layers
 * @param action$
 * @param {function} getState returns the state
 * @return {observable}
 */
export const setTimeLayersSetting = (action$, { getState = () => { } } = {}) =>
    action$.ofType(INIT_TIMELINE, REMOVE_NODE, CHANGE_LAYER_PROPERTIES, UPDATE_NODE)
        .switchMap(({config} = {}) => {
            const state = getState();
            let $observable = Rx.Observable.empty();
            const timeLayers = timelineLayersSetting(state) || [];
            if (!isEmpty(config) && !isEmpty(timeLayers)) {
                // Skip time layer update on initialization
                // as layer data is updated from map config
                return $observable;
            }
            const layers = layersWithTimeDataSelector(state)?.filter(l => l.visibility);
            if (!isEmpty(layers)) {
                let layersSetting = layers.map(layer => {
                    const id = layer.id;
                    const timeLayer = timeLayers.find(l => l[id]);
                    // Set flag on initialization also upon saved timeline layers
                    // Support for other layer props too for future usage in timeline settings
                    return {[id]: { hideInTimeline: isEmpty(timeLayer) ? false : get(timeLayer, `${id}.hideInTimeline`)}};
                });
                // Enable the time layer when only one layer present,
                // can happen when layer is deleted
                if (layersSetting.length === 1) {
                    layersSetting = layersSetting.map(l => {
                        const id = get(Object.keys(l), "[0]");
                        return {[id]: { hideInTimeline: false}};
                    });
                }
                $observable =  Rx.Observable.of(setTimeLayers(layersSetting));
            }
            return $observable;
        });

export default {
    updateTimelineDataOnMapLoad,
    setTimelineCurrentTime,
    settingInitialOffsetValue,
    updateRangeDataOnRangeChange,
    syncTimelineGuideLayer,
    snapTimeGuideLayer,
    onInitTimeLine,
    setRangeOnInit,
    rangeOnInitSelectLayer,
    onUpdateLayerDimensionData,
    resetTimeline,
    setTimeLayersSetting
};
