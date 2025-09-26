/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { head, isString } from 'lodash';
import moment from 'moment';
import React, { useEffect } from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
    branch,
    compose,
    defaultProps,
    renderNothing,
    setDisplayName,
    withProps,
    withState,
    withStateHandlers
} from 'recompose';
import { createSelector } from 'reselect';

import { setCurrentOffset } from '../actions/dimension';
import { selectPlaybackRange } from '../actions/playback';
import {
    enableOffset,
    onRangeChanged,
    selectTime,
    setMapSync,
    initTimeline,
    resetTimeline
} from '../actions/timeline';
import Message from '../components/I18N/Message';
import tooltip from '../components/misc/enhancers/tooltip';
import withResizeSpy from '../components/misc/enhancers/withResizeSpy';
import Toolbar from '../components/misc/toolbar/Toolbar';
import InlineDateTimeSelector from '../components/time/InlineDateTimeSelector';
import { currentTimeSelector, offsetEnabledSelector } from '../selectors/dimension';
import { mapLayoutValuesSelector } from '../selectors/maplayout';
import { playbackRangeSelector, statusSelector } from '../selectors/playback';
import {
    currentTimeRangeSelector,
    isMapSync,
    isVisible,
    rangeSelector,
    selectedLayerSelector,
    timelineLayersSelector
} from '../selectors/timeline';
import Timeline from './timeline/Timeline';
import TimelineToggle from './timeline/TimelineToggle';
import ButtonRB from '../components/misc/Button';
import { isTimelineVisible } from "../utils/LayersUtils";
import Loader from '../components/misc/Loader';

const Button = tooltip(ButtonRB);


const isPercent = (val) => isString(val) && val.indexOf("%") !== -1;
const getPercent = (val) => parseInt(val, 10) / 100;
const isValidOffset = (start, end) => moment(end).diff(start) > 0;

/**
  * Timeline Plugin. Shows the timeline tool on the map.
  * To use with Playback plugin. {@link #plugins.Playback|Playback}
  * For configuration, see related {@link api/framework#reducers.timeline|reducer's documentation}
  * @class  Timeline
  * @memberof plugins
  * @static
  * @prop {boolean} cfg.expandedPanel If `false`, the panel is collapsed by default. If true, the panel is expanded by default. `false` by default.
  * @prop {boolean} cfg.showHiddenLayers  if `true`, shows a line for each layer with the time data, if `false`, shows only the visible layers. `false` by default.
  * @prop {string} cfg.initialMode  One of `single` or `range`. Determines the initial mode of the timeline. To start the plugin by selecting a single time or a time range. Default mode is `single`
  * @prop {string} cfg.initialSnap One of `now` or `fullRange`. Sets initial snap policy when the layer is added or the plugin is initialized (if no time selection is saved in the map). Default value is `now`.
  * - When `fullRange` (and initialMode is `range`) the timeline select a time range that includes all the data of the guide layer.
  * - When `now`, the plugin selects the current time, or if a guide layer is selected, the time entry of the guide layer nearest to the current time.
  * @prop {boolean} cfg.resetButton shows a reset button that resets the timeline to the full range or to now, depending if mode is `single` or `range`. `false` by default.
  * - If current mode is `single`, when the reset button is clicked the time is set to nearest of the current time and when layer is unselected, the time is set to now.
  * - If current mode is `range`, when the reset button is clicked the time is set to the full range of the layer
  *
  * @example
  * {
  *   "name": "TimeLine",
  *   "cfg": {
  *        "initialMode": "range",
  *        "initialSnap": "fullRange",
  *        "resetButton": true
  *    }
  * }
  *
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
            (state) => state.timeline?.loader !== undefined,
            selectedLayerSelector,
            (visible, layers, currentTime, currentTimeRange, offsetEnabled, playbackRange, status, viewRange, timelineIsReady, selectedLayer) => ({
                visible,
                layers,
                currentTime,
                currentTimeRange,
                offsetEnabled,
                playbackRange,
                status,
                viewRange,
                timelineIsReady,
                selectedLayer
            })
        ), {
            setCurrentTime: selectTime,
            onOffsetEnabled: enableOffset,
            setOffset: setCurrentOffset,
            setPlaybackRange: selectPlaybackRange,
            moveRangeTo: onRangeChanged,
            onInit: initTimeline,
            reset: resetTimeline
        }),
    branch(({ visible = true, layers = [] }) => !visible || Object.keys(layers).length === 0, renderNothing),

    withState('options', 'setOptions', ({expandedPanel}) => {
        return { collapsed: !expandedPanel };
    }),
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
            showHiddenLayers: false,
            expandLimit: 20,
            snapType: "start",
            endValuesSupport: undefined,
            style: {
                marginBottom: 5,
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
        compactToolbar,
        showHiddenLayers,
        expandLimit,
        snapType,
        endValuesSupport,
        onInit = () => {},
        layers,
        timelineIsReady,
        initialMode = 'single',
        initialSnap = 'now',
        resetButton,
        reset = () => {},
        selectedLayer
    }) => {
        useEffect(()=>{
            // update state with configs coming from configuration file like localConfig.json so that can be used as props initializer
            onInit({showHiddenLayers, expandLimit, snapType, endValuesSupport, initialMode, initialSnap});
        }, [onInit]);

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
                ...style,
                right: collapsed ? 'auto' : (style.right || 0)
            }}
            className={`timeline-plugin${hideLayersName ? ' hide-layers-name' : ''}${offsetEnabled ? ' with-time-offset' : ''} ${!isTimelineVisible(layers) ? 'hidden' : ''}`}>

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
                                glyph: "viewport-filter",
                                tooltip: <Message msgId={mapSync ? "timeline.mapSyncOn" : "timeline.mapSyncOff"} />,
                                bsStyle: mapSync ? 'success' : 'primary',
                                active: mapSync,
                                onClick: () => toggleMapSync(!mapSync)
                            },
                            {
                                glyph: offsetEnabled ? "resize-horizontal" : "time",
                                visible: !!resetButton,
                                tooltip: <Message msgId={`timeline.reset.${offsetEnabled ? "range" : !!selectedLayer ? "singleNearest" : "singleNow"}`} />,
                                bsStyle: 'primary',
                                onClick: reset
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
            {!timelineIsReady && <div className="timeline-loader">
                <Loader size={50} />
            </div>}
            {!collapsed &&
                <Timeline
                    offsetEnabled={offsetEnabled}
                    playbackEnabled
                    hideLayersName={hideLayersName}
                    timelineLayers={layers}
                />}
        </div>);
    }
);

export default {
    TimelinePlugin: Object.assign(TimelinePlugin, {
        disablePluginIf: "{state('mapType') === 'cesium'}",
        WidgetsTray: {
            tool: <TimelineToggle />,
            position: 0
        }
    }),
    reducers: {
        dimension: require('../reducers/dimension').default,
        timeline: require('../reducers/timeline').default
    },
    epics: require('../epics/timeline').default
};
