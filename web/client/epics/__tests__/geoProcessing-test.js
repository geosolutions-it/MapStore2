/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from "axios-mock-adapter";

import { testEpic, addTimeoutEpic, TEST_TIMEOUT } from './epicTestUtils';
import axios from "../../libs/ajax";
import {
    checkWPSAvailabilityGPTEpic,
    getFeaturesGPTEpic,
    getFeatureDataGPTEpic,
    getIntersectionFeatureDataGPTEpic,
    runBufferProcessGPTEpic,
    resetSourceHighlightGPTEpic,
    resetIntersectHighlightGPTEpic,
    runIntersectProcessGPTEpic,
    toggleHighlightLayersOnOpenCloseGPTEpic,
    toggleHighlightLayersGPTEpic,
    disableIdentifyGPTEpic,
    clickToSelectFeatureGPTEpic,
    LPlongitudinalMapLayoutGPTEpic
} from '../geoProcessing';

import {
    GPT_TOOL_INTERSECTION,
    GPT_TOOL_BUFFER,
    GPT_CONTROL_NAME,
    SET_FEATURES,
    checkWPSAvailability,
    checkingWPSAvailability,
    checkingIntersectionWPSAvailability,
    errorLoadingDFT,
    getFeatures,
    setFeatures,
    setFeatureSourceLoading,
    setFeatureIntersectionLoading,
    setSourceFeatureId,
    setSourceLayerId,
    setInvalidLayer,
    setIntersectionFeatureId,
    setIntersectionLayerId,
    setWPSAvailability,
    setSourceFeature,
    setIntersectionFeature,
    setSelectedLayerType,
    runProcess,
    runningProcess,
    toggleHighlightLayers
} from '../../actions/geoProcessing';
import {
    mergeOptionsByOwner,
    updateAdditionalLayer,
    removeAdditionalLayer
} from '../../actions/additionallayers';
import {
    addGroup,
    addLayer,
    updateNode
} from '../../actions/layers';
import {
    updateMapLayout
} from '../../actions/maplayout';
import {
    toggleControl
} from '../../actions/controls';
import {
    registerEventListener,
    zoomToExtent,
    clickOnMap
} from '../../actions/map';
import {
    error as showErrorNotification,
    success as showSuccessNotification
} from '../../actions/notifications';
import DESCRIBE_PROCESS from 'raw-loader!../../test-resources/wfs/describeLayer.xml';
import DESCRIBE_PROCESS_NO_BUFFER from 'raw-loader!../../test-resources/wfs/describeProcess_no_buffer.xml';
import DESCRIBE_POIS from '../../test-resources/wfs/describe-pois.json';
import GET_FEATURES from '../../test-resources/wms/GetFeature.json';
import COLLECT_GEOM from '../../test-resources/wps/collectGeom.json';
import MULTIPOLYGON_FC from '../../test-resources/wps/MultiPolygonFC.json';


import {
    hideMapinfoMarker,
    purgeMapInfoResults,
    changeMapInfoState
} from "../../actions/mapInfo";
describe('geoProcessing epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        mockAxios.restore();
    });

    it('checkWPSAvailabilityGPTEpic for a vector layer', (done) => {
        const layerId = "id";
        const source = "source";
        const NUM_ACTIONS = 2;
        const startActions = [checkWPSAvailability(layerId, source)];
        const layer = {
            id: "id",
            url: "mockUrl",
            describeFeatureType: {
            },
            type: "vector",
            features: [{
                type: "Feature",
                id: "ft-id",
                geometry: {
                    type: "Point",
                    coordinates: [1, 2]
                },
                features: undefined
            }]
        };
        try {
            testEpic(addTimeoutEpic(checkWPSAvailabilityGPTEpic), NUM_ACTIONS, startActions, actions => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [
                    action1, // setwps
                    action2 // setFeatures
                ] = actions;
                expect(action1).toEqual(setWPSAvailability(layerId, true, source));
                expect(action2).toEqual(setFeatures(layerId, source, layer, 0, layer?.features?.[0]?.geometry?.type || ""));
                done();
            }, {
                layers: {
                    flat: [layer]
                }
            }, done);

        } catch (error) {
            done(error);
        }
    });
    it('checkWPSAvailabilityGPTEpic describe layer available', (done) => {
        mockAxios.onGet("mockUrl?service=WPS&version=1.0.0&REQUEST=DescribeProcess&IDENTIFIER=geo%3Abuffer%2Cgs%3AIntersectionFeatureCollection%2Cgs%3ACollectGeometries").reply(200, DESCRIBE_PROCESS);
        const layerId = "id";
        const source = "source";
        const NUM_ACTIONS = 4;
        const startActions = [checkWPSAvailability(layerId, source)];
        testEpic(checkWPSAvailabilityGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3,
                action4 // describe layer
            ] = actions;
            expect(action1).toEqual(checkingWPSAvailability(true));
            expect(action2).toEqual(setWPSAvailability(layerId, true, source));
            expect(action3).toEqual(getFeatures(layerId, source));
            expect(action4).toEqual(checkingWPSAvailability(false));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    type: "wfs",
                    search: {
                        type: "wfs"
                    },
                    describeFeatureType: {
                    }
                }]
            }
        });
    });
    it('checkWPSAvailabilityGPTEpic describe layer not available, failing', (done) => {
        mockAxios.onGet("mockUrl?service=WPS&version=1.0.0&REQUEST=DescribeProcess&IDENTIFIER=geo%3Abuffer%2Cgs%3AIntersectionFeatureCollection%2Cgs%3ACollectGeometries").reply(200, DESCRIBE_PROCESS);
        const layerId = "id";
        const source = "source";
        const NUM_ACTIONS = 5;
        const startActions = [checkWPSAvailability(layerId, source), updateNode(layerId, "id", { describeLayer: { error: "no describe feature found" }})];
        // note that this update node is not captured correctly
        testEpic(addTimeoutEpic(checkWPSAvailabilityGPTEpic, 100), NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3,
                action4, // describe layer
                action5
            ] = actions;
            expect(action1).toEqual(checkingWPSAvailability(true));
            expect(action2).toEqual(setWPSAvailability(layerId, true, source));
            expect(action3).toBeTruthy(checkingWPSAvailability(false));
            expect(action4).toBeTruthy();
            expect(action5.type).toEqual(TEST_TIMEOUT);
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    type: "wfs",
                    search: {
                        type: "wfs"
                    }
                }]
            }
        });
    });
    it('checkWPSAvailabilityGPTEpic buffer wps not available', (done) => {
        mockAxios.onGet("mockUrl?service=WPS&version=1.0.0&REQUEST=DescribeProcess&IDENTIFIER=geo%3Abuffer%2Cgs%3AIntersectionFeatureCollection%2Cgs%3ACollectGeometries").reply(200, DESCRIBE_PROCESS_NO_BUFFER);
        const layerId = "id";
        const source = "source";
        const NUM_ACTIONS = 4;
        const startActions = [checkWPSAvailability(layerId, source)];
        testEpic(checkWPSAvailabilityGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3,
                action4 // describe layer
            ] = actions;
            expect(action1).toEqual(checkingWPSAvailability(true));
            expect(action2).toEqual(setInvalidLayer(layerId, source));
            expect(action3).toEqual(setWPSAvailability(layerId, false, source));
            expect(action4).toEqual(checkingWPSAvailability(false));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    type: "wfs",
                    search: {
                        type: "wfs"
                    }
                }]
            }
        });
    });
    it('checkWPSAvailabilityGPTEpic buffer wps not available, intersection', (done) => {
        mockAxios.onGet("mockUrl?service=WPS&version=1.0.0&REQUEST=DescribeProcess&IDENTIFIER=geo%3Abuffer%2Cgs%3AIntersectionFeatureCollection%2Cgs%3ACollectGeometries").reply(200, DESCRIBE_PROCESS_NO_BUFFER);
        const layerId = "id";
        const source = "intersection";
        const NUM_ACTIONS = 4;
        const startActions = [checkWPSAvailability(layerId, source)];
        testEpic(checkWPSAvailabilityGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3,
                action4 // describe layer
            ] = actions;
            expect(action1).toEqual(checkingIntersectionWPSAvailability(true));
            expect(action2).toEqual(setInvalidLayer(layerId, source));
            expect(action3).toEqual(setWPSAvailability(layerId, false, source));
            expect(action4).toEqual(checkingIntersectionWPSAvailability(false));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    type: "wfs",
                    search: {
                        type: "wfs"
                    }
                }]
            }
        });
    });

    it('getFeaturesGPTEpic source as vector layer', (done) => {
        const layerId = "id";
        const source = "source";
        const NUM_ACTIONS = 1;
        mockAxios.onPost("mockUrl?service=WFS&outputFormat=json").reply(200, GET_FEATURES);

        const startActions = [getFeatures(layerId, source)];
        testEpic(getFeaturesGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1.type).toEqual(SET_FEATURES);
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    describeFeatureType: DESCRIBE_POIS,
                    type: "vector",
                    features: [{
                        type: "Feature",
                        id: "ft-id",
                        geometry: {
                            type: "Point",
                            coordinates: [1, 2]
                        }
                    }]
                }]
            }
        });
    });
    it('getFeaturesGPTEpic source', (done) => {
        const layerId = "id";
        const source = "source";
        const NUM_ACTIONS = 3;
        mockAxios.onPost("mockUrl?service=WFS&outputFormat=json").reply(200, GET_FEATURES);

        const startActions = [getFeatures(layerId, source)];
        testEpic(getFeaturesGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3
            ] = actions;
            expect(action1).toEqual(setFeatureSourceLoading(true));
            expect(action2.type).toEqual(SET_FEATURES);
            expect(action3).toEqual(setFeatureSourceLoading(false));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    describeFeatureType: DESCRIBE_POIS,
                    type: "wfs",
                    search: {
                        type: "wfs"
                    }
                }]
            }
        });
    });
    it('getFeaturesGPTEpic intersection', (done) => {
        const layerId = "id";
        const source = "intersection";
        const NUM_ACTIONS = 3;
        mockAxios.onPost("mockUrl?service=WFS&outputFormat=json").reply(200, GET_FEATURES);

        const startActions = [getFeatures(layerId, source)];
        testEpic(getFeaturesGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3
            ] = actions;
            expect(action1).toEqual(setFeatureIntersectionLoading(true));
            expect(action2.type).toEqual(SET_FEATURES);
            expect(action3).toEqual(setFeatureIntersectionLoading(false));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    describeFeatureType: DESCRIBE_POIS,
                    type: "wfs",
                    search: {
                        type: "wfs"
                    }
                }]
            }
        });
    });
    it('getFeaturesGPTEpic no describeFeatureType available', (done) => {
        const layerId = "id";
        const source = "intersection";
        const NUM_ACTIONS = 1;
        mockAxios.onPost("mockUrl?service=WFS&outputFormat=json").reply(200, GET_FEATURES);

        const startActions = [getFeatures(layerId, source)];
        testEpic(getFeaturesGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1).toEqual(errorLoadingDFT(layerId));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    type: "wfs",
                    search: {
                        type: "wfs"
                    }
                }]
            }
        });
    });
    it('setSourceFeatureId as vector', (done) => {
        const featureId = "ft-id2";
        const NUM_ACTIONS = 3;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);
        const secondFt = {
            type: "Feature",
            id: "ft-id2",
            geometry: {
                type: "Point",
                coordinates: [11, 22]
            },
            features: undefined
        };
        const startActions = [setSourceFeatureId(featureId)];
        testEpic(getFeatureDataGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3
            ] = actions;
            expect(action1.type).toEqual(setSourceFeature().type);
            expect(action1.feature).toEqual(secondFt);
            expect(action2.type).toEqual(updateAdditionalLayer().type);
            expect(action2.options.features).toEqual([{
                ...secondFt,
                style: {
                    color: "#3388ff",
                    dashArray: "",
                    fillColor: "#3388ff",
                    fillOpacity: 0.2,
                    weight: 4
                }}]);
            expect(action3.type).toEqual(zoomToExtent().type);
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    name: "name",
                    type: "vector",
                    features: [{
                        type: "Feature",
                        id: "ft-id",
                        geometry: {
                            type: "Point",
                            coordinates: [1, 2]
                        }
                    },
                    secondFt]
                }]
            },
            geoProcessing: {
                source: {
                    layerId: "id"
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('setSourceFeatureId', (done) => {
        const featureId = "INCENDI_INTERFACCIA.2955";
        const NUM_ACTIONS = 3;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);

        const startActions = [setSourceFeatureId(featureId)];
        testEpic(getFeatureDataGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3
            ] = actions;
            expect(action1.type).toEqual(setSourceFeature().type);
            expect(action2.type).toEqual(updateAdditionalLayer().type);
            expect(action3.type).toEqual(zoomToExtent().type);
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    name: "name",
                    type: "wfs",
                    search: {
                        type: "wfs",
                        url: "mockUrl"
                    }
                }]
            },
            geoProcessing: {
                source: {
                    layerId: "id"
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('setSourceFeatureId with error', (done) => {
        const featureId = "ft-id";
        const NUM_ACTIONS = 1;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(500, GET_FEATURES);

        const startActions = [setSourceFeatureId(featureId)];
        testEpic(getFeatureDataGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1.type).toEqual(showErrorNotification().type);
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    name: "name",
                    search: {
                        url: "mockUrl"
                    }
                }]
            },
            geoProcessing: {
                source: {
                    layerId: "id"
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('setIntersectionFeatureId as vector', (done) => {
        const featureId = "ft-id2";
        const secondFt = {
            type: "Feature",
            id: "ft-id2",
            geometry: {
                type: "Point",
                coordinates: [11, 22]
            },
            features: undefined
        };
        const NUM_ACTIONS = 3;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);

        const startActions = [setIntersectionFeatureId(featureId)];
        testEpic(getIntersectionFeatureDataGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3
            ] = actions;
            expect(action1.type).toEqual(setIntersectionFeature().type);
            expect(action1.feature).toEqual(secondFt);
            expect(action2.type).toEqual(updateAdditionalLayer().type);
            expect(action2.options.features).toEqual([{
                ...secondFt,
                style: {
                    color: "#3388ff",
                    dashArray: "",
                    fillColor: "#3388ff",
                    fillOpacity: 0.2,
                    weight: 4
                }}]);
            expect(action3.type).toEqual(zoomToExtent().type);

            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    name: "name",
                    type: "vector",
                    features: [{
                        type: "Feature",
                        id: "ft-id",
                        geometry: {
                            type: "Point",
                            coordinates: [1, 2]
                        }
                    },
                    secondFt]
                }]
            },
            geoProcessing: {
                intersection: {
                    layerId: "id"
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('setIntersectionFeatureId', (done) => {
        const featureId = "INCENDI_INTERFACCIA.2955";
        const NUM_ACTIONS = 3;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);

        const startActions = [setIntersectionFeatureId(featureId)];
        testEpic(getIntersectionFeatureDataGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3
            ] = actions;
            expect(action1.type).toEqual(setIntersectionFeature().type);
            expect(action2.type).toEqual(updateAdditionalLayer().type);
            expect(action3.type).toEqual(zoomToExtent().type);
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    name: "name",
                    type: "wfs",
                    search: {
                        type: "wfs",
                        url: "mockUrl"
                    }
                }]
            },
            geoProcessing: {
                intersection: {
                    layerId: "id"
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('setIntersectionFeatureId with error', (done) => {
        const featureId = "ft-id";
        const NUM_ACTIONS = 1;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(500, GET_FEATURES);

        const startActions = [setIntersectionFeatureId(featureId)];
        testEpic(getIntersectionFeatureDataGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1.type).toEqual(showErrorNotification().type);
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    name: "name",
                    search: {
                        url: "mockUrl"
                    }
                }]
            },
            geoProcessing: {
                intersection: {
                    layerId: "id"
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('runBufferProcess with geom collect', (done) => {
        const NUM_ACTIONS = 6;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);
        mockAxios.onPost("mockUrl?service=WPS&version=1.0.0&REQUEST=Execute").reply(200, COLLECT_GEOM, {
            "content-type": "application/json"
        });

        const startActions = [runProcess(GPT_TOOL_BUFFER)];
        testEpic(addTimeoutEpic(runBufferProcessGPTEpic, 100), NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3,
                action4,
                action5,
                action6
            ] = actions;
            expect(action1).toEqual(runningProcess(true));
            expect(action2.type).toEqual(addGroup().type);
            expect(action3.type).toEqual(addLayer().type);
            expect(action4.type).toEqual(zoomToExtent().type);
            expect(action5.type).toEqual(showSuccessNotification().type);
            expect(action6).toEqual(runningProcess(false));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    name: "name",
                    type: "wfs",
                    search: {
                        type: "wfs",
                        url: "mockUrl"
                    }
                }]
            },
            geoProcessing: {
                source: {
                    layerId: "id"
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('runBufferProcess without geom collect', (done) => {
        const NUM_ACTIONS = 6;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);
        mockAxios.onPost("mockUrl?service=WPS&version=1.0.0&REQUEST=Execute").reply(200, COLLECT_GEOM, {
            "content-type": "application/json"
        });
        const startActions = [runProcess(GPT_TOOL_BUFFER)];
        testEpic(addTimeoutEpic(runBufferProcessGPTEpic, 100), NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3,
                action4,
                action5,
                action6
            ] = actions;
            expect(action1).toEqual(runningProcess(true));
            expect(action2.type).toEqual(addGroup().type);
            expect(action3.type).toEqual(addLayer().type);
            expect(action4.type).toEqual(zoomToExtent().type);
            expect(action5.type).toEqual(showSuccessNotification().type);
            expect(action6).toEqual(runningProcess(false));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    type: "wfs",
                    name: "name",
                    search: {
                        type: "wfs",
                        url: "mockUrl"
                    }
                }]
            },
            geoProcessing: {
                source: {
                    layerId: "id",
                    featureId: "ft-id",
                    features: [{
                        type: "Feature",
                        id: "ft-id",
                        geometry: {
                            type: "Point",
                            coordinates: [1, 2]
                        }
                    }],
                    feature: {
                        id: "ft-id",
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [1, 2]
                        }
                    }
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('runBufferProcess with geom collect as vector layer', (done) => {
        const NUM_ACTIONS = 6;
        mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);
        mockAxios.onPost("mockUrl?service=WPS&version=1.0.0&REQUEST=Execute").reply(200, COLLECT_GEOM, {
            "content-type": "application/json"
        });

        const startActions = [runProcess(GPT_TOOL_BUFFER)];
        testEpic(addTimeoutEpic(runBufferProcessGPTEpic, 100), NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3,
                action4,
                action5,
                action6
            ] = actions;
            expect(action1).toEqual(runningProcess(true));
            expect(action2.type).toEqual(addGroup().type);
            expect(action3.type).toEqual(addLayer().type);
            expect(action4.type).toEqual(zoomToExtent().type);
            expect(action5.type).toEqual(showSuccessNotification().type);
            expect(action6).toEqual(runningProcess(false));
            done();
        }, {
            layers: {
                flat: [{
                    id: "id",
                    type: "vector",
                    features: [{type: "Feature", geometry: {type: "Point", coordinates: [1, 2]}}],
                    url: "mockUrl",
                    name: "name",
                    search: {
                        url: "mockUrl"
                    }
                }]
            },
            geoProcessing: {
                source: {
                    layerId: "id"
                },
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('resetSourceHighlightGPTEpic triggered by emptying the feature', (done) => {
        const NUM_ACTIONS = 1;
        const startActions = [setSourceFeatureId("")];
        testEpic(resetSourceHighlightGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1).toEqual(removeAdditionalLayer({id: "gpt-layer"}));
            done();
        }, {});
    });
    it('resetSourceHighlightGPTEpic triggered by emptying the layer', (done) => {
        const NUM_ACTIONS = 1;
        const startActions = [setSourceLayerId("")];
        testEpic(resetSourceHighlightGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1).toEqual(removeAdditionalLayer({id: "gpt-layer"}));
            done();
        }, {});
    });
    it('resetIntersectHighlightGPTEpic triggered by emptying the feature', (done) => {
        const NUM_ACTIONS = 1;
        const startActions = [setIntersectionFeatureId("")];
        testEpic(resetIntersectHighlightGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1).toEqual(removeAdditionalLayer({id: "gpt-layer-intersection"}));
            done();
        }, {});
    });
    it('resetIntersectHighlightGPTEpic triggered by emptying the layer', (done) => {
        const NUM_ACTIONS = 1;
        const startActions = [setIntersectionLayerId("")];
        testEpic(resetIntersectHighlightGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1).toEqual(removeAdditionalLayer({id: "gpt-layer-intersection"}));
            done();
        }, {});
    });
    it.skip('runIntersectProcessGPTEpic with double geom collect', (done) => {
        try {
            const NUM_ACTIONS = 6;
            mockAxios.onGet("mockUrl?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);
            mockAxios
                .onPost("mockUrl?service=WPS&version=1.0.0&REQUEST=Execute")
                .replyOnce(200, COLLECT_GEOM, {
                    "content-type": "application/json"
                })
                .onPost("mockUrl?service=WPS&version=1.0.0&REQUEST=Execute")
                .replyOnce(200, MULTIPOLYGON_FC, {
                    "content-type": "application/json"
                });
            mockAxios.onGet("mockUrl2?service=WFS&version=1.1.0&request=GetFeature").reply(200, GET_FEATURES);
            mockAxios.onPost("mockUrl2?service=WPS&version=1.0.0&REQUEST=Execute").replyOnce(200, COLLECT_GEOM, {
                "content-type": "application/json"
            });

            const startActions = [runProcess(GPT_TOOL_INTERSECTION)];
            testEpic(addTimeoutEpic(runIntersectProcessGPTEpic, 100), NUM_ACTIONS, startActions, actions => {
                expect(actions.length).toBe(NUM_ACTIONS);
                const [
                    action1,
                    action2,
                    action3,
                    action4,
                    action5,
                    action6
                ] = actions;
                expect(action1).toEqual(runningProcess(true));
                expect(action2.type).toEqual(addGroup().type);
                expect(action3.type).toEqual(addLayer().type);
                expect(action4.type).toEqual(zoomToExtent().type);
                expect(action5.type).toEqual(showSuccessNotification().type);
                expect(action6).toEqual(runningProcess(false));
                done();
            }, {
                layers: {
                    flat: [{
                        id: "id",
                        url: "mockUrl",
                        name: "name",
                        search: {
                            url: "mockUrl"
                        }
                    },
                    {
                        id: "id2",
                        url: "mockUrl2",
                        name: "name2",
                        search: {
                            url: "mockUrl2"
                        }
                    }]
                },
                geoProcessing: {
                    source: {
                        layerId: "id"
                    },
                    intersection: {
                        layerId: "id2"
                    },
                    flags: {
                        showHighlightLayers: true
                    }
                }
            });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
            done(e);
        }
    });
    it('toggleHighlightLayersGPTEpic', (done) => {
        const NUM_ACTIONS = 1;
        const startActions = [toggleHighlightLayers()];
        testEpic(toggleHighlightLayersGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1).toEqual(mergeOptionsByOwner("gpt", {
                visibility: false
            }));
            done();
        }, {});
    });
    it('disableIdentifyGPTEpic', (done) => {
        const NUM_ACTIONS = 4;
        const startActions = [setSelectedLayerType("source")];
        testEpic(disableIdentifyGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3,
                action4
            ] = actions;
            expect(action1).toEqual(purgeMapInfoResults());
            expect(action2).toEqual(hideMapinfoMarker());
            expect(action3).toEqual(registerEventListener('click', GPT_CONTROL_NAME));
            expect(action4).toEqual(changeMapInfoState(false));
            done();
        }, {});
    });
    it('clickToSelectFeatureGPTEpic', (done) => {
        const NUM_ACTIONS = 3;
        mockAxios.onGet("mockUrl").reply(200, GET_FEATURES);
        mockAxios.onPost("mockUrl").reply(200, GET_FEATURES);
        const startActions = [clickOnMap(
            {"pixel": {"x": 886.132802012314, "y": 258.94771208154924}, "latlng": {"lat": 45.43047435636936, "lng": 5.298064452087015}, "rawPos": [589777.8369962705, 5689547.371628628], "modifiers": {"alt": false, "ctrl": false, "metaKey": false, "shift": false}, "intersectedFeatures": []
            })];
        testEpic(clickToSelectFeatureGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1,
                action2,
                action3
            ] = actions;
            expect(action1.type).toEqual(setSourceFeature().type);
            expect(action2.type).toEqual(setSourceFeatureId().type);
            expect(action3.type).toEqual(showSuccessNotification().type);

            done();
        }, {
            geoProcessing: {
                selectedLayerId: "id",
                selectedLayerType: "source",
                source: {
                    layerId: "id"
                }
            },
            map: {
                present: {
                    projection: "EPSG:900913",
                    bbox: {
                        bounds: {
                            maxx: 1114971.8874426293,
                            maxy: 5847892.920370701,
                            minx: 47910.972581568756,
                            miny: 5342185.541235975
                        }
                    },
                    center: {x: 5.2231772340017955, y: 44.83153649936639, crs: 'EPSG:4326'},
                    zoom: 8,
                    resolution: 611.49622628141,
                    eventListeners: {
                        click: [GPT_CONTROL_NAME]
                    }
                }
            },
            layers: {
                flat: [{
                    id: "id",
                    url: "mockUrl",
                    name: "name",
                    type: "wms",
                    search: {
                        type: "wfs",
                        url: "mockUrl"
                    }
                }]
            }
        });
    });
    it('LPlongitudinalMapLayoutGPTEpic', (done) => {
        const NUM_ACTIONS = 1;
        const startActions = [updateMapLayout("test")];
        testEpic(LPlongitudinalMapLayoutGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1.type).toEqual(updateMapLayout().type);
            done();
        }, {
            controls: {
                GeoProcessing: {
                    enabled: true
                }
            }
        });
    });

    it('toggleHighlightLayersOnOpenCloseGPTEpic closing tool', (done) => {
        const NUM_ACTIONS = 1;
        const startActions = [toggleControl(GPT_CONTROL_NAME)];
        testEpic(toggleHighlightLayersOnOpenCloseGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1.type).toEqual(mergeOptionsByOwner().type);
            expect(action1.options.visibility).toEqual(false);
            done();
        }, {
            additionallayers: [{
                id: "gpt-layer-intersection",
                owner: "gpt",
                actionType: "overlay",
                options: {
                    visibility: true
                }
            }
            ],
            controls: {
                GeoProcessing: {
                    enabled: false
                }
            },
            geoProcessing: {
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
    it('toggleHighlightLayersOnOpenCloseGPTEpic closing tool', (done) => {
        const NUM_ACTIONS = 1;
        const startActions = [toggleControl(GPT_CONTROL_NAME)];
        testEpic(toggleHighlightLayersOnOpenCloseGPTEpic, NUM_ACTIONS, startActions, actions => {
            expect(actions.length).toBe(NUM_ACTIONS);
            const [
                action1
            ] = actions;
            expect(action1.type).toEqual(updateAdditionalLayer().type);
            expect(action1.options.visibility).toEqual(true);
            done();
        }, {
            additionallayers: [{
                id: "gpt-layer-intersection",
                owner: "gpt",
                actionType: "overlay",
                options: {
                    visibility: false
                }
            }, {
                id: "gpt-layer",
                owner: "gpt",
                actionType: "overlay",
                options: {
                    visibility: true
                }
            }],
            controls: {
                GeoProcessing: {
                    enabled: true
                }
            },
            geoProcessing: {
                selectedTool: GPT_TOOL_BUFFER,
                flags: {
                    showHighlightLayers: true
                }
            }
        });
    });
});
