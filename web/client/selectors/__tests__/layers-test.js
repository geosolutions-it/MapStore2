/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {layersSelector, layerSelectorWithMarkers, groupsSelector, selectedNodesSelector, layerFilterSelector, layerSettingSelector, layerMetadataSelector, backgroundControlsSelector, currentBackgroundSelector, tempBackgroundSelector} = require('../layers');

describe('Test layers selectors', () => {
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

        expect(props.length).toBe(2);
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


});
