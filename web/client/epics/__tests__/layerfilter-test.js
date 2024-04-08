/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { openQueryBuilder, discardCurrentFilter, applyFilter, layerFilterByLegend, resetLegendFilter } from '../../actions/layerFilter';
import { QUERY_FORM_SEARCH } from '../../actions/queryform';
import { testEpic } from './epicTestUtils';
import { handleLayerFilterPanel, restoreSavedFilter, onApplyFilter, applyCQLFilterBasedOnLegendFilter, applyResetLegendFilter } from '../layerfilter';

describe('layerFilter Epics', () => {
    it("handleLayerFilterPanel is correctly initiated and react to QUERY_FORM_SEARCH", (done) => {
        let action = [openQueryBuilder(), {type: QUERY_FORM_SEARCH}];

        // State need a selected layers
        const state = {layers: {
            flat: [{id: "topp:states__5", name: "topp:states", search: {url: "searchUrl"}, url: "url"}],
            selected: ["topp:states__5"]}
        };
        testEpic(handleLayerFilterPanel, 6, action, (actions) => {
            expect(actions[0].type).toBe("FEATURE_TYPE_SELECTED");
            expect(actions[0].url).toBe("searchUrl");
            expect(actions[1].type).toBe("QUERYFORM:LOAD_FILTER");
            expect(actions[2].type).toBe("LAYER_FILTER:INIT_LAYER_FILTER");
            expect(actions[3].type).toBe("SET_CONTROL_PROPERTY");
            expect(actions[4].type).toBe("QUERY:TOGGLE_LAYER_FILTER");
            expect(actions[5].type).toBe("CHANGE_LAYER_PROPERTIES");
            done();

        }, state);
    });
    it("handleLayerFilterPanel is correctly initiated and react to QUERY_FORM_SEARCH, no search url", (done) => {
        let action = [openQueryBuilder(), {type: QUERY_FORM_SEARCH}];

        // State need a selected layers
        const state = {layers: {
            flat: [{id: "topp:states__5", name: "topp:states", url: "url", fields: [{name: "STATE_NAME", type: "string", alias: "State Name"}]}],
            selected: ["topp:states__5"]}
        };
        testEpic(handleLayerFilterPanel, 6, action, ([featureTypeSelected, loadFilter, initLayerFilter, setControlProperty, toggleLayerFilter, changeLayerProperties]) => {
            expect(featureTypeSelected.type).toBe("FEATURE_TYPE_SELECTED");
            expect(featureTypeSelected.url).toBe("url");
            expect(featureTypeSelected.typeName).toBe("topp:states");
            expect(featureTypeSelected.fields).toEqual([{name: "STATE_NAME", type: "string", alias: "State Name"}]);

            expect(loadFilter.type).toBe("QUERYFORM:LOAD_FILTER");
            expect(initLayerFilter.type).toBe("LAYER_FILTER:INIT_LAYER_FILTER");
            expect(setControlProperty.type).toBe("SET_CONTROL_PROPERTY");
            expect(toggleLayerFilter.type).toBe("QUERY:TOGGLE_LAYER_FILTER");
            expect(changeLayerProperties.type).toBe("CHANGE_LAYER_PROPERTIES");
            done();

        }, state);
    });
    it('handleLayerFilterPanel with fields', () => {

    });
    it("restoreSavedFilter throws correct action", (done) => {
        let action = discardCurrentFilter();

        // State need a selected layers
        testEpic(restoreSavedFilter, 4, action, (actions) => {
            expect(actions[0].type).toBe("CHANGE_DRAWING_STATUS");
            expect(actions[1].type).toBe("QUERYFORM:LOAD_FILTER");
            expect(actions[2].type).toBe("QUERY_FORM_SEARCH");
            expect(actions[3].type).toBe("INIT_QUERY_PANEL");
            done();

        });
    });
    it("onApplyFilter throws correct action", (done) => {
        let action = applyFilter();

        // State need a selected layers
        testEpic(onApplyFilter, 1, action, (actions) => {
            expect(actions[0].type).toBe("LAYER_FILTER:APPLIED_FILTER");
            done();

        });
    });

    it("applyCQLFilterBasedOnLegendFilter to apply legend filter", (done) => {
        let action = [layerFilterByLegend('topp:states__5', 'layers', "[FIELD_01 >= '5' AND FIELD_01 < '1']")];

        // State need a selected layers
        const state = {layers: {
            flat: [{id: "topp:states__5", name: "topp:states", search: {url: "searchUrl"}, url: "url"}],
            selected: ["topp:states__5"]}
        };
        testEpic(applyCQLFilterBasedOnLegendFilter, 3, action, (actions) => {
            expect(actions[0].type).toBe("QUERY_FORM_SEARCH");
            expect(actions[0].searchUrl).toBe("searchUrl");
            expect(actions[0].filterObj.filters[0].id).toBe("interactiveLegend");
            expect(actions[1].type).toBe("CHANGE_LAYER_PROPERTIES");
            expect(actions[2].type).toBe("LAYER_FILTER:APPLIED_FILTER");
            done();

        }, state);
    });

    it("applyCQLFilterBasedOnLegendFilter to reset legend filter", (done) => {
        let action = [layerFilterByLegend('topp:states__5', 'layers', "")];

        // State need a selected layers
        const state = {
            layers: {
                flat: [{id: "topp:states__5", name: "topp:states", search: {url: "searchUrl"}, url: "url",
                    enableInteractiveLegend: true,
                    layerFilter: {
                        filters: [
                            {
                                "id": "interactiveLegend",
                                "format": "logic",
                                "version": "1.0.0",
                                "logic": "AND",
                                "filters": [
                                    {
                                        "format": "cql",
                                        "version": "1.0.0",
                                        "body": "FIELD_01 >= '5' AND FIELD_01 < '1'",
                                        "id": "[FIELD_01 >= '5' AND FIELD_01 < '1']"
                                    }
                                ]
                            }
                        ]
                    }}],
                selected: ["topp:states__5"]
            }
        };
        testEpic(applyCQLFilterBasedOnLegendFilter, 3, action, (actions) => {
            expect(actions[0].type).toBe("QUERY_FORM_SEARCH");
            expect(actions[0].searchUrl).toBe("searchUrl");
            expect(actions[0].filterObj).toBe(undefined);
            expect(actions[1].type).toBe("CHANGE_LAYER_PROPERTIES");
            expect(actions[2].type).toBe("LAYER_FILTER:APPLIED_FILTER");
            done();

        }, state);
    });

    it("applyResetLegendFilter to reset legend filter in case change 'style' for wms", (done) => {
        let action = [resetLegendFilter('style', 'style_02')];

        // State need a selected layers
        const state = {
            layers: {
                flat: [{id: "topp:states__5", name: "topp:states", search: {url: "searchUrl"}, url: "url", type: 'wms',
                    enableInteractiveLegend: true,
                    style: 'style_01',
                    layerFilter: {
                        filters: [
                            {
                                "id": "interactiveLegend",
                                "format": "logic",
                                "version": "1.0.0",
                                "logic": "AND",
                                "filters": [
                                    {
                                        "format": "cql",
                                        "version": "1.0.0",
                                        "body": "FIELD_01 >= '5' AND FIELD_01 < '1'",
                                        "id": "[FIELD_01 >= '5' AND FIELD_01 < '1']"
                                    }
                                ]
                            }
                        ]
                    }}],
                selected: ["topp:states__5"]
            }
        };
        testEpic(applyResetLegendFilter, 3, action, (actions) => {
            expect(actions[0].type).toBe("QUERY_FORM_SEARCH");
            expect(actions[0].searchUrl).toBe("searchUrl");
            expect(actions[0].filterObj).toBe(undefined);
            expect(actions[1].type).toBe("CHANGE_LAYER_PROPERTIES");
            expect(actions[2].type).toBe("LAYER_FILTER:APPLIED_FILTER");
            done();

        }, state);
    });
    it("applyResetLegendFilter to reset legend filter in case change 'style' for wfs", (done) => {
        let action = [resetLegendFilter('style', '{"rules":[{"name":"Style 01 wfs","ruleId2":"ruleId","symbolizers":[{"kind":"Fill","color":"#0920ff","fillOpacity":1,"outlineColor":"#3075e9","outlineOpacity":1,"outlineWidth":2,"symbolizerId":"symbolizerId1"}]}]}')];

        // State need a selected layers
        const state = {
            layers: {
                flat: [{id: "topp:states__5", name: "topp:states", search: {url: "searchUrl"}, url: "url", type: 'wfs',
                    enableInteractiveLegend: true,
                    style: {
                        body: {}, format: 'geostyler', metadate: {
                            editorType: 'visual',
                            styleJSON: `{"rules": [{"name": "Style 02 wfs","ruleId":"ruleId2","symbolizers":[{"kind":"Fill","color":"#0920ff","fillOpacity":1,"outlineColor":"#3075e9","outlineOpacity":1,"outlineWidth":2,"symbolizerId":"symbolizerId2"}]}]}`
                        }
                    },
                    layerFilter: {
                        filters: [
                            {
                                "id": "interactiveLegend",
                                "format": "logic",
                                "version": "1.0.0",
                                "logic": "AND",
                                "filters": [
                                    {
                                        "format": "cql",
                                        "version": "1.0.0",
                                        "body": "FIELD_01 >= '5' AND FIELD_01 < '1'",
                                        "id": "[FIELD_01 >= '5' AND FIELD_01 < '1']"
                                    }
                                ]
                            }
                        ]
                    }}],
                selected: ["topp:states__5"]
            }
        };
        testEpic(applyResetLegendFilter, 3, action, (actions) => {
            expect(actions[0].type).toBe("QUERY_FORM_SEARCH");
            expect(actions[0].searchUrl).toBe("searchUrl");
            expect(actions[0].filterObj).toBe(undefined);
            expect(actions[1].type).toBe("CHANGE_LAYER_PROPERTIES");
            expect(actions[2].type).toBe("LAYER_FILTER:APPLIED_FILTER");
            done();

        }, state);
    });

    it("applyResetLegendFilter to reset legend filter in case change 'style' for vector", (done) => {
        let action = [resetLegendFilter('style', '{"rules":[{"name":"Style 01 vector","ruleId2":"ruleId","symbolizers":[{"kind":"Fill","color":"#0920ff","fillOpacity":1,"outlineColor":"#3075e9","outlineOpacity":1,"outlineWidth":2,"symbolizerId":"symbolizerId1"}]}]}')];

        // State need a selected layers
        const state = {
            layers: {
                flat: [{id: "topp:states__5", name: "topp:states", search: {url: "searchUrl"}, url: "url", type: 'vector',
                    enableInteractiveLegend: true,
                    style: {
                        body: {}, format: 'geostyler', metadate: {
                            editorType: 'visual',
                            styleJSON: `{"rules": [{"name": "Style 02 vector","ruleId":"ruleId2","symbolizers":[{"kind":"Fill","color":"#0920ff","fillOpacity":1,"outlineColor":"#3075e9","outlineOpacity":1,"outlineWidth":2,"symbolizerId":"symbolizerId2"}]}]}`
                        }
                    },
                    layerFilter: {
                        filters: [
                            {
                                "id": "interactiveLegend",
                                "format": "logic",
                                "version": "1.0.0",
                                "logic": "AND",
                                "filters": [
                                    {
                                        "format": "cql",
                                        "version": "1.0.0",
                                        "body": "FIELD_01 >= '5' AND FIELD_01 < '1'",
                                        "id": "[FIELD_01 >= '5' AND FIELD_01 < '1']"
                                    }
                                ]
                            }
                        ]
                    }}],
                selected: ["topp:states__5"]
            }
        };
        testEpic(applyResetLegendFilter, 3, action, (actions) => {
            expect(actions[0].type).toBe("QUERY_FORM_SEARCH");
            expect(actions[0].searchUrl).toBe("searchUrl");
            expect(actions[0].filterObj).toBe(undefined);
            expect(actions[1].type).toBe("CHANGE_LAYER_PROPERTIES");
            expect(actions[2].type).toBe("LAYER_FILTER:APPLIED_FILTER");
            done();

        }, state);
    });
});
