/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var url = require('url');

const urlQuery = url.parse(window.location.href, true).query;
const mapType = urlQuery.type || 'leaflet';
/**
 * This Module wraps Preview and GrabMap objects for the variuous MapTypes.
 */
var Preview = require('./' + mapType + '/Preview.jsx');
var GrabMap = require('./' + mapType + '/GrabMap.jsx');

module.exports = {GrabMap, Preview};
