/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import shuffle from 'lodash/shuffle';
import { classifyGeoJSON } from '../GeoJSONClassification';

describe('GeoJSONClassification APIs', () => {
    const geojson = {
        type: 'FeatureCollection',
        features: shuffle([...new Array(50).keys()]).map(value => ({ type: 'Feature', properties: { value, category: `category-${value % 2}` }, geometry: null }))
    };
    it('classify GeoJSON with quantile method', (done) => {
        classifyGeoJSON(geojson, { attribute: 'value', method: 'quantile', ramp: 'viridis', intervals: 5  })
            .then(({ data }) => {
                expect(data.classification).toEqual([
                    { color: '#440154', min: 0, max: 9.5 },
                    { color: '#3f4a8a', min: 9.5, max: 19.5 },
                    { color: '#26838f', min: 19.5, max: 29.5 },
                    { color: '#6cce5a', min: 29.5, max: 39.5 },
                    { color: '#fee825', min: 39.5, max: 49 }
                ]);
                done();
            })
            .catch(done);
    });
    it('classify GeoJSON with jenks method', (done) => {
        classifyGeoJSON(geojson, { attribute: 'value', method: 'jenks', ramp: 'viridis', intervals: 5  })
            .then(({ data }) => {
                expect(data.classification).toEqual([
                    { color: '#440154', min: 0, max: 10 },
                    { color: '#3f4a8a', min: 10, max: 20 },
                    { color: '#26838f', min: 20, max: 30 },
                    { color: '#6cce5a', min: 30, max: 40 },
                    { color: '#fee825', min: 40, max: 49 }
                ]);
                done();
            })
            .catch(done);
    });
    it('classify GeoJSON with equalInterval method', (done) => {
        classifyGeoJSON(geojson, { attribute: 'value', method: 'equalInterval', ramp: 'viridis', intervals: 5  })
            .then(({ data }) => {
                expect(data.classification).toEqual([
                    { color: '#440154', min: 0, max: 9.8 },
                    { color: '#3f4a8a', min: 9.8, max: 19.6 },
                    { color: '#26838f', min: 19.6, max: 29.400000000000002 },
                    { color: '#6cce5a', min: 29.400000000000002, max: 39.2 },
                    { color: '#fee825', min: 39.2, max: 49 }
                ]);
                done();
            })
            .catch(done);
    });
    it('classify GeoJSON with uniqueInterval method', (done) => {
        classifyGeoJSON(geojson, { attribute: 'category', method: 'uniqueInterval', ramp: 'viridis'  })
            .then(({ data }) => {
                expect(data.classification).toEqual([
                    { color: '#440154', unique: 'category-0' },
                    { color: '#fee825', unique: 'category-1' }
                ]);
                done();
            })
            .catch(done);
    });
    it('classify GeoJSON with uniqueInterval method and reverse equal to true', (done) => {
        classifyGeoJSON(geojson, { attribute: 'category', method: 'uniqueInterval', ramp: 'viridis', reverse: true })
            .then(({ data }) => {
                expect(data.classification).toEqual([
                    { color: '#fee825', unique: 'category-0' },
                    { color: '#440154', unique: 'category-1' }
                ]);
                done();
            })
            .catch(done);
    });
});
