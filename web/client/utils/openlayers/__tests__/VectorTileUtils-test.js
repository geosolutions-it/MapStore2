/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { OL_VECTOR_FORMATS } from '../VectorTileUtils';

describe('VectorTileUtils openlayers', () => {
    it('test OL_VECTOR_FORMATS contains entry for all supported formats', () => {
        expect(OL_VECTOR_FORMATS['application/vnd.mapbox-vector-tile']).toExist();
        expect(OL_VECTOR_FORMATS['application/json;type=geojson']).toExist();
        expect(OL_VECTOR_FORMATS['application/json;type=topojson']).toExist();
    });
});
