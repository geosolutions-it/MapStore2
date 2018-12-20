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
const { itemsSelector, loadingSelector, selectedLayerSelector, mouseEventSelector, currentTimeRangeSelector, rangeSelector } = require('../../selectors/timeline');
const { setCurrentOffset } = require('../../actions/dimension');
const { selectPlaybackRange } = require('../../actions/playback');
const { playbackRangeSelector, statusSelector } = require('../../selectors/playback');
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
            rangeSelector,
            itemsSelector,
            layersWithTimeDataSelector,
            loadingSelector,
            (viewRange, items, layers, loading) => ({
                viewRange,
                items,
                layers,
                loading
            })
        )
    ),
    withPropsOnChange(
        (props, nextProps) => {
            const { layers = [], loading, selectedLayer} = props;
            const { layers: nextLayers, loading: nextLoading, selectedLayer: nextSelectedLayer } = nextProps;
            return loading !== nextLoading
                || selectedLayer !== nextSelectedLayer
                || (layers && nextLayers && layers.length !== nextLayers.length)
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
            currentTimeRangeSelector,
            (current, range) => ({
                        currentTime: current,
                        currentTimeRange: range
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
            playbackRange: playbackRangeSelector,
            status: statusSelector
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
        status,
        setMouseData = () => { }
    }) => ({ time, event } = {}) => {
        if (status === "PLAY") {
            return;
        }
        // initialize dragging range event
        let target = event && event.target && event.target.closest('.ms-current-range');
        if ( offsetEnabled && target) {
            setMouseData({dragging: true, startTime: time.toISOString()});
        } else {
            target = event && event.target && event.target.closest('.vis-custom-time');
            const className = target && target.getAttribute('class');
            const timeId = className && trim(className.replace('vis-custom-time', ''));
            if (timeId) setMouseData({dragging: false, borderID: timeId, startTime: time.toISOString()});
        }

    },
    clickHandler: ({
        selectedLayer,
        offsetEnabled,
        status,
        setCurrentTime = () => { },
        selectGroup = () => { },
        mouseEventProps= {}
    }) => ({ time, group, what } = {}) => {
        if (status === "PLAY") {
            return;
        }
        switch (what) {
            // case "axis":
            case "group-label": {
                if (group && status !== "PLAY") selectGroup(group);
                break;
            }
            default: {
                const target = event && event.target && event.target.closest('.vis-custom-time');
                const className = target && target.getAttribute('class');
                const timeId = className && trim(className.replace('vis-custom-time', ''));
                if (!mouseEventProps.timeId && time && !offsetEnabled && timeId !== "startPlaybackTime" && timeId !== "endPlaybackTime" ) setCurrentTime(time.toISOString(), group || selectedLayer);
                break;
            }
        }
    },
    mouseUpHandler: ({
        currentTime,
        status,
        setOffset = () => {},
        setCurrentTime = () => { },
        currentTimeRange = {},
        mouseEventProps ={},
        offsetEnabled,
        playbackRange,
        setTimeLineRange = () => {},
        setMouseData = () => {},
        setPlaybackRange = () => {}
    }) => ({ time, event } = {}) => {
        if (status === "PLAY") {
            return;
        }
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

                const startRangeShift = moment(currentTimeRange.start).add(off);
                const endRangeShift = moment(currentTimeRange.end).add(off);
                // no snap for range borders
                setCurrentTime(startRangeShift.toISOString(), null);
                setOffset(endRangeShift.toISOString());
                const newRange = {start: startRangeShift, end: endRangeShift};
                setTimeLineRange(newRange);

            } else {
                // changing the rang by moving currentTime or offsetTime
                if (border === 'currentTime' && isValidOffset(time, currentTimeRange.endTimeLineRange )) {
                    setCurrentTime(time.toISOString(), null);
                } else if (border === 'offsetTime' && isValidOffset(currentTime, time )) {
                    setOffset(time.toISOString());
                }
                const id = border === 'currentTime' && 'start' || border === 'offsetTime' && 'end';
                const TimeRange = { ...currentTimeRange, [id]: time.toISOString() };
                let { start, end } = getStartEnd(TimeRange.start, TimeRange.end);
                if (isValidOffset(start, end)) {
                    setTimeLineRange({
                    start: start,
                    end: end
                    });
                }
            }
                // normal click event
        }
        // reseting the mouse event data
        if (Object.keys(mouseEventProps).length > 0) setMouseData({});
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
            maxHeight: '90%',
            verticalScroll: true,
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
    // add view range to the options, to sync current range with state one and allow to control it
    withPropsOnChange(['viewRange', 'options'], ({ viewRange = {}, options}) => ({
        options: {
            ...options,
            ...(viewRange) // TODO: if the new view range is very far from the current one, the animation takes a lot. We should allow also to disable animation (animation: false in the options)
        }
    })),
    // items enhancer. Add background items for playback and time ranges
    withPropsOnChange(
        ['items', 'currentTime', 'offsetEnabled', 'hideLayersName', 'playbackRange', 'playbackEnabled', 'selectedLayer', 'currentTimeRange'],
        ({
            currentTimeRange,
            items,
            playbackEnabled,
            offsetEnabled,
            playbackRange
        }) => ({
            items: [
                ...items,
                playbackEnabled && playbackRange && playbackRange.startPlaybackTime !== undefined && playbackRange.endPlaybackTime !== undefined ? {
                    id: 'playback-range',
                    ...getStartEnd(playbackRange.startPlaybackTime, playbackRange.endPlaybackTime),
                    type: 'background',
                    className: 'ms-playback-range'
                } : null,
                offsetEnabled && currentTimeRange.start !== undefined && currentTimeRange.end !== undefined ? {
                    id: 'current-range',
                    ...getStartEnd(currentTimeRange.start, currentTimeRange.end),
                    type: 'background',
                    className: 'ms-current-range'
                } : null
            ].filter(val => val)
        })
    ),
    // custom times enhancer
    withPropsOnChange(
        ['currentTime', 'playbackRange', 'playbackEnabled', 'offsetEnabled', 'currentTimeRange'],
        ({ currentTime, playbackRange, playbackEnabled, offsetEnabled, currentTimeRange }) => ({
            customTimes: [
                (currentTime ? {currentTime: currentTime } : {}),
                (playbackEnabled && playbackRange && playbackRange.startPlaybackTime && playbackRange.endPlaybackTime ? playbackRange : {}),
                (offsetEnabled && currentTimeRange ? { offsetTime: currentTimeRange.end } : {})
            ].reduce((res, value) => value ? { ...res, ...value } : { ...res }, {}) // becomes an object
        })
    )
);
const Timeline = require('../../components/time/TimelineComponent');

module.exports = enhance(Timeline);
