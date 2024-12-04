/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const VECTOR_FORMATS = [
    'application/vnd.mapbox-vector-tile',
    'application/json;type=geojson',
    'application/json;type=topojson'
];

export const isVectorFormat = (format) => VECTOR_FORMATS.indexOf(format) !== -1;
