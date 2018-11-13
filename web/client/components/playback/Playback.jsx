/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const {compose, withState, withProps, lifecycle} = require('recompose');


const Toolbar = require('../misc/toolbar/Toolbar');


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

const PlaybackSettings = require("./PlaybackSettings");

module.exports = collapsible(({
    settings,
    onSettingChange = () => { },
    setPlaybackRange = () => { },
    toggleAnimationMode = () => {},
    // loading,
    selectedLayer,
    status,
    statusMap,
    play = () => {},
    pause = () => {},
    stop = () => {},
    showSettings,
    onShowSettings = () => {}
}) =>
( <div style={{display: 'flex'}}>
        {showSettings &&
        <PlaybackSettings
            {...settings}
            fixedStep={!selectedLayer}
            toggleAnimationMode={toggleAnimationMode}
            onSettingChange={onSettingChange}
            setPlaybackRange={setPlaybackRange}/>}
        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md',
                bsStyle: 'primary'
            }}
            buttons={[
                {
                    glyph: "step-backward",
                    tooltip: 'Step backward'
                }, {
                    glyph: status === statusMap.PLAY ? "pause" : "play",
                    onClick: () => status === statusMap.PLAY ? pause() : play(),
                    tooltip: 'Play'
                }, {
                    glyph: "stop",
                    onClick: stop,
                    tooltip: 'Stop'
                }, {
                    glyph: "step-forward",
                    tooltip: 'Step forward'
                }, {
                    glyph: "wrench",
                    bsStyle: showSettings ? 'success' : 'primary',
                    active: !!showSettings,
                    onClick: () => onShowSettings(!showSettings),
                    tooltip: 'Playback settings'
                }
            ]}/>
    </div>
    )
);
