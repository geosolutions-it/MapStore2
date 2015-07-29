/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var MapViewController = require('../../components/Map/MapViewController');
var ConfigUtils = require('../../utils/ConfigUtils');

var Api = require('../../api/MapConfigDAO');

Api.get("../data/mapStoreConfig.json").then( function(legacyConfig) {
    const mapId = "map";
    // convert from legacy
    const conf = ConfigUtils.convertFromLegacy(legacyConfig);
    React.render(<MapViewController id={mapId} config={conf}/>, document.body);
});
