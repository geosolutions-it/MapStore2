/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ol = require('openlayers');

const MarkerUtils = require('../MarkerUtils');
const markers = MarkerUtils.markers.extra;
const extraMarker = markers.icons[0];
const extraMarkerShadow = markers.icons[1];

const glyphs = MarkerUtils.getGlyphs('fontawesome');

module.exports = {
     extra: {
         getIcon: (options) => {
             return [new ol.style.Style({
                   image: new ol.style.Icon(({
                     anchor: [12, 12],
                     anchorXUnits: 'pixels',
                     anchorYUnits: 'pixels',
                     src: extraMarkerShadow
                 }))
             }), new ol.style.Style({
                 image: new ol.style.Icon(({
                     src: extraMarker,
                     anchor: [markers.size[0] / 2, markers.size[1]],
                     anchorXUnits: 'pixels',
                     anchorYUnits: 'pixels',
                     size: markers.size,
                     offset: [markers.colors.indexOf(options.style.iconColor || 'blue') * markers.size[0], markers.shapes.indexOf(options.style.iconShape || 'circle') * markers.size[1]]
                 })),
                 text: new ol.style.Text({
                     text: glyphs[options.style.iconGlyph],
                     font: '14px FontAwesome',
                     offsetY: -markers.size[1] * 2 / 3,
                     fill: new ol.style.Fill({color: '#FFFFFF'})
                 })
             })].concat(options.style.highlight ? [new ol.style.Style({
                 text: new ol.style.Text({
                     text: '\ue165',
                     font: '18px mapstore2',
                     offsetY: -markers.size[1] - 10,
                     fill: new ol.style.Fill({color: '#FF00FF'})
                 })
             })] : []);
         }
     },
     standard: {
         getIcon: (options) => {
             let markerStyle = [new ol.style.Style({
                   image: new ol.style.Icon(({
                     anchor: options.iconAnchor || [0.5, 1],
                     anchorXUnits: ( options.iconAnchor || options.iconAnchor === 0) ? 'pixels' : 'fraction',
                     anchorYUnits: ( options.iconAnchor || options.iconAnchor === 0) ? 'pixels' : 'fraction',
                     src: options.style.iconUrl
                 }))
             })];
             if (options.style.shadowUrl) {
                 markerStyle = [new ol.style.Style({
                       image: new ol.style.Icon(({
                         anchor: [12, 41],
                         anchorXUnits: 'pixels',
                         anchorYUnits: 'pixels',
                         src: options.style.shadowUrl
                       }))
                   }), markerStyle [0]];
             }
             return markerStyle;
         }
     },
     html: {
         getIcon: () => {
             // NOT implemented yet
             return null;
         }
     }
 };
