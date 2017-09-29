/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const L = require('leaflet');
const Icons = require('./Icons');

const getIcon = (style, geojson) => {
    if (style && style.iconGlyph) {
        const iconLibrary = style.iconLibrary || 'extra';
        if (Icons[iconLibrary]) {
            return Icons[iconLibrary].getIcon(style);
        }
    }
    if (style && style.html && geojson) {
        return Icons.html.getIcon(style, geojson);
    }
    if (style && style.iconUrl) {
        return Icons.standard.getIcon(style);
    }

};

module.exports = {
    pointToLayer: (latlng, geojson, style) => {
        const icon = getIcon(style, geojson);
        if (icon) {
            return L.marker(
                latlng,
                {
                    icon,
                    opacity: style && style.opacity || 1
                });
        }
        return L.marker(latlng, {
            opacity: style && style.opacity || 1
        });
    }
};
