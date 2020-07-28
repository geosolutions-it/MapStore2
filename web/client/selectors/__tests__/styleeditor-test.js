/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    temporaryIdSelector,
    templateIdSelector,
    statusStyleSelector,
    errorStyleSelector,
    loadingStyleSelector,
    formatStyleSelector,
    languageVersionStyleSelector,
    codeStyleSelector,
    initialCodeStyleSelector,
    selectedStyleSelector,
    addStyleSelector,
    geometryTypeSelector,
    layerPropertiesSelector,
    enabledStyleEditorSelector,
    styleServiceSelector,
    canEditStyleSelector,
    getUpdatedLayer,
    getAllStyles,
    selectedStyleFormatSelector,
    editorMetadataSelector,
    selectedStyleMetadataSelector
} = require('../styleeditor');

describe('Test styleeditor selector', () => {
    it('test temporaryIdSelector', () => {
        const state = {
            styleeditor: {
                temporaryId: '4d91420-d79b-11e8-94c3-cf252a711708'
            }
        };
        const retval = temporaryIdSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('4d91420-d79b-11e8-94c3-cf252a711708');
    });
    it('test templateIdSelector', () => {
        const state = {
            styleeditor: {
                templateId: '6f13030-d79e-11e8-95aa-85d7608156db'
            }
        };
        const retval = templateIdSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('6f13030-d79e-11e8-95aa-85d7608156db');
    });
    it('test templateIdSelector', () => {
        const state = {
            styleeditor: {
                status: 'edit'
            }
        };
        const retval = statusStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('edit');
    });
    it('test errorStyleSelector', () => {
        const state = {
            styleeditor: {
                error: {
                    global: {
                        status: 404
                    }
                }
            }
        };
        const retval = errorStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toEqual(
            {
                global: {
                    status: 404
                }
            }
        );
    });
    it('test loadingStyleSelector', () => {
        const state = {
            styleeditor: {
                loading: true
            }
        };
        const retval = loadingStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toBe(true);
    });
    it('test formatStyleSelector', () => {
        const state = {
            styleeditor: {
                format: 'css'
            }
        };
        const retval = formatStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('css');
    });
    it('test languageVersionStyleSelector', () => {
        const state = {
            styleeditor: {
                languageVersion: { version: '1.0.0' }
            }
        };
        const retval = languageVersionStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toEqual({ version: '1.0.0' });
    });
    it('test codeStyleSelector', () => {
        const state = {
            styleeditor: {
                code: '* { stroke: #333333 }'
            }
        };
        const retval = codeStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('* { stroke: #333333 }');
    });
    it('test initialCodeStyleSelector', () => {
        const state = {
            styleeditor: {
                initialCode: '* { stroke: #333333; }'
            }
        };
        const retval = initialCodeStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('* { stroke: #333333; }');
    });
    it('test selectedStyleSelector', () => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        style: 'point'
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        opacity: 1,
                        style: 'generic'
                    }
                }
            }
        };
        const retval = selectedStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('generic');
    });
    it('test addStyleSelector', () => {
        const state = {
            styleeditor: {
                addStyle: true
            }
        };
        const retval = addStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toBe(true);
    });
    it('test geometryTypeSelector', () => {
        const state = {
            layers: {
                flat: [
                    {
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
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        opacity: 1,
                        style: 'generic'
                    }
                }
            }
        };
        const retval = geometryTypeSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('point');
    });

    it('test layerPropertiesSelector', () => {
        const state = {
            layers: {
                flat: [
                    {
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
                                            }]
                                        }
                                    }
                                }
                            }]
                        }
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        opacity: 1,
                        style: 'generic'
                    }
                }
            }
        };
        const retval = layerPropertiesSelector(state);

        expect(retval).toExist();
        expect(retval).toEqual({ RANK: { localPart: 'short', prefix: 'xsd' } });
    });
    it('test enabledStyleEditorSelector', () => {
        const state = {
            styleeditor: {
                enabled: true
            }
        };
        const retval = enabledStyleEditorSelector(state);

        expect(retval).toExist();
        expect(retval).toBe(true);
    });
    it('test styleServiceSelector', () => {
        const state = {
            styleeditor: {
                service: {
                    baseUrl: '/geoserver'
                }
            }
        };
        const retval = styleServiceSelector(state);

        expect(retval).toExist();
        expect(retval).toEqual(
            {
                baseUrl: '/geoserver'
            }
        );
    });
    it('test canEditStyleSelector', () => {
        const state = {
            styleeditor: {
                canEdit: true
            }
        };
        const retval = canEditStyleSelector(state);

        expect(retval).toExist();
        expect(retval).toBe(true);
    });
    it('test getUpdatedLayer', () => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        style: 'point'
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        opacity: 1,
                        style: 'generic'
                    }
                }
            }
        };
        const retval = getUpdatedLayer(state);

        expect(retval).toExist();
        expect(retval).toEqual({
            id: 'layerId',
            name: 'layerName',
            opacity: 1,
            style: 'generic'
        });
    });
    it('test getAllStyles', () => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        style: 'point'
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        opacity: 1,
                        style: 'square',
                        availableStyles: [
                            {
                                TYPE_NAME: "WMS_1_3_0.Style",
                                filename: "default_point.sld",
                                format: "sld",
                                languageVersion: {version: "1.0.0"},
                                legendURL: [],
                                name: 'point',
                                title: 'Title',
                                _abstract: ''
                            },
                            {
                                TYPE_NAME: "WMS_1_3_0.Style",
                                filename: "square.css",
                                format: "css",
                                languageVersion: {version: "1.0.0"},
                                legendURL: [],
                                name: 'square',
                                title: 'Title',
                                _abstract: ''
                            }
                        ]
                    }
                }
            }
        };
        const retval = getAllStyles(state);

        expect(retval).toExist();
        expect(retval).toEqual({
            availableStyles: [
                {
                    TYPE_NAME: 'WMS_1_3_0.Style',
                    filename: 'default_point.sld',
                    format: 'sld',
                    languageVersion: { version: '1.0.0' },
                    legendURL: [],
                    name: 'point',
                    title: 'Title',
                    _abstract: '',
                    label: 'Title'
                },
                {
                    TYPE_NAME: 'WMS_1_3_0.Style',
                    filename: 'square.css',
                    format: 'css',
                    languageVersion: { version: '1.0.0' },
                    legendURL: [],
                    name: 'square',
                    title: 'Title',
                    _abstract: '',
                    label: 'Title'
                }
            ],
            defaultStyle: 'point',
            enabledStyle: 'square'
        });
    });
    it('test getAllStyles fallback to style.name', () => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        style: 'point'
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        opacity: 1,
                        style: 'square',
                        availableStyles: [
                            {
                                TYPE_NAME: "WMS_1_3_0.Style",
                                filename: "default_point.sld",
                                format: "sld",
                                languageVersion: {version: "1.0.0"},
                                legendURL: [],
                                name: 'point',
                                _abstract: ''
                            },
                            {
                                TYPE_NAME: "WMS_1_3_0.Style",
                                filename: "square.css",
                                format: "css",
                                languageVersion: {version: "1.0.0"},
                                legendURL: [],
                                name: 'square',
                                _abstract: ''
                            }
                        ]
                    }
                }
            }
        };
        const retval = getAllStyles(state);

        expect(retval).toExist();
        expect(retval).toEqual({
            availableStyles: [
                {
                    TYPE_NAME: 'WMS_1_3_0.Style',
                    filename: 'default_point.sld',
                    format: 'sld',
                    languageVersion: { version: '1.0.0' },
                    legendURL: [],
                    name: 'point',
                    _abstract: '',
                    label: "point"
                },
                {
                    TYPE_NAME: 'WMS_1_3_0.Style',
                    filename: 'square.css',
                    format: 'css',
                    languageVersion: { version: '1.0.0' },
                    legendURL: [],
                    name: 'square',
                    _abstract: '',
                    label: 'square'
                }
            ],
            defaultStyle: 'point',
            enabledStyle: 'square'
        });
    });
    it('test temporaryIdSelector', () => {

        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        style: 'point',
                        availableStyles: [
                            {
                                name: 'point',
                                format: 'sld'
                            },
                            {
                                name: 'generic',
                                format: 'css'
                            }
                        ]
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        opacity: 1,
                        style: 'generic'
                    }
                }
            }
        };
        const retval = selectedStyleFormatSelector(state);
        expect(retval).toExist();
        expect(retval).toBe('css');

    });
    it('test editorMetadataSelector', () => {
        const state = {
            styleeditor: {
                metadata: {
                    editorType: 'visual',
                    styleJSON: 'null'
                }
            }
        };
        const retval = editorMetadataSelector(state);
        expect(retval).toBeTruthy();
        expect(retval).toEqual({
            editorType: 'visual',
            styleJSON: 'null'
        });
    });

    it('test selectedStyleMetadataSelector', () => {
        const state = {
            layers: {
                flat: [
                    {
                        id: 'layerId',
                        name: 'layerName',
                        style: 'point',
                        availableStyles: [{
                            name: 'point',
                            metadata: {
                                editorType: 'visual',
                                styleJSON: 'null'
                            }
                        }]
                    }
                ],
                selected: [
                    'layerId'
                ],
                settings: {
                    expanded: true,
                    node: 'layerId',
                    nodeType: 'layers',
                    options: {
                        opacity: 1,
                        style: 'point'
                    }
                }
            }
        };
        const retval = selectedStyleMetadataSelector(state);

        expect(retval).toBeTruthy();
        expect(retval).toEqual({
            editorType: 'visual',
            styleJSON: 'null'
        });
    });
});
