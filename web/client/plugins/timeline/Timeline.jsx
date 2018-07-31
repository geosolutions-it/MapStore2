/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { isString } = require('lodash');
const { getTimeData, getLayersWithTimeData, currentTimeSelector } = require('../../selectors/timemanager');
const { selectTime, onRangeChanged} = require('../../actions/timeline');
const { rangeSelector } = require('../../selectors/timeline');
const { createShallowSelector } = require('../../utils/ReselectUtils');
const { timeIntervalToSequence, analyzeIntervalInRange } = require('../../utils/TimeUtils');

const { compose, branch, withProps, renderNothing, withHandlers, withPropsOnChange, defaultProps } = require('recompose');
const { createStructuredSelector } = require('reselect');
const MAX_ITEMS = 1000;
const timeStampToItems = (ISOString, viewRange) => {
    const [start, end, duration] = ISOString.split("/");
    if (duration) {
        // prevent overflows, indicating only the count of items in the interval
        const {count, start: dataStart, end: dataEnd } = analyzeIntervalInRange({start, end, duration}, viewRange);
        if (count > MAX_ITEMS) {
            return [{
                start,
                end,
                duration,
                type: "range",
                content: `${count} items`
            }];
        }
        return timeIntervalToSequence({ start: dataStart, end: dataEnd, duration}).map(t => ({
            start: new Date(t),
            end: new Date(t),
            type: 'point'
        }));
    }
    if (!isNaN(new Date(start).getTime())) {
        return [{
            start: new Date(start),
            end: new Date( end || start),
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
};

/**
 * Provides time dimension data for layers
 */
const layerData = compose(
    connect(
        createShallowSelector(
            getTimeData,
            getLayersWithTimeData,
            (data, layers) => ({data, layers})
        )
    ),
    branch(({ data = {} }) => Object.keys(data).length === 0, renderNothing),
    withPropsOnChange(
        ['data', 'layers', 'range'],
        // (props = {}, nextProps = {}) => Object.keys(props.data).length !== Object.keys(nextProps.data).length,
        ({ data = {}, layers = [], items = [], range = {} }) => ({
            groups: layers.map(l => ({
                id: l.id,
                title: isString(l.title) ? l.title : l.name
            })),
            items: [
                ...items,
                ...Object.keys(data)
                    .map(id => getTimeItems(data[id], range)
                        .map((item = {}) => ({
                            content: " ",
                            ...item,
                            // style: "color: red; background-color: pink",
                            group: id
                        })))
                    .reduce((acc, layerItems) => [...acc, ...layerItems], [])]
        })
    )
);
/**
 * Bind current time properties and handlers
 */
const currentTimeEnhancer = compose(
    connect(
        createStructuredSelector({
            currentTime: currentTimeSelector
        }),
        {
            setCurrentTime: selectTime
        }
    ),
    withHandlers({
        selectionChange: ({ setCurrentTime = () => { } }) => e => setCurrentTime(e.items[0]),
        clickHandler: ({ setCurrentTime = () => { } }) => ({ time } = {}) => setCurrentTime(time)
    }),
    defaultProps({
        currentTime: new Date()
    })
);

const rangeEnhancer = compose(
    connect( createStructuredSelector({
        range: rangeSelector
    }), {
        rangechangedHandler: onRangeChanged
    })
);
const enhance = compose(
    currentTimeEnhancer,
    rangeEnhancer,
    layerData,
    withProps(({ currentTime }) => ({
        customTimes: [currentTime],
        options: {
            stack: false,
            showMajorLabels: true,
            showCurrentTime: false,
            zoomMin: 10,
            zoomable: true,
            type: 'background',
            format: {
                minorLabels: {
                    minute: 'h:mma',
                    hour: 'ha'
                }
            }
        }
    }))

);
const Timeline = require('react-visjs-timeline').default;

module.exports = enhance(Timeline);
