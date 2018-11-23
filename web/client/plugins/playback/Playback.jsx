/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const {createSelector} = require('reselect');
const moment = require('moment');
const { compose, withState, withProps, withHandlers, lifecycle} = require('recompose');
const { playbackSettingsSelector, playbackRangeSelector} = require('../../selectors/playback');
const { selectedLayerSelector, rangeSelector, selectedLayerDataRangeSelector} = require('../../selectors/timeline');
const { selectPlaybackRange, changeSetting, toggleAnimationMode, animationStepMove } = require('../../actions/playback');
const Message = require('../../components/I18N/Message');
const { onRangeChanged } = require('../../actions/timeline');


const Toolbar = require('../../components/misc/toolbar/Toolbar');

const PlaybackSettings = compose(
    connect(createSelector(
        playbackSettingsSelector,
        selectedLayerSelector,
        playbackRangeSelector,
        (settings, selectedLayer, playbackRange) => ({
            fixedStep: !selectedLayer,
            playbackRange,
            ...settings
        })
    ), {
            setPlaybackRange: selectPlaybackRange,
            onSettingChange: changeSetting,
            toggleAnimationMode
    }

    ),
    // playback buttons
    compose(
        connect(createSelector(
            rangeSelector,
            selectedLayerDataRangeSelector,
            (viewRange, layerRange) => ({
                layerRange,
                viewRange
            })
        ), {
                moveTo: onRangeChanged
        }),
        withHandlers({
            toggleAnimationRange: ({ fixedStep, layerRange, viewRange = {}, setPlaybackRange = () => { } }) => (enabled) => {
                let currentPlaybackRange = fixedStep ? viewRange : layerRange;
                // when view range is collapsed, nothing may be initialized yet, so by default 1 day before and after today
                currentPlaybackRange = {
                    startPlaybackTime: moment(currentPlaybackRange && currentPlaybackRange.start || new Date()).subtract(1, 'days').toISOString(),
                    endPlaybackTime: moment(currentPlaybackRange && currentPlaybackRange.end || new Date()).add(1, 'days').toISOString()
                };
                setPlaybackRange(enabled ? currentPlaybackRange : undefined);
            },
            setPlaybackToCurrentViewRange: ({ viewRange = {}, setPlaybackRange = () => { } }) => () => {
                if (viewRange.start && viewRange.end) {
                    setPlaybackRange({
                        startPlaybackTime: moment(viewRange.start).toISOString(),
                        endPlaybackTime: moment(viewRange.end).toISOString()
                    });
                }
            },
            setPlaybackToCurrentLayerDataRange: ({ setPlaybackRange = () => { }, layerRange }) => () => layerRange && setPlaybackRange({
                startPlaybackTime: layerRange.start,
                endPlaybackTime: layerRange.end
            })
        }),
        withProps(({ playbackRange, fixedStep, moveTo = () => { }, setPlaybackToCurrentViewRange = () => { }, setPlaybackToCurrentLayerDataRange = () => {} }) => {
            return {
                playbackButtons: [{
                    glyph: "search",
                    tooltipId: "playback.settings.range.zoomToCurrentPlayackRange",
                    onClick: () => moveTo({start: playbackRange.startPlaybackTime, end: playbackRange.endPlaybackTime})
                }, {
                    glyph: "resize-horizontal",
                        tooltipId: "playback.settings.range.setToCurrentViewRange",
                    onClick: () => setPlaybackToCurrentViewRange()
                }, {
                    glyph: "1-layer",
                    visible: !fixedStep,
                    tooltipId: "playback.settings.range.fitToSelectedLayerRange",
                    onClick: () => setPlaybackToCurrentLayerDataRange()
                }]
            };
        })
    )

)(
    require("../../components/playback/PlaybackSettings")
);


/**
 * Support for expand/collapse timeline
 */
const collapsible = compose(
    withState("showSettings", "onShowSettings", false),
    withState("collapsed", "setCollapsed", true),
    withProps(({ setCollapsed }) => ({
        buttons: [{
            glyph: 'minus',
            onClick: () => setCollapsed(true)
        }]
    }))
);

/**
 * Implements playback buttons functionalities
 */
const playbackButtons = compose(
    connect(() => ({}), {
        stepMove: animationStepMove
    }),
    withHandlers({
        forward: ({ stepMove = () => { }}) => () => stepMove(+1),
        backward: ({ stepMove = () => { } }) => () => stepMove(-1)
    })
);

const playbackEnhancer = compose(
    collapsible,
    playbackButtons
);

module.exports = playbackEnhancer(({
    status,
    statusMap,
    play = () => {},
    forward = () => {},
    backward = () => {},
    pause = () => {},
    stop = () => {},
    showSettings,
    onShowSettings = () => {}
}) =>
( <div style={{display: 'flex'}}>
        { (status !== statusMap.PLAY && status !== statusMap.PAUSE) && showSettings && <PlaybackSettings />}
        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md',
                bsStyle: 'primary'
            }}
            buttons={[
                {
                    glyph: "step-backward",
                    onClick: backward,
                    tooltip: <Message msgId={"playback.backwardStep"} />
                }, {
                    glyph: status === statusMap.PLAY ? "pause" : "play",
                    bsStyle: status === statusMap.PLAY || status === statusMap.PAUSE ? "success" : "primary",
                    onClick: () => status === statusMap.PLAY ? pause() : play(),
                    tooltipId: status === statusMap.PLAY
                        ? "playback.pause"
                        : status === statusMap.PAUSE
                                ? "playback.paused"
                                : "playback.play"
                }, {
                    glyph: "stop",
                    onClick: stop,
                    tooltip: <Message msgId={"playback.stop"} />
                }, {
                    glyph: "step-forward",
                    onClick: forward,
                    tooltip: <Message msgId={"playback.forwardStep"} />
                }, {
                    glyph: "wrench",
                    bsStyle: (status !== statusMap.PLAY && status !== statusMap.PAUSE) && showSettings ? 'success' : 'primary',
                    active: (status !== statusMap.PLAY || status !== statusMap.PAUSE) && !!showSettings,
                    onClick: () => status !== statusMap.PLAY && onShowSettings(!showSettings),
                    tooltip: <Message msgId={"playback.settings.title"} />
                }
            ]}/>
    </div>
    )
);
