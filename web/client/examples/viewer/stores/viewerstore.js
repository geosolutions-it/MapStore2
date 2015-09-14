/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var {combineReducers} = require('redux');

var mapConfig = require('../../../reducers/config');
var mapInfo = require('../../../reducers/mapInfo');
var locale = require('../../../reducers/locale');

var DebugUtils = require('../../../utils/DebugUtils');

const reducers = combineReducers({
    mapConfig,
    locale,
    mapInfo
});

module.exports = DebugUtils.createDebugStore(reducers, {});
