/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var MapViewController = require('../../components/Map/MapViewController');
var InfoButton = require('../../components/InfoButton/InfoButton');

var ConfigUtils = require('../../utils/ConfigUtils');

var Api = require('../../api/MapConfigDAO');

Api.get("../data/mapStoreConfig.json").then( function(legacyConfig) {
    const mapId = "map";
    // convert from legacy
    const conf = ConfigUtils.convertFromLegacy(legacyConfig);
    React.render(<MapViewController id={mapId} config={conf}/>, document.getElementById("mapContainer"));
});

React.render(<InfoButton
    text="About"
    title="About this app..."
    glyphicon="info-sign"
    body={
        <div>
            <h1>MapStore 2</h1>
            <p>
                MapStore 2 is a framework to build web mapping applications using
                standard mapping libraries, such as <a href="http://openlayers.org/">OpenLayers 3</a> and <a href="http://leafletjs.com/">Leaflet</a>.
            </p>
            <p>MapStore 2 has several example applications:</p>
            <ul>
                <li>
                    MapViewer is a simple viewer of preconfigured maps (optionally
                    stored in a database using GeoStore)
                </li>
                <li>
                    MapPublisher has been developed to create, save and share in a
                    simple and intuitive way maps and mashups created selecting
                    contents by server like OpenStreetMap, Google Maps, MapQuest or
                    specific servers provided by your organization or third party.
                    For more information check the <a href="https://github.com/geosolutions-it/MapStore2/wiki">MapStore wiki</a>.
                </li>
            </ul>
            <h2>License</h2>
            <p>
                MapStore 2 is Free and Open Source software, it is based on
                OpenLayers 3, Leaflet and ReactJS, and is licensed under the
                Simplified BSD License.
            </p>
            <h2>Contributing</h2>
            <p>We welcome contributions in any form:</p>
            <ul>
                <li>pull requests for new features</li>
                <li>pull requests for bug fixes</li>
                <li>pull requests for documentation</li>
                <li>funding for any combination of the above</li>
            </ul>
            <p>For more information check <a href="https://github.com/geosolutions-it/MapStore2/blob/master/CONTRIBUTING.md">this</a> page.</p>
        </div>
    }/>, document.getElementById("aboutContainer"));
