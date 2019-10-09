/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
const {openQueryBuilder, discardCurrentFilter, applyFilter} = require('../../actions/layerFilter');
const {QUERY_FORM_SEARCH} = require('../../actions/queryform');
const {testEpic} = require('./epicTestUtils');

const {handleLayerFilterPanel, restoreSavedFilter, onApplyFilter} = require('../layerfilter');

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
            flat: [{id: "topp:states__5", name: "topp:states", url: "url"}],
            selected: ["topp:states__5"]}
        };
        testEpic(handleLayerFilterPanel, 6, action, (actions) => {
            expect(actions[0].type).toBe("FEATURE_TYPE_SELECTED");
            expect(actions[0].url).toBe("url");
            expect(actions[1].type).toBe("QUERYFORM:LOAD_FILTER");
            expect(actions[2].type).toBe("LAYER_FILTER:INIT_LAYER_FILTER");
            expect(actions[3].type).toBe("SET_CONTROL_PROPERTY");
            expect(actions[4].type).toBe("QUERY:TOGGLE_LAYER_FILTER");
            expect(actions[5].type).toBe("CHANGE_LAYER_PROPERTIES");
            done();

        }, state);
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
});
