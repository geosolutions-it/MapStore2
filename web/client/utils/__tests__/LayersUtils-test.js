/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import uuidv1 from 'uuid/v1';
import * as LayersUtils from '../LayersUtils';

const { extractTileMatrixSetFromLayers, splitMapAndLayers, flattenGroups, getTitle, isBackgroundCompatibleWithProjection} = LayersUtils;
const typeV1 = "empty";
const emptyBackground = {
    type: typeV1
};


const mapquestLayerWithApikey = {
    type: 'mapquest',
    apiKey: "SOME_APIKEY_VALUE"
};
const mapquestLayerWithoutApikey = {
    type: 'mapquest'
};
const wmsLayer = {
    type: 'wms'
};
const noVendorWmsLayer = {
    type: 'wms',
    serverType: 'no-vendor'
};
const groupsExample = [{
    "id": "first",
    "title": "first",
    "name": "first",
    "nodes": [
        {
            "id": "first.second",
            "title": "second",
            "name": "second",
            "nodes": [
                {
                    "id": "first.second.third",
                    "title": "third",
                    "name": "third",
                    "nodes": [
                        {
                            "id": "topp:states__6",
                            "format": "image/png8",
                            "search": {
                                "url": "https://demo.geo-solutions.it:443/geoserver/wfs",
                                "type": "wfs"
                            },
                            "name": "topp:states",
                            "opacity": 1,
                            "description": "This is some census data on the states.",
                            "title": "USA Population",
                            "type": "wms",
                            "url": "https://demo.geo-solutions.it:443/geoserver/wms",
                            "bbox": {
                                "crs": "EPSG:4326",
                                "bounds": {
                                    "minx": -124.73142200000001,
                                    "miny": 24.955967,
                                    "maxx": -66.969849,
                                    "maxy": 49.371735
                                }
                            },
                            "visibility": true,
                            "singleTile": false,
                            "allowedSRS": {},
                            "dimensions": [],
                            "hideLoading": false,
                            "handleClickOnLayer": false,
                            "catalogURL": "https://demo.geo-solutions.it/geoserver/csw?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=topp:states",
                            "useForElevation": false,
                            "hidden": false,
                            "params": {
                                "layers": "topp:states"
                            },
                            "loading": false,
                            "loadingError": false,
                            "group": "first.second.third",
                            "expanded": false
                        }
                    ],
                    "expanded": true,
                    "visibility": true
                }
            ],
            "expanded": true,
            "visibility": true
        }
    ],
    "expanded": true,
    "visibility": true
}];
describe('LayersUtils', () => {
    it('test normalizeLayer for vector layers', () => {
        const feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[0, 39], [28, 48]]
            },
            "fileName": "file.zip",
            "id": "feature-id"
        };
        const feature2 = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[0, 39], [28, 48]]
            },
            "fileName": "file.zip"
        };
        let layer = LayersUtils.normalizeLayer({
            type: "vector",
            features: [feature]
        });
        expect(layer.features[0].id).toEqual("feature-id");
        layer = LayersUtils.normalizeLayer({
            type: "vector",
            features: [feature2]
        });
        expect(layer.features[0].id.length).toEqual(36);
    });
    it('test createFeatureId', () => {
        let feature = LayersUtils.createFeatureId({});
        expect(feature.id.length).toEqual(uuidv1().length);
        feature = LayersUtils.createFeatureId({id: "test"});
        expect(feature.id).toEqual("test");
        feature = LayersUtils.createFeatureId({properties: {id: "test"}});
        expect(feature.id).toEqual("test");
    });
    it('getLayerUrl supports single and multiple url layers', () => {
        expect(['a', 'b']).toContain(LayersUtils.getLayerUrl({url: ['a', 'b']}));
        expect(LayersUtils.getLayerUrl({
            url: 'a'
        })).toBe('a');
    });
    it('splits layers and groups one group', () => {
        const state = LayersUtils.splitMapAndLayers({
            layers: [{
                name: "layer1",
                group: "group1"
            }, {
                name: "layer2",
                group: "group1"
            }]
        });
        expect(state.layers).toExist();
        expect(state.layers.flat).toExist();
        expect(state.layers.flat.length).toBe(2);
        expect(state.layers.groups.length).toBe(1);
    });

    it('splits layers and groups more groups', () => {
        const state = LayersUtils.splitMapAndLayers({
            layers: [{
                name: "layer1",
                group: "group1"
            }, {
                name: "layer2",
                group: "group2"
            }]
        });
        expect(state.layers).toExist();
        expect(state.layers.flat).toExist();
        expect(state.layers.flat.length).toBe(2);
        expect(state.layers.groups.length).toBe(2);
    });

    it('splits layers and groups groups additional data (expanded and title)', () => {
        const groups = [
            {id: 'custom.nested001', expanded: true},
            {id: 'custom.nested001.nested002', expanded: false},
            {id: 'Default', expanded: false},
            {id: 'custom', expanded: true, title: {'default': 'Default', 'en-US': 'new'}},
            {id: 'test', expanded: true, title: "Test-group", description: "description", tooltipOptions: "both", tooltipPlacement: 'right'}
        ];
        const layers = [
            {id: 'layer001', group: 'Default'},
            {id: 'layer002', group: 'Default'},
            {id: 'layer003', group: 'custom.nested001'},
            {id: 'layer004', group: 'custom.nested001.nested002'},
            {id: 'layer005', group: 'test'}
        ];

        const state = LayersUtils.splitMapAndLayers({groups, layers});

        expect(state.layers.groups).toEqual([
            {
                expanded: true,
                id: 'test',
                name: 'test',
                title: 'Test-group',
                description: 'description',
                tooltipOptions: 'both',
                tooltipPlacement: 'right',
                nodes: ['layer005'],
                visibility: undefined,
                nodesMutuallyExclusive: undefined
            },
            {
                expanded: true,
                id: 'custom',
                name: 'custom',
                title: {'default': 'Default', 'en-US': 'new'},
                description: undefined,
                tooltipOptions: undefined,
                tooltipPlacement: undefined,
                nodes: [
                    {
                        expanded: true,
                        id: 'custom.nested001',
                        name: 'nested001',
                        title: 'nested001',
                        nodes: [
                            {
                                expanded: false,
                                id: 'custom.nested001.nested002',
                                name: 'nested002',
                                title: 'nested002',
                                nodes: ['layer004'],
                                visibility: undefined,
                                nodesMutuallyExclusive: undefined
                            },
                            'layer003'
                        ],
                        visibility: undefined,
                        nodesMutuallyExclusive: undefined
                    }
                ],
                visibility: undefined,
                nodesMutuallyExclusive: undefined
            },
            {
                expanded: false,
                id: 'Default',
                name: 'Default',
                nodes: ['layer002', 'layer001'],
                title: 'Default',
                visibility: undefined,
                nodesMutuallyExclusive: undefined
            }
        ]);
    });

    it('deep change in nested group', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.deepChange(nestedGroups, 'custom.nested001.nested002', 'value', 'changed');

        expect(newGroups).toExist();
        expect(newGroups).toEqual([
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'changed'}]}]}
        ]);

        const newGroupsWrongId = LayersUtils.deepChange(nestedGroups, 'nested005', 'value', 'changed');
        expect(newGroupsWrongId).toExist();
        expect(newGroupsWrongId).toEqual([
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ]);
    });

    it('deep change of a subgroup in nested group with object ', () => {
        const groups = [
            {
                "id": "1",
                "title": "1",
                "name": "1",
                "nodes": [
                    {
                        "id": "1.3",
                        "title": "3",
                        "name": "3",
                        "nodes": [
                            {
                                "id": "1.3.4",
                                "title": "4",
                                "name": "4",
                                "nodes": [
                                    "topp:states__6"
                                ],
                                "expanded": true
                            }
                        ],
                        "expanded": true,
                        "description": "old desc",
                        "tooltipOptions": "both",
                        "tooltipPlacement": "right"
                    }
                ],
                "expanded": true
            }
        ];
        const newGroups = LayersUtils.deepChange(groups, '1.3', {description: "new desc"});
        expect(newGroups).toExist();
        expect(newGroups[0].nodes[0].description).toBe("new desc");
        expect(newGroups[0].nodes[0].tooltipOptions).toBe("both");
        expect(newGroups[0].nodes[0].tooltipPlacement).toBe("right");
    });

    it('get groups node id in nested group', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.getGroupNodes({nodes: nestedGroups});

        expect(newGroups).toExist();
        expect(newGroups).toEqual(['layer001', 'layer002', 'default', 'layer003', 'layer004', 'custom.nested001.nested002', 'custom.nested001', 'custom']);

    });

    it('get node', () => {

        const nestedGroups = [
            {id: 'default', nodes: ['layer001', 'layer002']},
            {id: 'custom', nodes: [{id: 'custom.nested001', nodes: ['layer003', {id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'}]}]}
        ];
        const newGroups = LayersUtils.getNode(nestedGroups, 'custom.nested001.nested002');

        expect(newGroups).toExist();
        expect(newGroups).toEqual({id: 'custom.nested001.nested002', nodes: ['layer004'], value: 'now'});

        const newGroupsNull = LayersUtils.getNode(nestedGroups, 'nested010');
        expect(newGroupsNull).toNotExist();
    });
    it('extract data from sources no state', () => {
        expect( LayersUtils.extractDataFromSources()).toBe(null);
        expect( LayersUtils.extractDataFromSources({})).toBe(null);
    });
    it('extract TileMatrixSet from layers without sources and grouped layers', () => {
        expect(extractTileMatrixSetFromLayers()).toEqual({});
    });

    it('extract TileMatrixSet from layers without sources and empty grouped layers', () => {
        expect(extractTileMatrixSetFromLayers({})).toEqual({});
    });

    it('extract TileMatrixSet from layers with sources and empty grouped layers', () => {
        expect(extractTileMatrixSetFromLayers(null, { data: 'data' })).toEqual({ data: 'data' });
    });

    it('extract TileMatrixSet from layers without sources', () => {

        const groupedLayersByUrl = {
            'http:url001': [
                {
                    id: "layer001",
                    matrixIds: {
                        'EPSG:4326': [{
                            identifier: 'EPSG:4326:0'
                        }]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                },
                {
                    id: "layer003",
                    matrixIds: {
                        'custom': [{
                            identifier: 'custom'
                        }]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                }
            ],
            'http:url002': [
                {
                    id: "layer002",
                    matrixIds: {
                        'custom': [
                            {
                                identifier: 'custom:0',
                                ranges: {
                                    cols: {
                                        min: 0,
                                        max: 1
                                    },
                                    rows: {
                                        min: 0,
                                        max: 1
                                    }
                                }
                            }
                        ]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                }
            ]
        };

        const newSources = extractTileMatrixSetFromLayers(groupedLayersByUrl);

        expect(newSources).toEqual({
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            },
            'http:url002': {
                tileMatrixSet: {
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        });

    });

    it('extract TileMatrixSet from layers with sources', () => {

        const groupedLayersByUrl = {
            'http:url001': [
                {
                    id: "layer001",
                    matrixIds: {
                        'EPSG:4326': [{
                            identifier: 'EPSG:4326:0'
                        }]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                },
                {
                    id: "layer003",
                    matrixIds: {
                        'custom': [{
                            identifier: 'custom'
                        }]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                }
            ],
            'http:url002': [
                {
                    id: "layer002",
                    matrixIds: {
                        'custom': [
                            {
                                identifier: 'custom:0',
                                ranges: {
                                    cols: {
                                        min: 0,
                                        max: 1
                                    },
                                    rows: {
                                        min: 0,
                                        max: 1
                                    }
                                }
                            }
                        ]
                    },
                    tileMatrixSet: [{
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    }, {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }]
                }
            ]
        };

        const sources = {
            'http:url003': {
                data: 'data'
            },
            'http:url002': {
                tileMatrixSet: {
                    'fromsources': {
                        TileMatrix: [{
                            'ows:Identifier': 'fromsources:0'
                        }],
                        'ows:Identifier': "fromsources",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const newSources = extractTileMatrixSetFromLayers(groupedLayersByUrl, sources);

        expect(newSources).toEqual({
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            },
            'http:url002': {
                tileMatrixSet: {
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    },
                    'fromsources': {
                        TileMatrix: [{
                            'ows:Identifier': 'fromsources:0'
                        }],
                        'ows:Identifier': "fromsources",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            },
            'http:url003': {
                data: 'data'
            }
        });

    });

    it('extract TileMatrixSet from layers with availableTileMatrixSets property', () => {

        const groupedLayersByUrl = {
            'http:url001': [
                {
                    id: "layer001",
                    availableTileMatrixSets: {
                        'EPSG:4326': {
                            crs: 'EPSG:4326',
                            tileMatrixSet: {
                                TileMatrix: [{
                                    'ows:Identifier': 'EPSG:4326:0'
                                }],
                                'ows:Identifier': "EPSG:4326",
                                'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                            }
                        },
                        'custom': {
                            crs: 'EPSG::900913',
                            tileMatrixSet: {
                                TileMatrix: [{
                                    'ows:Identifier': 'custom:0'
                                }],
                                'ows:Identifier': "custom",
                                'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                            }
                        }
                    }
                }
            ]
        };

        const newSources = extractTileMatrixSetFromLayers(groupedLayersByUrl);

        expect(newSources).toEqual({
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        });

    });
    it('extract data from sources no sources object', () => {

        const mapState = {
            layers: [{
                id: 'layer:001',
                url: 'http:url001'
            }]
        };

        const layers = LayersUtils.extractDataFromSources(mapState);
        expect(layers).toEqual([
            {
                id: 'layer:001',
                url: 'http:url001'
            }
        ]);
    });

    it('extract data from sources', () => {
        const sources = {
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const mapState = {
            mapInitialConfig: {
                sources
            },
            layers: [{
                id: 'layer:001',
                url: 'http:url001',
                tileMatrixSet: true,
                matrixIds: ['EPSG:4326', 'custom']
            }]
        };

        const layers = LayersUtils.extractDataFromSources(mapState);
        expect(layers).toEqual([
            {
                id: 'layer:001',
                url: 'http:url001',
                tileMatrixSet: true,
                matrixIds: [ 'EPSG:4326', 'custom' ],
                availableTileMatrixSets: {
                    'EPSG:4326': {
                        crs: 'EPSG:4326',
                        tileMatrixSet: {
                            TileMatrix: [{
                                'ows:Identifier': 'EPSG:4326:0'
                            }],
                            'ows:Identifier': "EPSG:4326",
                            'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                        }
                    },
                    'custom': {
                        crs: 'EPSG:900913',
                        tileMatrixSet: {
                            TileMatrix: [{
                                'ows:Identifier': 'custom:0'
                            }],
                            'ows:Identifier': "custom",
                            'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                        }
                    }
                }
            }
        ]);
    });

    it('extract matrix from sources no arguments', () => {
        expect( LayersUtils.extractTileMatrixFromSources()).toEqual({});
        expect( LayersUtils.extractTileMatrixFromSources(null, {})).toEqual({});
        expect( LayersUtils.extractTileMatrixFromSources({}, null)).toEqual({});
        expect( LayersUtils.extractTileMatrixFromSources({}, {})).toEqual({});
    });

    it('extract availableTileMatrixSets from sources', () => {
        const sources = {
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const layer = {
            id: 'layer:001',
            url: 'http:url001',
            tileMatrixSet: true,
            matrixIds: ['EPSG:4326', 'custom']
        };

        const { availableTileMatrixSets } = LayersUtils.extractTileMatrixFromSources(sources, layer);

        expect(availableTileMatrixSets).toEqual({
            'EPSG:4326': {
                crs: 'EPSG:4326',
                tileMatrixSet: {
                    TileMatrix: [
                        {
                            'ows:Identifier': 'EPSG:4326:0'
                        }
                    ],
                    'ows:Identifier': "EPSG:4326",
                    'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                }
            },
            'custom': {
                crs: 'EPSG:900913',
                tileMatrixSet: {
                    TileMatrix: [
                        {
                            'ows:Identifier': 'custom:0'
                        }
                    ],
                    'ows:Identifier': "custom",
                    'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                }
            }
        });
    });

    it('extract availableTileMatrixSets from sources with object matrixIds', () => {
        const sources = {
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const layer = {
            id: 'layer:001',
            url: 'http:url001',
            tileMatrixSet: true,
            matrixIds: {'EPSG:4326': [], 'custom': []}
        };

        const { availableTileMatrixSets } = LayersUtils.extractTileMatrixFromSources(sources, layer);

        expect(availableTileMatrixSets).toEqual({
            'EPSG:4326': {
                crs: 'EPSG:4326',
                tileMatrixSet: {
                    TileMatrix: [
                        {
                            'ows:Identifier': 'EPSG:4326:0'
                        }
                    ],
                    'ows:Identifier': "EPSG:4326",
                    'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                }
            },
            'custom': {
                crs: 'EPSG:900913',
                tileMatrixSet: {
                    TileMatrix: [
                        {
                            'ows:Identifier': 'custom:0'
                        }
                    ],
                    'ows:Identifier': "custom",
                    'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                }
            }
        });
    });

    it('extract matrix from sources no wmts layer', () => {
        const sources = {
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const layer = {
            id: 'layer:001',
            url: 'http:url001'
        };

        expect(LayersUtils.extractTileMatrixFromSources(sources, layer)).toEqual({});
    });
    it('extract matrix from sources with availableTileMatrixSets property', () => {
        const sources = {
            'http:url001': {
                tileMatrixSet: {
                    'EPSG:4326': {
                        TileMatrix: [{
                            'ows:Identifier': 'EPSG:4326:0'
                        }],
                        'ows:Identifier': "EPSG:4326",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::4326"
                    },
                    'custom': {
                        TileMatrix: [{
                            'ows:Identifier': 'custom:0'
                        }],
                        'ows:Identifier': "custom",
                        'ows:SupportedCRS': "urn:ogc:def:crs:EPSG::900913"
                    }
                }
            }
        };

        const layer = {
            id: 'layer:001',
            url: 'http:url001',
            type: 'wmts',
            availableTileMatrixSets: {
                'EPSG:4326': {
                    crs: 'EPSG:4326',
                    tileMatrixSetLink: 'sources[\'http:url001\'].tileMatrixSet[\'EPSG:4326\']'
                }
            }
        };

        expect(LayersUtils.extractTileMatrixFromSources(sources, layer)).toEqual(
            {
                availableTileMatrixSets: {
                    'EPSG:4326': {
                        crs: 'EPSG:4326',
                        tileMatrixSetLink: 'sources[\'http:url001\'].tileMatrixSet[\'EPSG:4326\']',
                        tileMatrixSet: {
                            TileMatrix: [{
                                'ows:Identifier': 'EPSG:4326:0'
                            }],
                            'ows:Identifier': 'EPSG:4326',
                            'ows:SupportedCRS': 'urn:ogc:def:crs:EPSG::4326'
                        }
                    }
                }
            }
        );
    });
    describe('isSupportedLayer', () => {
        it('type: ' + typeV1 + '  maptype: leaflet, supported', () => {
            const res = LayersUtils.isSupportedLayer(emptyBackground, "leaflet");
            expect(res).toBeTruthy();
        });
        it('type: ' + typeV1 + '  maptype: openlayers, supported', () => {
            const res = LayersUtils.isSupportedLayer(emptyBackground, "openlayers");
            expect(res).toBeTruthy();
        });
        it('type: ' + typeV1 + '  maptype: cesium, supported', () => {
            const res = LayersUtils.isSupportedLayer(emptyBackground, "cesium");
            expect(res).toBeTruthy();
        });
        it('type: wms  maptype: leaflet, supported', () => {
            const maptype = "leaflet";
            const Layers = require('../' + maptype + '/Layers');
            Layers.registerType('wms', {});
            const res = LayersUtils.isSupportedLayer(wmsLayer, maptype);
            expect(res).toBeTruthy();
        });
        it('type: wms  maptype: leaflet, not supported because invalid', () => {
            const maptype = "leaflet";
            const Layers = require('../' + maptype + '/Layers');
            Layers.registerType('wms', {});
            const res = LayersUtils.isSupportedLayer(Object.assign({}, wmsLayer, {invalid: true}), maptype);
            expect(res).toBeFalsy();
        });
        it('type: mapquest  maptype: openlayers, with apikey supported', () => {
            const maptype = "openlayers";
            const Layers = require('../' + maptype + '/Layers');
            Layers.registerType('mapquest', {});
            const res = LayersUtils.isSupportedLayer(mapquestLayerWithApikey, maptype);
            expect(res).toBeTruthy();
        });
        it('type: mapquest  maptype: openlayers, without apikey not supported', () => {
            const maptype = "openlayers";
            const Layers = require('../' + maptype + '/Layers');
            Layers.registerType('mapquest', {});
            const res = LayersUtils.isSupportedLayer(mapquestLayerWithoutApikey, maptype);
            expect(res).toBeFalsy();
        });
    });

    it('findGeoServerName with a positive match and using default regex', () => {
        const matchedGeoServerName = LayersUtils.findGeoServerName({url: "http:/hostname/geoservering/ows"});
        expect(matchedGeoServerName).toBe("/geoservering/");
    });
    it('findGeoServerName with a positive match and using a custom regex', () => {
        const matchedGeoServerName = LayersUtils.findGeoServerName({url: "http:/hostname/geoserver/ows", regex: /\/geoserver\//});
        expect(matchedGeoServerName).toBe("/geoserver/");
    });
    it('findGeoServerName with no match, with custom and default regex', () => {
        const matchedGeoServerName = LayersUtils.findGeoServerName({url: "http:/hostname/geosssearavering/ows"});
        expect(matchedGeoServerName).toBe(null);
        const matchedGeoServerNameCustomReg = LayersUtils.findGeoServerName({url: "http:/hostname/geosssearavering/ows", regex: /\/geoserver\//});
        expect(matchedGeoServerNameCustomReg).toBe(null);
    });
    it('test findGeoServerName with array url', () => {
        const matched = LayersUtils
            .findGeoServerName({url: ['https://1maps.geo-solutions.it/geoserver/wms'], regexRule: /\/[\w- ]*geoserver[\w- ]*\//});
        expect(matched).toExist();
    });

    it('test findGeoServerName with string url', () => {
        const matched = LayersUtils
            .findGeoServerName({url: 'https://1maps.geo-solutions.it/geoserver/wms', regexRule: /\/[\w- ]*geoserver[\w- ]*\//});
        expect(matched).toExist();
    });

    it('test getCapabilitiesUrl', () => {
        const capabilities = LayersUtils
            .getCapabilitiesUrl({url: ['https://1maps.geo-solutions.it/geoserver/wms'], name: 'states'});
        expect(capabilities).toExist();
    });
    it('getAuthenticationParam', () => {
        expect(LayersUtils.getAuthenticationParam({
            url: ['http://url/'],
            securityToken: '########-####-####-####-###########'
        })).toEqual({});

        expect(LayersUtils.getAuthenticationParam({
            url: 'http://url/'
        })).toEqual({});
    });
    it('getURLs', () => {
        expect(LayersUtils.getURLs(['http://url/?delete=param'])).toEqual(['http://url/']);
        expect(LayersUtils.getURLs(['http://url/?delete=param'], '?custom=param')).toEqual(['http://url/?custom=param']);
    });
    it('excludeGoogleBackground', () => {
        const GOOGLE_BG = {
            type: 'google',
            group: 'background',
            visibility: true
        };

        const LAYERS_1 = [GOOGLE_BG, wmsLayer];
        const LAYERS_2 = [GOOGLE_BG, wmsLayer];
        const LAYERS_3 = [GOOGLE_BG, {group: 'background'}, wmsLayer];
        const LAYERS_4 = [{visibility: false, ...GOOGLE_BG}, { group: 'background', visibility: true }, wmsLayer];

        // check adds a osm as default background
        const RES_1 = LayersUtils.excludeGoogleBackground(LAYERS_1);
        expect(RES_1.length).toBe(2);
        expect(RES_1[0].type).toBe('osm');
        expect(RES_1[0].visibility).toBe(true);

        // check adds anyway osm as default background
        const RES_2 = LayersUtils.excludeGoogleBackground(LAYERS_2);
        expect(RES_2.length).toBe(2);
        expect(RES_2[0].type).toBe('osm');
        expect(RES_2[0].visibility).toBe(true);

        // check select as visible the first background available
        const RES_3 = LayersUtils.excludeGoogleBackground(LAYERS_3);
        expect(RES_3.length).toBe(2);
        expect(RES_3[0].visibility).toBe(true);

        // check select as visible the first background available
        const RES_4 = LayersUtils.excludeGoogleBackground(LAYERS_4);
        expect(RES_4.length).toBe(2);
        expect(RES_4[0].visibility).toBe(true);

    });
    it('creditsToAttribution', () => {
        const TESTS = [
            [{ title: "test"}, 'test'], // text only
            [{ imageUrl: "image.png" }, '<img src="image.png" >'], // image and text
            [{ title: "test", imageUrl: "image.png" }, '<img src="image.png" title="test">'], // image and text
            [{ title: "test", link: "http://url.com" }, '<a href="http://url.com" target="_blank">test</a>'], // text with link
            [{ title: "test", link: "http://url.com", imageUrl: "image.png" }, '<a href="http://url.com" target="_blank"><img src="image.png" title="test"></a>'], // text, image, link
            [[], "credits"], // no data returns undefined
            [[{}], "credits"], // empty object returns undefined
            [{ link: "http://url.com" }, '<a href="http://url.com" target="_blank">credits</a>'] // only link returns undefined
        ];
        TESTS.map(([credits, expectedResult]) => expect(LayersUtils.creditsToAttribution(credits)).toBe(expectedResult));
    });
    it('geoJSONToLayer with a Feature with id', () => {
        const feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[0, 39], [28, 48]]
            },
            "fileName": "file.zip",
            "id": "feature-id"
        };
        const layer = LayersUtils.geoJSONToLayer(feature, "layer-id");
        expect(layer.type).toEqual("vector");
        expect(layer.visibility).toEqual(true);
        expect(layer.group).toBe(undefined);
        expect(layer.name).toEqual("file.zip");
        expect(layer.hideLoading).toEqual(true);
        expect(layer.bbox).toEqual({
            "bounds": {
                "minx": 0,
                "miny": 39,
                "maxx": 28,
                "maxy": 48
            },
            "crs": "EPSG:4326"
        });
        expect(layer.features).toEqual([{
            "geometry": {
                "type": "LineString",
                "coordinates": [[ 0, 39 ], [ 28, 48 ] ]
            },
            "id": "feature-id",
            "type": "Feature"
        }]);
    });
    it('geoJSONToLayer with a Feature without id', () => {
        const feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[0, 39], [28, 48]]
            },
            "fileName": "file.zip"
        };
        const layer = LayersUtils.geoJSONToLayer(feature, "layer-id");
        expect(layer.type).toEqual("vector");
        expect(layer.visibility).toEqual(true);
        expect(layer.group).toBe(undefined);
        expect(layer.name).toEqual("file.zip");
        expect(layer.hideLoading).toEqual(true);
        expect(layer.bbox).toEqual({
            "bounds": {
                "minx": 0,
                "miny": 39,
                "maxx": 28,
                "maxy": 48
            },
            "crs": "EPSG:4326"
        });

        expect(Object.keys(layer.features[0]).length).toEqual(3);
        expect(Object.keys(layer.features[0])).toEqual(["geometry", "type", "id"]);
        expect(layer.features[0].geometry).toEqual({
            "type": "LineString",
            "coordinates": [[ 0, 39 ], [ 28, 48 ] ]
        });
        expect(layer.features[0].type).toEqual("Feature");
        expect(layer.features[0].id.length).toEqual("1e63efb0-6b37-11e9-8359-eb9aa043350b".length);
    });
    it('geoJSONToLayer with a FeatureCollection', () => {
        const feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[0, 39], [28, 48]]
            },
            "id": "feature-id"
        };
        const ftColl = {
            type: "FeatureCollection",
            features: [feature],
            fileName: "ft-coll-zip"
        };
        const layer = LayersUtils.geoJSONToLayer(ftColl, "layer-id");
        expect(layer.type).toEqual("vector");
        expect(layer.visibility).toEqual(true);
        expect(layer.group).toBe(undefined);
        expect(layer.name).toEqual("ft-coll-zip");
        expect(layer.hideLoading).toEqual(true);
        expect(layer.bbox).toEqual({
            "bounds": {
                "minx": 0,
                "miny": 39,
                "maxx": 28,
                "maxy": 48
            },
            "crs": "EPSG:4326"
        });
        expect(layer.features).toEqual([{
            "geometry": {
                "type": "LineString",
                "coordinates": [[ 0, 39 ], [ 28, 48 ] ]
            },
            "id": "feature-id",
            "type": "Feature"
        }]);
    });
    it('saveLayer', () => {
        const layers = [
            // no params if not present
            [
                {
                    name: "test",
                    title: "test",
                    type: "wms"
                },
                l => {
                    expect(l.params).toNotExist();
                    const keys = Object.keys(l);
                    expect(keys).toContain('id');
                    expect(keys).toNotContain('params');
                    expect(keys).toNotContain('credits');
                }
            ],
            // save params if present
            [
                {
                    params: {
                        viewParams: "a:b"
                    }
                },
                l => {
                    expect(l.params).toExist();
                    expect(l.params.viewParams).toExist();
                }
            ],
            // save credits if present
            [
                {
                    credits: {
                        title: "test"
                    }
                },
                l => {
                    expect(l.credits).toExist();
                }
            ],
            // save tooltipOptions and tooltipPlacement if present
            [
                {
                    tooltipOptions: "both",
                    tooltipPlacement: "right"
                },
                l => {
                    expect(l.tooltipOptions).toExist();
                    expect(l.tooltipPlacement).toExist();
                }
            ],
            [
                {
                    options: {
                        attribution: "right"
                    }
                },
                l => {
                    expect(l.options).toExist();
                    expect(l.options.attribution).toExist();
                }
            ],
            // save heightOffset for 3dtiles
            [
                {
                    heightOffset: 10
                },
                l => {
                    expect(l.heightOffset).toBe(10);
                }
            ],
            // save forceProxy if present
            [
                {
                    forceProxy: true
                },
                l => {
                    expect(l.forceProxy).toBeTruthy();
                }
            ],
            // save forceProxy if present
            [
                {
                    security: {}
                },
                l => {
                    expect(l.security).toEqual({});
                }
            ],
            // save fields
            [
                {
                    fields: [
                        {
                            name: "test",
                            alias: "test"
                        }
                    ]
                },
                l => {
                    expect(l.fields).toExist();
                    expect(l.fields.length).toBe(1);
                    expect(l.fields[0].name).toBe("test");
                    expect(l.fields[0].alias).toBe("test");
                }
            ],
            // save tileGrids and tileGridStrategy
            [
                {
                    tileGridStrategy: 'custom',
                    tileGrids: [
                        {
                            id: 'EPSG:32122',
                            crs: 'EPSG:32122',
                            scales: [ 2557541.55271451, 1278770.776357255, 639385.3881786275 ],
                            origins: [ [ 403035.4105968763, 414783 ], [ 403035.4105968763, 414783 ], [ 403035.4105968763, 323121 ] ],
                            tileSize: [ 512, 512 ]
                        },
                        {
                            id: 'EPSG:900913',
                            crs: 'EPSG:900913',
                            scales: [ 559082263.9508929, 279541131.97544646, 139770565.98772323 ],
                            origin: [ -20037508.34, 20037508 ],
                            tileSize: [ 256, 256 ]
                        }
                    ],
                    tileGridCacheSupport: {
                        formats: ['image/png']
                    }
                },
                l => {
                    expect(l.tileGridStrategy).toBe('custom');
                    expect(l.tileGrids.length).toBe(2);
                    expect(l.tileGridCacheSupport).toEqual({
                        formats: ['image/png']
                    });
                }
            ],
            // save read only attribute
            [
                {
                    disableFeaturesEditing: true
                },
                l => {
                    expect(l.disableFeaturesEditing).toBeTruthy();
                }
            ],
            [
                {
                    pointCloudShading: {
                        attenuation: true,
                        maximumAttenuation: 4,
                        eyeDomeLighting: true,
                        eyeDomeLightingStrength: 1,
                        eyeDomeLightingRadius: 1
                    }
                },
                l => {
                    expect(l.pointCloudShading).toBeTruthy();
                }
            ],
            // Save sourceMetadata
            [
                {
                    sourceMetadata: {
                        crs: "EPSG:3946"
                    }
                },
                l => {
                    expect(l.sourceMetadata).toBeTruthy();
                }
            ],
            // Save terrain cesium layer
            [
                {
                    name: "terrain layer1",
                    title: "terrain layer1",
                    provider: "cesium",
                    url: "http://localhost/terrainlayer",
                    type: "terrain",
                    group: "background"
                },
                l => {
                    expect(l.provider).toEqual("cesium");
                    expect(l.url).toEqual("http://localhost/terrainlayer");
                    expect(l.type).toEqual("terrain");
                }
            ],
            // Save terrain cesium-ion layer
            [
                {
                    name: "terrain layer2",
                    title: "terrain layer2",
                    provider: "cesium-ion",
                    options: {
                        assetId: "123456789",
                        accessToken: "asd1233asd",
                        server: "server"
                    },
                    type: "terrain",
                    group: "background"
                },
                l => {
                    expect(l.provider).toEqual("cesium-ion");
                    expect(l.options.assetId).toEqual("123456789");
                    expect(l.options.accessToken).toEqual("asd1233asd");
                    expect(l.options.server).toEqual("server");
                    expect(l.type).toEqual("terrain");
                }
            ],
            // Save terrain wms layer
            [
                {
                    name: "terrain layer3",
                    title: "terrain layer3",
                    provider: "wms",
                    url: "http://localhost/terrainlayer",
                    options: {
                        version: "1.0.3",
                        crs: "EPSG:4326"
                    },
                    type: "terrain",
                    group: "background"
                },
                l => {
                    expect(l.provider).toEqual("wms");
                    expect(l.url).toEqual("http://localhost/terrainlayer");
                    expect(l.options.crs).toEqual("EPSG:4326");
                    expect(l.options.version).toEqual("1.0.3");
                    expect(l.type).toEqual("terrain");
                }
            ],
            // Save enableInteractiveLegend if present
            [
                {
                    enableInteractiveLegend: true
                },
                l => {
                    expect(l.enableInteractiveLegend).toBeTruthy();
                }
            ],
            // do not save enableInteractiveLegend if not present
            [
                {
                    name: "test",
                    title: "test",
                    type: "wms"
                },
                l => {
                    expect(l.enableInteractiveLegend).toBeFalsy();
                }
            ],
            // save enableDynamicLegend if present
            [
                {
                    enableDynamicLegend: true
                },
                l => {
                    expect(l.enableDynamicLegend).toBeTruthy();
                }
            ],
            // do not save enableDynamicLegend if not present
            [
                {
                    name: "test",
                    title: "test",
                    type: "wms"
                },
                l => {
                    expect(l.enableDynamicLegend).toBeFalsy();
                }
            ]
        ];
        layers.map(([layer, test]) => test(LayersUtils.saveLayer(layer)) );
    });

    it('findGeoServerName with a positive match and using custom regex (setRegGeoserverRule)', () => {
        const customRegex = /\/[\w- ]*gs[\w- ]*\//;
        LayersUtils.setRegGeoserverRule(customRegex);

        const matchedGeoServerName = LayersUtils.findGeoServerName({url: "http:/hostname/gs/ows"});
        expect(matchedGeoServerName).toBe("/gs/");

        // reset regex
        LayersUtils.setRegGeoserverRule(LayersUtils.REG_GEOSERVER_RULE);
    });

    it('getRegGeoserverRule test default value', () => {
        expect(LayersUtils.getRegGeoserverRule()).toBe(LayersUtils.REG_GEOSERVER_RULE);
    });

    it('test getCapabilitiesUrl with custom params in in layer options', () => {

        const EXPECTED_CAPABILITIES_URL = 'localhost:8080/geoserver/woekspace/layer/wms?token=value';

        const layer = {
            url: 'localhost:8080/geoserver/wms',
            name: 'woekspace:layer',
            params: {
                token: 'value'
            }
        };

        expect(LayersUtils.getCapabilitiesUrl(layer)).toEqual(EXPECTED_CAPABILITIES_URL);

    });

    it('test getNestedGroupTitle', () => {

        const groups = [
            {id: 'default', title: 'Default', nodes: [{id: 'layer001', title: 'titleLayer001'}, {id: 'layer002', title: 'titleLayer002'}]}
        ];
        const id = 'layer001';
        const groupTitle = LayersUtils.getNestedGroupTitle(id, groups);

        expect(groupTitle).toExist();
        expect(groupTitle).toEqual('titleLayer001');

    });

    it('test isInsideResolutionsLimits', () => {
        expect(LayersUtils.isInsideResolutionsLimits({
            maxResolution: 1000,
            minResolution: 100
        })).toBe(true);
        expect(LayersUtils.isInsideResolutionsLimits({
            maxResolution: 1000,
            minResolution: 100
        }, 500)).toBe(true);
        expect(LayersUtils.isInsideResolutionsLimits({
            maxResolution: 1000,
            minResolution: 100,
            disableResolutionLimits: true
        }, 2000)).toBe(true);
        expect(LayersUtils.isInsideResolutionsLimits({
            maxResolution: 1000,
            minResolution: 100
        }, 99)).toBe(false);
        expect(LayersUtils.isInsideResolutionsLimits({
            maxResolution: 1000,
            minResolution: 100
        }, 1000)).toBe(false);
    });
    describe('splitMapAndLayers', () => {
        const localizedGroupMap = {
            "map": {
                "center": {
                    "x": 17.360751857301523,
                    "y": 40.51921950782912,
                    "crs": "EPSG:4326"
                },
                "maxExtent": [
                    -20037508.34,
                    -20037508.34,
                    20037508.34,
                    20037508.34
                ],
                "projection": "EPSG:900913",
                "units": "m",
                "zoom": 6,
                "mapOptions": {},
                "backgrounds": [],
                "bookmark_search_config": {},
                "mapId": null,
                "size": null,
                "version": 2
            },
            "layers": [
                {
                    "id": "test:Linea_costa__5",
                    "format": "image/png",
                    "search": {
                        "url": "https://test/geoserver/wfs",
                        "type": "wfs"
                    },
                    "name": "test:Linea_costa",
                    "opacity": 1,
                    "description": "",
                    "title": {
                        "default": "Linea_costa",
                        "it-IT": "test",
                        "en-US": "test",
                        "fr-FR": "test",
                        "de-DE": "test",
                        "es-ES": "test"
                    },
                    "type": "wms",
                    "url": "https://test/geoserver/wms",


                    "useForElevation": false,
                    "hidden": false,
                    "params": {}
                }
            ],
            "groups": [
                {
                    "id": "Default",
                    "title": {
                        "default": "Default",
                        "it-IT": "test ",
                        "en-US": "test"
                    },
                    "expanded": true
                }
            ]
        };
        it('localized titles for default group', () => {
            const {map, layers} = splitMapAndLayers(localizedGroupMap);
            expect(map).toBeTruthy();
            expect(layers).toBeTruthy();
            expect(layers.groups[0].title).toEqual(localizedGroupMap.groups[0].title);
        });

        it('Display title of deep nested groups in an array', ()=>{
            const groups = [
                {id: 'default', title: 'Default', nodes: [{id: 'layer001', title: 'titleLayer001'}, {id: 'layer002', title: 'titleLayer002'}]}
            ];
            const id = 'layer001';
            const flattenedGroups = LayersUtils.flattenArrayOfObjects(groups);
            const groupTitle = LayersUtils.displayTitle(id, flattenedGroups);
            expect(groupTitle).toExist();
            expect(groupTitle).toEqual('titleLayer001');
        });
        it('Display title of deep nested groups not in an array', ()=>{
            const groups = {
                id: 'default',
                title: 'Default',
                nodes: [
                    {id: 'layer001', title: 'titleLayer001'},
                    {id: 'layer002', title: 'titleLayer002'}
                ]
            };
            const id = 'layer001';
            const flattenedGroups = LayersUtils.flattenArrayOfObjects(groups);
            const groupTitle = LayersUtils.displayTitle(id, flattenedGroups);
            expect(groupTitle).toExist();
            expect(groupTitle).toEqual('Default');
        });
        it('Get the length of a an object with nodes', ()=>{
            const groups = {
                id: 'default',
                title: 'Default',
                nodes: [
                    {id: 'layer001', title: 'titleLayer001'},
                    {id: 'layer002', title: 'titleLayer002'}
                ]
            };
            const flattenedGroups = LayersUtils.flattenArrayOfObjects(groups);
            expect(flattenedGroups.length).toBe(1);
        });
        it('Get the length of the nested array', ()=>{
            const groups = [{
                id: 'default',
                title: 'Default',
                nodes: [
                    {id: 'layer001', title: 'titleLayer001'},
                    {id: 'layer002', title: 'titleLayer002'}
                ]
            }, {
                id: 'default-1',
                title: 'Default-1',
                nodes: [
                    {id: 'layer003', title: 'titleLayer003'},
                    {id: 'layer004', title: 'titleLayer004'},
                    {id: 'layer005', title: 'titleLayer005'}
                ]
            }];
            const flattenedGroups = LayersUtils.flattenArrayOfObjects(groups);
            expect(flattenedGroups.length).toBe(7);
        });
    });
    it('removeWorkspace', ()=>{
        expect(LayersUtils.removeWorkspace('workspace:layerName')).toBe('layerName');
        expect(LayersUtils.removeWorkspace('layerName')).toBe('layerName');
    });
    it('getWMSVendorParams', () => {
        const params = LayersUtils.getWMSVendorParams(wmsLayer);
        expect(params.TILED).toBe(true);
        expect(LayersUtils.getWMSVendorParams(noVendorWmsLayer)).toEqual({});
    });
    it('test flattenGroups, wholeGroup true', () => {
        const allGroups = flattenGroups(groupsExample, 0, true);
        expect(allGroups.length).toBe(3);
        expect(allGroups[0].id).toBe("first");
        expect(allGroups[0].value).toBe(undefined);
        expect(allGroups[1].id).toBe("first.second");
        expect(allGroups[1].value).toBe(undefined);
        expect(allGroups[2].id).toBe("first.second.third");
        expect(allGroups[2].value).toBe(undefined);
    });
    it('test flattenGroups, wholeGroup false', () => {
        const allGroups = flattenGroups(groupsExample);
        expect(allGroups.length).toBe(3);
        expect(allGroups[0].id).toBe(undefined);
        expect(allGroups[0].value).toBe("first");
        expect(allGroups[0].label).toBe("first");
        expect(allGroups[1].id).toBe(undefined);
        expect(allGroups[1].value).toBe("first.second");
        expect(allGroups[1].label).toBe("second");
        expect(allGroups[2].id).toBe(undefined);
        expect(allGroups[2].value).toBe("first.second.third");
        expect(allGroups[2].label).toBe("third");
    });
    it('test flattenGroups, wholeGroup false with translation', () => {
        const title = {
            "default": "first",
            "en-US": 'first-en'
        };
        const _groups = [{...groupsExample[0], title}];
        const allGroups = flattenGroups(_groups);
        expect(allGroups.length).toBe(3);
        expect(allGroups[0].id).toBe(undefined);
        expect(allGroups[0].value).toBe("first");
        expect(allGroups[0].label).toBeTruthy();
        expect(allGroups[0].label.default).toBe(title.default);
        expect(allGroups[1].id).toBe(undefined);
        expect(allGroups[1].value).toBe("first.second");
        expect(allGroups[1].label).toBe("second");
        expect(allGroups[2].id).toBe(undefined);
        expect(allGroups[2].value).toBe("first.second.third");
        expect(allGroups[2].label).toBe("third");
    });
    it('test parsed title getTitle', () => {
        const title = "Default.Livello";
        expect(getTitle(title)).toBe("Default/Livello");
    });
    it('test localized title getTitle from object', () => {
        const title = {
            'default': 'Layer',
            'no-EX': 'Livello'
        };
        expect(getTitle(title)).toBe("Layer");
    });
    it('test localized title getTitle with locale', () => {
        const locale = 'it-IT';
        const title = {
            'default': 'Layer',
            [locale]: 'Livello'
        };
        expect(getTitle(title, locale)).toBe("Livello");
    });
    it('test isBackgroundCompatibleWithProjection with valid crs', () => {
        const background = {};
        const projection = "EPSG:4326";
        expect(isBackgroundCompatibleWithProjection(background, projection)).toEqual(true);
    });
    it('test isBackgroundCompatibleWithProjection with compatibleWmts', () => {
        const background = {type: "wmts", allowedSRS: ["EPSG:4326"]};
        const projection = "EPSG:4326";
        expect(isBackgroundCompatibleWithProjection(background, projection)).toEqual(true);
    });
});
