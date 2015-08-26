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
var I18N = require('../../components/I18N/I18N');
var LangSelector = require('../../components/LangSelector/LangSelector');
var ConfigUtils = require('../../utils/ConfigUtils');
var url = require('url');

var Api = require('../../api/MapConfigDAO');

// window.geoStoreBase = "http://mapstore.geo-solutions.it/geostore/rest/"
Api.getMergedConfig("../data/mapStoreConfig.json", url.parse(window.location.href, true).query.mapId, window.geoStoreBase).then( function(legacyConfig) {
    const mapId = "map";
    // convert from legacy
    const conf = ConfigUtils.convertFromLegacy(legacyConfig);
    React.render(<MapViewController id={mapId} config={conf}/>, document.getElementById("mapContainer"));
});

React.render(<InfoButton
    text={<I18N.Message msgId="aboutLbl"/>}
    title={<I18N.Message msgId="about_title"/>}
    glyphicon="info-sign"
    body={
        <div>
            <h1>MapStore 2</h1>
            <p>
                <I18N.Message msgId="about_p0-0"/> <a href="http://openlayers.org/">OpenLayers 3</a> <I18N.Message msgId="about_p0-1"/> <a href="http://leafletjs.com/">Leaflet</a>.
            </p>
            <p><I18N.Message msgId="about_p1"/></p>
            <ul>
                <li>
                    <I18N.Message msgId="about_ul0_li0"/>
                </li>
                <li>
                    <I18N.Message msgId="about_ul0_li1"/> <a href="https://github.com/geosolutions-it/MapStore2/wiki">MapStore wiki</a>.
                </li>
            </ul>
            <h2><I18N.Message msgId="about_h20"/></h2>
            <p>
                <I18N.Message msgId="about_p3"/>
            </p>
            <p><I18N.Message msgId="about_p5-0"/> <a href="https://github.com/geosolutions-it/MapStore2/blob/master/CONTRIBUTING.md"><I18N.Message msgId="about_a0"/></a> <I18N.Message msgId="about_p5-1"/></p>
        </div>
    }/>, document.getElementById("aboutContainer"));
React.render(<LangSelector/>, document.getElementById("langSelContainer"));
