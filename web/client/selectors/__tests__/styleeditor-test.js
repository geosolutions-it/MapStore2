/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import {
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
    selectedStyleMetadataSelector,
    editingAllowedRolesSelector,
    editingAllowedGroupsSelector,
    canEditSelector,
    getEditDefaultStyle
} from '../styleeditor';
import {
    setCustomUtils,
    StyleEditorCustomUtils
} from "../../utils/StyleEditorUtils";

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
                "flat": [
                    {
                        "type": "wms",
                        "style": "pophade",
                        "format": "image/png",
                        "url": "https://gs-stable.geo-solutions.it/geoserver/wms",
                        "visibility": true,
                        "dimensions": [],
                        "name": "gs:us_states",
                        "title": "States of US",
                        "description": "States of US",
                        "bbox": {
                            "crs": "EPSG:4326",
                            "bounds": {
                                "minx": "-124.73142200000001",
                                "miny": "24.955967",
                                "maxx": "-66.969849",
                                "maxy": "49.371735"
                            }
                        },
                        "links": [],
                        "params": {},
                        "allowedSRS": {
                            "EPSG:3857": true,
                            "EPSG:900913": true,
                            "EPSG:4326": true
                        },
                        "catalogURL": null,
                        "version": "1.3.0",
                        "infoFormats": [
                            "text/plain",
                            "text/html",
                            "application/json"
                        ],
                        "id": "gs:us_states__5",
                        "loading": false,
                        "search": {
                            "url": "https://gs-stable.geo-solutions.it/geoserver/wfs",
                            "type": "wfs"
                        },
                        "previousLoadingError": false,
                        "loadingError": false,
                        "opacity": 1,
                        "describeLayer": {
                            "TYPE_NAME": "WMS_1_1_1.LayerDescription",
                            "name": "gs:us_states",
                            "wfs": "https://gs-stable.geo-solutions.it/geoserver/wfs?authkey=609779ca-0790-4ca3-8c75-f1cc957bb822&",
                            "owsURL": "https://gs-stable.geo-solutions.it/geoserver/wfs?authkey=609779ca-0790-4ca3-8c75-f1cc957bb822&",
                            "owsType": "WFS",
                            "query": [
                                {
                                    "TYPE_NAME": "WMS_1_1_1.Query",
                                    "typeName": "gs:us_states"
                                }
                            ],
                            "geometryType": "MultiPolygon"
                        },
                        "describeFeatureType": {
                            "elementFormDefault": "qualified",
                            "targetNamespace": "https://gs-stable.geo-solutions.it/geoserver/geoserver",
                            "targetPrefix": "gs",
                            "featureTypes": [
                                {
                                    "typeName": "us_states",
                                    "properties": [
                                        {
                                            "name": "the_geom",
                                            "maxOccurs": 1,
                                            "minOccurs": 0,
                                            "nillable": true,
                                            "type": "gml:MultiPolygon",
                                            "localType": "MultiPolygon"
                                        },
                                        {
                                            "name": "STATE_NAME",
                                            "maxOccurs": 1,
                                            "minOccurs": 0,
                                            "nillable": true,
                                            "type": "xsd:string",
                                            "localType": "string"
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ],
                "groups": [
                    {
                        "id": "Default",
                        "title": "Default",
                        "name": "Default",
                        "nodes": [
                            "gs:us_states__5"
                        ],
                        "expanded": true
                    }
                ],
                "selected": [
                    "gs:us_states__5"
                ],
                "layerMetadata": {
                    "expanded": false,
                    "metadataRecord": {},
                    "maskLoading": false
                },
                "editLayerName": false,
                "layerNameIsBeingChecked": false,
                "layerNameChangeError": false
            }
        };
        const retval = geometryTypeSelector(state);

        expect(retval).toExist();
        expect(retval).toBe('polygon');
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
                        "describeFeatureType": {
                            "elementFormDefault": "qualified",
                            "targetPrefix": "gs",
                            "featureTypes": [
                                {
                                    "typeName": "us_states",
                                    "properties": [
                                        {
                                            "name": "the_geom",
                                            "maxOccurs": 1,
                                            "minOccurs": 0,
                                            "nillable": true,
                                            "type": "gml:MultiPolygon",
                                            "localType": "MultiPolygon"
                                        },
                                        {
                                            "name": "STATE_NAME",
                                            "maxOccurs": 1,
                                            "minOccurs": 0,
                                            "nillable": true,
                                            "type": "xsd:string",
                                            "localType": "string"
                                        }
                                    ]
                                }
                            ]
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
        expect(retval).toEqual({ the_geom: { localType: 'MultiPolygon', prefix: 'gml' }, STATE_NAME: { localType: 'string', prefix: 'xsd' } });
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
    it('test editingAllowedRolesSelector', () => {
        expect(editingAllowedRolesSelector({
            styleeditor: {
                editingAllowedRoles: ['ADMIN']
            }
        })).toEqual(['ADMIN']);
    });
    it('test editingAllowedGroupsSelector', () => {
        expect(editingAllowedGroupsSelector({
            styleeditor: {
                editingAllowedGroups: ['test']
            }
        })).toEqual(['test']);
    });
    describe('canEditStyleSelector', () => {
        const isSameOrigin = StyleEditorCustomUtils.isSameOrigin;
        before(() => {
            setCustomUtils('isSameOrigin', () => true);
        });
        after(()=> {
            setCustomUtils('isSameOrigin', isSameOrigin);
        });
        it('test with role ADMIN', () => {
            expect(canEditStyleSelector({
                styleeditor: {
                    editingAllowedRoles: ['ADMIN']
                },
                security: {
                    user: {
                        role: 'ADMIN',
                        groups: {
                            group: {
                                enabled: true,
                                groupName: 'test'
                            }
                        }
                    }
                }
            })).toBeTruthy();
        });
        it('test with user matching allowedRoles', () => {
            expect(canEditStyleSelector({
                styleeditor: {
                    editingAllowedRoles: ['USER']
                },
                security: {
                    user: {
                        role: 'USER',
                        groups: {
                            group: {
                                enabled: true,
                                groupName: 'test'
                            }
                        }
                    }
                }
            })).toBeTruthy();
        });
        it('test with user matching allowedGroups', () => {
            expect(canEditStyleSelector({
                styleeditor: {
                    editingAllowedGroups: ['test']
                },
                security: {
                    user: {
                        role: 'USER',
                        groups: {
                            group: {
                                enabled: true,
                                groupName: 'test'
                            }
                        }
                    }
                }
            })).toBeTruthy();
        });
        it('test with user matching both allowedRoles and allowedGroups', () => {
            expect(canEditStyleSelector({
                styleeditor: {
                    editingAllowedRoles: ['USER'],
                    editingAllowedGroups: ['test']
                },
                security: {
                    user: {
                        role: 'USER',
                        groups: {
                            group: {
                                enabled: true,
                                groupName: 'test'
                            }
                        }
                    }
                }
            })).toBeTruthy();
        });
        it('test not allowed for editing', () => {
            expect(canEditStyleSelector({
                styleeditor: {
                    editingAllowedRoles: ['USER1'],
                    editingAllowedGroups: ['some']
                },
                security: {
                    user: {
                        role: 'USER',
                        groups: {
                            group: {
                                enabled: true,
                                groupName: 'test'
                            }
                        }
                    }
                }
            })).toBeFalsy();
        });
        it('test `canEdit` taking precedence over allowed roles and groups', () => {
            expect(canEditStyleSelector({
                styleeditor: {
                    canEdit: true,
                    editingAllowedRoles: ['USER1'],
                    editingAllowedGroups: ['some']
                },
                security: {
                    user: {
                        role: 'USER',
                        groups: {
                            group: {
                                enabled: true,
                                groupName: 'test'
                            }
                        }
                    }
                }
            })).toBeTruthy();
        });
        it('test canEditSelector', () => {
            expect(canEditSelector({
                styleeditor: {
                    canEdit: true
                }
            })).toBeTruthy();
            expect(canEditSelector()).toBeFalsy();
        });
    });
    it('test getEditDefaultStyle', () => {
        expect(getEditDefaultStyle({
            styleeditor: {
                enableEditDefaultStyle: true
            }
        })).toBeTruthy();
        expect(getEditDefaultStyle({
            styleeditor: {
                enableEditDefaultStyle: false
            }
        })).toBeFalsy();
    });
});
