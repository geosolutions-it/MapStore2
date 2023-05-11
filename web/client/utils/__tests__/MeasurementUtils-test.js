/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import {
    convertMeasuresToAnnotation,
    getGeomTypeSelected,
    convertMeasuresToGeoJSON
} from '../MeasurementUtils';
import { MeasureTypes, defaultUnitOfMeasure } from '../MeasureUtils';

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
    it('convertMeasuresToAnnotation with LineString', () => {
        const geoJson = convertMeasuresToAnnotation(features, [], testUom, 'id');

        expect(geoJson).toBeTruthy();
        expect(geoJson.type).toBe('FeatureCollection');
        expect(geoJson.properties).toBeTruthy();
        expect(geoJson.properties.id).toBe('id');
        expect(geoJson.properties.title).toBe('Measure Length');
        expect(geoJson.properties.type).toBe('Measure');
        expect(geoJson.properties.iconGlyph).toBe('1-measure-length');
        expect(geoJson.features).toBeTruthy();
        expect(geoJson.features.length).toBe(2);
        expect(geoJson.features[0].type).toBe('Feature');
        expect(geoJson.features[0].geometry).toBeTruthy();
        expect(geoJson.features[0].geometry.type).toBe('LineString');
        expect(geoJson.features[0].geometry.coordinates).toEqual(features[0].geometry.coordinates);
        expect(geoJson.features[0].properties).toBeTruthy();
        expect(geoJson.features[0].properties.geometryGeodesic).toBeTruthy();
        expect(geoJson.features[0].properties.id).toBeTruthy();
        expect(geoJson.features[0].properties.id.length).toBe(36);
        expect(geoJson.features[0].properties.useGeodesicLines).toBe(true);
        expect(geoJson.features[0].properties.isValidFeature).toBe(true);
        expect(geoJson.features[0].style).toBeTruthy();
        expect(geoJson.features[1].type).toBe('Feature');
        expect(geoJson.features[1].geometry).toBeTruthy();
        expect(geoJson.features[1].geometry.type).toBe('Point');
        expect(geoJson.features[1].geometry.coordinates).toEqual(features[0].properties.values[0].position);
        expect(geoJson.features[1].properties).toBeTruthy();
        expect(geoJson.features[1].properties.id).toBeTruthy();
        expect(geoJson.features[1].properties.id.length).toBe(36);
        expect(geoJson.features[1].properties.isText).toBe(true);
        expect(geoJson.features[1].properties.isValidFeature).toBe(true);
        expect(geoJson.features[1].properties.valueText).toBe(features[0].properties.values[0].formattedValue);
    });

    it('getGeomTypeSelected', ()=>{
        const geomTypeSelected = getGeomTypeSelected(features);
        expect(geomTypeSelected).toBeTruthy();
        expect(geomTypeSelected.length).toBe(1);
        expect(geomTypeSelected).toEqual(["LineString"]);
    });
    it('convertMeasuresToGeoJSON with POLYLINE_DISTANCE_3D measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "properties": {
                    "length": 5736.191873126155,
                    "lengthUom": "m",
                    "id": "139b1660-ed9e-11ed-bc84-5131497a86c4",
                    "measureType": MeasureTypes.POLYLINE_DISTANCE_3D,
                    "segments": [
                        [
                            9.184683224433599,
                            45.47060173111353,
                            -0.6521433975928714,
                            5736.191873126155,
                            "5736.19 m"
                        ]
                    ],
                    "segmentsCRS": "WGS84",
                    "segmentsColumns": [
                        "longitude",
                        "latitude",
                        "height:m",
                        "length:m",
                        "label"
                    ],
                    "infoLabelText": "5736.19 m"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [
                            9.15391920005504,
                            45.456555371497174,
                            -0.00578527500281874
                        ],
                        [
                            9.215462531208086,
                            45.4846397665771,
                            -0.009719516418843414
                        ]
                    ]
                },
                "id": "139b1660-ed9e-11ed-bc84-5131497a86c4"
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(2);
        const { id, ...measurementProperties } = geoJSON.features[0].properties;
        expect(measurementProperties).toEqual({
            length: 5736.191873126155,
            lengthUom: 'm',
            measureType: MeasureTypes.POLYLINE_DISTANCE_3D,
            label: '5736.19 m',
            geodesic: false,
            type: 'measurement'
        });
        const { id: labelSegmentId, measureId, ...labelSegmentProperties } = geoJSON.features[1].properties;
        expect(measureId).toBe(id);
        expect(labelSegmentProperties).toEqual({
            type: 'segment',
            label: '5736.19 m'
        });
        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(6);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Linear measurement',
            'Start position',
            'End position',
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Line',
            'Mark',
            'Mark',
            'Mark',
            'Text',
            'Text'
        ]);
    });
    it('convertMeasuresToGeoJSON with AREA_3D measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "properties": {
                    "area": 2383564.708255599,
                    "areaUom": "sqm",
                    "length": 8183.280113848724,
                    "lengthUom": "m",
                    "id": "af5e4f90-ee3e-11ed-978b-474e027357db",
                    "measureType": MeasureTypes.AREA_3D,
                    "segments": [
                        [
                            9.185073913711433,
                            45.46765885076272,
                            -0.24466030024914406,
                            3517.648282271119,
                            "3517.65 m"
                        ],
                        [
                            9.192285559942214,
                            45.46313177896892,
                            -0.19741914742027625,
                            3154.021843822118,
                            "3154.02 m"
                        ],
                        [
                            9.171431636055354,
                            45.457210191213136,
                            -0.046951213356398264,
                            1511.609987755487,
                            "1511.61 m"
                        ]
                    ],
                    "segmentsCRS": "WGS84",
                    "segmentsColumns": [
                        "longitude",
                        "latitude",
                        "height:m",
                        "length:m",
                        "label"
                    ],
                    "infoLabelText": "2383564.71 m²"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                9.16421907633995,
                                45.46173595087767,
                                -0.0021944744995794304
                            ],
                            [
                                9.205933118322637,
                                45.47357793618286,
                                -0.0027140397801343357
                            ],
                            [
                                9.178643041867716,
                                45.45268397260321,
                                -0.0021661478371538256
                            ],
                            [
                                9.16421907633995,
                                45.46173595087767,
                                -0.0021944744995794304
                            ]
                        ]
                    ]
                },
                "id": "af5e4f90-ee3e-11ed-978b-474e027357db"
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(4);
        const [measureFeature, ...segmentFeatures] = geoJSON.features;
        const { id, ...measurementProperties } = measureFeature.properties;
        expect(measurementProperties).toEqual({
            area: 2383564.708255599,
            areaUom: 'sqm',
            length: 8183.280113848724,
            lengthUom: 'm',
            measureType: MeasureTypes.AREA_3D,
            label: '2383564.71 m²',
            geodesic: false,
            type: 'measurement'
        });

        segmentFeatures.forEach((segmentFeature, idx) => {
            const { id: labelSegmentId, measureId, ...labelSegmentProperties } = segmentFeature.properties;
            expect(measureId).toBe(id);
            expect(labelSegmentProperties.type).toBe('segment');
            expect(labelSegmentProperties.label).toBe(measurementFeatures[0].properties.segments[idx][4]);
        });

        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(6);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Area measurement',
            'Start position',
            'End position',
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Fill',
            'Mark',
            'Mark',
            'Mark',
            'Text',
            'Text'
        ]);
    });
    it('convertMeasuresToGeoJSON with POINT_COORDINATES measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "properties": {
                    "id": "d856bea0-ee3e-11ed-978b-474e027357db",
                    "measureType": MeasureTypes.POINT_COORDINATES,
                    "infoLabelText": "Latitude: 45.471191\nLongitude: 9.184720\nAltitude: -0.00 m"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        9.18472025253404,
                        45.47119086062241,
                        -0.0013678387224366256
                    ]
                },
                "id": "d856bea0-ee3e-11ed-978b-474e027357db"
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(1);
        const [measureFeature] = geoJSON.features;
        const { id, ...measurementProperties } = measureFeature.properties;
        expect(measurementProperties).toEqual({
            measureType: MeasureTypes.POINT_COORDINATES,
            label: 'Latitude: 45.471191\nLongitude: 9.184720\nAltitude: -0.00 m',
            geodesic: false,
            type: 'position'
        });
        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(3);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Mark',
            'Text',
            'Text'
        ]);
    });
    it('convertMeasuresToGeoJSON with HEIGHT_FROM_TERRAIN measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "properties": {
                    "height": -0.0014013006948233539,
                    "heightUom": "m",
                    "terrainCoordinates": [
                        9.186699642103079,
                        45.477757978168086,
                        0
                    ],
                    "id": "e2aaf0b0-ee3e-11ed-978b-474e027357db",
                    "measureType": MeasureTypes.HEIGHT_FROM_TERRAIN,
                    "infoLabelText": "-0.00 m"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        9.186699642103077,
                        45.4777579781681,
                        -0.001401308000102272
                    ]
                },
                "id": "e2aaf0b0-ee3e-11ed-978b-474e027357db"
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(1);
        const [measureFeature] = geoJSON.features;
        const { id, ...measurementProperties } = measureFeature.properties;
        expect(measurementProperties).toEqual({
            height: -0.0014013006948233539,
            heightUom: 'm',
            measureType: MeasureTypes.HEIGHT_FROM_TERRAIN,
            label: '-0.00 m',
            geodesic: false,
            type: 'measurement'
        });
        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(6);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Linear measurement',
            'Start position',
            'End position',
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Line',
            'Mark',
            'Mark',
            'Mark',
            'Text',
            'Text'
        ]);
    });
    it('convertMeasuresToGeoJSON with ANGLE_3D measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "properties": {
                    "length": 1892.918877514463,
                    "lengthUom": "m",
                    "id": "00632000-ee3f-11ed-978b-474e027357db",
                    "measureType": MeasureTypes.ANGLE_3D,
                    "infoLabelText": "37.91 °",
                    "angle": 37.91182677916115,
                    "angleUom": "deg"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [
                            9.170012084358694,
                            45.47347799578363,
                            -0.0020413347227668773
                        ],
                        [
                            9.179064311549824,
                            45.468205574763445,
                            -0.0017033081537283909
                        ],
                        [
                            9.176375314007679,
                            45.476762351930496,
                            -0.002318261541184519
                        ]
                    ]
                },
                "id": "00632000-ee3f-11ed-978b-474e027357db"
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(1);
        const [measureFeature] = geoJSON.features;
        const { id, ...measurementProperties } = measureFeature.properties;
        expect(measurementProperties).toEqual({
            length: 1892.918877514463,
            lengthUom: 'm',
            measureType: MeasureTypes.ANGLE_3D,
            angle: 37.91182677916115,
            angleUom: 'deg',
            label: '37.91 °',
            geodesic: false,
            type: 'measurement'
        });
        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(6);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Angle measurement',
            'Start position',
            'End position',
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Line',
            'Mark',
            'Mark',
            'Mark',
            'Text',
            'Text'
        ]);
    });
    it('convertMeasuresToGeoJSON with SLOPE measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "properties": {
                    "area": 994418.1917767797,
                    "areaUom": "sqm",
                    "length": 4618.992421971779,
                    "lengthUom": "m",
                    "id": "1707f060-ee3f-11ed-978b-474e027357db",
                    "measureType": MeasureTypes.SLOPE,
                    "infoLabelText": "0.20 °",
                    "slope": 0.20040935363738588,
                    "slopeUom": "deg"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                9.191084126644927,
                                45.48134020383751,
                                -0.002428257005681121
                            ],
                            [
                                9.204943482345003,
                                45.47467256922044,
                                -0.00033059769827687054
                            ],
                            [
                                9.209899806152368,
                                45.48880246326597,
                                -0.001989185596876758
                            ],
                            [
                                9.191084126644927,
                                45.48134020383751,
                                -0.002428257005681121
                            ]
                        ]
                    ]
                },
                "id": "1707f060-ee3f-11ed-978b-474e027357db"
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(1);
        const [measureFeature] = geoJSON.features;
        const { id, ...measurementProperties } = measureFeature.properties;
        expect(measurementProperties).toEqual({
            area: 994418.1917767797,
            areaUom: 'sqm',
            length: 4618.992421971779,
            lengthUom: 'm',
            measureType: MeasureTypes.SLOPE,
            slope: 0.20040935363738588,
            slopeUom: 'deg',
            label: '0.20 °',
            geodesic: false,
            type: 'measurement'
        });
        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(6);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Slope measurement',
            'Start position',
            'End position',
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Fill',
            'Mark',
            'Mark',
            'Mark',
            'Text',
            'Text'
        ]);
    });
    it('convertMeasuresToGeoJSON with LENGTH measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [
                            9.194719791412354,
                            45.47215472687304
                        ],
                        [
                            9.1780686378479,
                            45.45903193872102
                        ]
                    ],
                    "textLabels": [
                        {
                            "text": "1,953.32 m",
                            "position": [
                                9.186309148944535,
                                45.46552735846267
                            ]
                        }
                    ]
                },
                "properties": {
                    "values": [
                        {
                            "value": 1953.316,
                            "formattedValue": "1,953.32 m",
                            "position": [
                                9.1780686378479,
                                45.45903193872102
                            ],
                            "type": "length"
                        }
                    ]
                }
            }
        ];
        const textLabels = [
            {
                "text": "1,953.32 m",
                "position": [
                    9.186309148944535,
                    45.46552735846267
                ],
                "type": "LineString",
                "textId": 0
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures, textLabels, defaultUnitOfMeasure);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(2);
        const [measureFeature, labelSegmentFeature] = geoJSON.features;
        const { id, ...measurementProperties } = measureFeature.properties;
        expect(measurementProperties).toEqual({
            label: '1,953.32 m',
            geodesic: true,
            length: 1953.316,
            lengthUom: 'm',
            type: 'measurement',
            measureType: MeasureTypes.LENGTH
        });
        const { id: labelSegmentId, measureId, ...labelSegmentProperties } = labelSegmentFeature.properties;
        expect(measureId).toBe(id);
        expect(labelSegmentProperties).toEqual({
            type: 'segment',
            label: '1,953.32 m'
        });
        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(6);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Geodesic measurement',
            'Start position',
            'End position',
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Line',
            'Mark',
            'Mark',
            'Mark',
            'Text',
            'Text'
        ]);
    });
    it('convertMeasuresToGeoJSON with AREA measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                9.193453788757324,
                                45.479723019275006
                            ],
                            [
                                9.164185523986816,
                                45.46196677235737
                            ],
                            [
                                9.20529842376709,
                                45.47394532919275
                            ],
                            [
                                9.193453788757324,
                                45.479723019275006
                            ]
                        ]
                    ],
                    "textLabels": [
                        {
                            "text": "3,017.79 m",
                            "position": [
                                9.17881965637207,
                                45.47084559505888
                            ]
                        },
                        {
                            "text": "3,471.73 m",
                            "position": [
                                9.184741973876953,
                                45.46795636896818
                            ]
                        },
                        {
                            "text": "1,125 m",
                            "position": [
                                9.199376106262205,
                                45.47683424828385
                            ]
                        }
                    ]
                },
                "properties": {
                    "values": [
                        {
                            "value": 1644850.6921266892,
                            "formattedValue": "1,644,850.69 m²",
                            "position": [
                                9.186739154796498,
                                45.47084559505888
                            ],
                            "type": "area"
                        },
                        {
                            "value": 7614.5289999999995,
                            "formattedValue": "7,614.53 m",
                            "position": [
                                9.193453788757324,
                                45.479723019275006
                            ],
                            "uom": {
                                "length": {
                                    "unit": "m",
                                    "label": "m",
                                    "value": "m"
                                },
                                "area": {
                                    "unit": "sqm",
                                    "label": "m²",
                                    "value": "sqm"
                                },
                                "bearing": {
                                    "unit": "deg",
                                    "label": "°",
                                    "value": "deg"
                                },
                                "POLYLINE_DISTANCE_3D": {
                                    "unit": "m",
                                    "label": "m",
                                    "value": "m"
                                },
                                "AREA_3D": {
                                    "unit": "sqm",
                                    "label": "m²",
                                    "value": "sqm"
                                },
                                "POINT_COORDINATES": {
                                    "unit": "m",
                                    "label": "m",
                                    "value": "m"
                                },
                                "HEIGHT_FROM_TERRAIN": {
                                    "unit": "m",
                                    "label": "m",
                                    "value": "m"
                                },
                                "SLOPE": {
                                    "unit": "deg",
                                    "label": "°",
                                    "value": "deg"
                                },
                                "ANGLE_3D": {
                                    "unit": "deg",
                                    "label": "°",
                                    "value": "deg"
                                }
                            },
                            "type": "length"
                        }
                    ]
                }
            }
        ];
        const textLabels = [
            {
                "text": "3,017.79 m",
                "position": [
                    9.17881965637207,
                    45.47084559505888
                ],
                "type": "Polygon",
                "textId": 0
            },
            {
                "text": "3,471.73 m",
                "position": [
                    9.184741973876953,
                    45.46795636896818
                ],
                "type": "Polygon",
                "textId": 0
            },
            {
                "text": "1,125 m",
                "position": [
                    9.199376106262205,
                    45.47683424828385
                ],
                "type": "Polygon",
                "textId": 0
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures, textLabels, defaultUnitOfMeasure);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(4);
        const [measureFeature, ...segmentFeatures] = geoJSON.features;
        const { id, ...measurementProperties } = measureFeature.properties;
        expect(measurementProperties).toEqual({
            label: '1,644,850.69 m²',
            geodesic: false,
            length: 7614.5289999999995,
            lengthUom: 'm',
            area: 1644850.6921266892,
            areaUom: 'sqm',
            type: 'measurement',
            measureType: MeasureTypes.AREA
        });
        segmentFeatures.forEach((segmentFeature, idx) => {
            const { id: labelSegmentId, measureId, ...labelSegmentProperties } = segmentFeature.properties;
            expect(measureId).toBe(id);
            expect(labelSegmentProperties.type).toBe('segment');
            expect(labelSegmentProperties.label).toBe(textLabels[idx].text);
        });
        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(6);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Area measurement',
            'Start position',
            'End position',
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Fill',
            'Mark',
            'Mark',
            'Mark',
            'Text',
            'Text'
        ]);
    });
    it('convertMeasuresToGeoJSON with BEARING measurement', ()=>{
        const measurementFeatures = [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [
                            9.201264381408691,
                            45.45275539722548
                        ],
                        [
                            9.187273979187012,
                            45.46130456683173
                        ]
                    ],
                    "textLabels": []
                },
                "properties": {
                    "values": [
                        {
                            "value": 311.0662463199936,
                            "formattedValue": "N 48° 56' 1'' W",
                            "position": [
                                9.187273979187012,
                                45.46130456683173
                            ],
                            "type": "bearing"
                        }
                    ]
                }
            }
        ];
        const { style, ...geoJSON } = convertMeasuresToGeoJSON(measurementFeatures, [], defaultUnitOfMeasure);
        expect(geoJSON.type).toBe('FeatureCollection');
        expect(geoJSON.features.length).toBe(1);
        const [measureFeature] = geoJSON.features;
        const { id, ...measurementProperties } = measureFeature.properties;
        expect(measurementProperties).toEqual({
            label: 'N 48° 56\' 1\'\' W',
            geodesic: false,
            bearing: 311.0662463199936,
            bearingUom: 'deg',
            type: 'measurement',
            measureType: MeasureTypes.BEARING
        });
        expect(style.format).toBe('geostyler');
        expect(style.body.rules.length).toBe(6);
        expect(style.body.rules.map(({ name }) => name)).toEqual([
            'Angle measurement',
            'Start position',
            'End position',
            'Center position',
            'Segment labels',
            'Measurement label'
        ]);
        expect(style.body.rules.map(({ symbolizers }) => symbolizers[0].kind)).toEqual([
            'Line',
            'Mark',
            'Mark',
            'Mark',
            'Text',
            'Text'
        ]);
    });
});
