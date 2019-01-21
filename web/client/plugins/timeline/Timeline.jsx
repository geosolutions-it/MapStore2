/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { connect } = require('react-redux');
const { isString, differenceBy } = require('lodash');
const { currentTimeSelector, layersWithTimeDataSelector } = require('../../selectors/dimension');


const { selectTime, selectLayer, onRangeChanged, setMouseEventData } = require('../../actions/timeline');
const { itemsSelector, loadingSelector, selectedLayerSelector, mouseEventSelector, currentTimeRangeSelector, rangeSelector } = require('../../selectors/timeline');
const { setCurrentOffset } = require('../../actions/dimension');
const { selectPlaybackRange } = require('../../actions/playback');
const { playbackRangeSelector, statusSelector } = require('../../selectors/playback');
const { createStructuredSelector, createSelector } = require('reselect');
const { compose, withPropsOnChange, defaultProps } = require('recompose');
const withMask = require('../../components/misc/enhancers/withMask');
const Message = require('../../components/I18N/Message');
const LoadingSpinner = require('../../components/misc/LoadingSpinner');


const clickHandleEnhancer = compose(
    require('../../components/time/enhancers/clickHandlers')
);

const moment = require('moment');

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
    // Playback range background
    withPropsOnChange(
        (props, nextProps) => {
            const update = Object.keys(props)
                .filter(k => ['items', 'hideLayersName', 'playbackRange', 'playbackEnabled', 'selectedLayer'].indexOf(k) >= 0)
                .filter(k => props[k] !== nextProps[k]);
            return update.length > 0;
        },
        ({
            items,
            playbackEnabled,
            playbackRange
        }) => ({
                items: playbackEnabled && playbackRange && playbackRange.startPlaybackTime !== undefined && playbackRange.endPlaybackTime !== undefined
                    ? [
                        ...items,
                        {
                            id: 'playback-range',
                            ...getStartEnd(playbackRange.startPlaybackTime, playbackRange.endPlaybackTime),
                            type: 'background',
                            className: 'ms-playback-range'
                        }
                    ].filter(val => val)
                    : items
        })
    ),
    // offset range background
    withPropsOnChange(
        (props, nextProps) => {
            const update = Object.keys(props)
                .filter(k => ['items', 'currentTime', 'offsetEnabled', 'hideLayersName', 'selectedLayer', 'currentTimeRange'].indexOf(k) >= 0)
                .filter( k => props[k] !== nextProps[k]);
            return update.length > 0;
        },
        ({
            currentTimeRange,
            items,
            offsetEnabled
        }) => ({
                items: offsetEnabled && currentTimeRange.start !== undefined && currentTimeRange.end !== undefined
                ? [
                    ...items,
                        {
                            id: 'current-range',
                            ...getStartEnd(currentTimeRange.start, currentTimeRange.end),
                            editable: {

                            },
                            type: 'background',
                            className: 'ms-current-range'
                        }
                    ].filter(val => val)
                : items
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
    ),
    withMask(
        ({loading}) => loading && loading.timeline,
        () => <div style={{ margin: "auto" }} ><LoadingSpinner style={{ display: "inline-block", verticalAlign: "middle" }}/><Message msgId="loading" /></div>,
        {white: true}
    ),
    withPropsOnChange(['status'], ({status}) => ({
        readOnly: status === "PLAY"
    }))
);
const Timeline = require('../../components/time/TimelineComponent');

module.exports = enhance(Timeline);
