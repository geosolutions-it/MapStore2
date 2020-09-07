/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const mapInfo = require('../mapInfo');
const { featureInfoClick, toggleEmptyMessageGFI, toggleShowCoordinateEditor, changeFormat, changePage, toggleHighlightFeature, setMapTrigger} = require('../../actions/mapInfo');
const { MAP_CONFIG_LOADED } = require('../../actions/config');
const assign = require('object-assign');

require('babel-polyfill');

describe('Test the mapInfo reducer', () => {
    let appState = {configuration: {infoFormat: 'text/plain'}, responses: [], requests: [{reqId: 10, request: "test"}, {reqId: 11, request: "test1"}]};

    it('returns original state on unrecognized action', () => {
        let state = mapInfo(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });

    it('creates a general error ', () => {
        let testAction = {
            type: 'ERROR_FEATURE_INFO',
            error: "error",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 10
        };

        let state = mapInfo( appState, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);

        state = mapInfo(assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);

        state = mapInfo(assign({}, appState, {responses: ["test"]}), {...testAction, reqId: 11});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("test");
        expect(state.responses[1]).toBeFalsy();
    });

    it('creates an wms feature info exception', () => {
        let testAction = {
            type: 'EXCEPTIONS_FEATURE_INFO',
            exceptions: "exception",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 10
        };

        let state = mapInfo(appState, testAction);
        expect(state.responses).toBeTruthy();
        expect(state.responses.length).toBe(0);

        state = mapInfo(assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);

        state = mapInfo(assign({}, appState, {responses: ["test"]}), {...testAction, reqId: 11});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0]).toBe("test");

    });

    it('creates a feature info data from successful request', () => {
        let testAction = {
            type: 'LOAD_FEATURE_INFO',
            data: "data",
            requestParams: "params",
            layerMetadata: "meta",
            reqId: 10
        };

        let state = mapInfo(appState, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("data");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");
        expect(state.index).toBe(0);

        state = mapInfo(assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("data");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");
        expect(state.index).toBe(0);

        state = mapInfo(assign({}, appState, {responses: ["test"]}), {...testAction, reqId: 11});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBeTruthy();
        expect(state.responses[1].response).toBe("data");
        expect(state.responses[1].queryParams).toBe("params");
        expect(state.responses[1].layerMetadata).toBe("meta");
        expect(state.index).toBe(1);
    });

    it('creates a feature info data from vector info request', () => {
        let testAction = {
            type: 'GET_VECTOR_INFO',
            layer: {
                features: [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [ [9.0, 42.0], [11.0, 42.0], [11.0, 44.0],
                                [9.0, 44.0], [9.0, 42.0] ]
                        ]
                    },
                    "properties": {
                        "prop0": "value0",
                        "prop1": {"this": "that"}
                    }
                }]
            },
            request: {
                lng: 10.0,
                lat: 43.0
            },
            metadata: "meta"
        };

        let state = mapInfo({requests: [{}], configuration: {}}, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[1].response).toExist();
        expect(state.responses[1].response.features.length).toBe(1);
        expect(state.responses[1].format).toBe('JSON');
        expect(state.responses[1].queryParams.lng).toBe(10.0);
        expect(state.responses[1].layerMetadata).toBe("meta");

        state = mapInfo({requests: [{}], configuration: {trigger: "hover"}}, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toExist();
        expect(state.responses[0].response.features.length).toBe(1);
        expect(state.responses[0].format).toBe('JSON');
        expect(state.responses[0].queryParams.lng).toBe(10.0);
        expect(state.responses[0].layerMetadata).toBe("meta");
    });

    it('creates a new mapinfo request', () => {
        let state = mapInfo({}, {type: 'NEW_MAPINFO_REQUEST', reqId: 1, request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(1);
        expect(state.requests.filter((req) => req.reqId === 1)[0].request).toBe("request");

        state = mapInfo({requests: [] }, {type: 'NEW_MAPINFO_REQUEST', reqId: 1, request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(1);
        expect(state.requests.filter((req) => req.reqId === 1)[0].request).toBe("request");

        state = mapInfo( appState, {type: 'NEW_MAPINFO_REQUEST', reqId: 1, request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(3);
        expect(state.requests.filter((req) => req.reqId === 10)[0].request).toBe("test");
        expect(state.requests.filter((req) => req.reqId === 1)[0].request).toBe("request");
    });

    it('clear request queue', () => {
        let state = mapInfo({}, {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(0);

        state = mapInfo(assign({}, appState, {responses: []}), {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(0);

        state = mapInfo(assign({}, appState, {responses: ["test"]}), {type: 'PURGE_MAPINFO_RESULTS'});
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(0);
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(0);
    });

    it('set a new point on map which has been clicked', () => {
        let state = mapInfo({}, featureInfoClick("p"));
        expect(state.clickPoint).toExist();
        expect(state.clickPoint).toBe('p');

        state = mapInfo({ clickPoint: 'oldP' }, featureInfoClick("p"));
        expect(state.clickPoint).toExist();
        expect(state.clickPoint).toBe('p');

        const overrideParams = {"ws:layername": {info_format: "application/json"}};
        const filterNameList = ["ws:layername"];
        const layer = {};
        const itemId = "ws:layername_1";
        state = mapInfo({ clickPoint: 'oldP' }, featureInfoClick("p", layer, filterNameList, overrideParams, itemId ));
        expect(state.clickPoint).toExist();
        expect(state.clickPoint).toEqual('p');
        expect(state.clickLayer).toEqual(layer);
        expect(state.filterNameList).toEqual(filterNameList);
        expect(state.overrideParams).toEqual(overrideParams);
        expect(state.itemId).toEqual(itemId);
    });

    it('enables map info', () => {
        let state = mapInfo({}, {type: 'CHANGE_MAPINFO_STATE', enabled: true});
        expect(state).toExist();
        expect(state.enabled).toBe(true);

        state = mapInfo({}, {type: 'CHANGE_MAPINFO_STATE', enabled: false});
        expect(state).toExist();
        expect(state.enabled).toBe(false);
    });

    it('change mapinfo format', () => {
        let state = mapInfo({}, {type: 'CHANGE_MAPINFO_FORMAT', infoFormat: "testFormat"});
        expect(state).toExist();
        expect(state.configuration.infoFormat).toBe("testFormat");

        state = mapInfo({configuration: {infoFormat: 'oldFormat'}}, {type: 'CHANGE_MAPINFO_FORMAT', infoFormat: "newFormat"});
        expect(state).toExist();
        expect(state.configuration.infoFormat).toBe('newFormat');
    });

    it('show reverese geocode', () => {
        let state = mapInfo({}, {type: 'SHOW_REVERSE_GEOCODE'});
        expect(state).toExist();
        expect(state.showModalReverse).toBe(true);

        state = mapInfo({reverseGeocodeData: {}}, {type: "SHOW_REVERSE_GEOCODE", reverseGeocodeData: "newData"});
        expect(state).toExist();
        expect(state.reverseGeocodeData).toBe('newData');
    });

    it('hide reverese geocode', () => {
        let state = mapInfo({}, {type: 'HIDE_REVERSE_GEOCODE'});
        expect(state).toExist();
        expect(state.showModalReverse).toBe(false);
        expect(state.reverseGeocodeData).toBe(undefined);
    });

    it('should reset the state', () => {
        let state = mapInfo({showMarker: true}, {type: 'RESET_CONTROLS'});
        expect(state).toExist();
        expect(state.showMarker).toBe(false);
    });

    it('should toggle mapinfo state', () => {
        let state = mapInfo({enabled: true}, {type: 'TOGGLE_MAPINFO_STATE'});
        expect(state).toExist();
        expect(state.enabled).toBe(false);
    });

    it('should enable center to marker', () => {
        let state = mapInfo({}, {type: 'UPDATE_CENTER_TO_MARKER'});
        expect(state).toExist();
        expect(state.centerToMarker).toBe(undefined);

        state = mapInfo({}, {type: 'UPDATE_CENTER_TO_MARKER', status: 'enabled'});
        expect(state).toExist();
        expect(state.centerToMarker).toBe('enabled');

    });

    it('creates a feature info data from vector info request, with FeatureCollection inside', () => {
        let testAction = {
            type: 'GET_VECTOR_INFO',
            layer: {
                type: 'vector',
                visibility: true,
                id: 'annotations',
                name: 'Annotations',
                hideLoading: true,
                style: {
                    type: 'FeatureCollection',
                    Polygon: {
                        color: '#ffcc33',
                        opacity: 1,
                        weight: 3,
                        fillColor: '#ffffff',
                        fillOpacity: 0.2,
                        editing: {
                            fill: 1
                        }
                    },
                    MultiPolygon: {
                        color: '#ffcc33',
                        opacity: 1,
                        weight: 3,
                        fillColor: '#ffffff',
                        fillOpacity: 0.2,
                        editing: {
                            fill: 1
                        }
                    }
                },
                features: [
                    {
                        type: 'FeatureCollection',
                        properties: {
                            title: 'ads',
                            id: '77359220-6b2d-11e8-af0b-7f182f5005a7'
                        },
                        features: [
                            {
                                type: 'Feature',
                                geometry: {
                                    coordinates: [
                                        [
                                            [
                                                1.4062499999999993,
                                                0.07690427378333507
                                            ],
                                            [
                                                2.878417968750001,
                                                -2.2077054557054083
                                            ],
                                            [
                                                -1.5600585937500016,
                                                -1.7245930431979002
                                            ],
                                            [
                                                1.4062499999999993,
                                                0.07690427378333507
                                            ]
                                        ]
                                    ],
                                    type: 'Polygon'
                                },
                                properties: {
                                    id: '782dadc0-6b2d-11e8-af0b-7f182f5005a7',
                                    isValidFeature: true,
                                    canEdit: false
                                }
                            },
                            {
                                type: 'Feature',
                                geometry: {
                                    coordinates: [
                                        [
                                            [
                                                -4.394531250000002,
                                                0.03295898255728466
                                            ],
                                            [
                                                -3.4716796875000018,
                                                -2.3174830687583046
                                            ],
                                            [
                                                -6.767578125000002,
                                                -2.8442900428132867
                                            ],
                                            [
                                                -4.394531250000002,
                                                0.03295898255728466
                                            ]
                                        ]
                                    ],
                                    type: 'Polygon'
                                },
                                properties: {
                                    id: '7a4199a0-6b2d-11e8-af0b-7f182f5005a7',
                                    isValidFeature: true,
                                    canEdit: false
                                }
                            }
                        ],
                        style: {
                            type: 'FeatureCollection',
                            Polygon: {
                                color: '#ffcc33',
                                opacity: 1,
                                weight: 3,
                                fillColor: '#ffffff',
                                fillOpacity: 0.2,
                                editing: {
                                    fill: 1
                                }
                            },
                            MultiPolygon: {
                                color: '#ffcc33',
                                opacity: 1,
                                weight: 3,
                                fillColor: '#ffffff',
                                fillOpacity: 0.2,
                                editing: {
                                    fill: 1
                                }
                            },
                            highlight: false
                        }
                    },
                    {
                        type: 'FeatureCollection',
                        properties: {
                            title: 'dfgd',
                            id: '87056c20-6b2d-11e8-af0b-7f182f5005a7'
                        },
                        features: [
                            {
                                type: 'Feature',
                                geometry: {
                                    coordinates: [
                                        -1.0107421874999996,
                                        2.7126091154394105
                                    ],
                                    type: 'Point'
                                },
                                properties: {
                                    id: '87f9b730-6b2d-11e8-af0b-7f182f5005a7',
                                    isValidFeature: true,
                                    canEdit: false
                                }
                            },
                            {
                                type: 'Feature',
                                geometry: {
                                    type: 'Polygon',
                                    coordinates: [
                                        [
                                            [
                                                -1.801757812500001,
                                                0.2966295342722069
                                            ],
                                            [
                                                0.3735351562500003,
                                                -1.461023280622767
                                            ],
                                            [
                                                -5.075683593750002,
                                                -1.6147764249055092
                                            ],
                                            [
                                                -1.801757812500001,
                                                0.2966295342722069
                                            ]
                                        ]
                                    ]
                                },
                                properties: {
                                    id: '8984eb10-6b2d-11e8-af0b-7f182f5005a7',
                                    isValidFeature: true,
                                    canEdit: false,
                                    selected: true
                                }
                            },
                            {
                                type: 'Feature',
                                geometry: {
                                    coordinates: [
                                        4.724121093750001,
                                        2.0100855878673873
                                    ],
                                    type: 'Point'
                                },
                                properties: {
                                    id: '8e11c630-6b2d-11e8-af0b-7f182f5005a7',
                                    isValidFeature: true,
                                    canEdit: false,
                                    isText: true,
                                    valueText: 'New'
                                }
                            },
                            {
                                type: 'Feature',
                                geometry: {
                                    coordinates: [
                                        [
                                            [
                                                1.4950389402841207,
                                                0.6481795331595092
                                            ],

                                            [
                                                1.4950318567997916,
                                                0.6480669516034593
                                            ],
                                            [
                                                1.495037167664108,
                                                0.6481231310851803
                                            ],
                                            [
                                                1.4950389402841207,
                                                0.6481795331595092
                                            ]
                                        ]
                                    ],
                                    type: 'Polygon'
                                },
                                properties: {
                                    isCircle: true,
                                    radius: 187065.88083090802,
                                    center: [
                                        1.494140625000001,
                                        0.6481795331595092
                                    ],
                                    id: '902563f0-6b2d-11e8-af0b-7f182f5005a7',
                                    polygonGeom: {
                                        coordinates: [
                                            [
                                                [
                                                    1.4950389402841207,
                                                    0.6481795331595092
                                                ],
                                                [
                                                    1.495037167664108,
                                                    0.6481231310851803
                                                ],
                                                [
                                                    1.4950389402841207,
                                                    0.6481795331595092
                                                ]
                                            ]
                                        ],
                                        type: 'Polygon'
                                    },
                                    isValidFeature: true,
                                    canEdit: false
                                }
                            },
                            {
                                type: 'Feature',
                                geometry: {
                                    coordinates: [
                                        [
                                            2.0654296874999982,
                                            3.568247821628616
                                        ],
                                        [
                                            -5.844726562500002,
                                            -0.0769042737833478
                                        ]
                                    ],
                                    type: 'LineString'
                                },
                                properties: {
                                    id: '921748e0-6b2d-11e8-af0b-7f182f5005a7',
                                    isValidFeature: true,
                                    canEdit: false
                                }
                            }
                        ],
                        style: {
                            type: 'FeatureCollection',
                            Point: {
                                iconGlyph: 'comment',
                                iconShape: 'square',
                                iconColor: 'blue'
                            },
                            MultiPoint: {
                                iconGlyph: 'comment',
                                iconShape: 'square',
                                iconColor: 'blue'
                            },
                            Polygon: {
                                color: '#ffcc33',
                                opacity: 1,
                                weight: 3,
                                fillColor: '#ffffff',
                                fillOpacity: 0.2,
                                editing: {
                                    fill: 1
                                }
                            },
                            MultiPolygon: {
                                color: '#ffcc33',
                                opacity: 1,
                                weight: 3,
                                fillColor: '#ffffff',
                                fillOpacity: 0.2,
                                editing: {
                                    fill: 1
                                }
                            },
                            Text: {
                                fontStyle: 'normal',
                                fontSize: '14',
                                fontSizeUom: 'px',
                                fontFamily: 'Arial',
                                fontWeight: 'normal',
                                font: '14px Arial',
                                textAlign: 'center',
                                color: '#000000',
                                opacity: 1
                            },
                            Circle: {
                                color: '#ffcc33',
                                opacity: 1,
                                weight: 3,
                                fillColor: '#ffffff',
                                fillOpacity: 0.2,
                                radius: 10
                            },
                            LineString: {
                                color: '#ffcc33',
                                opacity: 1,
                                weight: 3,
                                fillColor: '#ffffff',
                                fillOpacity: 0.2,
                                editing: {
                                    fill: 1
                                }
                            },
                            MultiLineString: {
                                color: '#ffcc33',
                                opacity: 1,
                                weight: 3,
                                fillColor: '#ffffff',
                                fillOpacity: 0.2,
                                editing: {
                                    fill: 1
                                }
                            },
                            highlight: false
                        }
                    }
                ],
                handleClickOnLayer: true
            },
            request: {
                lat: 0.6481795331595066,
                lng: 1.4941406250000009
            },
            metadata: {
                fields: [
                    'title',
                    'id'
                ],
                title: 'Annotations',
                resolution: 2445.98490512564,
                buffer: 2,
                units: 'm'
            }
        };

        let state = mapInfo({requests: []}, testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toExist();
        expect(state.responses[0].response.features.length).toBe(1);
        expect(state.responses[0].format).toBe('JSON');
        expect(state.responses[0].queryParams.lng).toBe(1.4941406250000009);
        expect(state.responses[0].layerMetadata.fields.length).toBe(2);
        expect(state.responses[0].layerMetadata.title).toBe("Annotations");
        expect(state.responses[0].layerMetadata.buffer).toBe(2);
    });

    it('TOGGLE_EMPTY_MESSAGE_GFI', () => {
        let state = mapInfo({
            infoFormat: "text/html",
            configuration: {}
        }, toggleEmptyMessageGFI());
        expect(state.configuration.showEmptyMessageGFI).toBe(true);
        state = mapInfo(state, toggleEmptyMessageGFI());
        expect(state.configuration.showEmptyMessageGFI).toBe(false);
    });
    it('MAP_CONFIG_LOADED', () => {
        const oldInfoFormat = "text/html";
        const newInfoFormat = "application/json";
        let state = mapInfo({
            infoFormat: oldInfoFormat,
            configuration: {}
        }, {
            type: MAP_CONFIG_LOADED,
            config: {
                mapInfoConfiguration: {
                    infoFormat: newInfoFormat,
                    showEmptyMessageGFI: true
                }
            }
        });
        expect(state.configuration.showEmptyMessageGFI).toBe(true);
        expect(state.configuration.infoFormat).toBe(newInfoFormat);
    });

    it('toggleShowCoordinateEditor', () => {
        let state = mapInfo({}, toggleShowCoordinateEditor(true));
        expect(state).toExist();
        expect(state.showCoordinateEditor).toBe(false);
    });
    it('changeFormat', () => {
        let state = mapInfo({
            formatCoord: "aeronautical"
        }, changeFormat("decimal"));
        expect(state).toExist();
        expect(state.formatCoord).toBe("decimal");
    });
    it('test get FeatureInfo', () => {
        const coordinates = [
            [
                10.588610688032599,
                47.299871638197
            ],
            [
                -16.352332555255717,
                49.53350105609461
            ]
        ];

        // mid point of coordinate segment
        const MPoint = {
            x: (coordinates[0][0] + coordinates[1][0] ) / 2,
            y: (coordinates[0][1] + coordinates[1][1]) / 2
        };
        const getVectorInfoAction = {
            type: 'GET_VECTOR_INFO',
            layer: {
                type: 'vector',
                visibility: true,
                id: 'annotations',
                name: 'Annotations',
                hideLoading: true,
                style: null,
                features: [
                    {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [
                                        -16.352332555255717,
                                        49.53350105609461
                                    ]
                                },
                                properties: {
                                    valueText: '1998753.55 m',
                                    isText: true,
                                    isValidFeature: true,
                                    id: 'e3129731-40b7-11e9-8a48-ad0c6ec638ad'
                                },
                                style: [{}]
                            },
                            {
                                type: 'Feature',
                                geometry: {
                                    type: 'MultiPoint',
                                    // start end ponts
                                    coordinates
                                },
                                properties: {
                                    isValidFeature: true,
                                    useGeodesicLines: true,
                                    id: 'e312be41-40b7-11e9-8a48-ad0c6ec638ad',
                                    geometryGeodesic: {
                                        type: 'LineString',
                                        // simplified for tests. Densified in rea world
                                        coordinates
                                    }
                                },
                                style: [{}]
                            }
                        ],
                        properties: {
                            id: 'e3129730-40b7-11e9-8a48-ad0c6ec638ad',
                            title: 'New annotation',
                            description: '<p>1998753.55 m</p>'
                        },
                        style: {}
                    }
                ],
                handleClickOnLayer: true
            },
            // click on mid point (one that belongs to the `geometryGeodesic`)
            request: {
                lat: MPoint.y,
                lng: MPoint.x
            },
            metadata: {
                fields: [
                    'id',
                    'title',
                    'description'
                ],
                title: 'Annotations',
                resolution: 10583.33333333336,
                buffer: 2,
                units: 'm'
            }
        };
        let state = mapInfo({
            requests: [],
            responses: [],
            formatCoord: "aeronautical"
        }, getVectorInfoAction);
        expect(state).toExist();
        expect(state.responses.length).toBe(1);
        const response = state.responses[0].response;
        // check the click has been intercepted
        expect(response.features.length).toBe(1);
        expect(response.features[0].type).toBe("FeatureCollection");
    });
    it('mapInfo changePage', () => {
        const action = changePage(1);
        const state = mapInfo( undefined, action);
        expect(state.index).toBe(1);
    });
    it('mapInfo changePage', () => {
        const action = toggleHighlightFeature(true);
        const state = mapInfo(undefined, action);
        expect(state.highlight).toBe(true);
    });
    it('mapInfo SET_MAP_TRIGGER', () => {
        const action = setMapTrigger('hover');
        const state = mapInfo(undefined, action);
        expect(state.configuration.trigger).toBe('hover');
    });
});
