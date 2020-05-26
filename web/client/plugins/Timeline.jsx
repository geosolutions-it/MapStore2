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
const { offsetEnabledSelector, currentTimeSelector } = require('../selectors/dimension');
const { currentTimeRangeSelector, isVisible, rangeSelector, timelineLayersSelector, isMapSync } = require('../selectors/timeline');
const { mapLayoutValuesSelector } = require('../selectors/maplayout');

const { withState, compose, branch, renderNothing, withStateHandlers, withProps, defaultProps, setDisplayName } = require('recompose');
const withResizeSpy = require('../components/misc/enhancers/withResizeSpy');

const { selectTime, enableOffset, onRangeChanged, setMapSync } = require('../actions/timeline');
const { setCurrentOffset } = require('../actions/dimension');
const Message = require('../components/I18N/Message');
const { selectPlaybackRange } = require('../actions/playback');
const { playbackRangeSelector, statusSelector } = require('../selectors/playback');

const { Button: ButtonRB, Glyphicon } = require('react-bootstrap');
const tooltip = require('../components/misc/enhancers/tooltip');
const Button = tooltip(ButtonRB);

const { head, isString} = require('lodash');
const moment = require('moment');
const isPercent = (val) => isString(val) && val.indexOf("%") !== -1;
const getPercent = (val) => parseInt(val, 10) / 100;
const isValidOffset = (start, end) => moment(end).diff(start) > 0;

/**
  * Timeline Plugin. Shows the timeline tool on the map.
  * To use with Playback plugin. {@link api/plugins#plugins.Playback}
  * For configuration, see related reducer's documentation {@link api/framework#reducers.timeline}
  * @class  Timeline
  * @memberof plugins
  * @static
  */
const TimelinePlugin = compose(
    connect(
        createSelector(
            isVisible,
            timelineLayersSelector,
            currentTimeSelector,
            currentTimeRangeSelector,
            offsetEnabledSelector,
            playbackRangeSelector,
            statusSelector,
            rangeSelector,
            (visible, layers, currentTime, currentTimeRange, offsetEnabled, playbackRange, status, viewRange) => ({
                visible,
                layers,
                currentTime,
                currentTimeRange,
                offsetEnabled,
                playbackRange,
                status,
                viewRange
            })
        ), {
            setCurrentTime: selectTime,
            onOffsetEnabled: enableOffset,
            setOffset: setCurrentOffset,
            setPlaybackRange: selectPlaybackRange,
            moveRangeTo: onRangeChanged
        }),
    branch(({ visible = true, layers = [] }) => !visible || Object.keys(layers).length === 0, renderNothing),
    withState('options', 'setOptions', {collapsed: true}),
    // add mapSync button handler and value
    connect(
        createSelector(isMapSync, mapSync => ({mapSync})),
        {
            toggleMapSync: setMapSync
        }
    ),
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
            ({containerWidth, style, mapLayoutStyle}) => {
                const { marginLeft, marginRight} = style || {};
                let {left = 0, right = 0} = mapLayoutStyle;
                right = isPercent(right) && (getPercent(right) * containerWidth) || right;
                left = isPercent(left) && (getPercent(left) * containerWidth) || left;

                const minWidth = 410;

                if (containerWidth) {
                    const availableWidth = containerWidth - right - left - marginLeft - marginRight;
                    return {
                        hide: availableWidth < minWidth,
                        compactToolbar: availableWidth < 880,
                        style: {...style, ...mapLayoutStyle, minWidth}
                    };
                }
                return {style: {...style, ...mapLayoutStyle, minWidth}};
            }
        ),
        // effective hide
        branch(({ hide }) => hide, renderNothing),
        setDisplayName("TimelinePlugin")
    )
)(
    ({
        items,
        options,
        setOptions,
        mapSync,
        toggleMapSync = () => {},
        currentTime,
        setCurrentTime,
        offsetEnabled,
        onOffsetEnabled,
        currentTimeRange,
        setOffset,
        style,
        status,
        viewRange,
        moveRangeTo,
        compactToolbar
    }) => {

        const { hideLayersName, collapsed } = options;

        const playbackItem = head(items && items.filter(item => item.name === 'playback'));
        const Playback = playbackItem && playbackItem.plugin;

        const zoomToCurrent = (time, type, view, offsetRange ) => {
            const shift = moment(view.end).diff(view.start) / 2;
            if (type === "time-current" && view) {
                // if the current time is centered to viewRange do nothing
                view.start.toString() !== moment(time).add(-1 * shift).toString() && view.end.toString() !== moment(time).add(shift).toString()
                && moveRangeTo({
                    start: moment(time).add(-1 * shift),
                    end: moment(time).add(shift)
                });
            }
            // center to the current offset range
            if (type === "range-start" || type === "range-end") {
                const offsetRangeDistance = moment(offsetRange.end).diff(offsetRange.start);
                const offsetCenter = moment(offsetRange.start).add(offsetRangeDistance / 2);
                // if the range is smaller than the view range then move the range
                if ( offsetRangeDistance / 2 <= shift ) {
                    moveRangeTo({
                        start: moment(offsetCenter).add(-1 * shift),
                        end: moment(offsetCenter).add(shift)
                    });
                // if offset range is wider than the view range zoom out + move
                } else {
                    moveRangeTo({
                        start: moment(offsetCenter).add(-1 * offsetRangeDistance * 5 / 2),
                        end: moment(offsetCenter).add( offsetRangeDistance * 5 / 2)
                    });
                }
            }
        };
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
                    clickable={!collapsed}
                    glyph="range-start"
                    onIconClick= {(time, type) => status !== "PLAY" && zoomToCurrent(time, type, viewRange, currentTimeRange)}
                    tooltip={<Message msgId="timeline.rangeStart"/>}
                    showButtons
                    date={currentTime || currentTimeRange && currentTimeRange.start}
                    onUpdate={start => (currentTimeRange && isValidOffset(start, currentTimeRange.end) || !currentTimeRange) && status !== "PLAY" && setCurrentTime(start)}
                    className="shadow-soft"
                    style={{
                        position: 'absolute',
                        top: -5,
                        left: 2,
                        transform: 'translateY(-100%)'
                    }} />}

            <div
                className={`timeline-plugin-toolbar${compactToolbar ? ' ms-collapsed' : ''}`}>
                {offsetEnabled && currentTimeRange
                    // if range enabled, show time end in the timeline
                    ? <InlineDateTimeSelector
                        clickable={!collapsed}
                        glyph={'range-end'}
                        onIconClick= {(time, type) => status !== "PLAY" && zoomToCurrent(time, type, viewRange, currentTimeRange)}
                        tooltip={<Message msgId="timeline.rangeEnd"/>}
                        date={currentTimeRange.end}
                        showButtons
                        onUpdate={end => status !== "PLAY" && isValidOffset(currentTime, end) && setOffset(end)} />
                    : // show current time if using single time
                    <InlineDateTimeSelector
                        clickable={!collapsed}
                        glyph={'time-current'}
                        showButtons
                        onIconClick= {(time, type) => status !== "PLAY" && zoomToCurrent(time, type, viewRange)}
                        tooltip={<Message msgId="timeline.currentTime"/>}
                        date={currentTime || currentTimeRange && currentTimeRange.start}
                        onUpdate={start => (currentTimeRange && isValidOffset(start, currentTimeRange.end) || !currentTimeRange) && status !== "PLAY" && setCurrentTime(start)} />}
                <div className="timeline-plugin-btn-group">
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
                                disabled: status === "PLAY",
                                tooltip: <Message msgId={!offsetEnabled ? "timeline.enableRange" : "timeline.disableRange"} />,
                                onClick: () => {
                                    if (status !== "PLAY") onOffsetEnabled(!offsetEnabled);

                                }
                            },
                            {
                                glyph: "map-synch",
                                tooltip: <Message msgId={mapSync ? "timeline.mapSyncOn" : "timeline.mapSyncOff"} />,
                                bsStyle: mapSync ? 'success' : 'primary',
                                active: mapSync,
                                onClick: () => toggleMapSync(!mapSync)

                            }
                        ]} />
                    {Playback && <Playback
                        {...playbackItem}
                        settingsStyle={{
                            right: (collapsed || compactToolbar) ? 40 : 'unset'
                        }}/>}
                </div>

                <Button
                    onClick={() => setOptions({ ...options, collapsed: !collapsed })}
                    className="square-button-sm ms-timeline-expand"
                    bsStyle="primary"
                    tooltip={<Message msgId= {collapsed ? "timeline.expand" : "timeline.collapse"}/>}>
                    <Glyphicon glyph={collapsed ? 'chevron-up' : 'chevron-down'}/>
                </Button>

            </div>
            {!collapsed &&
                <Timeline
                    offsetEnabled={offsetEnabled}
                    playbackEnabled
                    hideLayersName={hideLayersName} />}
        </div>);
    }
);

const assign = require('object-assign');
const TimelineToggle = require('./timeline/TimelineToggle');
module.exports = {
    TimelinePlugin: assign(TimelinePlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        WidgetsTray: {
            tool: <TimelineToggle />,
            position: 0
        }
    }),
    reducers: {
        dimension: require('../reducers/dimension'),
        timeline: require('../reducers/timeline')
    },
    epics: require('../epics/timeline')
};
