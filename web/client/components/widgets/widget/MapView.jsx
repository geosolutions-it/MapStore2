/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const autoMapType = require('../../map/enhancers/autoMapType');
const mapType = require('../../map/enhancers/mapType');
const autoResize = require('../../map/enhancers/autoResize');
const getProjectionDefs = require('../../map/enhancers/getProjectionDefs').default;
const onMapViewChanges = require('../../map/enhancers/onMapViewChanges');


const {compose} = require('recompose');
const { handlingUnsupportedProjection } = require('../../map/enhancers/handlingUnsupportedProjection');

module.exports = compose(
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    mapType,
    getProjectionDefs,
    handlingUnsupportedProjection
)(require('../../map/BaseMap'));

