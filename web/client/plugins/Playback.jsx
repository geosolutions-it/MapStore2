/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { compose, defaultProps } from 'recompose';
import { createSelector } from 'reselect';

import { STATUS, pause, play, stop } from '../actions/playback';
import playback from '../epics/playback';
import dimensionReducers from '../reducers/dimension';
import playbackReducers from '../reducers/playback';
import { currentTimeSelector } from '../selectors/dimension';
import { loadingSelector, playbackMetadataSelector, playbackRangeSelector, playbackSettingsSelector, statusSelector } from '../selectors/playback';
import PlaybackComp from './playback/Playback';
import { registerCustomSaveHandler } from '../selectors/mapsave';

registerCustomSaveHandler('playback', (state) => ({
    settings: playbackSettingsSelector(state),
    playbackRange: playbackRangeSelector(state),
    metadata: playbackMetadataSelector(state)
}));

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
)(PlaybackComp);

/**
  * Playback Plugin. Shows the playback controls for {@link #plugins.Timeline|Timeline}
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

export default {
    PlaybackPlugin: Object.assign(PlaybackPlugin, {
        noRoot: true,
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}",
        Timeline: {
            name: 'playback',
            position: 1,
            priority: 1
        }
    }),
    epics: playback,
    reducers: {
        playback: playbackReducers,
        dimension: dimensionReducers
    }
};
