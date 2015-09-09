/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Proj4js = require('proj4');
var assign = require('object-assign');

var CoordinatesUtils = {
    reproject: function(point, source, dest) {
        const sourceProj = new Proj4js.Proj(source);
        const destProj = new Proj4js.Proj(dest);

        return assign({}, Proj4js.transform(sourceProj, destProj, Proj4js.toPoint(point)), {srs: dest});
    },
    normalizeSRS: function(srs) {
        return srs === 'EPSG:900913' ? 'EPSG:3857' : srs;
    }
};

module.exports = CoordinatesUtils;
