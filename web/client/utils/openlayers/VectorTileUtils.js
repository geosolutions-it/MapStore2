/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import TopoJSON from 'ol/format/TopoJSON';

export const OL_VECTOR_FORMATS = {
    'application/vnd.mapbox-vector-tile': MVT,
    'application/json;type=geojson': GeoJSON,
    'application/json;type=topojson': TopoJSON
};
