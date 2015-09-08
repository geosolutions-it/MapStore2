/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../utils/openlayers/Layers');
var ol = require('openlayers');
var React = require('react');

var layersMap;

Layers.registerType('google', {
    create: (options, map, mapId) => {
        let google = window.google;
        if (!layersMap) {
            layersMap = {
               'HYBRID': google.maps.MapTypeId.HYBRID,
               'SATELLITE': google.maps.MapTypeId.SATELLITE,
               'ROADMAP': google.maps.MapTypeId.ROADMAP,
               'TERRAIN': google.maps.MapTypeId.TERRAIN
           };
        }

        let gmap = new google.maps.Map(document.getElementById(mapId + 'gmaps'), {
          disableDefaultUI: true,
          keyboardShortcuts: false,
          draggable: false,
          disableDoubleClickZoom: true,
          scrollwheel: false,
          streetViewControl: false
        });
        gmap.setMapTypeId(layersMap[options.name]);
        let view = map.getView();
        let setCenter = function() {
            var center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
            gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
        };
        let setZoom = function() {
            gmap.setZoom(view.getZoom());
        };
        view.on('change:center', setCenter);
        view.on('change:resolution', setZoom);
        setCenter();
        setZoom();
        return null;
    },
    render(options, map, mapId) {
        var gmapsStyle = {zIndex: -1};
        return <div id={mapId + "gmaps"} className="fill" style={gmapsStyle}></div>;
    }
});
