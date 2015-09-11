/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var {combineReducers} = require('redux');

var maps = require('../../../reducers/maps');
var locale = require('../../../reducers/locale');
var mapType = require('../../manager/reducers/mapType');

var DebugUtils = require('../../../utils/DebugUtils');

const reducers = combineReducers({
    maps,
    locale,
    mapType
});

module.exports = DebugUtils.createDebugStore(reducers, {});
