
const Rx = require('rxjs');
const {isString, get, head, castArray} = require('lodash');
const moment = require('moment');

const { SELECT_TIME, RANGE_CHANGED, timeDataLoading, rangeDataLoaded } = require('../actions/timeline');
const { setCurrentTime, UPDATE_LAYER_DIMENSION_DATA } = require('../actions/dimension');


const {getLayerFromId} = require('../selectors/layers');
const { rangeSelector, offsetEnabledSelector, offsetTimeSelector, selectedLayerName, selectedLayerUrl } = require('../selectors/timeline');
const { layerTimeSequenceSelectorCreator, timeDataSelector, layersWithTimeDataSelector } = require('../selectors/dimension');

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
    const {range, resolution} = roundRangeResolution( rangeSelector(getState()), MAX_HISTOGRAM);
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
     * Update the time data when the timeline range changes, or when the layer dimension data is
     * updated (for instance when a layer is added to the map)
     */
    updateRangeDataOnRangeChange: (action$, { getState = () => { } } = {}) =>
        action$.ofType(RANGE_CHANGED, UPDATE_LAYER_DIMENSION_DATA)
            .debounceTime(500)
            .switchMap( () => {
                // if timeline is not present, don't update range data
                if ( !rangeSelector(getState()) ) {
                    return Rx.Observable.empty();
                }
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
