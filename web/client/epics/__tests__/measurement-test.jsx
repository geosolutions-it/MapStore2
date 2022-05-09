/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { addTimeoutEpic, testEpic } from './epicTestUtils';
import { addAnnotationFromMeasureEpic, addAsLayerEpic, openMeasureEpic, setMeasureStateFromAnnotationEpic, closeMeasureEpics, addCoordinatesEpic } from '../measurement';
import {addAnnotation, addAsLayer, setAnnotationMeasurement} from '../../actions/measurement';
import { clickOnMap } from '../../actions/map';
import {setControlProperty, toggleControl} from '../../actions/controls';

describe('measurement epics', () => {
    const testData = {
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [
                            -144.6328125,
                            41.31082267209039
                        ],
                        [
                            -108.3515635728836,
                            48.795285183486584
                        ],
                        [
                            -95.62499678134918,
                            35.18817511540887
                        ]
                    ],
                    "textLabels": [
                        {
                            "text": "2,937,911.16 m | 061.17°",
                            "position": [
                                -127.53661546263791,
                                46.54526898530547
                            ]
                        },
                        {
                            "text": "1,837,281.12 m | 140.72°",
                            "position": [
                                -101.23884662739748,
                                42.09680198161091
                            ]
                        }
                    ]
                },
                "properties": {
                    "values": [
                        {
                            "value": 4775192.28,
                            "formattedValue": "4,775,192.28 m",
                            "position": [
                                -95.62499678134918,
                                35.18817511540887
                            ],
                            "type": "length"
                        }
                    ]
                }
            }
        ],
        "textLabels": [
            {
                "text": "2,937,911.16 m | 061.17°",
                "position": [
                    -127.53661546263791,
                    46.54526898530547
                ]
            },
            {
                "text": "1,837,281.12 m | 140.72°",
                "position": [
                    -101.23884662739748,
                    42.09680198161091
                ]
            }
        ],
        "uom": {
            "length": {
                "unit": "m",
                "label": "m"
            },
            "area": {
                "unit": "sqm",
                "label": "m²"
            }
        }
    };

    it('test addAnnotationFromMeasureEpic', (done) => {
        const NUMBER_OF_ACTIONS = 4;
        const {textLabels, features, uom} = testData;

        testEpic(
            addTimeoutEpic(addAnnotationFromMeasureEpic, 10),
            NUMBER_OF_ACTIONS, [
                addAnnotation(features, textLabels, uom, false, {id: 1})
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[0].type).toBe("TOGGLE_CONTROL");
                expect(actions[1].type).toBe("ANNOTATIONS:NEW");
                expect(actions[2].type).toBe("MEASUREMENT:SET_MEASUREMENT_CONFIG");
                expect(actions[2].property).toBe("exportToAnnotation");
                expect(actions[2].value).toBe(false);
                expect(actions[3].type).toBe("ANNOTATIONS:SET_EDITING_FEATURE");
                expect(actions[3].feature.features).toBeTruthy();
                expect(actions[3].feature.features.length).toBe(4);
                expect(actions[3].feature.features[0].geometry.type).toBe("LineString");
                expect(actions[3].feature.features[1].geometry.type).toBe("Point");
                expect(actions[3].feature.features[2].geometry.type).toBe("Point");
                expect(actions[3].feature.features[3].geometry.type).toBe("Point");
                expect(actions[3].feature.properties.id).toBe(1);
                expect(actions[3].feature.visibility).toBe(true);
                done();
            }, null);
    });
    it('test addAnnotationFromMeasureEpic with textLabels', (done) => {
        const NUMBER_OF_ACTIONS = 4;
        const {textLabels, features, uom} = testData;

        testEpic(
            addTimeoutEpic(addAnnotationFromMeasureEpic, 10),
            NUMBER_OF_ACTIONS, [
                addAnnotation(features, textLabels, uom, true, {id: 1, visibility: false})
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                const resultFeatures = actions[3].feature.features;
                const properties = actions[3].feature.properties;
                const style = actions[3].feature.style;
                expect(resultFeatures).toExist();
                expect(properties).toExist();
                expect(style).toExist();
                expect(resultFeatures.length).toBe(4);
                expect(resultFeatures[0].geometry).toExist();
                expect(resultFeatures[0].geometry.textLabels).toExist();
                expect(resultFeatures[0].geometry.textLabels[0].text).toBe("2,937,911.16 m | 061.17°");
                expect(resultFeatures[0].geometry.textLabels[1].text).toBe("1,837,281.12 m | 140.72°");
                expect(resultFeatures[0].properties).toExist();
                expect(resultFeatures[0].properties.geometryGeodesic).toExist();
                expect(actions[3].feature.visibility).toBe(false);
                done();
            }, null);
    });
    it('test addAsLayerEpic', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const {textLabels, features, uom} = testData;

        testEpic(
            addTimeoutEpic(addAsLayerEpic, 10),
            NUMBER_OF_ACTIONS, [
                addAsLayer(features, textLabels, uom)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[0].type).toBe("ADD_LAYER");
                const resultFeatures = actions[0].layer.features;
                expect(resultFeatures).toExist();
                expect(resultFeatures.length).toBe(1);
                const innerFeatures = resultFeatures[0].features;
                expect(innerFeatures.length).toBe(4);
                expect(innerFeatures[0].geometry).toExist();
                expect(innerFeatures[0].geometry.type).toBe('LineString');
                expect(innerFeatures[0].geometry.textLabels).toExist();
                expect(innerFeatures[0].geometry.textLabels[0].text).toBe("2,937,911.16 m | 061.17°");
                expect(innerFeatures[0].geometry.textLabels[1].text).toBe("1,837,281.12 m | 140.72°");
                done();
            }, null);
    });
    it('test addAsLayerEpic with textLabels', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const {textLabels, features, uom} = testData;

        testEpic(
            addTimeoutEpic(addAsLayerEpic, 10),
            NUMBER_OF_ACTIONS, [
                addAsLayer(features, textLabels, uom)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[0].type).toBe("ADD_LAYER");
                done();
            }, null);
    });
    it('test openMeasureEpic', (done) => {
        const NUMBER_OF_ACTIONS = 3;
        const state = {
            controls: {
                measure: {
                    enabled: true,
                    showCoordinateEditor: true
                }
            }
        };

        testEpic(
            addTimeoutEpic(openMeasureEpic, 10),
            NUMBER_OF_ACTIONS, [
                setControlProperty("measure", "enabled", true)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[0].type).toBe("FEATUREGRID:CLOSE_GRID");
                expect(actions[1].type).toBe("PURGE_MAPINFO_RESULTS");
                expect(actions[2].type).toBe("HIDE_MAPINFO_MARKER");
                done();
            }, state);
    });
    it('test setMeasureStateFromAnnotationEpic', (done) => {
        const NUMBER_OF_ACTIONS = 4;
        const state = {
            controls: {
                measure: {
                    showCoordinateEditor: true
                }
            }
        };

        testEpic(
            addTimeoutEpic(setMeasureStateFromAnnotationEpic, 10),
            NUMBER_OF_ACTIONS, [
                setAnnotationMeasurement([{type: 'Feature', geometry: {type: "LineString"}, properties: {id: 1}}], 1)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[1].type).toBe("SET_CONTROL_PROPERTY");
                expect(actions[1].control).toBe("measure");
                expect(actions[1].property).toBe("enabled");
                expect(actions[1].value).toBe(true);
                expect(actions[2].type).toBe("SET_CONTROL_PROPERTY");
                expect(actions[2].control).toBe("annotations");
                expect(actions[2].property).toBe("enabled");
                expect(actions[2].value).toBe(false);
                expect(actions[3].type).toBe("ANNOTATIONS:VISIBILITY");
                expect(actions[3].visibility).toBe(false);
                done();
            }, state);
    });
    it('test closeMeasureEpics', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const state = {
            controls: {
                measure: {
                    showCoordinateEditor: true,
                    enabled: false
                }
            }
        };

        testEpic(
            addTimeoutEpic(closeMeasureEpics, 10),
            NUMBER_OF_ACTIONS, [
                toggleControl('measure', null)
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[0].type).toBe("ANNOTATIONS:CLEAN_HIGHLIGHT");
                done();
            }, state);
    });
    it('test addCoordinatesEpic', (done) => {
        const NUMBER_OF_ACTIONS = 1;
        const state = {
            controls: {
                measure: {
                    showCoordinateEditor: true,
                    enabled: true
                }
            },
            measurement: {
                currentFeature: 0,
                features: [{
                    type: "Feature",
                    geometry: {type: "LineString", coordinates: [[1, 2], [2, 3], ["", ""]], textLabels: [{text: "1m"}, {text: "0"}]},
                    properties: {values: [{value: 1154.583, formattedValue: "10 m", position: [1, 2], type: "length"}]}
                }],
                geomType: "LineString"
            }
        };

        testEpic(
            addTimeoutEpic(addCoordinatesEpic, 10),
            NUMBER_OF_ACTIONS, [
                clickOnMap({latlng: {lng: 3, lat: 4}})
            ], actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[0].type).toBe("MEASUREMENT:CHANGE_COORDINATES");
                expect(actions[0].coordinates).toEqual([{"lon": 1, "lat": 2}, {"lon": 2, "lat": 3}, {"lon": 3, "lat": 4}]);
                done();
            }, state);
    });
});
