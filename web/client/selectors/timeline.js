const { get } = require('lodash');
const { createShallowSelector } = require('../utils/ReselectUtils');
const { timeIntervalToSequence, timeIntervalToIntervalSequence, analyzeIntervalInRange, isTimeDomainInterval } = require('../utils/TimeUtils');

const { timeDataSelector } = require('../selectors/dimension');
const rangeSelector = state => get(state, 'timeline.range');
const rangeDataSelector = state => get(state, 'timeline.rangeData');

// items
const MAX_ITEMS = 50;

/**
 * Converts the list of timestamps into timeline items.
 * If a timestamp is a start/end/resolution, and items in viewRange are less than MAX_ITEMS, returns tha array of items,
 * one for each point calculated in start/end/resolution interval. If the MAX_ITEMS limit is exceed, returns an array of 1 item representing the range.
 * In case of single elements, return array of 1 element.
 * @param {string} ISOString ISO 8601 timestamp
 * @param {object} viewRange start/end object representing the date range of the view
 * @returns {array[object]} items to pass to timeline.
 */
const timeStampToItems = (ISOString, viewRange) => {
    const [start, end, duration] = ISOString.split("/");
    if (duration && duration !== "0") {
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
 * Converts an array of ISO8601 string values into timeline item objects
 * @param {array[string]} values array of ISOStrings
 * @param {object} range start/end object representing the range of the view
 * @returns {array[object]} items to pass to timeline.
 */
const valuesToItems = (values, range) => (values || []).reduce((acc, ISOString) => [...acc, ...timeStampToItems(ISOString, range)], []).filter(v => v && v.start);

/**
 * Converts range data into items.If values are present, it returns values' items, otherwise it will return histogram items.
 * @param {object} rangeData object representing rangeData
 * @param {object} range start/stop object representing the range of the view
 * @returns {array[object]} items to pass to timeline.
 */
const rangeDataToItems = (rangeData = {}, range) => {
    if (rangeData.domain && rangeData.domain.values) {
        return valuesToItems(rangeData.domain.values, range);
    }
    if (rangeData.histogram && rangeData.histogram.domain && rangeData.histogram.values) {
        const [start, end, duration] = rangeData.histogram.domain.split('/');
        const max = Math.max(
            ...(rangeData.histogram.values)
        );
        const items = timeIntervalToIntervalSequence({ start, end, duration });
        return rangeData.histogram.values.map( (value, i) => ({
            ...items[i],
            type: "range",
            itemType: "histogram",
            count: value,
            className: "histogram-item",
            content: `<div><div class="histogram-box" style="height: ${(100 * value / max)}%"></div> <span class="histogram-count">${value}</span></div>`
        }));
    }
    return [];
};
/**
 * Transforms time values from layer state or rangeData (histogram,values) into items for timeline.
 * @param {object} data layer timedimension data
 * @param {object} range start/end object that represent the view range
 * @param {object} rangeData object that contains domain or histogram
 */
const getTimeItems = (data = {}, range, rangeData) => {
    if (data && data.values || data && data.domain && !isTimeDomainInterval(data.domain)) {
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
const loadingSelector = state => get(state, "timeline.loading");
const selectedLayerSelector = state => get(state, "timeline.selectedLayer");
module.exports = {
    itemsSelector,
    rangeSelector,
    loadingSelector,
    selectedLayerSelector
};
