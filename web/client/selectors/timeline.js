const { get } = require('lodash');
const { createShallowSelector } = require('../utils/ReselectUtils');
const { timeIntervalToSequence, timeIntervalToIntervalSequence, analyzeIntervalInRange } = require('../utils/TimeUtils');

const { timeDataSelector } = require('../selectors/dimension');
const rangeSelector = state => get(state, 'timeline.range');
const rangeDataSelector = state => get(state, 'timeline.rangeData');

// items
const MAX_ITEMS = 100;
const timeStampToItems = (ISOString, viewRange) => {
    const [start, end, duration] = ISOString.split("/");
    if (duration) {
        // prevent overflows, indicating only the count of items in the interval
        const { count, start: dataStart, end: dataEnd } = analyzeIntervalInRange({ start, end, duration }, viewRange);
        if (count > MAX_ITEMS) {
            return [{
                start,
                end,
                duration,
                type: "range",
                content: `${count} items`
            }];
        }
        return timeIntervalToSequence({ start: dataStart, end: dataEnd, duration }).map(t => ({
            start: new Date(t),
            end: new Date(t),
            type: 'point'
        }));
    }
    if (!isNaN(new Date(start).getTime())) {
        return [{
            start: new Date(start),
            end: new Date(end || start),
            type: end ? 'range' : 'point'
        }];
    }
    return null;
};

const valuesToItems = (values, range) => (values || []).reduce((acc, ISOString) => [...acc, ...timeStampToItems(ISOString, range)], []).filter(v => v && v.start);
const rangeDataToItems = (rangeData = {}) => {
    if (rangeData.histogram && rangeData.histogram.domain && rangeData.histogram.values) {
        const [start, end, duration] = rangeData.histogram.domain.split('/');
        const max = Math.max(
            ...(rangeData.histogram.values)
        );
        return timeIntervalToIntervalSequence({start, end, duration}).map( (item, i) => ({
            ...item,
            type: "range",
            itemType: "histogram",
            count: rangeData.histogram.values[i],
            className: "histogram-item",
            content: `<div><div class="histogram-box" style="height: ${(100 * rangeData.histogram.values[i] / max)}%"></div> <span class="histogram-count">${rangeData.histogram.values[i]}</span></div>`
        }));
    }
    return [];
};
/**
 * Transforms time values from layer state into items for timeline
 */
const getTimeItems = (data = {}, range, rangeData) => {
    if (data && data.values || data && data.domain && data.domain.indexOf("--") < 0) {
        return valuesToItems(data.values || data.domain.split(','), range);
    } else if (rangeData && rangeData.histogram) {
        return rangeDataToItems(rangeData, range);
    }
    return [];
};

const itemsSelector = createShallowSelector(
    timeDataSelector,
    rangeSelector,
    rangeDataSelector,
    (data = {}, range, rangeData = {} ) => ([
        ...Object.keys(data)
            .map(id => getTimeItems(data[id], range, rangeData[id])
                .map((item = {}) => ({
                    content: " ",
                    ...item,
                    // style: "color: red; background-color: pink",
                    group: id
                })))
            .reduce((acc, layerItems) => [...acc, ...layerItems], [])]
    )
);

module.exports = {
    itemsSelector,
    rangeSelector
};
