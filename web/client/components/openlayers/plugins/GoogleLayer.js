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

        /*let calculateRotatedSize = function(rotation, size) {
            let w = size[0];
            let h = size[1];

            let L1 = w / (Math.sqrt(1 + Math.pow(Math.tan(rotation), 2)));
            let L2 = L1 * Math.tan(rotation);

            let L1p = h / (Math.sqrt(1 + Math.pow(Math.tan(rotation), 2)));
            let L2p = L1p * Math.tan(rotation);

            return {width: Math.abs(Math.ceil(L1 + L2p)), height: Math.abs(Math.ceil(L2 + L1p))};
        };*/

        let setRotation = function() {
            var rotation = view.getRotation() * 180 / Math.PI;
            document.getElementById(mapId + 'gmaps').style.transform = "rotate(" + rotation + "deg)";
            /*let size = calculateRotatedSize(Math.PI - view.getRotation(), map.getSize());

            let mapContainer = document.getElementById(mapId + 'gmaps');
            mapContainer.style.width = size.width + 'px';
            mapContainer.style.height = size.height + 'px';
            mapContainer.style.left = -(Math.round((size.width - map.getSize()[0]) / 2.0)) + 'px';
            mapContainer.style.top = -(Math.round((size.height - map.getSize()[1]) / 2.0)) + 'px';
            google.maps.event.trigger(gmap, "resize");*/
        };
        view.on('change:center', setCenter);
        view.on('change:resolution', setZoom);
        view.on('change:rotation', setRotation);
        setCenter();
        setZoom();
        return null;
    },
    render(options, map, mapId) {
        var gmapsStyle = {zIndex: -1};
        return <div id={mapId + "gmaps"} className="fill" style={gmapsStyle}></div>;
    }

});
