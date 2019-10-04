/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');
const {isFunction} = require('lodash');

require('leaflet-extra-markers');
require('leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css');

module.exports = {
    extra: {
        getIcon: (style) => {
            const prefix = style.iconPrefix || 'fa';
            return L.ExtraMarkers.icon({
                icon: prefix + '-' + style.iconGlyph,
                markerColor: style.iconColor || 'blue',
                shape: style.iconShape || 'square',
                prefix,
                extraClasses: style.highlight ? 'marker-selected' : ''
            });
        }
    },
    standard: {
        getIcon: (style) => {
            return L.icon({
                iconUrl: style.iconUrl || style.symbolUrlCustomized || style.symbolUrl,
                shadowUrl: style.shadowUrl,
                iconSize: style.iconSize,
                shadowSize: style.shadowSize,
                iconAnchor: style.iconAnchor,
                shadowAnchor: style.shadowAnchor,
                popupAnchor: style.popupAnchor
            });
        }
    },
    html: {
        getIcon: (style, geojson) => {
            return L.divIcon(isFunction(style.html) ? style.html(geojson) : style.html);
        }
    }
};
