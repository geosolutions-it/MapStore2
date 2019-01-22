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
const { moveTime, setCurrentOffset } = require('../../actions/dimension');
const { selectPlaybackRange } = require('../../actions/playback');
const { playbackRangeSelector, statusSelector } = require('../../selectors/playback');
const { createStructuredSelector, createSelector } = require('reselect');
const { createShallowSelectorCreator } = require('../../utils/ReselectUtils');

const { compose, withHandlers, withPropsOnChange, defaultProps } = require('recompose');
const withMask = require('../../components/misc/enhancers/withMask');
const Message = require('../../components/I18N/Message');
const LoadingSpinner = require('../../components/misc/LoadingSpinner');


const clickHandleEnhancer = compose(
    require('../../components/time/enhancers/clickHandlers')
);

const moment = require('moment');
/**
 * Optimization to skip re-render when the layers update properties that are not needed.
 * Typically `loading` attribute
 */
const timeLayersSelector = createShallowSelectorCreator(
    (a = {}, b = {}) => {
        return a.id === b.id && a.title === b.title && a.name === b.name;
    }
)(layersWithTimeDataSelector, layers => layers);

/**
 * Provides time dimension data for layers
 */
const layerData = compose(
    connect(
        createSelector(
            rangeSelector,
            itemsSelector,
            timeLayersSelector,
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
            moveCurrentRange: moveTime,
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
            itemsAlwaysDraggable: true,
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
    // disable some functionalities when playing
    withPropsOnChange(['status'], ({ status }) => ({
        readOnly: status === "PLAY"
    })),
    // Playback range background
    withPropsOnChange(
        (props, nextProps) => {
            const update = Object.keys(props)
                .filter(k => ['rangeItems', 'hideLayersName', 'playbackRange', 'playbackEnabled', 'selectedLayer'].indexOf(k) >= 0)
                .filter(k => props[k] !== nextProps[k]);
            return update.length > 0;
        },
        ({
            rangeItems = [],
            playbackEnabled,
            playbackRange
        }) => ({
                rangeItems: playbackEnabled && playbackRange && playbackRange.startPlaybackTime !== undefined && playbackRange.endPlaybackTime !== undefined
                    ? [
                    ...rangeItems,
                        {
                            id: 'playback-range',
                            ...getStartEnd(playbackRange.startPlaybackTime, playbackRange.endPlaybackTime),
                            type: 'background',
                            className: 'ms-playback-range'
                        }
                    ].filter(val => val)
                    : rangeItems
        })
    ),
    // support for offset and it's range background. TODO: compose also with the proper custom time, to isolate the functionality
    compose(
        withHandlers({
            onUpdate: ({ moveCurrentRange = () => {}}) => ({id, start}) => {
                if (id === 'current-range') {
                    moveCurrentRange(start.toISOString());
                }

            }
        }),
        withPropsOnChange(['options', 'onUpdate'], ({ options = {}, onUpdate = () => {} }) => ({
            options: {
                ...options,
                snap: null,
                editable: {
                    // ...(options.editable || {}), // we may improve this merge to allow some configuration.
                    add: false,         // add new items by double tapping
                    updateTime: false,  // drag items horizontally
                    updateGroup: false, // drag items from one group to another
                    remove: false,       // delete an item by tapping the delete button top right
                    overrideItems: false  // allow these options to override item.editable
                },
                onMove: (item = {}, callback) => {
                    onUpdate(item);
                    callback(item);

                }
            }
        })),
        withPropsOnChange(
            (props, nextProps) => {
                const update = Object.keys(props)
                    .filter(k => ['rangeItems', 'currentTime', 'offsetEnabled', 'hideLayersName', 'selectedLayer', 'currentTimeRange', 'readOnly'].indexOf(k) >= 0)
                    .filter(k => props[k] !== nextProps[k]);
                // console.log(update);
                return update.length > 0;
            },
            ({
                currentTimeRange,
                rangeItems = [],
                readOnly,
                offsetEnabled
            }) => ({
                rangeItems: offsetEnabled && currentTimeRange.start !== undefined && currentTimeRange.end !== undefined
                    ? [
                        ...rangeItems,
                        {
                            id: 'current-range',
                            editable: { updateTime: !readOnly, updateGroup: false, remove: false },
                            ...getStartEnd(currentTimeRange.start, currentTimeRange.end),
                            type: 'background',
                            className: 'ms-current-range'
                        }
                    ].filter(val => val)
                    : rangeItems
            })
        )
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
    )
);
const Timeline = require('../../components/time/TimelineComponent');

module.exports = enhance(Timeline);
