/**
 * Copyright 2015-2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const mapInfo = require('../mapInfo');
const { featureInfoClick } = require('../../actions/mapInfo');
const assign = require('object-assign');

require('babel-polyfill');

describe('Test the mapInfo reducer', () => {
    let appState = {requests: [{reqId: 10, request: "test"}]};

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
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("error");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");

        state = mapInfo(assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("error");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");

        state = mapInfo(assign({}, appState, {responses: ["test"]}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBe("test");
        expect(state.responses[1].response).toBe("error");
        expect(state.responses[1].queryParams).toBe("params");
        expect(state.responses[1].layerMetadata).toBe("meta");
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
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("exception");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");

        state = mapInfo(assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("exception");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");


        state = mapInfo(assign({}, appState, {responses: ["test"]}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBe("test");
        expect(state.responses[1].response).toBe("exception");
        expect(state.responses[1].queryParams).toBe("params");
        expect(state.responses[1].layerMetadata).toBe("meta");

    });

    it('creates a feature info data from succesfull request', () => {
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

        state = mapInfo(assign({}, appState, {responses: []}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(1);
        expect(state.responses[0].response).toBe("data");
        expect(state.responses[0].queryParams).toBe("params");
        expect(state.responses[0].layerMetadata).toBe("meta");

        state = mapInfo(assign({}, appState, {responses: ["test"]}), testAction);
        expect(state.responses).toExist();
        expect(state.responses.length).toBe(2);
        expect(state.responses[0]).toBe("test");
        expect(state.responses[1].response).toBe("data");
        expect(state.responses[1].queryParams).toBe("params");
        expect(state.responses[1].layerMetadata).toBe("meta");
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

        let state = mapInfo(appState, testAction);
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

        state = mapInfo({requests: {} }, {type: 'NEW_MAPINFO_REQUEST', reqId: 1, request: "request"});
        expect(state.requests).toExist();
        expect(state.requests.length).toBe(1);
        expect(state.requests.filter((req) => req.reqId === 1)[0].request).toBe("request");

        state = mapInfo( appState, {type: 'NEW_MAPINFO_REQUEST', reqId: 1, request: "request"});

        expect(state.requests).toExist();
        expect(state.requests.length).toBe(2);
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
        expect(state.infoFormat).toBe("testFormat");

        state = mapInfo({infoFormat: 'oldFormat'}, {type: 'CHANGE_MAPINFO_FORMAT', infoFormat: "newFormat"});
        expect(state).toExist();
        expect(state.infoFormat).toBe('newFormat');
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
                            1.495037167664108,
                            0.6482359352331892
                          ],
                          [
                            1.4950318567997916,
                            0.64829211471304
                          ],
                          [
                            1.4950230286507264,
                            0.6483478498843123
                          ],
                          [
                            1.4950107180575838,
                            0.6484029207857728
                          ],
                          [
                            1.4949949736046504,
                            0.6484571100777669
                          ],
                          [
                            1.4949758574280894,
                            0.6485102038999376
                          ],
                          [
                            1.494953444970716,
                            0.6485619927152563
                          ],
                          [
                            1.4949278246842606,
                            0.6486122721369788
                          ],
                          [
                            1.4948990976802885,
                            0.6486608437352605
                          ],
                          [
                            1.4948673773311605,
                            0.6487075158202205
                          ],
                          [
                            1.4948327888226032,
                            0.6487521041985329
                          ],
                          [
                            1.4947954686596574,
                            0.6487944329002852
                          ],
                          [
                            1.4947555641279566,
                            0.6488343348734962
                          ],
                          [
                            1.4947132327124568,
                            0.6488716526433697
                          ],
                          [
                            1.4946686414759156,
                            0.6489062389337739
                          ],
                          [
                            1.4946219663995715,
                            0.6489379572484694
                          ],
                          [
                            1.4945733916886275,
                            0.6489666824098187
                          ],
                          [
                            1.4945231090452755,
                            0.6489923010527895
                          ],
                          [
                            1.4944713169121375,
                            0.6490147120723448
                          ],
                          [
                            1.494418219689101,
                            0.6490338270224751
                          ],
                          [
                            1.4943640269266472,
                            0.6490495704652451
                          ],
                          [
                            1.494308952498852,
                            0.6490618802685062
                          ],
                          [
                            1.4942532137593199,
                            0.6490707078511051
                          ],
                          [
                            1.4941970306833923,
                            0.6490760183746451
                          ],
                          [
                            1.494140625000001,
                            0.6490777908809122
                          ],
                          [
                            1.4940842193166102,
                            0.6490760183746451
                          ],
                          [
                            1.4940280362406824,
                            0.6490707078511051
                          ],
                          [
                            1.4939722975011502,
                            0.6490618802685062
                          ],
                          [
                            1.493917223073355,
                            0.6490495704652451
                          ],
                          [
                            1.4938630303109015,
                            0.6490338270224751
                          ],
                          [
                            1.493809933087865,
                            0.6490147120723448
                          ],
                          [
                            1.4937581409547267,
                            0.6489923010527895
                          ],
                          [
                            1.4937078583113748,
                            0.6489666824098187
                          ],
                          [
                            1.4936592836004308,
                            0.6489379572484694
                          ],
                          [
                            1.4936126085240866,
                            0.6489062389337739
                          ],
                          [
                            1.4935680172875454,
                            0.6488716526433697
                          ],
                          [
                            1.4935256858720456,
                            0.6488343348734962
                          ],
                          [
                            1.4934857813403448,
                            0.6487944329002852
                          ],
                          [
                            1.493448461177399,
                            0.6487521041985329
                          ],
                          [
                            1.4934138726688415,
                            0.6487075158202205
                          ],
                          [
                            1.4933821523197137,
                            0.6486608437352605
                          ],
                          [
                            1.4933534253157417,
                            0.6486122721369788
                          ],
                          [
                            1.4933278050292862,
                            0.6485619927152563
                          ],
                          [
                            1.4933053925719126,
                            0.6485102038999376
                          ],
                          [
                            1.4932862763953518,
                            0.6484571100777669
                          ],
                          [
                            1.4932705319424184,
                            0.6484029207857728
                          ],
                          [
                            1.4932582213492758,
                            0.6483478498843123
                          ],
                          [
                            1.4932493932002107,
                            0.64829211471304
                          ],
                          [
                            1.4932440823358941,
                            0.6482359352331892
                          ],
                          [
                            1.4932423097158816,
                            0.6481795331595092
                          ],
                          [
                            1.4932440823358941,
                            0.6481231310851803
                          ],
                          [
                            1.4932493932002107,
                            0.6480669516034593
                          ],
                          [
                            1.4932582213492758,
                            0.6480112164290955
                          ],
                          [
                            1.4932705319424184,
                            0.6479561455233731
                          ],
                          [
                            1.4932862763953518,
                            0.6479019562260231
                          ],
                          [
                            1.4933053925719126,
                            0.6478488623974784
                          ],
                          [
                            1.4933278050292862,
                            0.6477970735748573
                          ],
                          [
                            1.4933534253157417,
                            0.6477467941450433
                          ],
                          [
                            1.4933821523197137,
                            0.6476982225379961
                          ],
                          [
                            1.4934138726688415,
                            0.6476515504437361
                          ],
                          [
                            1.493448461177399,
                            0.6476069620557421
                          ],
                          [
                            1.4934857813403448,
                            0.6475646333440538
                          ],
                          [
                            1.4935256858720456,
                            0.6475247313608431
                          ],
                          [
                            1.4935680172875454,
                            0.6474874135810463
                          ],
                          [
                            1.4936126085240866,
                            0.6474528272809605
                          ],
                          [
                            1.4936592836004308,
                            0.647421108956965
                          ],
                          [
                            1.4937078583113748,
                            0.6473923837868502
                          ],
                          [
                            1.4937581409547267,
                            0.647366765135788
                          ],
                          [
                            1.493809933087865,
                            0.6473443541089301
                          ],
                          [
                            1.4938630303109015,
                            0.6473252391524259
                          ],
                          [
                            1.493917223073355,
                            0.6473094957043
                          ],
                          [
                            1.4939722975011502,
                            0.6472971858967769
                          ],
                          [
                            1.4940280362406824,
                            0.6472883583110738
                          ],
                          [
                            1.4940842193166102,
                            0.6472830477856762
                          ],
                          [
                            1.494140625000001,
                            0.6472812752787731
                          ],
                          [
                            1.4941970306833923,
                            0.6472830477856762
                          ],
                          [
                            1.4942532137593199,
                            0.6472883583110738
                          ],
                          [
                            1.494308952498852,
                            0.6472971858967769
                          ],
                          [
                            1.4943640269266472,
                            0.6473094957043
                          ],
                          [
                            1.494418219689101,
                            0.6473252391524259
                          ],
                          [
                            1.4944713169121375,
                            0.6473443541089301
                          ],
                          [
                            1.4945231090452755,
                            0.647366765135788
                          ],
                          [
                            1.4945733916886275,
                            0.6473923837868502
                          ],
                          [
                            1.4946219663995715,
                            0.647421108956965
                          ],
                          [
                            1.4946686414759156,
                            0.6474528272809605
                          ],
                          [
                            1.4947132327124568,
                            0.6474874135810463
                          ],
                          [
                            1.4947555641279566,
                            0.6475247313608431
                          ],
                          [
                            1.4947954686596574,
                            0.6475646333440538
                          ],
                          [
                            1.4948327888226032,
                            0.6476069620557421
                          ],
                          [
                            1.4948673773311605,
                            0.6476515504437361
                          ],
                          [
                            1.4948990976802885,
                            0.6476982225379961
                          ],
                          [
                            1.4949278246842606,
                            0.6477467941450433
                          ],
                          [
                            1.494953444970716,
                            0.6477970735748573
                          ],
                          [
                            1.4949758574280894,
                            0.6478488623974784
                          ],
                          [
                            1.4949949736046504,
                            0.6479019562260231
                          ],
                          [
                            1.4950107180575838,
                            0.6479561455233731
                          ],
                          [
                            1.4950230286507264,
                            0.6480112164290955
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
                              0.6482359352331892
                            ],
                            [
                              1.4950318567997916,
                              0.64829211471304
                            ],
                            [
                              1.4950230286507264,
                              0.6483478498843123
                            ],
                            [
                              1.4950107180575838,
                              0.6484029207857728
                            ],
                            [
                              1.4949949736046504,
                              0.6484571100777669
                            ],
                            [
                              1.4949758574280894,
                              0.6485102038999376
                            ],
                            [
                              1.494953444970716,
                              0.6485619927152563
                            ],
                            [
                              1.4949278246842606,
                              0.6486122721369788
                            ],
                            [
                              1.4948990976802885,
                              0.6486608437352605
                            ],
                            [
                              1.4948673773311605,
                              0.6487075158202205
                            ],
                            [
                              1.4948327888226032,
                              0.6487521041985329
                            ],
                            [
                              1.4947954686596574,
                              0.6487944329002852
                            ],
                            [
                              1.4947555641279566,
                              0.6488343348734962
                            ],
                            [
                              1.4947132327124568,
                              0.6488716526433697
                            ],
                            [
                              1.4946686414759156,
                              0.6489062389337739
                            ],
                            [
                              1.4946219663995715,
                              0.6489379572484694
                            ],
                            [
                              1.4945733916886275,
                              0.6489666824098187
                            ],
                            [
                              1.4945231090452755,
                              0.6489923010527895
                            ],
                            [
                              1.4944713169121375,
                              0.6490147120723448
                            ],
                            [
                              1.494418219689101,
                              0.6490338270224751
                            ],
                            [
                              1.4943640269266472,
                              0.6490495704652451
                            ],
                            [
                              1.494308952498852,
                              0.6490618802685062
                            ],
                            [
                              1.4942532137593199,
                              0.6490707078511051
                            ],
                            [
                              1.4941970306833923,
                              0.6490760183746451
                            ],
                            [
                              1.494140625000001,
                              0.6490777908809122
                            ],
                            [
                              1.4940842193166102,
                              0.6490760183746451
                            ],
                            [
                              1.4940280362406824,
                              0.6490707078511051
                            ],
                            [
                              1.4939722975011502,
                              0.6490618802685062
                            ],
                            [
                              1.493917223073355,
                              0.6490495704652451
                            ],
                            [
                              1.4938630303109015,
                              0.6490338270224751
                            ],
                            [
                              1.493809933087865,
                              0.6490147120723448
                            ],
                            [
                              1.4937581409547267,
                              0.6489923010527895
                            ],
                            [
                              1.4937078583113748,
                              0.6489666824098187
                            ],
                            [
                              1.4936592836004308,
                              0.6489379572484694
                            ],
                            [
                              1.4936126085240866,
                              0.6489062389337739
                            ],
                            [
                              1.4935680172875454,
                              0.6488716526433697
                            ],
                            [
                              1.4935256858720456,
                              0.6488343348734962
                            ],
                            [
                              1.4934857813403448,
                              0.6487944329002852
                            ],
                            [
                              1.493448461177399,
                              0.6487521041985329
                            ],
                            [
                              1.4934138726688415,
                              0.6487075158202205
                            ],
                            [
                              1.4933821523197137,
                              0.6486608437352605
                            ],
                            [
                              1.4933534253157417,
                              0.6486122721369788
                            ],
                            [
                              1.4933278050292862,
                              0.6485619927152563
                            ],
                            [
                              1.4933053925719126,
                              0.6485102038999376
                            ],
                            [
                              1.4932862763953518,
                              0.6484571100777669
                            ],
                            [
                              1.4932705319424184,
                              0.6484029207857728
                            ],
                            [
                              1.4932582213492758,
                              0.6483478498843123
                            ],
                            [
                              1.4932493932002107,
                              0.64829211471304
                            ],
                            [
                              1.4932440823358941,
                              0.6482359352331892
                            ],
                            [
                              1.4932423097158816,
                              0.6481795331595092
                            ],
                            [
                              1.4932440823358941,
                              0.6481231310851803
                            ],
                            [
                              1.4932493932002107,
                              0.6480669516034593
                            ],
                            [
                              1.4932582213492758,
                              0.6480112164290955
                            ],
                            [
                              1.4932705319424184,
                              0.6479561455233731
                            ],
                            [
                              1.4932862763953518,
                              0.6479019562260231
                            ],
                            [
                              1.4933053925719126,
                              0.6478488623974784
                            ],
                            [
                              1.4933278050292862,
                              0.6477970735748573
                            ],
                            [
                              1.4933534253157417,
                              0.6477467941450433
                            ],
                            [
                              1.4933821523197137,
                              0.6476982225379961
                            ],
                            [
                              1.4934138726688415,
                              0.6476515504437361
                            ],
                            [
                              1.493448461177399,
                              0.6476069620557421
                            ],
                            [
                              1.4934857813403448,
                              0.6475646333440538
                            ],
                            [
                              1.4935256858720456,
                              0.6475247313608431
                            ],
                            [
                              1.4935680172875454,
                              0.6474874135810463
                            ],
                            [
                              1.4936126085240866,
                              0.6474528272809605
                            ],
                            [
                              1.4936592836004308,
                              0.647421108956965
                            ],
                            [
                              1.4937078583113748,
                              0.6473923837868502
                            ],
                            [
                              1.4937581409547267,
                              0.647366765135788
                            ],
                            [
                              1.493809933087865,
                              0.6473443541089301
                            ],
                            [
                              1.4938630303109015,
                              0.6473252391524259
                            ],
                            [
                              1.493917223073355,
                              0.6473094957043
                            ],
                            [
                              1.4939722975011502,
                              0.6472971858967769
                            ],
                            [
                              1.4940280362406824,
                              0.6472883583110738
                            ],
                            [
                              1.4940842193166102,
                              0.6472830477856762
                            ],
                            [
                              1.494140625000001,
                              0.6472812752787731
                            ],
                            [
                              1.4941970306833923,
                              0.6472830477856762
                            ],
                            [
                              1.4942532137593199,
                              0.6472883583110738
                            ],
                            [
                              1.494308952498852,
                              0.6472971858967769
                            ],
                            [
                              1.4943640269266472,
                              0.6473094957043
                            ],
                            [
                              1.494418219689101,
                              0.6473252391524259
                            ],
                            [
                              1.4944713169121375,
                              0.6473443541089301
                            ],
                            [
                              1.4945231090452755,
                              0.647366765135788
                            ],
                            [
                              1.4945733916886275,
                              0.6473923837868502
                            ],
                            [
                              1.4946219663995715,
                              0.647421108956965
                            ],
                            [
                              1.4946686414759156,
                              0.6474528272809605
                            ],
                            [
                              1.4947132327124568,
                              0.6474874135810463
                            ],
                            [
                              1.4947555641279566,
                              0.6475247313608431
                            ],
                            [
                              1.4947954686596574,
                              0.6475646333440538
                            ],
                            [
                              1.4948327888226032,
                              0.6476069620557421
                            ],
                            [
                              1.4948673773311605,
                              0.6476515504437361
                            ],
                            [
                              1.4948990976802885,
                              0.6476982225379961
                            ],
                            [
                              1.4949278246842606,
                              0.6477467941450433
                            ],
                            [
                              1.494953444970716,
                              0.6477970735748573
                            ],
                            [
                              1.4949758574280894,
                              0.6478488623974784
                            ],
                            [
                              1.4949949736046504,
                              0.6479019562260231
                            ],
                            [
                              1.4950107180575838,
                              0.6479561455233731
                            ],
                            [
                              1.4950230286507264,
                              0.6480112164290955
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
                    fontFamily: 'FontAwesome',
                    fontWeight: 'normal',
                    font: '14px FontAwesome',
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

        let state = mapInfo(appState, testAction);
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

});
