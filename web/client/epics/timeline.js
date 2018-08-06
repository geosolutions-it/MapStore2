
const Rx = require('rxjs');
const {isString} = require('lodash');
const { SELECT_TIME, RANGE_CHANGED, timeDataLoading, rangeDataLoaded } = require('../actions/timeline');
const {getLayerFromId} = require('../selectors/layers');
const { getHistogram } = require('../api/MultiDim');

const { rangeSelector } = require('../selectors/timeline');

const { setCurrentTime, UPDATE_LAYER_DIMENSION_DATA } = require('../actions/dimension');
const { timeSequenceSelector, timeDataSelector } = require('../selectors/dimension');
const { getNearestDate } = require('../utils/TimeUtils');
const TIME_DIMENSION = "time";
const DEFAULT_RESOLUTION = "P1W";
const MAX_ITEMS_PER_LAYER = -1;
const snapTime = (state, time) => {
    return Rx.Observable.of(getNearestDate(timeSequenceSelector(state), time) || time);
};
const snap = true; // TODO: externalize to make this configurable.

const toISOString = date => isString(date) ? date : date.toISOString();

const loadRangeData = (id, timeData, getState) => {
    const range = rangeSelector(getState());
    return getHistogram(
        timeData.source.url,
        getLayerFromId(getState(), id).name,
        TIME_DIMENSION,
        {
            [TIME_DIMENSION]: `${toISOString(range.start)}/${toISOString(range.end)}`
        },
        DEFAULT_RESOLUTION
    ).switchMap( ({Histogram: histogram}) => {
        let values;
        try {
            values = histogram.Values ? histogram.Values && histogram.Values.split(',').map(v => parseInt(v, 10)) : [];
        } catch (error) {
            values = []; // TODO notify some issue
        }


        const total = values.reduce((a, b) => a + b, 0);
        if (total <= MAX_ITEMS_PER_LAYER) {
            // TODO: describe domain to display single values
        } else {
            return Rx.Observable.of({
                range,
                histogram: {
                    values,
                    domain: histogram.Domain
                }
            });
        }

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
    updateRangeDataOnRangeChange: (action$, { getState = () => { } } = {}) =>
        action$.ofType(RANGE_CHANGED, UPDATE_LAYER_DIMENSION_DATA).debounceTime(1000)
            .switchMap( () => {
                const timeData = timeDataSelector(getState()) || {};
                const layerIds = Object.keys(timeData).filter(id => timeData[id] && timeData[id].domain && timeData[id].domain.indexOf("--") > 0);
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
