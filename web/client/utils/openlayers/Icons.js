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
const {isArray, isNumber, isNil} = require('lodash');

const getHighlishtStyle = ({highlight, rotation = 0}) => (highlight ? [new ol.style.Style({
    text: new ol.style.Text({
        rotation,
        text: '\ue165',
        font: '18px mapstore2',
        offsetY: -markers.size[1] - 10,
        fill: new ol.style.Fill({color: '#FF00FF'})
    })
})] : []);

module.exports = {
     extra: {
         getIcon: (options = {}) => {
             const rotation = !isNil(options.style && options.style.rotation) ? options.style.rotation : 0;
             return [new ol.style.Style({
                   image: new ol.style.Icon(({
                     rotation,
                     anchor: [12, 12],
                     anchorXUnits: 'pixels',
                     anchorYUnits: 'pixels',
                     src: extraMarkerShadow
                 }))
             }), new ol.style.Style({
                 image: new ol.style.Icon({
                     rotation,
                     src: extraMarker,
                     anchor: [markers.size[0] / 2, markers.size[1]],
                     anchorXUnits: 'pixels',
                     anchorYUnits: 'pixels',
                     size: markers.size,
                     offset: [markers.colors.indexOf(options.style.iconColor || 'blue') * markers.size[0], markers.shapes.indexOf(options.style.iconShape || 'circle') * markers.size[1]]
                 }),
                 text: new ol.style.Text({
                     rotation,
                     text: glyphs[options.style.iconGlyph],
                     font: '14px FontAwesome',
                     offsetY: -markers.size[1] * 2 / 3,
                     fill: new ol.style.Fill({color: '#FFFFFF'})
                 })

             })].concat(getHighlishtStyle(options.style));
         }
     },
     standard: {
         getIcon: ({style, iconAnchor }) => {
             const rotation = !isNil(style && style.rotation) ? style.rotation : 0;
             const anchor = style.iconAnchor || iconAnchor;
             let markerStyle = [new ol.style.Style({
                image: new ol.style.Icon(({
                     anchor: anchor || [0.5, 1],
                     anchorXUnits: style.anchorXUnits || (( anchor || anchor === 0) ? 'pixels' : 'fraction'),
                     anchorYUnits: style.anchorYUnits || (( anchor || anchor === 0) ? 'pixels' : 'fraction'),
                     size: isArray(style.size) ? style.size : isNumber(style.size) ? [style.size, style.size] : undefined,
                     rotation,
                     anchorOrigin: style.anchorOrigin || "top-left",
                     src: style.iconUrl || style.symbolUrlCustomized || style.symbolUrl
                 }))
             })];
             if (style.shadowUrl) {
                 markerStyle = [new ol.style.Style({
                       image: new ol.style.Icon({
                           anchor: [12, 41],
                           anchorXUnits: 'pixels',
                           anchorYUnits: 'pixels',
                           src: style.shadowUrl
                       })
                   }), markerStyle[0]];
             }
             return markerStyle.concat(getHighlishtStyle(style));
         }
    },
    html: {
        getIcon: () => {
            // NOT implemented yet
            return null;
        }
    }
};
