/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import {
    isAnnotationLayer,
    isAnnotation,
    createAnnotationId,
    updateAnnotationsLayer
} from '../AnnotationsLayerUtils';

describe('AnnotationsLayerUtils', () => {
    it('isAnnotationLayer', () => {
        expect(isAnnotationLayer({ id: 'annotations:01', rowViewer: 'annotations', features: [], type: 'vector' })).toBe(true);
        expect(isAnnotationLayer({ id: '01', features: [], type: 'vector' })).toBe(false);
    });
    it('isAnnotation', () => {
        expect(isAnnotation({ type: 'ms2-annotations', features: [] })).toBe(true);
        expect(isAnnotation({ name: 'Annotations', features: [] })).toBe(true);
        expect(isAnnotation({ type: 'FeatureCollection', msType: 'annotations', features: [] })).toBe(true);
        expect(isAnnotation({ type: 'FeatureCollection', features: [] })).toBe(false);
    });
    it('createAnnotationId', () => {
        expect(createAnnotationId('01')).toBe('annotations:01');
        expect(createAnnotationId('annotations:01')).toBe('annotations:01');
        expect(createAnnotationId().includes('annotations:')).toBe(true);
    });
    it('updateAnnotationsLayer', () => {

        const oldAnnotationsLayer = {
            id: 'annotations',
            features: [
                {
                    type: 'FeatureCollection',
                    properties: {
                        title: 'Annotation 1',
                        description: '<p>The annotation number 1</p>',
                        id: '6963f020-a19f-11e9-bb35-a7155c9e9b22',
                        visibility: false
                    },
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                coordinates: [
                                    -74.81689453125001,
                                    34.24359472969738
                                ],
                                type: 'Point'
                            },
                            properties: {
                                id: '75575340-a19f-11e9-bb35-a7155c9e9b22',
                                isValidFeature: true,
                                canEdit: false
                            },
                            style: [
                                {
                                    iconGlyph: 'comment',
                                    iconShape: 'star',
                                    iconColor: 'cyan',
                                    highlight: false,
                                    id: '7557a160-a19f-11e9-bb35-a7155c9e9b22'
                                }
                            ]
                        }
                    ],
                    style: {}
                },
                {
                    type: 'FeatureCollection',
                    properties: {
                        title: 'Annotation 2',
                        description: '<p>The annotation number 2</p>',
                        id: '80145940-a19f-11e9-bb35-a7155c9e9b22',
                        visibility: false
                    },
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                coordinates: [
                                    -72.79541015625001,
                                    34.569906380856345
                                ],
                                type: 'Point'
                            },
                            properties: {
                                id: '8c975230-a19f-11e9-bb35-a7155c9e9b22',
                                isValidFeature: true,
                                canEdit: false
                            },
                            style: [
                                {
                                    iconAnchor: [
                                        0.5,
                                        0.5
                                    ],
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'fraction',
                                    color: '#ff0000',
                                    fillColor: '#130ce9',
                                    opacity: 1,
                                    size: 64,
                                    fillOpacity: 1,
                                    symbolUrl: 'product/assets/symbols/map-pin-marked.svg',
                                    shape: 'map-pin-marked',
                                    id: '8c977940-a19f-11e9-bb35-a7155c9e9b22',
                                    weight: 2,
                                    highlight: false
                                }
                            ]
                        }
                    ],
                    style: {}
                },
                {
                    type: 'FeatureCollection',
                    properties: {
                        title: 'Annotation 3',
                        description: '<p>The annotation number 3</p>',
                        id: 'ab69cb20-a19f-11e9-bb35-a7155c9e9b22',
                        visibility: false
                    },
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                coordinates: [
                                    [
                                        -79.07958984375003,
                                        29.869228848968298
                                    ],
                                    [
                                        -79.18945312500001,
                                        31.980123357368026
                                    ],
                                    [
                                        -77.58544921875,
                                        31.774877618507386
                                    ],
                                    [
                                        -77.49755859375001,
                                        29.735762444449076
                                    ],
                                    [
                                        -76.11328125000001,
                                        29.544787796199454
                                    ],
                                    [
                                        -76.04736328125001,
                                        31.024694128525123
                                    ]
                                ],
                                type: 'LineString'
                            },
                            properties: {
                                id: 'b46f8430-a19f-11e9-bb35-a7155c9e9b22',
                                isValidFeature: true,
                                canEdit: false
                            },
                            style: [
                                {
                                    color: '#e62130',
                                    opacity: 1,
                                    weight: 4,
                                    editing: {
                                        fill: 1
                                    },
                                    highlight: false,
                                    id: 'b46fab40-a19f-11e9-bb35-a7155c9e9b22',
                                    dashArray: [
                                        '6',
                                        '6'
                                    ]
                                },
                                {
                                    iconGlyph: 'comment',
                                    iconShape: 'circle',
                                    iconColor: 'blue',
                                    highlight: false,
                                    iconAnchor: [
                                        0.5,
                                        0.5
                                    ],
                                    type: 'Point',
                                    title: 'StartPoint Style',
                                    geometry: 'startPoint',
                                    filtering: true,
                                    id: 'b46fab41-a19f-11e9-bb35-a7155c9e9b22'
                                },
                                {
                                    iconGlyph: 'comment',
                                    iconShape: 'circle',
                                    iconColor: 'orange-dark',
                                    highlight: false,
                                    iconAnchor: [
                                        0.5,
                                        0.5
                                    ],
                                    type: 'Point',
                                    title: 'EndPoint Style',
                                    geometry: 'endPoint',
                                    filtering: true,
                                    id: 'b46fab42-a19f-11e9-bb35-a7155c9e9b22'
                                }
                            ]
                        }
                    ],
                    style: {}
                },
                {
                    type: 'FeatureCollection',
                    properties: {
                        title: 'Annotation 4',
                        description: '<p>The annotation number 4</p>',
                        id: 'ca722120-a19f-11e9-bb35-a7155c9e9b22',
                        visibility: false
                    },
                    features: [
                        {
                            type: 'Feature',
                            geometry: {
                                coordinates: [
                                    [
                                        [
                                            -74.37744140625001,
                                            31.306715155075157
                                        ],
                                        [
                                            -73.34472656250001,
                                            33.14675022877646
                                        ],
                                        [
                                            -72.02636718750001,
                                            30.94934691546855
                                        ],
                                        [
                                            -72.55371093750001,
                                            29.602118211647333
                                        ],
                                        [
                                            -74.59716796875001,
                                            29.94541533710443
                                        ],
                                        [
                                            -73.56445312500001,
                                            30.704058230919504
                                        ],
                                        [
                                            -74.37744140625001,
                                            31.306715155075157
                                        ]
                                    ]
                                ],
                                type: 'Polygon'
                            },
                            properties: {
                                id: 'd5679c40-a19f-11e9-bb35-a7155c9e9b22',
                                isValidFeature: true,
                                canEdit: false
                            },
                            style: [
                                {
                                    color: '#0df506',
                                    opacity: 1,
                                    weight: 3,
                                    fillColor: '#ffff00',
                                    fillOpacity: 0.54,
                                    editing: {
                                        fill: 1
                                    },
                                    highlight: false,
                                    id: 'd567c350-a19f-11e9-bb35-a7155c9e9b22',
                                    dashArray: [
                                        '20',
                                        '20'
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [
                                    -70.59814453125001,
                                    31.21280145833882
                                ]
                            },
                            properties: {
                                id: 'ee2d02b0-a19f-11e9-bb35-a7155c9e9b22',
                                isValidFeature: true,
                                canEdit: false,
                                isText: true,
                                valueText: 'The annotation',
                                selected: true
                            },
                            style: [
                                {
                                    fontStyle: 'normal',
                                    fontSize: '16',
                                    fontSizeUom: 'px',
                                    fontFamily: 'Arial',
                                    fontWeight: 'normal',
                                    font: 'normal normal 16px Arial',
                                    textAlign: 'center',
                                    color: '#000000',
                                    opacity: 1,
                                    fillColor: '#f5eb0f',
                                    fillOpacity: 1,
                                    highlight: false,
                                    type: 'Text',
                                    title: 'Text Style',
                                    id: 'ee2d50d0-a19f-11e9-bb35-a7155c9e9b22',
                                    label: 'The annotation'
                                }
                            ]
                        },
                        {
                            type: 'Feature',
                            geometry: {
                                type: 'Polygon',
                                coordinates: []
                            },
                            properties: {
                                isCircle: true,
                                radius: 147023.83721695654,
                                center: [
                                    -69.78515625000001,
                                    28.950475674847993
                                ],
                                id: '0a5f2e40-a1a0-11e9-bb35-a7155c9e9b22',
                                polygonGeom: {
                                    type: 'Polygon',
                                    coordinates: []
                                },
                                isValidFeature: true,
                                canEdit: false
                            },
                            style: [
                                {
                                    color: '#ffcc33',
                                    opacity: 1,
                                    weight: 3,
                                    fillColor: '#ffffff',
                                    fillOpacity: 0.2,
                                    highlight: false,
                                    type: 'Circle',
                                    title: 'Circle Style',
                                    id: '0a5f5550-a1a0-11e9-bb35-a7155c9e9b22'
                                },
                                {
                                    iconAnchor: [
                                        0.5,
                                        0.5
                                    ],
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'fraction',
                                    color: '#ffffff',
                                    fillColor: '#1120e4',
                                    opacity: 1,
                                    size: 38,
                                    fillOpacity: 1,
                                    symbolUrl: 'product/assets/symbols/triangle.svg',
                                    shape: 'triangle',
                                    id: '0a5f5551-a1a0-11e9-bb35-a7155c9e9b22',
                                    title: 'Center Style',
                                    geometry: 'centerPoint',
                                    filtering: true,
                                    weight: 4,
                                    highlight: false
                                }
                            ]
                        }
                    ],
                    style: {}
                }
            ],
            name: 'Annotations',
            style: {},
            type: 'vector',
            visibility: false,
            singleTile: false,
            dimensions: [],
            hideLoading: true,
            handleClickOnLayer: true,
            useForElevation: false,
            hidden: false
        };
        const newLayers = updateAnnotationsLayer(oldAnnotationsLayer);
        expect(newLayers.length).toBe(4);
        expect(newLayers[0].features.length).toBe(1);
        expect(newLayers[0].features[0].geometry.type).toBe('Point');
        expect(newLayers[0].features[0].properties.annotationType).toBe('Point');
        expect(newLayers[0].style.body.rules.length).toBe(1);
        expect(newLayers[0].style.body.rules[0].symbolizers[0].kind).toBe('Icon');
        expect(newLayers[1].features.length).toBe(1);
        expect(newLayers[1].features[0].geometry.type).toBe('Point');
        expect(newLayers[1].features[0].properties.annotationType).toBe('Point');
        expect(newLayers[1].style.body.rules.length).toBe(1);
        expect(newLayers[1].style.body.rules[0].symbolizers[0].kind).toBe('Mark');
        expect(newLayers[2].features.length).toBe(1);
        expect(newLayers[2].features[0].geometry.type).toBe('LineString');
        expect(newLayers[2].features[0].properties.annotationType).toBe('LineString');
        expect(newLayers[2].style.body.rules.length).toBe(3);
        expect(newLayers[2].style.body.rules.map(rule => rule.symbolizers[0].kind)).toEqual(['Line', 'Icon', 'Icon']);
        expect(newLayers[3].features.length).toBe(3);
        expect(newLayers[3].features.map(feature => feature.geometry.type)).toEqual([ 'Polygon', 'Point', 'Point' ]);
        expect(newLayers[3].features.map(feature => feature.properties.annotationType)).toEqual([ 'Polygon', 'Text', 'Circle' ]);
        expect(newLayers[3].style.body.rules.length).toBe(4);
        expect(newLayers[3].style.body.rules.map(rule => rule.symbolizers[0].kind)).toEqual([ 'Fill', 'Text', 'Circle', 'Mark' ]);
    });
});
