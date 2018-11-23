/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const { createSelector } = require('reselect');
const Timeline = require('./timeline/Timeline');
const InlineDateTimeSelector = require('../components/time/InlineDateTimeSelector');
const Toolbar = require('../components/misc/toolbar/Toolbar');
const { offsetEnabledSelector, currentTimeSelector, layersWithTimeDataSelector } = require('../selectors/dimension');
const { selectedLayerSelector, currentTimeRangeSelector } = require('../selectors/timeline');
const { mapLayoutValuesSelector } = require('../selectors/maplayout');

const { withState, compose, branch, renderNothing, withStateHandlers, withProps, defaultProps } = require('recompose');
const withResizeSpy = require('../components/misc/enhancers/withResizeSpy');

const { selectTime, enableOffset } = require('../actions/timeline');
const { setCurrentOffset } = require('../actions/dimension');
const Message = require('../components/I18N/Message');
const { selectPlaybackRange } = require('../actions/playback');
const { playbackRangeSelector, statusSelector } = require('../selectors/playback');

const { head, isString} = require('lodash');
const moment = require('moment');
const isPercent = (val) => isString(val) && val.indexOf("%") !== -1;
const getPercent = (val) => parseInt(val, 10) / 100;
const isValidOffset = (start, end) => moment(end).diff(start) > 0;

/**
  * Timeline Plugin. Shows the timeline tool on the map
  * @class  Timeline
  * @memberof plugins
  * @static
  */
const TimelinePlugin = compose(
    connect(
        createSelector(
            layersWithTimeDataSelector,
            selectedLayerSelector,
            currentTimeSelector,
            currentTimeRangeSelector,
            offsetEnabledSelector,
            playbackRangeSelector,
            statusSelector,
            (layers, selectedLayer, currentTime, currentTimeRange, offsetEnabled, playbackRange, status) => ({
                layers,
                selectedLayer,
                currentTime,
                currentTimeRange,
                offsetEnabled,
                playbackRange,
                status
            })
        ), {
            setCurrentTime: selectTime,
            onOffsetEnabled: enableOffset,
            setOffset: setCurrentOffset,
            setPlaybackRange: selectPlaybackRange
        }),
    branch(({ layers = [] }) => Object.keys(layers).length === 0, renderNothing),
    withState('options', 'setOptions', {collapsed: true}),
    //
    // ** Responsiveness to container.
    // These enhancers allow to properly place the timeline inside the map
    // and resize it or hide accordingly with the available space
    //
    compose(
        // get container size
        compose(
            withStateHandlers(() => ({}), {
                onResize: () => ({ width }) => ({ containerWidth: width })
            }),
            withResizeSpy({ querySelector: ".ms2", closest: true, debounceTime: 100 })
        ),
        defaultProps({
            style: {
                marginBottom: 35,
                marginLeft: 100,
                marginRight: 80
            }
        }),
        // get info about expand, collapse panel
        connect( createSelector(
            state => mapLayoutValuesSelector(state, { right: true, bottom: true, left: true }),
            mapLayoutStyle => ({mapLayoutStyle}))),
        // guess when to hide
        withProps(
            ({containerWidth, style, mapLayoutStyle, options = {}}) => {
                const { marginLeft, marginRight} = style || {};
                let {left = 0, right = 0} = mapLayoutStyle;
                right = isPercent(right) && (getPercent(right) * containerWidth) || right;
                left = isPercent(right) && (getPercent(right) * containerWidth) || right;
                const { collapsed, playbackEnabled} = options;
                // size of date picker with all margins
                const DATE_TIME_BAR = 378;
                // 94 + 4 the timeline button-group expanded and its margin (1 button more than when collapsed)
                // 62 + 4 the timeline button-group collapsed and its margin
                // 32 + 2 Expand button
                const MIN_EXPANDED = DATE_TIME_BAR + 94 + 4 + 32 + 2;
                const MIN_COLLAPSED = DATE_TIME_BAR + 62 + 4 + 32 + 2;
                // 160 playback offset width with its margins
                const PLAYBACK_OFFSET = 160;
                const minWidth = (collapsed ? MIN_COLLAPSED : MIN_EXPANDED );
                if (containerWidth) {
                    const availableWidth = containerWidth - right - left - marginLeft - marginRight;
                    const canExpand = !collapsed || availableWidth > MIN_EXPANDED + (playbackEnabled && 160 || 0);
                    const canExpandPlayback = playbackEnabled || availableWidth > (minWidth + PLAYBACK_OFFSET) - (!canExpand && 32 || 0);
                    return {
                        hide: availableWidth < minWidth,
                        canExpand,
                        canExpandPlayback,
                        style: {...style, ...mapLayoutStyle}
                    };
                }
                return {style: {...style, ...mapLayoutStyle}};
            }
        ),
        // effective hide
        branch(({ hide }) => hide, renderNothing)
    )
)(
    ({
        items,
        options,
        setOptions,
        currentTime,
        setCurrentTime,
        offsetEnabled,
        onOffsetEnabled,
        currentTimeRange,
        setOffset,
        style,
        canExpand,
        canExpandPlayback,
        status
    }) => {

        const { hideLayersName, collapsed, playbackEnabled} = options;

        const playbackItem = head(items && items.filter(item => item.name === 'playback'));
        const Playback = playbackItem && playbackItem.plugin;

        return (<div
            style={{
                position: "absolute",
                marginBottom: 35,
                marginLeft: 100,

                background: "transparent",
                ...style,
                right: collapsed ? 'auto' : (style.right || 0)
            }}
            className={`timeline-plugin${hideLayersName ? ' hide-layers-name' : ''}${offsetEnabled ? ' with-time-offset' : ''}`}>

            {offsetEnabled // if range is present and configured, show the floating start point.
                && <InlineDateTimeSelector
                glyph="range-start"
                tooltip={<Message msgId="timeline.currentTime"/>}
                date={currentTime || currentTimeRange && currentTimeRange.start}
                onUpdate={start => (currentTimeRange && isValidOffset(start, currentTimeRange.end) || !currentTimeRange) && status !== "PLAY" && setCurrentTime(start)}
                className="shadow-soft"
                style={{
                    position: 'absolute',
                    top: -60,
                    left: 2
                }} />}

            <div className="timeline-plugin-toolbar">
                {offsetEnabled && currentTimeRange
                    // if range enabled, show time end in the timeline
                    ? <InlineDateTimeSelector
                        glyph={'range-end'}
                        tooltip="Offset time"
                        date={currentTimeRange.end}
                        onUpdate={end => status !== "PLAY" && isValidOffset(currentTime, end) && setOffset(end)} />
                    : // show current time if using single time
                    <InlineDateTimeSelector
                        glyph={'time-current'}
                        tooltip={<Message msgId="timeline.currentTime"/>}
                        date={currentTime || currentTimeRange && currentTimeRange.start}
                        onUpdate={start => (currentTimeRange && isValidOffset(start, currentTimeRange.end) || !currentTimeRange) && status !== "PLAY" && setCurrentTime(start)} />}

                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md',
                        bsStyle: 'primary'
                    }}
                    buttons={[
                        {
                            glyph: 'list',
                            tooltip: <Message msgId={!hideLayersName ? "timeline.hideLayerName" : "timeline.showLayerName" } />,
                            bsStyle: !hideLayersName ? 'success' : 'primary',
                            visible: !collapsed,
                            active: !hideLayersName,
                            onClick: () => setOptions({ ...options, hideLayersName: !hideLayersName })
                        },
                        {
                            glyph: 'time-offset',
                            bsStyle: offsetEnabled ? 'success' : 'primary',
                            active: offsetEnabled,
                            tooltip: <Message msgId={offsetEnabled ? "timeline.enableOffset" : "timeline.disableOffset"} />,
                            onClick: () => {
                                if (status !== "PLAY") onOffsetEnabled(!offsetEnabled);

                            }
                        },
                        {
                            glyph: 'playback',
                            tooltip: <Message msgId= {!playbackEnabled ? "timeline.enablePlayBack" : "timeline.disablePlayBack"}/>,
                            bsStyle: playbackEnabled ? 'success' : 'primary',
                            active: playbackEnabled,
                            visible: !!Playback && canExpandPlayback,
                            onClick: () => {
                                setOptions({ ...options, playbackEnabled: !playbackEnabled });

                            }
                        }
                    ]} />
                {playbackEnabled && <Playback {...playbackItem}/>}
                <Toolbar
                    btnGroupProps={{
                        className: 'timeline-plugin-toolbar-right'
                    }}
                    btnDefaultProps={{
                        className: 'square-button-md',
                        bsStyle: 'primary'
                    }}
                    buttons={[
                        {
                            visible: canExpand,
                            tooltip: <Message msgId= {collapsed ? "timeline.expand" : "timeline.collapse"}/>,
                            glyph: collapsed ? 'resize-full' : 'resize-small',
                            // we perform a check if the timeline data is loaded before allowing the user to expand the timeline and render an empty component
                            onClick: () => setOptions({ ...options, collapsed: !collapsed })
                        }
                    ]} />
            </div>
            {!collapsed &&
                <Timeline
                    offsetEnabled={offsetEnabled}
                    playbackEnabled={playbackEnabled}
                    hideLayersName={hideLayersName} />}
        </div>);
    }
);

const assign = require('object-assign');

module.exports = {
    TimelinePlugin: assign(TimelinePlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}"
    }),
    reducers: {
        dimension: require('../reducers/dimension'),
        timeline: require('../reducers/timeline')
    },
    epics: require('../epics/timeline')
};
