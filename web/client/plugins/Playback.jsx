/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const assign = require('object-assign');
const Playback = require('../components/playback/Playback');


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
    reducers: {
        dimension: require('../reducers/dimension')
    }
};
