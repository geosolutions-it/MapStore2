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

const expect = require('expect');

const {
    generateTemporaryStyleId,
    STYLE_ID_SEPARATOR,
    generateStyleId,
    extractFeatureProperties,
    getEditorMode,
    isSameOrigin,
    getStyleTemplates
} = require('../StyleEditorUtils');

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
        expect(getStyleTemplates().length > true).toBe(true);
    });

});
