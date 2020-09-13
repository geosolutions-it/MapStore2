/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Editor = require('./Editor');
const Viewer = require('./Viewer');

/**
 * Visualize the coordinate editor or viewer for the point clicked
 * @prop {object} coordinate coordinate in format `lat` `lon`
 * @prop {string} formatCoord `decimal` or `aeronautical`
 * @prop {boolean} edit true to visualize in edit mode
 * @prop {function} onChange handler to change the point coordinates. 2st argument is the key `lat` or `lon`, 2nd argument is the new numeric value.
 * @prop {function} onChangeFormat handler to change the formatCoord. 1st argument is the  formatCoord string.
 */
module.exports = ({
    coordinate = {},
    formatCoord,
    edit,
    onSubmit = () => {},
    onChangeFormat = () => {}
}) =>
    edit ?
        (<Editor
            removeVisible={false}
            formatCoord={formatCoord}
            coordinate={coordinate || {lat: "", lon: ""}}
            onSubmit={onSubmit}
            onChangeFormat={onChangeFormat}
        />)
        : (<Viewer
            className="coordinates-text"
            formatCoord={formatCoord}
            coordinate={coordinate || { lat: "", lon: "" }}
        />);

