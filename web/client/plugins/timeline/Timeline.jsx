/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { isString, differenceBy, trim } = require('lodash');
const { currentTimeSelector, layersWithTimeDataSelector } = require('../../selectors/dimension');
const { selectTime, selectLayer, onRangeChanged, setMouseEventData } = require('../../actions/timeline');
const { itemsSelector, loadingSelector, selectedLayerSelector, mouseEventSelector, currentTimeRange } = require('../../selectors/timeline');
const { setCurrentOffset } = require('../../actions/dimension');
const { selectPlaybackRange } = require('../../actions/playback');
const { playbackRangeSelector } = require('../../selectors/playback');
const { createStructuredSelector, createSelector } = require('reselect');
const { compose, withHandlers, withPropsOnChange, defaultProps } = require('recompose');
const moment = require('moment');

const isValidOffset = (start, end) => moment(end).diff(start) > 0;
/**
 * Provides time dimension data for layers
 */
const layerData = compose(
    connect(
        createSelector(
            itemsSelector,
            layersWithTimeDataSelector,
            loadingSelector,
            (items, layers, loading) => ({ items, layers, loading })
        )
    ),
    withPropsOnChange(
        (props, nextProps) => {
            const { layers = [], loading, selectedLayer} = props;
            const { layers: nextLayers, loading: nextLoading, selectedLayer: nextSelectedLayer } = nextProps;
            return loading !== nextLoading
                || selectedLayer !== nextSelectedLayer
                || differenceBy(layers, nextLayers || [], ({id, title, name} = {}) => id + title + name).length > 0;
        },
        // (props = {}, nextProps = {}) => Object.keys(props.data).length !== Object.keys(nextProps.data).length,
        ({ layers = [], loading = {}, selectedLayer }) => ({
            groups: layers.map((l) => ({
                id: l.id,
                className: (loading[l.id] ? "loading" : "") + ((l.id && l.id === selectedLayer) ? " selected" : ""),
                content:
                    `<div class="timeline-layer-label-container">`
                        + (loading[l.id]
                            ? `<div class="timeline-layer-icon"><div class="timeline-spinner"></div></div>`
                            : `<div class="timeline-layer-icon">${(l.id && l.id === selectedLayer)
                                ? '<i class="glyphicon glyphicon-time"></i>'
                                : ''
                            }</div>`)
                        + `<div class="timeline-layer-title">${(isString(l.title) ? l.title : l.name)}</div>`
                    + "</div>" // TODO: i18n for layer titles*/
            }))
        })
    )
);
/**
 * Bind current time properties and handlers
 */
const currentTimeEnhancer = compose(
    connect(
        createSelector(
            currentTimeSelector,
            currentTimeRange,
            (current, range) => ({
                        currentTime: current,
                        customizedRange: range
            })
        ),
        {
            setCurrentTime: selectTime,
            setOffset: setCurrentOffset
        }
    )
);
const playbackRangeEnhancer = compose(
    connect(
        createStructuredSelector({
            playbackRange: playbackRangeSelector
        }),
        {
            setPlaybackRange: selectPlaybackRange
        }
    )
);

const layerSelectionEnhancer = compose(
    connect(
        createSelector(
            selectedLayerSelector,
            selectedLayer => ({selectedLayer})
        )
        , {
            selectGroup: selectLayer
        }
    )
);

const mouseInteractionEnhancer = compose(
    connect(
        createSelector(
            mouseEventSelector,
            (mouseEventProps) => ({mouseEventProps})
        ),
        {
            setMouseData: setMouseEventData
        }
    )
);

const getStartEnd = (startTime, endTime) => {
    const diff = moment(startTime).diff(endTime);
    return {
        start: diff >= 0 ? endTime : startTime,
        end: diff >= 0 ? startTime : endTime
    };
};

const clickHandleEnhancer = withHandlers({
    mouseDownHandler: ({
        offsetEnabled,
        setMouseData = () => { },
        selectGroup= () => {}
    }) => ({ time, event, what, group } = {}) => {
        // if theu user selects a layer from layer group
        if (what === "group-label") {
            return group && selectGroup(group);
        }
        // initialize dragging range event
        let target = event && event.target && event.target.closest('.ms-current-range');
        if ( offsetEnabled && target) {
            setMouseData({dragging: true, startTime: time.toISOString(), draggedWhat: what });
        } else {
            target = event && event.target && event.target.closest('.vis-custom-time');
            const className = target && target.getAttribute('class');
            const timeId = className && trim(className.replace('vis-custom-time', ''));
            setMouseData({dragging: false, borderID: timeId ? timeId : null, startTime: time.toISOString(), movement: event.pageX});
        }

    },
    mouseUpHandler: ({
        selectedLayer,
        currentTime,
        setOffset = () => {},
        setCurrentTime = () => { },
        customizedRange = {},
        mouseEventProps ={},
        offsetEnabled,
        playbackRange,
        setTimeLineRange = () => {},
        setMouseData = () => {},
        setPlaybackRange = () => {}
    }) => ({ time, event, group, what } = {}) => {

        let target = event && event.target && event.target.closest('.vis-center');
        const border = mouseEventProps.borderID;
        // sets the playbackRange range
        if (!mouseEventProps.dragging && border === 'startPlaybackTime' || border === 'endPlaybackTime') {
            const range = { ...playbackRange, [border]: time.toISOString() };
            let { start, end } = getStartEnd(range.startPlaybackTime, range.endPlaybackTime);
            if (isValidOffset(start, end)) {
                setPlaybackRange({
                    startPlaybackTime: start,
                    endPlaybackTime: end
                    });
            }
        }
        if (offsetEnabled) {
            // range dragging
            if ( mouseEventProps.dragging && target ) {
                const off = moment(time).diff(mouseEventProps.startTime);

                const startRangeShift = moment(customizedRange.startTimeLineRange).add(off);
                const endRangeShift = moment(customizedRange.endTimeLineRange).add(off);
                // no snap for range borders
                setCurrentTime(startRangeShift.toISOString(), null);
                setOffset(endRangeShift.toISOString());
                const newRange = {startTimeLineRange: startRangeShift, endTimeLineRange: endRangeShift};
                setTimeLineRange(newRange);

            } else {
                // changing the rang by moving currentTime or offsetTime
                if (border === 'currentTime' && isValidOffset(time, customizedRange.endTimeLineRange )) {
                    setCurrentTime(time.toISOString(), null);
                } else if (border === 'offsetTime' && isValidOffset(currentTime, time )) {
                    setOffset(time.toISOString());
                }
                const id = border === 'currentTime' && 'startTimeLineRange' || border === 'offsetTime' && 'endTimeLineRange';
                const TimeRange = { ...customizedRange, [id]: time.toISOString() };
                let { start, end } = getStartEnd(TimeRange.startTimeLineRange, TimeRange.endTimeLineRange);
                if (isValidOffset(start, end)) {
                    setTimeLineRange({
                    startTimeLineRange: start,
                    endTimeLineRange: end
                    });
                }
            }
                // normal click event
        } else if (event.pageX === mouseEventProps.movement) {
            if (time && !border && what !== "axis") {
                setCurrentTime(time.toISOString(), group || selectedLayer);
            }
        }
        // reseting the mouse event data
        setMouseData({});
    }


});

const rangeEnhancer = compose(
    connect(() => ({}), {
        rangechangedHandler: onRangeChanged
    })
);

const enhance = compose(
    mouseInteractionEnhancer,
    currentTimeEnhancer,
    playbackRangeEnhancer,
    layerSelectionEnhancer,
    clickHandleEnhancer,
    rangeEnhancer,
    layerData,
    defaultProps({
        key: 'timeline',
        options: {
            stack: false,
            showMajorLabels: true,
            showCurrentTime: false,
            zoomMin: 10,
            zoomable: true,
            type: 'background',
            margin: {
                item: 0,
                axis: 0
            },
            format: {
                minorLabels: {
                    minute: 'h:mma',
                    hour: 'ha'
                }
            },
            moment: date => moment(date).utc()
        }
    }),
    // items enhancer
    withPropsOnChange(
        ['items', 'currentTime', 'offsetEnabled', 'calculatedOffsetTime', 'hideLayersName', 'playbackRange', 'playbackEnabled', 'selectedLayer'],
        ({
            customizedRange,
            items,
            playbackEnabled,
            offsetEnabled,
            playbackRange
        }) => ({
            items: [
                ...items,
                playbackEnabled ? {
                    id: 'playback-range',
                    ...getStartEnd(playbackRange.startPlaybackTime, playbackRange.endPlaybackTime),
                    type: 'background',
                    className: 'ms-playback-range'
                } : null,
                offsetEnabled ? {
                    id: 'current-range',
                    ...getStartEnd(customizedRange.startTimeLineRange, customizedRange.endTimeLineRange),
                    type: 'background',
                    className: 'ms-current-range'
                } : null
            ].filter(val => val)
        })
    ),
    // custom times enhancer
    withPropsOnChange(
        ['currentTime', 'playbackRange', 'playbackEnabled', 'offsetEnabled', 'customizedRange'],
        ({ currentTime, playbackRange, playbackEnabled, offsetEnabled, customizedRange }) => ({
            customTimes: {
            ...[(currentTime ? {currentTime: currentTime } : {}),
                (playbackEnabled ? playbackRange : {}),
                (offsetEnabled ? { offsetTime: customizedRange.endTimeLineRange } : {})]
                .reduce((res, value) => value ? { ...res, ...value } : { ...res }, {})
        }
        })
    )
);
const Timeline = require('./TimelineComponent');

module.exports = enhance(Timeline);
