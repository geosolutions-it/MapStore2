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
const {compose, withState, withProps, lifecycle} = require('recompose');
const { playbackSettingsSelector, playbackRangeSelector} = require('../../selectors/playback');
const {selectedLayerSelector} = require('../../selectors/timeline');
const { selectPlaybackRange, changeSetting, toggleAnimationMode } = require('../../actions/playback');
const Message = require('../../components/I18N/Message');

const Toolbar = require('../../components/misc/toolbar/Toolbar');


const collapsible = compose(
    withState("showSettings", "onShowSettings", false),
    withState("collapsed", "setCollapsed", true),
        withProps(({ setCollapsed }) => ({
            buttons: [{
                glyph: 'minus',
                onClick: () => setCollapsed(true)
            }]
    })),
    lifecycle({
        componentWillUnmount() {
            this.props.stop();
        }
    })
);

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

    )
)(
    require("../../components/playback/PlaybackSettings")
);

module.exports = collapsible(({
    status,
    statusMap,
    play = () => {},
    pause = () => {},
    stop = () => {},
    showSettings,
    onShowSettings = () => {}
}) =>
( <div style={{display: 'flex'}}>
        {showSettings && <PlaybackSettings />}
        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md',
                bsStyle: 'primary'
            }}
            buttons={[
                {
                    glyph: "step-backward",
                    tooltip: <Message msgId={"playback.backwardStep"} />
                }, {
                    glyph: status === statusMap.PLAY ? "pause" : "play",
                    onClick: () => status === statusMap.PLAY ? pause() : play(),
                    tooltip: <Message msgId={status === statusMap.PLAY ? "playback.pause" : "playback.play"} />
                }, {
                    glyph: "stop",
                    onClick: stop,
                    tooltip: <Message msgId={"playback.stop"} />
                }, {
                    glyph: "step-forward",
                    tooltip: <Message msgId={"playback.forwarStep"} />
                }, {
                    glyph: "wrench",
                    bsStyle: showSettings ? 'success' : 'primary',
                    active: !!showSettings,
                    onClick: () => onShowSettings(!showSettings),
                    tooltip: <Message msgId={"playback.settings.title"} />
                }
            ]}/>
    </div>
    )
);
