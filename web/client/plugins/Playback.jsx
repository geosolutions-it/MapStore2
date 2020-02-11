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
            play,
            pause,
            stop
        }
    )
)(require('./playback/Playback'));

/**
  * Playback Plugin. Shows the playback controls for @see {@link api/plugins#plugins.Timeline}
  * @class  Playback
  * @memberof plugins
  * @static
  */
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
        noRoot: true,
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
