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
const { play, pause, stop, STATUS } = require('../actions/playback');
const {currentTimeSelector} = require('../selectors/dimension');

const { statusSelector, loadingSelector } = require('../selectors/playback');

const { connect } = require('react-redux');

const Playback = compose(
    defaultProps({
        statusMap: STATUS
    }),
    connect(
        createSelector(
            statusSelector,
            currentTimeSelector,
            loadingSelector,
            (status, currentTime, loading) => ({
                loading,
                currentTime,
                status
            })
        ), {
            play, pause, stop
        }
    )
)(require('../components/playback/Playback'));

class PlaybackPlugin extends React.Component {
    render() {
        return (
            <div
                className={"playback-plugin"}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    marginBottom: 30,
                    left: 0,
                    zIndex: 1000
                }}>
                <Playback />
            </div>
        );
    }
}


module.exports = {
    PlaybackPlugin: assign(PlaybackPlugin, {
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}"
    }),
    epics: require('../epics/playback'),
    reducers: {
        playback: require('../reducers/playback'),
        dimension: require('../reducers/dimension')
    }
};
