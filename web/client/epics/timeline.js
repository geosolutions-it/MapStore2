
const Rx = require('rxjs');
const {isString, get, head, castArray} = require('lodash');
const { SELECT_TIME, RANGE_CHANGED, timeDataLoading, rangeDataLoaded } = require('../actions/timeline');
const {getLayerFromId} = require('../selectors/layers');
const { getHistogram, describeDomains } = require('../api/MultiDim');

const { rangeSelector } = require('../selectors/timeline');

const { setCurrentTime, UPDATE_LAYER_DIMENSION_DATA } = require('../actions/dimension');
const { timeSequenceSelector, timeDataSelector } = require('../selectors/dimension');
const { getNearestDate, roundRangeResolution, isTimeDomainInterval } = require('../utils/TimeUtils');
const TIME_DIMENSION = "time";
// const DEFAULT_RESOLUTION = "P1W";
const MAX_ITEMS_PER_LAYER = 10;
const MAX_HISTOGRAM = 20;
const snapTime = (state, time) => {
    return Rx.Observable.of(getNearestDate(timeSequenceSelector(state), time) || time);
};
const snap = true; // TODO: externalize to make this configurable.

const toISOString = date => isString(date) ? date : date.toISOString();

/**
 * Creates a stream to retrieve histogram/domain values.
 *
 * @param {string} id layer id
 * @param {object} timeData the object that represent the domain source. Contains the URL to the service
 * @param {function} getState return the state of the application
 * @returns a stream of data with histogram or domain values
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
    ).switchMap( ({Histogram: histogram}) => {
        let values;
        try {
            values = histogram.Values ? histogram.Values && histogram.Values.split(',').map(v => parseInt(v, 10)) : [];
        } catch (error) {
            values = []; // TODO notify some issue
        }


        const total = values.reduce((a, b) => a + b, 0);

        return Rx.Observable.of({
            range,
            histogram: {
                values,
                domain: histogram.Domain
            }
        }).concat(
            (total > MAX_ITEMS_PER_LAYER)
                ? Rx.Observable.empty()
                : describeDomains(
                        timeData.source.url,
                        layerName,
                        filter,
                        {
                            expandLimit: MAX_ITEMS_PER_LAYER
                        }
                    ).switchMap(domains => {
                        const domain = get(
                            head(
                                castArray(
                                    get(domains, "Domains.DimensionDomain") || []
                                ).filter(
                                    ({ Identifier } = {}) => Identifier === TIME_DIMENSION
                                )
                            ),
                            "Domain"
                        );
                        // TODO: check also 0 values case
                        return (domain && !isTimeDomainInterval(domain))
                                // send effective values
                                ? Rx.Observable.of({
                                    range,
                                    histogram: {
                                        values,
                                        domain: histogram.Domain
                                    },
                                    domain: {
                                        values: domain.split(',')
                                    }
                                })
                                // do nothing (probably describeDomain has a small expandLimit and it returned a domain)
                                : Rx.Observable.empty();
                    })
            );

    } );
};
module.exports = {
    setTimelineCurrentTime: (action$, {getState = () => {}} = {}) => action$.ofType(SELECT_TIME)
        .switchMap( ({time}) => {

            if (snap) {
                return snapTime(getState(), time).map( t => setCurrentTime(t));
            }
            return Rx.Observable.of(setCurrentTime(time));
        }),
    /**
     * Update the time data when the timeline range changes, or when the layer dimension data is
     * updated (for instance when a layer is added to the map)
     */
    updateRangeDataOnRangeChange: (action$, { getState = () => { } } = {}) =>
        action$.ofType(RANGE_CHANGED, UPDATE_LAYER_DIMENSION_DATA).debounceTime(1000)
            .switchMap( () => {
                const timeData = timeDataSelector(getState()) || {};
                const layerIds = Object.keys(timeData).filter(id => timeData[id] && timeData[id].domain && isTimeDomainInterval(timeData[id].domain));
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
