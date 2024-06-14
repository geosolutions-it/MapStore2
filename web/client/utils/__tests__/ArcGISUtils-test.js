/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    isImageServerUrl,
    isMapServerUrl,
    getLayerIds,
    getQueryLayerIds,
    esriToGeoJSONFeature
} from '../ArcGISUtils';

const layers = [
    {
        id: 0,
        parentLayerId: -1,
        subLayerIds: [1, 6, 7]
    },
    {
        id: 1,
        parentLayerId: 0,
        subLayerIds: [
            2,
            3,
            4,
            5
        ]
    },
    {
        id: 2,
        parentLayerId: 1,
        subLayerIds: null
    },
    {
        id: 3,
        parentLayerId: 1,
        subLayerIds: null
    },
    {
        id: 4,
        parentLayerId: 1,
        subLayerIds: null
    },
    {
        id: 5,
        parentLayerId: 1,
        subLayerIds: null
    },
    {
        id: 6,
        parentLayerId: 0,
        subLayerIds: null
    },
    {
        id: 7,
        parentLayerId: 0,
        subLayerIds: [
            8,
            9
        ]
    },
    {
        id: 8,
        parentLayerId: 7,
        subLayerIds: null
    },
    {
        id: 9,
        parentLayerId: 7,
        subLayerIds: null
    }
];
describe('ArcGISUtils', () => {
    it('isImageServerUrl', () => {
        expect(isImageServerUrl()).toBeFalsy();
        expect(isImageServerUrl('https://localhost/arcgis/rest/services/Name/MapServer')).toBeFalsy();
        expect(isImageServerUrl('https://localhost/arcgis/rest/services/Name/ImageServer')).toBeTruthy();
    });
    it('isMapServerUrl', () => {
        expect(isMapServerUrl()).toBeFalsy();
        expect(isMapServerUrl('https://localhost/arcgis/rest/services/Name/ImageServer')).toBeFalsy();
        expect(isMapServerUrl('https://localhost/arcgis/rest/services/Name/MapServer')).toBeTruthy();
    });
    it('getLayerIds', () => {
        expect(getLayerIds(1)).toEqual(['1']);
        expect(getLayerIds('1')).toEqual(['1']);
        expect(getLayerIds(0, layers)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
        expect(getLayerIds(6, layers)).toEqual(['6']);
        expect(getLayerIds(7, layers)).toEqual(['7', '8', '9']);
    });
    it('getQueryLayerIds', () => {
        expect(getQueryLayerIds(1)).toEqual(['1']);
        expect(getQueryLayerIds('1')).toEqual(['1']);
        expect(getQueryLayerIds(0, layers)).toEqual(['2', '3', '4', '5', '6', '8', '9']);
        expect(getQueryLayerIds(6, layers)).toEqual(['6']);
        expect(getQueryLayerIds(7, layers)).toEqual(['8', '9']);
    });
    it('esriToGeoJSONFeature', () => {
        expect(esriToGeoJSONFeature())
            .toEqual({ type: 'Feature', properties: {}, geometry: null });
        expect(esriToGeoJSONFeature({ attributes: { title: 'Title' } }))
            .toEqual({ type: 'Feature', properties: { title: 'Title' }, geometry: null });
        expect(esriToGeoJSONFeature({
            geometry: {
                x: -118.15,
                y: 33.80,
                spatialReference: { wkid: 4326 }
            }
        }))
            .toEqual({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [ -118.15, 33.8, 0 ] } });
        expect(esriToGeoJSONFeature({
            geometry: {
                x: -118.15,
                y: 33.80,
                z: 10,
                spatialReference: { wkid: 4326 }
            }
        }))
            .toEqual({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [ -118.15, 33.8, 10 ] } });
        expect(esriToGeoJSONFeature({
            geometry: {
                points: [
                    [
                        -97.06138,
                        32.837
                    ],
                    [
                        -97.06133,
                        32.836
                    ]
                ],
                spatialReference: { wkid: 4326 }
            }
        }))
            .toEqual({ type: 'Feature', properties: {}, geometry: { type: 'MultiPoint', coordinates: [ [ -97.06138, 32.837, 0 ], [ -97.06133, 32.836, 0 ] ] } });
        expect(esriToGeoJSONFeature({
            geometry: {
                paths: [
                    [
                        [-97.06138, 32.837],
                        [-97.06133, 32.836],
                        [-97.06124, 32.834],
                        [-97.06127, 32.832]
                    ],
                    [
                        [-97.06326, 32.759],
                        [-97.06298, 32.755]
                    ]
                ],
                spatialReference: { wkid: 4326 }
            }
        }))
            .toEqual({ type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: [ [ [ -97.06138, 32.837, 0 ], [ -97.06133, 32.836, 0 ], [ -97.06124, 32.834, 0 ], [ -97.06127, 32.832, 0 ] ], [ [ -97.06326, 32.759, 0 ], [ -97.06298, 32.755, 0 ] ] ] } });
        expect(esriToGeoJSONFeature({
            geometry: {
                rings: [
                    [
                        [-97.06138, 32.837],
                        [-97.06133, 32.836],
                        [-97.06124, 32.834],
                        [-97.06127, 32.832],
                        [-97.06138, 32.837]
                    ],
                    [
                        [-97.06326, 32.759],
                        [-97.06298, 32.755],
                        [-97.06153, 32.749],
                        [-97.06326, 32.759]
                    ]
                ],
                spatialReference: { wkid: 4326 }
            }
        }))
            .toEqual({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ [ [ -97.06138, 32.837, 0 ], [ -97.06133, 32.836, 0 ], [ -97.06124, 32.834, 0 ], [ -97.06127, 32.832, 0 ], [ -97.06138, 32.837, 0 ] ], [ [ -97.06326, 32.759, 0 ], [ -97.06298, 32.755, 0 ], [ -97.06153, 32.749, 0 ], [ -97.06326, 32.759, 0 ] ] ] } });
    });
});
