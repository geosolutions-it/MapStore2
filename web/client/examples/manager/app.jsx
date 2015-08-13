/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');

var MapList = require('../../components/MapManager/MapList');

var GeoStoreApi = require('../../api/GeoStoreDAO');
GeoStoreApi.getResourcesByCategory("MAP", "*", {start: 0, limit: 20}).then( function(data) {
    React.render(
        <MapList data={data.results} panelProps={{header: "Maps", collapsible: true, defaultExpanded: true }} totalCount={data.totalCount}/>, document.getElementById("mapList"));
});
