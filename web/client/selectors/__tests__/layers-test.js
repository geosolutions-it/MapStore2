/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    getLayerFromName, getLayerFromId, layersSelector, layerSelectorWithMarkers, groupsSelector, selectedNodesSelector, layerFilterSelector, layerSettingSelector,
    layerMetadataSelector, wfsDownloadSelector, backgroundControlsSelector,
    currentBackgroundSelector, tempBackgroundSelector, centerToMarkerSelector,
    getLayersWithDimension, elementSelector, queryableSelectedLayersSelector
} = require('../layers');

describe('Test layers selectors', () => {
    it('test getLayerFromName', () => {
        let layer = getLayerFromName({}, "ws:layer_1");
        expect(layer).toNotExist();
        layer = getLayerFromName({layers: {flat: [{name: "ws:layer_1"}]}}, "ws:layer_1");
        expect(layer).toExist();
        expect(layer).toEqual({name: "ws:layer_1"});
    });
    it('test getLayerFromId', () => {
        let layer = getLayerFromId({}, "layer_1");
        expect(layer).toNotExist();
        layer = getLayerFromId({layers: {flat: [{id: "layer_1"}]}}, "layer_1");
        expect(layer).toExist();
        expect(layer).toEqual({id: "layer_1"});
    });
    it('test layersSelector from config', () => {
        const props = layersSelector({config: {layers: [{type: "osm"}]}});

        expect(props.length).toBe(1);
        expect(props[0].type).toBe("osm");
    });

    it('test layersSelector from layers', () => {
        const props = layersSelector({layers: [{type: "osm"}]});

        expect(props.length).toBe(1);
        expect(props[0].type).toBe("osm");
    });

    it('test layersSelector from layers flat', () => {
        const props = layersSelector({layers: {flat: [{type: "osm"}]}});

        expect(props.length).toBe(1);
        expect(props[0].type).toBe("osm");
    });

    it('test layersSelector without layers', () => {
        const props = layersSelector({});
        expect(props).toExist();
        expect(props.length).toBe(0);
    });

    it('test layerSelectorWithMarkers with no markers', () => {
        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}});

        expect(props.length).toBe(1);
        expect(props[0].type).toBe("osm");
    });

    it('test layerSelectorWithMarkers with a marker', () => {
        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}, mapInfo: {
            showMarker: true,
            clickPoint: {
                latlng: {lat: 45, lng: 43}
            }
        }});
        // 1 for marker, 1 for highlight
        expect(props.length).toBe(3);
        expect(props[1].type).toBe("vector");
    });
    it('test layerSelectorWithMarkers with geocoder marker as lat lon', () => {
        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}, search: {
            markerPosition: {
                lat: 0,
                lng: 0
            }
        }});
        expect(props.length).toBe(2);
        expect(props[1].type).toBe("vector");
    });
    it('test layerSelectorWithMarkers with geocoder marker as Point', () => {
        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}, search: {
            markerPosition: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [0, 0]
                }
            }
        }});
        expect(props.length).toBe(2);
        expect(props[1].type).toBe("vector");
    });
    it('test layerSelectorWithMarkers with geocoder marker as Polygon', () => {
        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}, search: {
            markerPosition: {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                            [100.0, 1.0], [100.0, 0.0] ]
                    ]
                },
                "properties": {
                    "prop0": "value0"
                }
            }
        }});
        expect(props.length).toBe(2);
        expect(props[1].type).toBe("vector");
    });

    it('test layerSelectorWithMarkers with default style', () => {
        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}, search: {
            markerPosition: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [0, 0]
                }
            }
        }});
        expect(props.length).toBe(2);
        expect(props[1].type).toBe("vector");
        const {defaultIconStyle} = require('../../utils/SearchUtils');

        expect(props[1].style).toEqual(defaultIconStyle);
    });

    it('test layerSelectorWithMarkers with custom style', () => {
        const style = {
            color: '#ff0000'
        };

        const {defaultIconStyle} = require('../../utils/SearchUtils');

        const props = layerSelectorWithMarkers({config: {layers: [{type: "osm"}]}, search: {
            markerPosition: {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [0, 0]
                }
            },
            style
        }});
        expect(props.length).toBe(2);
        expect(props[1].type).toBe("vector");
        expect(props[1].style).toEqual({...defaultIconStyle, ...style});
    });


    it('test layerSelectorWithMarkers with override layers from additionallayers', () => {
        const state = {
            additionallayers: [
                {
                    id: 'layer_001',
                    owner: 'styleeditor',
                    actionType: 'override',
                    settings: {
                        name: 'workspace:layer_001',
                        properties: {
                            pop: 500000
                        }
                    },
                    options: {
                        style: 'generic'
                    }
                }
            ],
            layers: {
                flat: [
                    {
                        type: 'wms',
                        id: 'layer_001',
                        style: ''
                    }
                ]
            }
        };
        const props = layerSelectorWithMarkers(state);
        expect(props.length).toBe(1);
        expect(props[0]).toEqual({
            type: 'wms',
            id: 'layer_001',
            style: 'generic'
        });
    });
    it('test layerSelectorWithMarkers with overlay layers from additionallayers', () => {
        const state = {
            additionallayers: [
                {
                    id: 'layer_002',
                    owner: 'styleeditor',
                    actionType: 'overlay',
                    settings: {
                        name: 'workspace:layer_001',
                        properties: {
                            pop: 500000
                        }
                    },
                    options: {
                        type: "vector",
                        name: 'layer_002',
                        id: 'layer_002',
                        style: 'generic'
                    }
                }
            ],
            layers: {
                flat: [
                    {
                        type: 'wms',
                        id: 'layer_001',
                        style: ''
                    }
                ]
            }
        };
        const props = layerSelectorWithMarkers(state);
        expect(props.length).toBe(2);
        expect(props[0]).toEqual({
            type: 'wms',
            id: 'layer_001',
            style: ''
        });
        expect(props[1]).toEqual({
            type: "vector",
            name: 'layer_002',
            id: 'layer_002',
            style: 'generic'
        });
    });
    it('test groupsSelector from layers flat one group', () => {
        const props = groupsSelector({layers: {
            flat: [{type: "osm", id: "layer1", group: "group1"}, {type: "wms", id: "layer2", group: "group1"}],
            groups: [{name: "group1", nodes: ["layer1", "layer2"]}]
        }});

        expect(props.length).toBe(1);
        expect(props[0].nodes.length).toBe(2);
        expect(props[0].nodes[0]).toNotBeA('string');
    });

    it('test groupsSelector from layers flat more groups', () => {
        const props = groupsSelector({layers: {
            flat: [{type: "osm", id: "layer1", group: "group1"}, {type: "wms", id: "layer2", group: "group2"}],
            groups: [
                {name: "group1", nodes: ["layer1"]},
                {name: "group2", nodes: ["layer2"]}
            ]
        }});

        expect(props.length).toBe(2);
        expect(props[0].nodes.length).toBe(1);
        expect(props[1].nodes.length).toBe(1);
        expect(props[0].nodes[0]).toNotBeA('string');
        expect(props[1].nodes[0]).toNotBeA('string');
    });

    it('test selectedNodesSelector', () => {
        const props = selectedNodesSelector({layers: {selected: ['layer']}});
        expect(props.length).toBe(1);
        expect(props[0]).toBe('layer');
    });

    it('test selectedNodesSelector no state', () => {
        const props = selectedNodesSelector({});
        expect(props.length).toBe(0);
    });

    it('test layerFilterSelector', () => {
        const props = layerFilterSelector({layers: {filter: 'test'}});
        expect(props).toBe('test');
    });

    it('test layerFilterSelector no state', () => {
        const props = layerFilterSelector({});
        expect(props).toBe('');
    });

    it('test layerSettingSelector', () => {
        const props = layerSettingSelector({layers: {settings: {expanded: true}}});
        expect(props).toEqual({expanded: true});
    });

    it('test layerSettingSelector no state', () => {
        const props = layerSettingSelector({});
        expect(props).toEqual({expanded: false, options: {opacity: 1}});
    });

    it('test layerMetadataSelector', () => {
        const props = layerMetadataSelector({layers: {layerMetadata: {expanded: true}}});
        expect(props).toEqual({expanded: true});
    });

    it('test layerMetadataSelector no state', () => {
        const props = layerMetadataSelector({});
        expect(props).toEqual({expanded: false, metadataRecord: {}, maskLoading: false});
    });

    it('test wfsDownloadSelector', () => {
        const props = wfsDownloadSelector({ controls: { wfsdownload: { enabled: true } } });
        expect(props).toEqual({ expanded: true });
    });

    it('test wfsDownloadSelector no state', () => {
        const props = wfsDownloadSelector({});
        expect(props).toEqual({ expanded: false });
    });

    it('test backgroundControlsSelector', () => {
        const props = backgroundControlsSelector({
            controls: {
                backgroundSelector: {
                    start: 0
                }
            }
        });
        expect(props).toEqual({
            start: 0
        });
    });

    it('test backgroundControlsSelector no state', () => {
        const props = backgroundControlsSelector({
            controls: {
            }
        });
        expect(props).toEqual({});
    });

    it('test currentBackgroundSelector', () => {
        const props = currentBackgroundSelector({
            controls: {
                backgroundSelector: {
                    start: 0,
                    currentLayer: {
                        id: 'layer001'
                    }
                }
            }
        });
        expect(props).toEqual({
            id: 'layer001'
        });
    });

    it('test currentBackgroundSelector no state', () => {
        const props = currentBackgroundSelector({
            controls: {
                backgroundSelector: {
                    start: 0
                }
            }
        });
        expect(props).toEqual({});
    });

    it('test currentBackgroundSelector from layers', () => {
        const props = currentBackgroundSelector({
            controls: {
                backgroundSelector: {
                    start: 0
                }
            },
            layers: {
                flat: [{
                    group: 'background',
                    id: 'layer001',
                    visibility: true
                },
                {
                    group: 'background',
                    id: 'layer002',
                    visibility: true
                }]
            }
        });
        expect(props).toEqual({
            group: 'background',
            id: 'layer001',
            visibility: true
        });
    });

    it('test currentBackgroundSelector from layers no visible', () => {
        const props = currentBackgroundSelector({
            controls: {
                backgroundSelector: {
                    start: 0
                }
            },
            layers: {
                flat: [{
                    group: 'background',
                    id: 'layer001',
                    visibility: false
                }]
            }
        });
        expect(props).toEqual({});
    });

    it('test tempBackgroundSelector', () => {
        const props = tempBackgroundSelector({
            controls: {
                backgroundSelector: {
                    start: 0,
                    tempLayer: {
                        id: 'layer001'
                    }
                }
            }
        });
        expect(props).toEqual({
            id: 'layer001'
        });
    });

    it('test tempBackgroundSelector no state', () => {
        const props = tempBackgroundSelector({
            controls: {
                backgroundSelector: {
                    start: 0
                }
            }
        });
        expect(props).toEqual({});
    });

    it('test tempBackgroundSelector from layers', () => {
        const props = tempBackgroundSelector({
            controls: {
                backgroundSelector: {
                    start: 0
                }
            },
            layers: {
                flat: [{
                    group: 'background',
                    id: 'layer001',
                    visibility: true
                },
                {
                    group: 'background',
                    id: 'layer002',
                    visibility: true
                }]
            }
        });
        expect(props).toEqual({
            group: 'background',
            id: 'layer001',
            visibility: true
        });
    });

    it('test tempBackgroundSelector from layers no visible', () => {
        const props = tempBackgroundSelector({
            controls: {
                backgroundSelector: {
                    start: 0
                }
            },
            layers: {
                flat: [{
                    group: 'background',
                    id: 'layer001',
                    visibility: false
                }]
            }
        });
        expect(props).toEqual({});
    });

    it('test centerToMarkerSelector', () => {
        let props = centerToMarkerSelector({});
        expect(props).toEqual(false);

        props = centerToMarkerSelector({
            mapInfo: {
                centerToMarker: false
            }
        });
        expect(props).toEqual(false);

        props = centerToMarkerSelector({
            mapInfo: {
                centerToMarker: true
            }
        });
        expect(props).toEqual(true);
    });
    it('test getLayerWidDimension', () => {
        const state = {
            layers: {
                flat: [{
                    group: 'test',
                    id: 'layer001',
                    visibility: true,
                    dimensions: [{
                        name: 'time'
                    }]
                },
                {
                    group: 'test',
                    id: 'layer002',
                    visibility: true,
                    dimensions: [{
                        name: 'time'
                    }, {
                        name: 'elevation'
                    }]
                }]
            }
        };
        expect(getLayersWithDimension(state, 'time').length).toBe(2);
        expect(getLayersWithDimension(state, 'elevation').length).toBe(1);
        expect(getLayersWithDimension(state, 'reference').length).toBe(0);
    });

    it('test elementSelector with a sub group node and a layer node', () => {
        let settings = {
            "expanded": true,
            "node": "first.second",
            "nodeType": "groups",
            "options": {}
        };
        const flat = [
            {
                id: 'topp:states__6',
                format: 'image/png8',
                search: {
                    url: 'https://demo.geo-solutions.it:443/geoserver/wfs',
                    type: 'wfs'
                },
                name: 'topp:states',
                opacity: 1,
                description: 'This is some census data on the states.',
                title: 'USA Population',
                type: 'wms',
                url: 'https://demo.geo-solutions.it:443/geoserver/wms',
                bbox: {
                    crs: 'EPSG:4326',
                    bounds: {
                        minx: -124.73142200000001,
                        miny: 24.955967,
                        maxx: -66.969849,
                        maxy: 49.371735
                    }
                },
                visibility: true,
                singleTile: false,
                allowedSRS: {},
                dimensions: [],
                hideLoading: false,
                handleClickOnLayer: false,
                catalogURL: 'https://demo.geo-solutions.it/geoserver/csw?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=topp:states',
                useForElevation: false,
                hidden: false,
                params: {
                    layers: 'topp:states'
                },
                loading: false,
                loadingError: false,
                group: 'first.second.third'
            }
        ];
        const groups = [
            {
                id: 'first',
                title: 'first',
                name: 'first',
                nodes: [
                    {
                        id: 'first.second',
                        title: 'second',
                        name: 'second',
                        nodes: [
                            {
                                id: 'first.second.third',
                                title: 'third',
                                name: 'third',
                                nodes: [
                                    'topp:states__6'
                                ],
                                expanded: true
                            }
                        ],
                        expanded: true
                    }
                ],
                expanded: true
            }
        ];
        // group node
        let state = {
            layers: {
                flat,
                groups,
                settings
            }
        };
        let element = {
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
        };
        expect(elementSelector(state)).toEqual(element);

        // layer node
        settings = {
            "expanded": true,
            "node": "topp:states__6",
            "nodeType": "layers",
            "options": {
                "opacity": 1
            }
        };
        state = {
            layers: {
                flat,
                groups,
                settings
            }
        };
        element = {
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
            "group": "first.second.third"
        };
        expect(elementSelector(state)).toEqual(element);
    });
    it('test queryableSelectedLayersSelector', () => {
        const queryableSelectedLayers = [
            {
                type: 'wms',
                visibility: true,
                id: 'mapstore:states__7'
            },
            {
                type: 'wms',
                visibility: true,
                id: 'mapstore:Types__6'
            },
            {
                type: 'wms',
                visibility: true,
                id: 'mapstore:Meteorite_Landings_from_NASA_Open_Data_Portal__5'
            }
        ];
        const state = {
            layers: {
                flat: [
                    {
                        id: 'mapnik__0',
                        group: 'background',
                        type: 'osm',
                        visibility: true
                    },
                    {
                        id: 'Night2012__1',
                        group: 'background',
                        type: 'tileprovider',
                        visibility: false
                    },
                    {
                        type: 'wms',
                        visibility: true,
                        id: 'mapstore:DE_USNG_UTM18__8'
                    },
                    ...queryableSelectedLayers
                ],
                selected: [
                    'mapstore:states__7',
                    'mapstore:Types__6',
                    'mapstore:Meteorite_Landings_from_NASA_Open_Data_Portal__5'
                ]
            }
        };
        expect(queryableSelectedLayersSelector(state)).toEqual(queryableSelectedLayers);
    });
});
