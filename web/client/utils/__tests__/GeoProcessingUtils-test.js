/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {
    createFC,
    getCounter,
    densifyGeodesicFeature,
    transformCircleIntoPolygon
} from '../GeoProcessingUtils';
import {
    GPT_BUFFER_GROUP_ID
} from '../../actions/geoProcessing';
describe('GeoProcessing utils', () => {
    it('test createFC', () => {
        const features = [{
            type: "Feature",
            id: "ft-id",
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        }];
        const ftColl = createFC(features);
        expect(ftColl).toEqual({ type: 'FeatureCollection', features: [ { type: 'Feature', id: 'ft-id', geometry: { type: 'Point', coordinates: [ 1, 2 ] } } ] });
    });
    it('test getCounter', () => {
        const layers = [{
            group: GPT_BUFFER_GROUP_ID,
            name: "Buffer Layer 0"
        }];
        const counter = getCounter(layers, GPT_BUFFER_GROUP_ID);
        expect(counter).toEqual(1);
        const counter2 = getCounter([
            ...layers,
            {
                group: GPT_BUFFER_GROUP_ID,
                name: "Buffer Layer 3"
            },
            {
                group: GPT_BUFFER_GROUP_ID,
                name: "Buffer Layer 4"
            }
        ], GPT_BUFFER_GROUP_ID);
        expect(counter2).toEqual(5);
    });
    it('test densifyGeodesicFeature', () => {
        let ft = densifyGeodesicFeature({}, 0);
        expect(ft).toEqual({});
        ft = densifyGeodesicFeature({
            geometry: {
                coordinates: [[1, 1], [2, 2]],
                type: "LineString"
            },
            properties: {
                geodesic: true
            }
        }, 0);
        expect(ft.geometry.coordinates.length).toEqual(100);
    });
    it('test transformCircleIntoPolygon', () => {
        let ft = transformCircleIntoPolygon({}, 0);
        expect(ft).toEqual({});
        ft = transformCircleIntoPolygon({
            geometry: {
                coordinates: [1, 1],
                type: "Point"
            },
            properties: {
                annotationType: "Circle",
                radius: 100
            }
        }, 0);
        expect(ft.geometry.type).toEqual("Polygon");
        expect(ft.geometry.coordinates[0].length).toEqual(101);
    });
});
