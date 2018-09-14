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
const { selectTime, selectOffset, selectLayer, onRangeChanged } = require('../../actions/timeline');
const { itemsSelector, loadingSelector, selectedLayerSelector, calculateOffsetTimeSelector } = require('../../selectors/timeline');
const { selectPlaybackRange } = require('../../actions/playback');
const { playbackRangeSelector } = require('../../selectors/playback');
const { createStructuredSelector, createSelector } = require('reselect');
const { compose, branch, withHandlers, withPropsOnChange, renderNothing, defaultProps } = require('recompose');
const moment = require('moment');
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
    branch(({ layers = [] }) => Object.keys(layers).length === 0, renderNothing),
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
                   + (loading[l.id] ? `<div class="timeline-layer-icon"><div class="timeline-spinner"></div></div>` : `<div class="timeline-layer-icon">${(l.id && l.id === selectedLayer) ? '<i class="glyphicon glyphicon-time"></i>' : ''}</div>`)
                    + `<div class="timeline-layer-title">${(isString(l.title) ? l.title : l.name)}</div></div>` // TODO: i18n for layer titles*/
            }))
        })
    )
);
/**
 * Bind current time properties and handlers
 */
const currentTimeEnhancer = compose(
    connect(
        createStructuredSelector({
            currentTime: currentTimeSelector,
            calculatedOffsetTime: calculateOffsetTimeSelector
        }),
        {
            setCurrentTime: selectTime,
            setOffset: selectOffset
        }
    ),
    defaultProps({
        currentTime: new Date().toISOString(),
        calculatedOffsetTime: 10000
    })
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

const getStartEnd = (startTime, endTime) => {
    const diff = moment(startTime).diff(endTime);
    return {
        start: diff >= 0 ? endTime : startTime,
        end: diff >= 0 ? startTime : endTime
    };
};

const clickHandleEnhancer = withHandlers({
    clickHandler: ({
        currentTime,
        setCurrentTime = () => { },
        selectGroup = () => { },
        playbackRange,
        setPlaybackRange = () => {},
        setOffset = () => {}
    }) => ({ time, group, what, event } = {}) => {
        if (["axis", "group-label"].indexOf(what) < 0) {
            const target = event && event.target && event.target.closest('.vis-custom-time');
            const className = target && target.getAttribute('class');
            const timeId = className && trim(className.replace('vis-custom-time', ''));
            if (!timeId || timeId === 'currentTime') {
                setCurrentTime(time.toISOString());
            } if (timeId === 'offsetTime') {
                const offset = moment(time).diff(currentTime);
                if (offset > 0) setOffset(offset);
            } else if (timeId === 'startPlaybackTime' || timeId === 'endPlaybackTime') {

                const range = {...playbackRange, [timeId]: time.toISOString()};
                const {start, end} = getStartEnd(range.startPlaybackTime, range.endPlaybackTime);
                setPlaybackRange({
                    startPlaybackTime: start,
                    endPlaybackTime: end
                });

            }
        } else if (what === "group-label") {
            selectGroup(group);
        }
    }
});
const rangeEnhancer = compose(
    connect(() => ({}), {
        rangechangedHandler: onRangeChanged
    })
);

const enhance = compose(
    currentTimeEnhancer,
    playbackRangeEnhancer,
    layerSelectionEnhancer,
    clickHandleEnhancer,
    rangeEnhancer,
    layerData,
    withPropsOnChange(
        ['currentTime', 'offsetEnabled', 'calculatedOffsetTime', 'hideLayersName', 'playbackRange', 'playbackEnabled'],
        ({
            currentTime,
            calculatedOffsetTime,
            items,
            playbackEnabled,
            offsetEnabled,
            playbackRange = {}
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
                    ...getStartEnd(currentTime, calculatedOffsetTime),
                    type: 'background',
                    className: 'ms-current-range'
                } : null
            ].filter(val => val),
            key: 'timeline',
            customTimes: {
                currentTime,
                ...[
                    (playbackEnabled ? playbackRange : {}),
                    (offsetEnabled ? {offsetTime: calculatedOffsetTime} : {})]
                .reduce((res, value) => value ? {...res, ...value} : {...res}, {})
            },
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
        })
    )
);
const Timeline = require('react-visjs-timeline').default;

module.exports = enhance(Timeline);
