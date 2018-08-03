const { get } = require('lodash');
const { createShallowSelector } = require('../utils/ReselectUtils');
const { timeDataSelector } = require('../selectors/timemanager');
const rangeSelector = state => get(state, 'timeline.range');
const { timeIntervalToSequence, analyzeIntervalInRange } = require('../utils/TimeUtils');


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

/**
 * Transforms time values from layer state into items for timeline
 */
const getTimeItems = (data = {}, range) => {
    if (data && data.values) {
        return (data.values || []).reduce((acc, ISOString) => [...acc, ...timeStampToItems(ISOString, range)], []).filter(v => v && v.start);
    }
    return [];
};

const itemsSelector = createShallowSelector(
    timeDataSelector,
    rangeSelector,
    (data = {}, range) => ([
        ...Object.keys(data)
            .map(id => getTimeItems(data[id], range)
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
