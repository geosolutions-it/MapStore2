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
const { withState, compose, branch, renderNothing } = require('recompose');
const { selectTime, enableOffset } = require('../actions/timeline');
const { setCurrentOffset } = require('../actions/dimension');
const Message = require('../components/I18N/Message');
const { selectPlaybackRange } = require('../actions/playback');
const { playbackRangeSelector } = require('../selectors/playback');

const { head } = require('lodash');
const moment = require('moment');

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
            (layers, selectedLayer, currentTime, currentTimeRange, offsetEnabled, playbackRange) => ({
                layers,
                selectedLayer,
                currentTime,
                currentTimeRange,
                offsetEnabled,
                playbackRange
            })
        ), {
            setCurrentTime: selectTime,
            onOffsetEnabled: enableOffset,
            setOffset: setCurrentOffset,
            setPlaybackRange: selectPlaybackRange
        }),
    branch(({ layers = [] }) => Object.keys(layers).length === 0, renderNothing),
    withState('options', 'setOptions', {collapsed: true})
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
        setOffset
    }) => {

        const { hideLayersName, collapsed, playbackEnabled } = options;

        const playbackItem = head(items && items.filter(item => item.name === 'playback'));
        const Playback = playbackItem && playbackItem.plugin;

        return (<div
            style={{
                position: "absolute",
                bottom: 65,
                left: 100,
                right: collapsed ? 'auto' : 80,
                background: "transparent"
            }}
            className={`timeline-plugin${hideLayersName ? ' hide-layers-name' : ''}${offsetEnabled ? ' with-time-offset' : ''}`}>

            {offsetEnabled // if range is present and configured, show the floating start point.
                && <InlineDateTimeSelector
                glyph="range-start"
                tooltip={<Message msgId="timeline.currentTime"/>}
                date={currentTime || currentTimeRange && currentTimeRange.start}
                onUpdate={start => !currentTimeRange || isValidOffset(start, currentTimeRange.end) && setCurrentTime(start)}
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
                        onUpdate={end => isValidOffset(currentTime, end) && setOffset(end)} />
                    : // show current time if using single time
                    <InlineDateTimeSelector
                        glyph={'time-current'}
                        tooltip={<Message msgId="timeline.currentTime"/>}
                        date={currentTime || currentTimeRange && currentTimeRange.start}
                        onUpdate={start => isValidOffset(start, currentTimeRange.end) && setCurrentTime(start)} />}

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
                                onOffsetEnabled(!offsetEnabled);

                            }
                        },
                        {
                            glyph: 'playback',
                            tooltip: <Message msgId= {!playbackEnabled ? "timeline.enablePlayBack" : "timeline.disablePlayBack"}/>,
                            bsStyle: playbackEnabled ? 'success' : 'primary',
                            active: playbackEnabled,
                            visible: !!Playback,
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
                            tooltip: <Message msgId= {collapsed ? "timeline.expand" : "timeline.collapse"}/>,
                            glyph: collapsed ? 'resize-full' : 'resize-small',
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
