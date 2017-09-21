/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');
const {isFunction} = require('lodash');


const getIcon = (style) => {
    if (style.iconGlyph) {
        const prefix = style.iconPrefix || 'fa';
        return L.ExtraMarkers.icon({
            icon: prefix + '-' + style.iconGlyph,
            markerColor: style.iconColor || 'blue',
            shape: style.iconShape || 'circle',
            prefix
        });
    }
    return L.icon({
        iconUrl: style.iconUrl,
        shadowUrl: style.shadowUrl,
        iconSize: style.iconSize,
        shadowSize: style.shadowSize,
        iconAnchor: style.iconAnchor,
        shadowAnchor: style.shadowAnchor,
        popupAnchor: style.popupAnchor
    });
};

module.exports = {
    pointToLayer: (latlng, geojson, style) => {
        if (style && (style.iconUrl || style.iconGlyph)) {
            return L.marker(
                latlng,
                {
                    icon: getIcon(style)
                });
        }
        if (style && style.html && geojson) {
            return L.marker(
                latlng,
                {
                    icon: L.divIcon(isFunction(style.html) ? style.html(geojson) : style.html)
                });
        }
        return L.marker(latlng);
    }
};
