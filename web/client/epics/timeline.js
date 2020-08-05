
const Rx = require('rxjs');
const {isString, get, head, castArray} = require('lodash');
const moment = require('moment');
const {wrapStartStop} = require('../observables/epics');


const { CHANGE_MAP_VIEW } = require('../actions/map');

const { SELECT_TIME, RANGE_CHANGED, ENABLE_OFFSET, SET_MAP_SYNC, AUTOSELECT, timeDataLoading, rangeDataLoaded, onRangeChanged, selectLayer } = require('../actions/timeline');
const { setCurrentTime, UPDATE_LAYER_DIMENSION_DATA, setCurrentOffset } = require('../actions/dimension');

const {REMOVE_NODE} = require('../actions/layers');
const {error} = require('../actions/notifications');

const {getLayerFromId} = require('../selectors/layers');
const { rangeSelector, selectedLayerName, selectedLayerUrl, isAutoSelectEnabled, selectedLayerSelector, timelineLayersSelector, multidimOptionsSelectorCreator, isMapSync } = require('../selectors/timeline');
const { layerTimeSequenceSelectorCreator, timeDataSelector, offsetTimeSelector, currentTimeSelector } = require('../selectors/dimension');

const { getNearestDate, roundRangeResolution, isTimeDomainInterval } = require('../utils/TimeUtils');
const { getHistogram, describeDomains, getDomainValues } = require('../api/MultiDim');

const TIME_DIMENSION = "time";
// const DEFAULT_RESOLUTION = "P1W";
const MAX_ITEMS_PER_LAYER = 20;
const MAX_HISTOGRAM = 20;

/**
 * Gets the getDomain args for retrieve **single** value surrounding current time for the selected layer
 * @param {object} state application state
 * @param {object} paginationOptions
 */
const domainArgs = (state, paginationOptions = {}) => {
    const id = selectedLayerSelector(state);
    const layerName = selectedLayerName(state);
    const layerUrl = selectedLayerUrl(state);
    const bboxOptions = multidimOptionsSelectorCreator(id)(state);
    return [layerUrl, layerName, "time", {
        limit: 1,
        ...paginationOptions
    }, bboxOptions];
};
/**
 * creates an observable that emit a time that snap the values of the selected layer to the current time
 */
const snapTime = (state, group, time) => {
    // TODO: evaluate to snap to clicked layer instead of current selected layer, and change layer selection
    // TODO: support local list of values for no multidim-extension.
    if (selectedLayerName(state)) {
        // do parallel request and return and observable that emit the correct value/ time as it is by default
        return Rx.Observable.forkJoin(
            // TODO: find out a way to optimize and do only one request
            getDomainValues(...domainArgs(state, { sort: "asc", fromValue: time }))
                .map(res => res.DomainValues.Domain.split(","))
                .map(([tt])=> tt).catch(err => err && Rx.Observable.of(null)),
            getDomainValues(...domainArgs(state, { sort: "desc", fromValue: time }))
                .map(res => res.DomainValues.Domain.split(","))
                .map(([tt])=> tt).catch(err => err && Rx.Observable.of(null))
        )
            .map(values =>
                getNearestDate(values.filter(v => !!v), time) || time
            );


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
                    expandLimit: MAX_ITEMS_PER_LAYER
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


module.exports = {
    /**
     * when a time is selected from timeline, tries to snap to nearest value and set the current time
     */
    setTimelineCurrentTime: (action$, {getState = () => {}} = {}) =>
        action$.ofType(SELECT_TIME)
            .throttleTime(100) // avoid multiple request in case of mouse events drag and click
            .switchMap( ({time, group}) => {
                const state = getState();

                if (snap && group) {
                    return snapTime(state, group, time)
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
            }),
    /**
     * Initializes the time line
     */
    setupTimelineExistingSettings: (action$, { getState = () => { } } = {}) => action$.ofType(REMOVE_NODE, AUTOSELECT)
        .exhaustMap(() =>
            isAutoSelectEnabled(getState())
            && get(timelineLayersSelector(getState()), "[0].id")
            && !selectedLayerSelector(getState())
                ? Rx.Observable.of(selectLayer(get(timelineLayersSelector(getState()), "[0].id")))
                    .concat(
                        Rx.Observable.of(1).switchMap( () =>
                            snapTime(getState(), get(timelineLayersSelector(getState()), "[0].id"), currentTimeSelector(getState) || new Date().toISOString())
                                .filter( v => v)
                                .map(time => setCurrentTime(time)))
                    )
                : Rx.Observable.empty()
        ),
    /**
     * When offset is initiated this epic sets both initial current time and offset if any does not exist
     * The policy is:
     *  - if current time is not defined, it will be placed to the center of the current timeline's viewport. If the viewport is undefined it is set to "now"
     *  - if offsetTime is not defined, it will be placed at 1/ RATIO * (current viewport size) distance from current time (to make it visible). If viewport is not defined, 1 day from the current time
     *  - At the end, if the viewport is not defined, it will be placed to center the current time. This way the range will be visible when the timeline is available.
     *
     */
    settingInitialOffsetValue: (action$, {getState = () => {}} = {}) =>
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
            }),
    /**
     * Update the time data when the timeline range changes, or when the layer dimension data is
     * updated (for instance when a layer is added to the map)
     */
    updateRangeDataOnRangeChange: (action$, { getState = () => { } } = {}) =>
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

            })
};
