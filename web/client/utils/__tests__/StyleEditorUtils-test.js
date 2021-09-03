/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import xml2js from 'xml2js';
import {
    generateTemporaryStyleId,
    STYLE_ID_SEPARATOR,
    generateStyleId,
    extractFeatureProperties,
    getEditorMode,
    isSameOrigin,
    getStyleTemplates,
    getNameParts,
    stringifyNameParts,
    parseJSONStyle,
    formatJSONStyle,
    validateImageSrc,
    updateExternalGraphicNode
} from '../StyleEditorUtils';

describe('StyleEditorUtils test', () => {
    it('test generateTemporaryStyleId', () => {
        const divider = '_ms_';
        const generateId = generateTemporaryStyleId();
        const idSplit = generateId.split(divider);
        expect(idSplit.length).toBe(2);
    });
    it('test generateStyleId', () => {
        const generateId = generateStyleId({title: 'My style TiTle'});
        const idSplit = generateId.split(STYLE_ID_SEPARATOR);
        expect(idSplit.length).toBe(2);
        expect(idSplit[0]).toBe('my_style_title');
    });
    it('test extractFeatureProperties', () => {
        const layer = {
            id: 'layerId',
            name: 'layerName',
            style: 'point',
            describeLayer: {
                owsType: 'WFS'
            },
            describeFeatureType: {
                complexType: [{
                    complexContent: {
                        extension: {
                            sequence: {
                                element: [{
                                    TYPE_NAME: "XSD_1_0.LocalElement",
                                    maxOccurs: "1",
                                    minOccurs: 0,
                                    name: "RANK",
                                    nillable: true,
                                    otherAttributes: {},
                                    type: {
                                        key: "{http://www.w3.org/2001/XMLSchema}short",
                                        localPart: "short",
                                        namespaceURI: "http://www.w3.org/2001/XMLSchema",
                                        prefix: "xsd",
                                        string: "{http://www.w3.org/2001/XMLSchema}xsd:short"
                                    }
                                }, {
                                    TYPE_NAME: "XSD_1_0.LocalElement",
                                    maxOccurs: "1",
                                    minOccurs: 0,
                                    name: "geom",
                                    nillable: true,
                                    otherAttributes: {},
                                    type: {
                                        key: "{http://www.opengis.net/gml}PointPropertyType",
                                        localPart: "PointPropertyType",
                                        namespaceURI: "http://www.opengis.net/gml",
                                        prefix: "gml",
                                        string: "{http://www.opengis.net/gml}gml:PointPropertyType"
                                    }
                                }]
                            }
                        }
                    }
                }]
            }
        };
        expect(extractFeatureProperties(layer)).toEqual({
            geometryType: 'point',
            properties: {
                RANK: { localPart: 'short', prefix: 'xsd' },
                geom: { localPart: 'PointPropertyType', prefix: 'gml' }
            },
            owsType: 'WFS'
        });

    });
    it('test getEditorMode', () => {
        expect(getEditorMode('css')).toBe('geocss');
        expect(getEditorMode('sld')).toBe('xml');
        expect(getEditorMode('yaml')).toBe('yaml');
    });
    it('test isSameOrigin', () => {
        expect(isSameOrigin({url: '/geoserver'}, {baseUrl: '/geoserver'})).toBe(true);
        expect(isSameOrigin({url: 'http://localhost:8080/geoserver'}, {baseUrl: '/geoserver'})).toBe(false);
        expect(isSameOrigin({url: 'http://localhost:8080/geoserver'}, {baseUrl: '/geoserver', availableUrls: [ 'http://localhost:8080']})).toBe(true);
    });
    it('test getStyleTemplates', () => {
        expect(getStyleTemplates().length > 2).toBe(true);
    });
    it('test getNameParts', () => {
        expect(getNameParts('workspace:name')).toEqual({
            name: 'name',
            workspace: 'workspace'
        });

        expect(getNameParts('name')).toEqual({
            name: 'name',
            workspace: undefined
        });
    });

    it('test getNameParts', () => {
        expect(stringifyNameParts({name: 'name', workspace: {name: 'workspace'}})).toBe('workspace:name');
        expect(stringifyNameParts({name: 'name'})).toBe('name');
    });

    it('test parseJSONStyle filter object to geostyler array filter translation', () => {
        const style = {
            name: 'Style',
            rules: [
                {
                    name: 'Rule',
                    filter: {
                        filterFields: [
                            {
                                rowId: 1594021816562,
                                groupId: 1,
                                attribute: 'STATE_NAME',
                                operator: '=',
                                value: 'New York',
                                type: 'string',
                                fieldOptions: {
                                    valuesCount: 0,
                                    currentPage: 1
                                },
                                exception: null
                            }
                        ],
                        groupFields: [
                            {
                                id: 1,
                                logic: 'OR',
                                index: 0
                            }
                        ]
                    },
                    symbolizers: []
                }
            ]
        };
        expect(parseJSONStyle(style)).toEqual({
            name: 'Style',
            rules: [ {
                name: 'Rule',
                filter: [ '||', [ '==', 'STATE_NAME', 'New York' ] ],
                symbolizers: []
            }]
        });
    });

    it('test parseJSONStyle classification translation', () => {
        const style = {
            name: 'Style',
            rules: [
                {
                    ruleId: 'rule1',
                    kind: 'Classification',
                    color: '#dddddd',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    classification: [{
                        title: ' >= 18.0 AND <10164.3',
                        color: '#FFF7EC',
                        type: 'Polygon',
                        min: 18,
                        max: 10164.3
                    },
                    {
                        title: ' >= 10164.3 AND <20310.5',
                        color: '#FC8D59',
                        type: 'Polygon',
                        min: 10164.3,
                        max: 20310.5
                    },
                    {
                        title: ' >= 20310.5 AND <=30456.9',
                        color: '#7F0000',
                        type: 'Polygon',
                        min: 20310.5,
                        max: 30456.9
                    }],
                    intervals: 3,
                    method: 'equalInterval',
                    ramp: 'orrd',
                    reverse: false,
                    symbolizerKind: 'Fill',
                    attribute: 'WATER_KM'
                }
            ]
        };
        expect(parseJSONStyle(style)).toEqual({
            name: 'Style',
            rules: [ {
                name: '>= 18 and < 10164.3',
                filter: [ '&&', [ '>=', 'WATER_KM', 18 ], [ '<', 'WATER_KM', 10164.3 ] ],
                symbolizers: [{
                    kind: 'Fill',
                    color: '#FFF7EC',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            },
            {
                name: '>= 10164.3 and < 20310.5',
                filter: [ '&&', [ '>=', 'WATER_KM', 10164.3 ], [ '<', 'WATER_KM', 20310.5 ] ],
                symbolizers: [ {
                    kind: 'Fill',
                    color: '#FC8D59',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            },
            {
                name: '>= 20310.5 and <= 30456.9',
                filter: [ '&&', [ '>=', 'WATER_KM', 20310.5 ], [ '<=', 'WATER_KM', 30456.9 ] ],
                symbolizers: [{
                    kind: 'Fill',
                    color: '#7F0000',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            }]
        });
    });
    it('test parseJSONStyle classification translation with null values', () => {
        const style = {
            name: 'Style',
            rules: [
                {
                    ruleId: 'rule1',
                    kind: 'Classification',
                    color: '#dddddd',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    classification: [{
                        title: '<10164.3',
                        color: '#FFF7EC',
                        type: 'Polygon',
                        min: null,
                        max: 10164.3
                    },
                    {
                        title: ' >= 10164.3 AND <20310.5',
                        color: '#FC8D59',
                        type: 'Polygon',
                        min: 10164.3,
                        max: 20310.5
                    },
                    {
                        title: '>= 20310.5',
                        color: '#7F0000',
                        type: 'Polygon',
                        min: 20310.5,
                        max: null
                    }],
                    intervals: 3,
                    method: 'equalInterval',
                    ramp: 'orrd',
                    reverse: false,
                    symbolizerKind: 'Fill',
                    attribute: 'WATER_KM'
                }
            ]
        };
        expect(parseJSONStyle(style)).toEqual({
            name: 'Style',
            rules: [ {
                name: '< 10164.3',
                filter: [ '&&', [ '<', 'WATER_KM', 10164.3 ] ],
                symbolizers: [{
                    kind: 'Fill',
                    color: '#FFF7EC',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            },
            {
                name: '>= 10164.3 and < 20310.5',
                filter: [ '&&', [ '>=', 'WATER_KM', 10164.3 ], [ '<', 'WATER_KM', 20310.5 ] ],
                symbolizers: [ {
                    kind: 'Fill',
                    color: '#FC8D59',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            },
            {
                name: '>= 20310.5',
                filter: [ '&&', [ '>=', 'WATER_KM', 20310.5 ] ],
                symbolizers: [{
                    kind: 'Fill',
                    color: '#7F0000',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            }]
        });
    });
    it('test parseJSONStyle raster classification translation', () => {

        const style = {
            name: 'Style',
            rules: [
                {
                    ruleId: 'rule1',
                    kind: 'Raster',
                    opacity: 1,
                    classification: [{
                        color: '#B9FBC7',
                        opacity: 1,
                        label: '1066',
                        quantity: 1066
                    },
                    {
                        color: '#FC8D59',
                        opacity: 1,
                        label: '1453',
                        quantity: 1453
                    },
                    {
                        color: '#7F0000',
                        opacity: 1,
                        label: '1840',
                        quantity: 1840
                    }],
                    intervals: 3,
                    method: 'equalInterval',
                    ramp: 'custom',
                    reverse: false,
                    continuous: true,
                    colorMapType: 'ramp',
                    symbolizerKind: 'Raster',
                    name: 'raster'
                }
            ]
        };
        expect(parseJSONStyle(style)).toEqual({
            name: 'Style',
            rules: [ {
                name: 'raster',
                symbolizers: [ {
                    kind: 'Raster',
                    opacity: 1,
                    colorMap: {
                        colorMapEntries: [{
                            color: '#B9FBC7',
                            opacity: 1,
                            label: '1066',
                            quantity: 1066
                        },
                        {
                            color: '#FC8D59',
                            opacity: 1,
                            label: '1453',
                            quantity: 1453
                        },
                        {
                            color: '#7F0000',
                            opacity: 1,
                            label: '1840',
                            quantity: 1840
                        }],
                        type: 'ramp'
                    }
                }]
            } ]
        });
    });

    it('test parseJSONStyle should return empty string when rule name is undefined', () => {

        const style = {
            name: 'Style',
            rules: [
                {
                    ruleId: 'rule1',
                    kind: 'Raster',
                    opacity: 1,
                    classification: [],
                    intervals: 3,
                    method: 'equalInterval',
                    ramp: 'custom',
                    reverse: false,
                    continuous: true,
                    symbolizerKind: 'Raster'
                }
            ]
        };

        expect(parseJSONStyle(style)).toEqual({
            name: 'Style',
            rules: [ {
                name: '',
                symbolizers: [ {
                    kind: 'Raster',
                    opacity: 1
                }]
            } ]
        });
    });

    it('test formatJSONStyle geostyler array filter to filter object translation', () => {
        const style = {
            name: 'Style',
            rules: [ {
                name: 'Rule',
                filter: [ '||', [ '==', 'STATE_NAME', 'New York' ] ],
                symbolizers: []
            }]
        };

        const formattedJSONStyle = formatJSONStyle(style);
        expect(formattedJSONStyle.rules[0].filter.groupFields).toBeTruthy();
        expect(formattedJSONStyle.rules[0].filter.filterFields).toBeTruthy();
    });
    it('test parseJSONStyle read scale denominator filters for rule kind Classification', () => {
        const scaleDenominator = {
            min: 100,
            max: 50000
        };
        const style = {
            name: 'Style',
            rules: [ {
                scaleDenominator,

                kind: 'Classification',
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                ramp: 'spectral',
                type: 'classificationVector',

                symbolizerKind: 'Fill',
                color: '#dddddd',
                fillOpacity: 1,
                outlineColor: '#777777',
                outlineWidth: 1,

                classification: [
                    {
                        title: ' >= 168839.0 AND <2211312.4',
                        color: '#9E0142',
                        type: 'Polygon',
                        min: 168839,
                        max: 2211312.4
                    },
                    {
                        title: ' >= 2211312.4 AND <4253785.8',
                        color: '#F98E52',
                        type: 'Polygon',
                        min: 2211312.4,
                        max: 4253785.8
                    }
                ]
            }]
        };

        const formattedJSONStyle = parseJSONStyle(style);
        expect(formattedJSONStyle.rules.length).toBe(2);
        expect(formattedJSONStyle.rules[0].scaleDenominator).toEqual(scaleDenominator);
        expect(formattedJSONStyle.rules[1].scaleDenominator).toEqual(scaleDenominator);
    });
    it('test parseJSONStyle read scale denominator filters for rule kind Raster', () => {
        const scaleDenominator = {
            min: 100,
            max: 50000
        };
        const style = {
            name: 'Style',
            rules: [ {
                scaleDenominator,

                kind: 'Raster',
                ruleId: 'rule0',
                intervals: 5,
                method: 'equalInterval',
                reverse: false,
                continuous: true,
                ramp: 'spectral',
                type: 'classificationRaster',

                opacity: 1,
                symbolizerKind: 'Raster'
            }]
        };

        const formattedJSONStyle = parseJSONStyle(style);
        expect(formattedJSONStyle.rules.length).toBe(1);
        expect(formattedJSONStyle.rules[0].scaleDenominator).toEqual(scaleDenominator);
    });
    it('test parseJSONStyle remove undefined value', () => {
        const style = {
            name: 'Style',
            rules: [ {
                name: 'Rule',
                symbolizers: [
                    {
                        kind: 'Text',
                        label: 'Label',
                        font: undefined,
                        color: '#333333'
                    }
                ]
            }]
        };

        const formattedJSONStyle = parseJSONStyle(style);
        expect(formattedJSONStyle.rules.length).toBe(1);
        expect(formattedJSONStyle.rules[0].symbolizers[0]).toEqual({
            kind: 'Text',
            label: 'Label',
            color: '#333333'
        });
    });
    it('should remove halo if haloWidth is equal to 0', () => {
        const style = {
            name: 'Style',
            rules: [ {
                name: 'Rule',
                symbolizers: [
                    {
                        allowOverlap: true,
                        color: '#333333',
                        fontStyle: 'normal',
                        fontWeight: 'normal',
                        haloColor: '#ffffff',
                        haloWidth: 0,
                        kind: 'Text',
                        label: 'Label',
                        offset: [0, 0],
                        size: 14,
                        symbolizerId: 'id'
                    }
                ]
            }]
        };

        const formattedJSONStyle = parseJSONStyle(style);
        expect(formattedJSONStyle.rules.length).toBe(1);
        expect(formattedJSONStyle.rules[0].symbolizers[0]).toEqual({
            allowOverlap: true,
            color: '#333333',
            fontStyle: 'normal',
            fontWeight: 'normal',
            kind: 'Text',
            label: 'Label',
            offset: [0, 0],
            size: 14,
            symbolizerId: 'id'
        });
    });
    it('should remove outline if outlineWidth is equal to 0', () => {
        const style = {
            name: 'Style',
            rules: [ {
                name: 'Rule',
                symbolizers: [
                    {
                        color: '#dddddd',
                        fillOpacity: 1,
                        kind: 'Fill',
                        outlineColor: '#777777',
                        outlineWidth: 0,
                        symbolizerId: 'id'
                    }
                ]
            }]
        };

        const formattedJSONStyle = parseJSONStyle(style);
        expect(formattedJSONStyle.rules.length).toBe(1);
        expect(formattedJSONStyle.rules[0].symbolizers[0]).toEqual({
            color: '#dddddd',
            fillOpacity: 1,
            kind: 'Fill',
            symbolizerId: 'id'
        });
    });
    it('should remove stroke if strokeWidth is equal to 0', () => {
        const style = {
            name: 'Style',
            rules: [ {
                name: 'Rule',
                symbolizers: [
                    {
                        color: '#dddddd',
                        fillOpacity: 1,
                        kind: 'Mark',
                        radius: 16,
                        rotate: 0,
                        strokeColor: '#777777',
                        strokeOpacity: 1,
                        strokeWidth: 0,
                        symbolizerId: 'id',
                        wellKnownName: 'Circle'
                    }
                ]
            }]
        };

        const formattedJSONStyle = parseJSONStyle(style);
        expect(formattedJSONStyle.rules.length).toBe(1);
        expect(formattedJSONStyle.rules[0].symbolizers[0]).toEqual({
            color: '#dddddd',
            fillOpacity: 1,
            kind: 'Mark',
            radius: 16,
            rotate: 0,
            symbolizerId: 'id',
            wellKnownName: 'Circle'
        });
    });
    it('should remove stroke in graphicStroke if strokeWidth is equal to 0', () => {
        const style = {
            name: 'Style',
            rules: [ {
                name: 'Rule',
                symbolizers: [
                    {
                        cap: "round",
                        color: "#777777",
                        graphicStroke: {
                            color: '#dddddd',
                            fillOpacity: 1,
                            kind: 'Mark',
                            radius: 16,
                            rotate: 0,
                            strokeColor: '#777777',
                            strokeOpacity: 1,
                            strokeWidth: 0,
                            wellKnownName: 'Circle'
                        },
                        join: 'round',
                        kind: 'Line',
                        opacity: 1,
                        symbolizerId: 'id',
                        width: 1
                    }
                ]
            }]
        };

        const formattedJSONStyle = parseJSONStyle(style);
        expect(formattedJSONStyle.rules.length).toBe(1);
        expect(formattedJSONStyle.rules[0].symbolizers[0]).toEqual({
            cap: "round",
            color: "#777777",
            graphicStroke: {
                color: '#dddddd',
                fillOpacity: 1,
                kind: 'Mark',
                radius: 16,
                rotate: 0,
                wellKnownName: 'Circle'
            },
            join: 'round',
            kind: 'Line',
            opacity: 1,
            symbolizerId: 'id',
            width: 1
        });
    });

    it('should remove stroke in graphicFill if strokeWidth is equal to 0', () => {
        const style = {
            name: 'Style',
            rules: [ {
                name: 'Rule',
                symbolizers: [
                    {
                        color: '#dddddd',
                        fillOpacity: 1,
                        graphicFill: {
                            color: '#dddddd',
                            fillOpacity: 1,
                            kind: 'Mark',
                            radius: 16,
                            rotate: 0,
                            strokeColor: '#777777',
                            strokeOpacity: 1,
                            strokeWidth: 0,
                            wellKnownName: 'Circle'
                        },
                        kind: 'Fill',
                        outlineColor: '#777777',
                        outlineWidth: 0,
                        symbolizerId: 'id'
                    }
                ]
            }]
        };

        const formattedJSONStyle = parseJSONStyle(style);
        expect(formattedJSONStyle.rules.length).toBe(1);
        expect(formattedJSONStyle.rules[0].symbolizers[0]).toEqual({
            color: '#dddddd',
            fillOpacity: 1,
            graphicFill: {
                color: '#dddddd',
                fillOpacity: 1,
                kind: 'Mark',
                radius: 16,
                rotate: 0,
                wellKnownName: 'Circle'
            },
            kind: 'Fill',
            symbolizerId: 'id'
        });
    });
    it('test parseJSONStyle for unique interval method classification translation', () => {
        const style = {
            name: 'Style',
            rules: [
                {
                    ruleId: 'rule1',
                    kind: 'Classification',
                    color: '#dddddd',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1,
                    classification: [{
                        title: 10164.3,
                        color: '#FFF7EC',
                        type: 'Polygon',
                        unique: 10164.3
                    },
                    {
                        title: 20310.5,
                        color: '#FC8D59',
                        type: 'Polygon',
                        unique: 20310.5
                    },
                    {
                        title: 30456.9,
                        color: '#7F0000',
                        type: 'Polygon',
                        unique: 30456.9
                    }],
                    intervals: 3,
                    method: 'uniqueInterval',
                    ramp: 'orrd',
                    reverse: false,
                    symbolizerKind: 'Fill',
                    attribute: 'WATER_KM'
                }
            ]
        };
        expect(parseJSONStyle(style)).toEqual({
            name: 'Style',
            rules: [{
                name: 10164.3,
                filter: [ '==', 'WATER_KM', 10164.3 ],
                symbolizers: [{
                    kind: 'Fill',
                    color: '#FFF7EC',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            },
            {
                name: 20310.5,
                filter: [ '==', 'WATER_KM', 20310.5 ],
                symbolizers: [ {
                    kind: 'Fill',
                    color: '#FC8D59',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            },
            {
                name: 30456.9,
                filter: [ '==', 'WATER_KM', 30456.9 ],
                symbolizers: [{
                    kind: 'Fill',
                    color: '#7F0000',
                    fillOpacity: 1,
                    outlineColor: '#777777',
                    outlineWidth: 1
                }]
            }]
        });
    });
    it('should return an error with empty image src (validateImageSrc)', (done) => {
        validateImageSrc('')
            .then(() => {})
            .catch((error) => {
                expect(error.isBase64).toBe(false);
                expect(error.messageId).toBe('imageSrcEmpty');
                done();
            });
    });
    it('should return an error with an invalid image (validateImageSrc)', (done) => {
        const invalidSrc = 'image.png';
        validateImageSrc(invalidSrc)
            .then(() => {})
            .catch((error) => {
                expect(error.isBase64).toBe(false);
                expect(error.messageId).toBe('imageSrcLoadError');
                done();
            });
    });
    it('should return an error with invalid base64 image (validateImageSrc)', (done) => {
        const invalidBase64Src = 'data:image/png;base64,iVBOR';
        validateImageSrc(invalidBase64Src)
            .then(() => {})
            .catch((error) => {
                expect(error.isBase64).toBe(false);
                expect(error.messageId).toBe('imageSrcInvalidBase64');
                done();
            });
    });
    it('should return an valid response with valid base64 image (validateImageSrc)', (done) => {
        const validBase64Src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        validateImageSrc(validBase64Src)
            .then((response) => {
                expect(response.isBase64).toBe(true);
                expect(response.src).toBe(validBase64Src);
                done();
            });
    });
    describe('test updateExternalGraphicNode', ()=>{
        it('should return an valid parsed SLD with format specified', () => {
            const format = 'image/png';
            const style = {
                name: "Base SLD1",
                rules: [
                    {
                        name: "",
                        ruleId: "1",
                        symbolizers: [
                            {
                                kind: "Icon",
                                format,
                                image: "https://test.com/linktoImage",
                                opacity: 1,
                                size: 32,
                                rotate: 0,
                                symbolizerId: "2"
                            }
                        ]
                    }
                ]
            };
            const parsedSLD = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><StyledLayerDescriptor version=\"1.0.0\" xsi:schemaLocation=\"http://www.opengis.net/sld StyledLayerDescriptor.xsd\" xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><NamedLayer><Name>icon dev</Name><UserStyle><Name>icon dev</Name><Title>icon dev</Title><FeatureTypeStyle><Rule><Name/><PointSymbolizer><Graphic><ExternalGraphic><OnlineResource xlink:type=\"simple\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"https://www.pngix.com/pngfile/middle/92-926820_test-logo-png-transparent-png.png\"/></ExternalGraphic><Opacity>1</Opacity><Size>32</Size></Graphic></PointSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";
            const {parsedCode, errorObj} = updateExternalGraphicNode({format: 'sld', style}, parsedSLD);
            expect(errorObj).toBe(false);
            expect(parsedCode).toBeTruthy();
            expect(parsedCode).toContain(format);

        });
        it('should skip parsing when style format is css', () => {
            const format = 'image/png';
            const style = {
                name: "Base SLD1",
                rules: [
                    {
                        name: "",
                        ruleId: "1",
                        symbolizers: [
                            {
                                kind: "Icon",
                                format,
                                image: "https://test.com/linktoImage",
                                opacity: 1,
                                size: 32,
                                rotate: 0,
                                symbolizerId: "2"
                            }
                        ]
                    }
                ]
            };
            const parsedSLD = "@mode 'Flat';\n" +
                "@styleTitle 'Base CSS1';\n" +
                "\n" +
                "* {\n" +
                "  mark: url('https://master.demo.geonode.org/documents/1623/link');\n" +
                "  mark-opacity: 1;\n" +
                "  mark-size: 32;\n" +
                "  mark-rotation: 0;\n" +
                "}";
            const {parsedCode, errorObj} = updateExternalGraphicNode({format: 'css', style}, parsedSLD);
            expect(errorObj).toBe(false);
            expect(parsedCode).toBeTruthy();
            expect(parsedCode).toEqual(parsedSLD);

        });
        it('should skip parsing when parsed SLD has format in external graphic of Icon symbolizer', () => {
            const style = {
                name: "Base SLD1",
                rules: [
                    {
                        name: "",
                        ruleId: "1",
                        symbolizers: [
                            {
                                kind: "Icon",
                                image: "https://test.com/linktoImage.png",
                                opacity: 1,
                                size: 32,
                                rotate: 0,
                                symbolizerId: "2"
                            }
                        ]
                    }
                ]
            };
            const oldSLD = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><NamedLayer><Name>icon dev</Name><UserStyle><Name>icon dev</Name><Title>icon dev</Title><FeatureTypeStyle><Rule><Name/><PointSymbolizer><Graphic><ExternalGraphic><OnlineResource xlink:type="simple" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://www.pngix.com/pngfile/middle/92-926820_test-logo-png-transparent-png.png"/><Format>image/png</Format></ExternalGraphic><Opacity>1</Opacity><Size>32</Size></Graphic></PointSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`;
            let oldSLDJSON;
            xml2js.parseString(oldSLD, { explicitArray: false }, (_, res)=>{
                oldSLDJSON = res;
            });
            const {parsedCode, errorObj} = updateExternalGraphicNode({format: 'sld', style}, oldSLD);
            expect(errorObj).toBeFalsy();
            expect(parsedCode).toBeTruthy();
            let parsedCodeJSON;
            xml2js.parseString(parsedCode, { explicitArray: false }, (_, res)=>{
                parsedCodeJSON = res;
            });
            expect(parsedCodeJSON).toEqual(oldSLDJSON);
        });
        it('should return error when image and user specified format is not present', () => {
            const style = {
                name: "Base SLD1",
                rules: [
                    {
                        name: "",
                        ruleId: "1",
                        symbolizers: [
                            {
                                kind: "Icon",
                                image: "https://test.com/linktoImage",
                                opacity: 1,
                                size: 32,
                                rotate: 0,
                                symbolizerId: "2"
                            }
                        ]
                    }
                ]
            };
            const parsedSLD = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><StyledLayerDescriptor version=\"1.0.0\" xsi:schemaLocation=\"http://www.opengis.net/sld StyledLayerDescriptor.xsd\" xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><NamedLayer><Name>icon dev</Name><UserStyle><Name>icon dev</Name><Title>icon dev</Title><FeatureTypeStyle><Rule><Name/><PointSymbolizer><Graphic><ExternalGraphic><OnlineResource xlink:type=\"simple\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"https://www.pngix.com/pngfile/middle/92-926820_test-logo-png-transparent-png.png\"/></ExternalGraphic><Opacity>1</Opacity><Size>32</Size></Graphic></PointSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";
            const {parsedCode, errorObj} = updateExternalGraphicNode({format: 'sld', style}, parsedSLD);
            expect(errorObj).toBeTruthy();
            expect(errorObj.messageId).toEqual('styleeditor.imageFormatEmpty');
            expect(errorObj.status).toEqual(400);
            expect(parsedCode).toBeFalsy();
        });
    });
});
