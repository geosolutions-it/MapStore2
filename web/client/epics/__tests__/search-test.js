
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {head, last} = require('lodash');

const configureMockStore = require('redux-mock-store').default;
const { createEpicMiddleware, combineEpics } = require('redux-observable');
const {
    textSearch,
    selectSearchItem,
    TEXT_SEARCH_RESULTS_LOADED,
    TEXT_SEARCH_LOADING,
    TEXT_SEARCH_ADD_MARKER,
    TEXT_SEARCH_RESULTS_PURGE,
    TEXT_SEARCH_NESTED_SERVICES_SELECTED,
    TEXT_SEARCH_TEXT_CHANGE,
    TEXT_SEARCH_ERROR,
    zoomAndAddPoint, ZOOM_ADD_POINT
} = require('../../actions/search');
const {CHANGE_MAP_VIEW, ZOOM_TO_POINT} = require('../../actions/map');
const {UPDATE_ADDITIONAL_LAYER} = require('../../actions/additionallayers');
const {searchEpic, searchItemSelected, zoomAndAddPointEpic } = require('../search');
const rootEpic = combineEpics(searchEpic, searchItemSelected, zoomAndAddPointEpic);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

const SEARCH_NESTED = 'SEARCH NESTED';
const TEST_NESTED_PLACEHOLDER = 'TEST_NESTED_PLACEHOLDER';
const STATE_NAME = 'STATE_NAME';

const {testEpic, addTimeoutEpic} = require('./epicTestUtils');

const nestedService = {
    nestedPlaceholder: TEST_NESTED_PLACEHOLDER
};
const TEXT = "Dinagat Islands";
const item = {
    "type": "Feature",
    "bbox": [125, 10, 126, 11],
    "geometry": {
        "type": "Point",
        "coordinates": [125.6, 10.1]
    },
    "properties": {
        "name": TEXT
    },
    "__SERVICE__": {
        searchTextTemplate: "${properties.name}",
        displayName: "${properties.name}",
        type: "wfs",
        options: {
            staticFilter: "${properties.name}"
        },
        nestedPlaceholder: SEARCH_NESTED,
        nestedPlaceholderMsgId: TEST_NESTED_PLACEHOLDER,
        then: [nestedService]
    }
};

describe('search Epics', () => {
    let store;
    beforeEach(() => {
        store = mockStore();
    });

    afterEach(() => {
        epicMiddleware.replaceEpic(rootEpic);
    });

    it('produces the search epic', (done) => {
        let action = {
            ...textSearch("TEST"),
            services: [{
                type: 'wfs',
                options: {
                    url: 'base/web/client/test-resources/wfs/Wyoming.json',
                    typeName: 'topp:states',
                    queriableAttributes: [STATE_NAME],
                    returnFullData: false
                }
            }]
        };

        store.dispatch( action );
        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length === 4) {
                expect(actions[1].type).toBe(TEXT_SEARCH_LOADING);
                expect(actions[2].type).toBe(TEXT_SEARCH_RESULTS_LOADED);
                expect(actions[3].type).toBe(TEXT_SEARCH_LOADING);
                done();
            }
        });
    });

    it('produces the selectSearchItem epic', () => {
        let action = selectSearchItem({
            "type": "Feature",
            "bbox": [125, 10, 126, 11],
            "geometry": {
                "type": "Point",
                "coordinates": [125.6, 10.1]
            },
            "properties": {
                "name": "Dinagat Islands"
            }
        }, {
            size: {
                width: 200,
                height: 200
            },
            projection: "EPSG:4326"
        });

        store.dispatch( action );

        let actions = store.getActions();
        expect(actions.length).toBe(4);
        expect(actions[1].type).toBe(TEXT_SEARCH_RESULTS_PURGE);
        expect(actions[2].type).toBe(CHANGE_MAP_VIEW);
        expect(actions[3].type).toBe(TEXT_SEARCH_ADD_MARKER);
    });

    it('searchItemSelected epic with nested services', () => {
        let action = selectSearchItem(item, {
            size: {
                width: 200,
                height: 200
            },
            projection: "EPSG:4326"
        });

        store.dispatch( action );

        let actions = store.getActions();
        expect(actions.length).toBe(6);
        let expectedActions = [CHANGE_MAP_VIEW, TEXT_SEARCH_ADD_MARKER, TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_NESTED_SERVICES_SELECTED, TEXT_SEARCH_TEXT_CHANGE ];
        let actionsType = actions.map(a => a.type);

        expectedActions.forEach((a) => {
            expect(actionsType.indexOf(a)).toNotBe(-1);
        });

        let testSearchNestedServicesSelectedAction = actions.filter(m => m.type === TEXT_SEARCH_NESTED_SERVICES_SELECTED)[0];
        expect(testSearchNestedServicesSelectedAction.services[0]).toEqual({
            ...nestedService,
            options: {
                item
            }
        });
        expect(testSearchNestedServicesSelectedAction.items).toEqual({
            placeholder: SEARCH_NESTED,
            placeholderMsgId: TEST_NESTED_PLACEHOLDER,
            text: TEXT
        });
        expect(actions.filter(m => m.type === TEXT_SEARCH_TEXT_CHANGE)[0].searchText).toBe(TEXT);
    });
    it('zoomAndAddPointEpic ADD addiditonalLayer and zoom to point', () => {
        let action = zoomAndAddPoint({x: 1, y: 0}, 10, "EPSG:4326");
        store.dispatch( action );
        let actions = store.getActions();
        expect(actions.length).toBe(3);
        let expectedActions = [ZOOM_ADD_POINT, UPDATE_ADDITIONAL_LAYER, ZOOM_TO_POINT ];
        let actionsType = actions.map(a => a.type);
        expectedActions.forEach((a) => {
            expect(actionsType.indexOf(a)).toNotBe(-1);
        });
    });

    it('geometry service', (done) => {
        // use the done function for asynchronus calls
        const itemWithoutGeom = {
            "type": "Feature",
            "properties": {
                "name": TEXT
            },
            "__SERVICE__": {
                searchTextTemplate: "${properties.name}",
                displayName: "${properties.name}",
                type: "wfs",
                options: {
                    staticFilter: "${properties.name}"
                },
                "geomService": {
                    type: 'wfs',
                    options: {
                        url: 'base/web/client/test-resources/wfs/Wyoming.json',
                        typeName: 'topp:states',
                        queriableAttributes: [STATE_NAME],
                        returnFullData: false
                    }
                }
            }
        };

        // needed for the changeMapView action
        let action = selectSearchItem(itemWithoutGeom, {
            size: {
                width: 200,
                height: 200
            },
            projection: "EPSG:4326"
        });

        store.dispatch( action );

        store.subscribe(() => {
            const actions = store.getActions();
            if (actions.length === 5) {
                const addMarkerAction = actions.filter(m => m.type === TEXT_SEARCH_ADD_MARKER)[0];

                expect(addMarkerAction).toExist();
                expect(addMarkerAction.markerPosition.geometry).toExist();

                done();
            }
        });
    });
    it('respond with correct service error when service type missing', (done) => {
        let action = {
            ...textSearch("TEST"),
            services: [{
                type: 'nom',
                options: {
                    url: 'base/web/client/test-resources/wfs/Wyoming.json',
                    typeName: 'topp:states',
                    queriableAttributes: [STATE_NAME],
                    returnFullData: false
                }
            }]
        };
        testEpic(searchEpic, 3, action, (actions) => {
            expect(actions).toExist();
            expect(actions[0].type).toBe(TEXT_SEARCH_LOADING);
            expect(actions.length).toBe(3);
            expect(actions[1].type).toBe(TEXT_SEARCH_ERROR);
            expect(actions[1].error).toExist();
            expect(actions[1].error.serviceType).toBe('nom');
            expect(actions[2].type).toBe(TEXT_SEARCH_LOADING);
            done();

        });
    });
    it('check the search result resorting is conservative and the number of results limited to maxResults', (done) => {
        const maxResults = 5;
        let action = {
            ...textSearch("TEST"),
            services: [{
                type: 'wfs',
                options: {
                    url: 'base/web/client/test-resources/wfs/Wyoming_18_results.json',
                    typeName: 'topp:states',
                    queriableAttributes: [STATE_NAME],
                    returnFullData: false
                }
            }],
            maxResults
        };

        const NUMBER_OF_ACTIONS = 4;
        testEpic(
            addTimeoutEpic(searchEpic, 100),
            NUMBER_OF_ACTIONS,
            [action],
            actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[1].type).toBe(TEXT_SEARCH_LOADING);
                expect(actions[2].type).toBe(TEXT_SEARCH_RESULTS_LOADED);
                expect(actions[2].results.length).toBe(maxResults);
                expect(head(actions[2].results).id).toBe("states.1");
                expect(last(actions[2].results).id).toBe("states.5");
                expect(actions[3].type).toBe(TEXT_SEARCH_LOADING);
                done();
            }, {});
    });
    it('produces the search epic with two services with more results than default limit', (done) => {
        const maxResults = 5;
        let action = {
            ...textSearch("TEST"),
            services: [{
                type: 'wfs',
                options: {
                    url: 'base/web/client/test-resources/wfs/Wyoming_18_results.json',
                    typeName: 'topp:states',
                    queriableAttributes: [STATE_NAME],
                    returnFullData: false
                }
            },
            {
                type: 'wfs',
                options: {
                    url: 'base/web/client/test-resources/wfs/Arizona_18_results.json',
                    typeName: 'topp:states',
                    queriableAttributes: [STATE_NAME],
                    returnFullData: false
                }
            }],
            maxResults
        };

        const NUMBER_OF_ACTIONS = 5;
        testEpic(
            addTimeoutEpic(searchEpic, 100),
            NUMBER_OF_ACTIONS,
            [action],
            actions => {
                expect(actions.length).toBe(NUMBER_OF_ACTIONS);
                expect(actions[1].type).toBe(TEXT_SEARCH_LOADING);
                expect(actions[2].type).toBe(TEXT_SEARCH_RESULTS_LOADED);
                expect(actions[2].results.length).toBe(maxResults);
                expect(head(actions[2].results).id).toBe("states.1");
                expect(last(actions[2].results).id).toBe("states.5");
                expect(actions[3].type).toBe(TEXT_SEARCH_RESULTS_LOADED);
                expect(actions[3].results.length).toBe(maxResults);
                expect(head(actions[3].results).id).toBe("states.1");
                expect(last(actions[3].results).id).toBe("states.5");
                expect(actions[4].type).toBe(TEXT_SEARCH_LOADING);
                done();
            }, {});
    });
});
