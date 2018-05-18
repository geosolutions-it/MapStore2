/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {isEqual} = require('lodash');
const {shouldUpdate} = require('recompose');
/**
 * Component for rendering react-nouislider.
 * It will update the component only when start and disabled props change,
 * this improvement removes glitches due to excessive updates. (eg. filckering of TOC slider while zooming/panning on map).
 * It uses props of react-nouislider.
 * @memberof components.misc
 * @name Slider
 * @class
 */
module.exports = shouldUpdate(
    (props, nexProps) =>
        !isEqual(props.start, nexProps.start)
        || props.disabled !== nexProps.disabled
)(require('react-nouislider'));
