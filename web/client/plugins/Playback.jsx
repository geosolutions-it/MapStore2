/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const { defaultProps, compose } = require('recompose');
const {createSelector} = require('reselect');
const { play, pause, stop, STATUS, selectPlaybackRange } = require('../actions/playback');
const {currentTimeSelector} = require('../selectors/dimension');
const {selectedLayerSelector} = require('../selectors/timeline');
const { statusSelector, loadingSelector, playbackRangeSelector } = require('../selectors/playback');

const { connect } = require('react-redux');

const Playback = compose(
    defaultProps({
        statusMap: STATUS
    }),
    connect(
        createSelector(
            selectedLayerSelector,
            statusSelector,
            currentTimeSelector,
            loadingSelector,
            playbackRangeSelector,
            (selectedLayer, status, currentTime, loading, playbackRange) => ({
                selectedLayer,
                loading,
                currentTime,
                status,
                playbackRange
            })
        ), {
            play,
            pause,
            stop,
            setPlaybackRange: selectPlaybackRange
        }
    )
)(require('../components/playback/Playback'));

class PlaybackPlugin extends React.Component {
    render() {
        return (
            <div className={"playback-plugin"}>
                <Playback {...this.props}/>
            </div>
        );
    }
}

module.exports = {
    PlaybackPlugin: assign(PlaybackPlugin, {
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}",
        Timeline: {
            name: 'playback',
            position: 1,
            priority: 1
        }
    }),
    epics: require('../epics/playback'),
    reducers: {
        playback: require('../reducers/playback'),
        dimension: require('../reducers/dimension')
    }
};
