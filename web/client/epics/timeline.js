
const Rx = require('rxjs');
const {isString, get, head, castArray} = require('lodash');
const moment = require('moment');

const { SELECT_TIME, RANGE_CHANGED, ENABLE_OFFSET, timeDataLoading, rangeDataLoaded, onRangeChanged } = require('../actions/timeline');
const { setCurrentTime, UPDATE_LAYER_DIMENSION_DATA, setCurrentOffset } = require('../actions/dimension');


const {getLayerFromId} = require('../selectors/layers');
const { rangeSelector, selectedLayerName, selectedLayerUrl } = require('../selectors/timeline');
const { layerTimeSequenceSelectorCreator, offsetEnabledSelector, timeDataSelector, layersWithTimeDataSelector, offsetTimeSelector, currentTimeSelector } = require('../selectors/dimension');

const { getNearestDate, roundRangeResolution, isTimeDomainInterval } = require('../utils/TimeUtils');
const { getHistogram, describeDomains, getDomainValues } = require('../api/MultiDim');

const TIME_DIMENSION = "time";
// const DEFAULT_RESOLUTION = "P1W";
const MAX_ITEMS_PER_LAYER = 10;
const MAX_HISTOGRAM = 20;

/**
 * creates an observable that emit a time that snap to the current time
 */

const domainArgs = (state, paginationOptions = {}) => {

    const layerName = selectedLayerName(state);
    const layerUrl = selectedLayerUrl(state);

    return [layerUrl, layerName, "time", {
        limit: 1,
        ...paginationOptions
    }];
};

const snapTime = (state, group, time) => {

    if (layersWithTimeDataSelector(state)) {
        // do parallel request and return and observable that emit the correct value/ time as it is by default
        return Rx.Observable.forkJoin(
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
     * when there is no timeline state rangeSelector(getState()) returns undefiend, so instead we use the timeData[id] range
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
        resolution
    )
    .merge(
        describeDomains(
            timeData.source.url,
            layerName,
            filter,
            {
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
        } catch (error) {
            values = []; // TODO notify some issue
        }

        const domainValues = domain && domain.indexOf('--') < 0 && domain.split(',');
        // const total = values.reduce((a, b) => a + b, 0);

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

const getTimestamp = (time, offsetEnabled, state) => {
    if (!offsetEnabled) return time;
    const offset = offsetTimeSelector(state);
    const calculatedOffsetTime = moment(time).add(offset);
    return time + '/' + calculatedOffsetTime.toISOString();
};

module.exports = {
    /**
     * when a time is selected from timeline, tries to snap to nearest value and set the current time
     */
    setTimelineCurrentTime: (action$, {getState = () => {}} = {}) =>
        action$.ofType(SELECT_TIME)
        .switchMap( ({time, group}) => {
            const state = getState();
            const offsetEnabled = offsetEnabledSelector(state);

            if (snap && group) {
                return snapTime(state, group, time).map( t => setCurrentTime(getTimestamp(t, offsetEnabled, state)));
            }
            return Rx.Observable.of(setCurrentTime(getTimestamp(time, offsetEnabled, state)));
        }),
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
                let currentMoment = currentViewRange ? moment(start).add(rangeDistance / 2).toISOString() : moment(new Date());

                const initialOffsetTime = moment(time ? time : currentMoment).add(rangeDistance / RATIO);
                let setTime = action.enabled && !time ? Rx.Observable.of(setCurrentTime(currentMoment.toISOString())) : Rx.Observable.empty();
                let setOff = action.enabled && !currentOffset || action.enabled && moment(currentOffset.toISOString()).diff(time) < 0 ? Rx.Observable.of(setCurrentOffset(initialOffsetTime.toISOString()))
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
        action$.ofType(RANGE_CHANGED, UPDATE_LAYER_DIMENSION_DATA)
            .debounceTime(500)
            .switchMap( () => {
                const timeData = timeDataSelector(getState()) || {};
                const layerIds = Object.keys(timeData).filter(id => timeData[id] && timeData[id].domain && isTimeDomainInterval(timeData[id].domain));
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
                        .catch(() => Rx.Observable.empty()) // TODO: notify time data loading errors
                        .concat( Rx.Observable.of(timeDataLoading(id, false)))
                    ));

            })
};
