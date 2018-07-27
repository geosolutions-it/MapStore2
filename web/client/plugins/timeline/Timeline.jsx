/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { isString } = require('lodash');
const { getTimeData, getLayersWithTimeData } = require('../../selectors/timemanager');
// const { setCurrentTime } =

const { compose, branch, withProps, renderNothing, withHandlers, withPropsOnChange} = require('recompose');
const { createStructuredSelector } = require('reselect');

const timeStampToItem = ISOString => {
    const start = new Date(ISOString);
    if (!isNaN(start.getTime())) {
        return {
            start, end: start, type: 'point'
        };
    }
    return null;
};

const getTimeItems = (data = {}) => {
    if (data && data.values) {
        return (data.values || []).map(ISOString => timeStampToItem(ISOString)).filter(v => v && v.start);
    }
};

const layerData = compose(
    connect(
        createStructuredSelector({
            data: getTimeData,
            layers: getLayersWithTimeData
        })
    ),
    branch(({ data = {} }) => Object.keys(data).length === 0, renderNothing),
    withPropsOnChange(
        ['data', 'layers'],
        // (props = {}, nextProps = {}) => Object.keys(props.data).length !== Object.keys(nextProps.data).length,
        ({ data = {}, layers = [], items = [] }) => ({
            groups: layers.map(l => ({
                id: l.id,
                title: isString(l.title) ? l.title : l.name
            })),
            items: [
                ...items,
                ...Object.keys(data)
                    .map(id => getTimeItems(data[id])
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
const enhance = compose(
    layerData,
    currentTime,
    withHandlers({
        onSelect: ({ setCurrentTime = () => { } }) => e => setCurrentTime(e.items[0]),
        clickHandler: ({ setCurrentTime = () => { } }) => ({ event = {} } = {}) => setCurrentTime(event.time)
    }),
    withProps(() => ({
        customTimes: [new Date()],
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
