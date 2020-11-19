/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { compose, withState, withProps, withHandlers } from 'recompose';
import { selectedLayerSelector } from '../../selectors/timeline';
import { statusSelector, hasPrevNextAnimationSteps, playbackMetadataSelector } from '../../selectors/playback';
import { animationStepMove, STATUS } from '../../actions/playback';
import Message from '../../components/I18N/Message';
import Toolbar from '../../components/misc/toolbar/Toolbar';
import Settings from './Settings';

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

const playbackButtonsSelector = createSelector(
    statusSelector,
    selectedLayerSelector,
    playbackMetadataSelector,
    hasPrevNextAnimationSteps,
    (status, layer, metadata = {}, animationState) =>
        !layer
            ? { hasNext: true, hasPrevious: true } // fixed step
            : status === STATUS.PLAY || status === STATUS.PAUSE
                ? animationState // animation mode with guide layer
                : { hasNext: !!metadata.next, hasPrevious: !!metadata.previous} // normal mode with guide layer
);


/**
 * Implements playback buttons functionalities
 */
const playbackButtons = compose(
    connect(playbackButtonsSelector, {
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

export default playbackEnhancer(({
    status,
    statusMap,
    play = () => {},
    forward = () => {},
    backward = () => {},
    pause = () => {},
    stop = () => {},
    hasPrevious,
    hasNext,
    showSettings,
    onShowSettings = () => {},
    settingsStyle = {}
}) =>
    ( <div style={{display: 'flex'}}>
        { (status !== statusMap.PLAY && status !== statusMap.PAUSE) && showSettings && <Settings style={settingsStyle}/>}
        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md',
                bsStyle: 'primary'
            }}
            buttons={[
                {
                    glyph: "step-backward",
                    key: 'back',
                    onClick: backward,
                    disabled: !hasPrevious,
                    tooltip: <Message msgId={"playback.backwardStep"} />
                }, {
                    glyph: status === statusMap.PLAY ? "pause" : "play",
                    key: 'play',
                    active: status === statusMap.PLAY || status === statusMap.PAUSE,
                    disabled: !hasNext,
                    bsStyle: status === statusMap.PLAY || status === statusMap.PAUSE ? "success" : "primary",
                    onClick: () => status === statusMap.PLAY ? pause() : play(),
                    tooltipId: hasNext && (status === statusMap.PLAY
                        ? "playback.pause"
                        : status === statusMap.PAUSE
                            ? "playback.paused"
                            : "playback.play")
                }, {
                    glyph: "stop",
                    key: 'stop',
                    disabled: status !== statusMap.PLAY && status !== statusMap.PAUSE,
                    onClick: stop,
                    tooltip: !(status !== statusMap.PLAY && status !== statusMap.PAUSE) && <Message msgId={"playback.stop"} />
                }, {
                    glyph: "step-forward",
                    key: 'forward',
                    onClick: forward,
                    disabled: !hasNext,
                    tooltip: hasNext && <Message msgId={"playback.forwardStep"} />
                }, {
                    glyph: "cog",
                    key: 'settings',
                    bsStyle: (status !== statusMap.PLAY && status !== statusMap.PAUSE) && showSettings ? 'success' : 'primary',
                    active: (status !== statusMap.PLAY || status !== statusMap.PAUSE) && !!showSettings,
                    disabled: (status === statusMap.PLAY || status === statusMap.PAUSE),
                    onClick: () => status !== statusMap.PLAY && onShowSettings(!showSettings),
                    tooltip: !(status === statusMap.PLAY || status === statusMap.PAUSE) && <Message msgId={"playback.settings.tooltip"} />
                }
            ]}/>
    </div>
    )
);
