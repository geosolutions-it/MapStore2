/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const { compose, withHandlers} = require('recompose');

module.exports = compose(
    withHandlers({
        onMapViewChanges: ({onChange = () => {}}) => map => {
            onChange('map', map);
            onChange('mapStateSource', map.mapStateSource);
        }
    })
)(require('../../../widget/MapView'));
