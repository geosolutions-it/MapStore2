/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import {convertMeasuresToGeoJSON} from '../MeasurementUtils';

const testUom = {
    length: {
        unit: "m",
        label: "m"
    },
    area: {
        unit: "sqm",
        label: "m²"
    }
};

describe('MeasurementUtils', () => {
    it('convertMeasuresToGeoJSON with LineString', () => {
        const features = [{
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [
                        -3.6694335937499996,
                        37.81701672562037
                    ],
                    [
                        24.763183593750004,
                        41.6674407428383
                    ]
                ]
            },
            properties: {
                values: [
                    {
                        value: 2456862.991,
                        formattedValue: "2,456,862.99 m",
                        position: [
                            24.763183593750004,
                            41.6674407428383
                        ],
                        type: "length"
                    }
                ]
            }
        }];

        const geoJson = convertMeasuresToGeoJSON(features, [], testUom, 'id');

        expect(geoJson).toExist();
        expect(geoJson.type).toBe('FeatureCollection');
        expect(geoJson.properties).toExist();
        expect(geoJson.properties.id).toBe('id');
        expect(geoJson.features).toExist();
        expect(geoJson.features.length).toBe(2);
        expect(geoJson.features[0].type).toBe('Feature');
        expect(geoJson.features[0].geometry).toExist();
        expect(geoJson.features[0].geometry.type).toBe('LineString');
        expect(geoJson.features[0].geometry.coordinates).toEqual(features[0].geometry.coordinates);
        expect(geoJson.features[0].properties).toExist();
        expect(geoJson.features[0].properties.geometryGeodesic).toExist();
        expect(geoJson.features[0].properties.id).toExist();
        expect(geoJson.features[0].properties.id.length).toBe(36);
        expect(geoJson.features[0].properties.useGeodesicLines).toBe(true);
        expect(geoJson.features[0].properties.isValidFeature).toBe(true);
        expect(geoJson.features[0].style).toExist();
        expect(geoJson.features[1].type).toBe('Feature');
        expect(geoJson.features[1].geometry).toExist();
        expect(geoJson.features[1].geometry.type).toBe('Point');
        expect(geoJson.features[1].geometry.coordinates).toEqual(features[0].properties.values[0].position);
        expect(geoJson.features[1].properties).toExist();
        expect(geoJson.features[1].properties.id).toExist();
        expect(geoJson.features[1].properties.id.length).toBe(36);
        expect(geoJson.features[1].properties.isText).toBe(true);
        expect(geoJson.features[1].properties.isValidFeature).toBe(true);
        expect(geoJson.features[1].properties.valueText).toBe(features[0].properties.values[0].formattedValue);
    });
});
