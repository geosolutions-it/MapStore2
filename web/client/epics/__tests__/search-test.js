
/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');

const configureMockStore = require('redux-mock-store').default;
const { createEpicMiddleware, combineEpics } = require('redux-observable');
const { textSearch, selectSearchItem, TEXT_SEARCH_RESULTS_LOADED, TEXT_SEARCH_LOADING, TEXT_SEARCH_ADD_MARKER, TEXT_SEARCH_RESULTS_PURGE, TEXT_SEARCH_NESTED_SERVICES_SELECTED, TEXT_SEARCH_TEXT_CHANGE } = require('../../actions/search');
const {CHANGE_MAP_VIEW} = require('../../actions/map');
const {searchEpic, searchItemSelected } = require('../search');
const rootEpic = combineEpics(searchEpic, searchItemSelected);
const epicMiddleware = createEpicMiddleware(rootEpic);
const mockStore = configureMockStore([epicMiddleware]);

const SEARCH_NESTED = 'SEARCH NESTED';
const TEST_NESTED_PLACEHOLDER = 'TEST_NESTED_PLACEHOLDER';
const STATE_NAME = 'STATE_NAME';

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
                    queriableAttributes: [STATE_NAME]
                }
            }]
        };

        store.dispatch( action );

        setTimeout(() => {
            let actions = store.getActions();
            expect(actions.length).toBe(4);
            expect(actions[1].type).toBe(TEXT_SEARCH_LOADING);
            expect(actions[2].type).toBe(TEXT_SEARCH_RESULTS_LOADED);
            expect(actions[3].type).toBe(TEXT_SEARCH_LOADING);
            done();
        }, 400);
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
        expect(actions[1].type).toBe(CHANGE_MAP_VIEW);
        expect(actions[2].type).toBe(TEXT_SEARCH_ADD_MARKER);
        expect(actions[3].type).toBe(TEXT_SEARCH_RESULTS_PURGE);
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
        expect(actions[1].type).toBe(CHANGE_MAP_VIEW);
        expect(actions[2].type).toBe(TEXT_SEARCH_ADD_MARKER);
        expect(actions[3].type).toBe(TEXT_SEARCH_RESULTS_PURGE);
        expect(actions[4].type).toBe(TEXT_SEARCH_NESTED_SERVICES_SELECTED);
        expect(actions[4].services[0]).toEqual({
            ...nestedService,
            options: {
                item
            }
        });
        expect(actions[4].items).toEqual({
            placeholder: SEARCH_NESTED,
            placeholderMsgId: TEST_NESTED_PLACEHOLDER,
            text: TEXT
        });
        expect(actions[5].type).toBe(TEXT_SEARCH_TEXT_CHANGE);
        expect(actions[5].searchText).toBe(TEXT);
    });

    it('searchItemSelected with geomService', () => {
        const itemWithoutGeom = {
              "type": "Feature",
              "bbox": [125, 10, 126, 11],
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
                        queriableAttributes: [STATE_NAME]
                    }
                },
                nestedPlaceholder: SEARCH_NESTED,
                nestedPlaceholderMsgId: TEST_NESTED_PLACEHOLDER
            }
        };

        let action = selectSearchItem(itemWithoutGeom, {
            size: {
                width: 200,
                height: 200
            },
            services: [{
                type: 'wfs',
                options: {
                    url: 'base/web/client/test-resources/wfs/Wyoming.json',
                    typeName: 'topp:states',
                    queriableAttributes: [STATE_NAME]
                }
            }],
            projection: "EPSG:4326"
        });

        store.dispatch( action );
        setTimeout(() => {
            let actions = store.getActions();
            expect(actions.length).toBe(6);
            expect(actions[1].type).toBe(CHANGE_MAP_VIEW);
            expect(actions[2].type).toBe(TEXT_SEARCH_ADD_MARKER);
            expect(actions[3].type).toBe(TEXT_SEARCH_RESULTS_PURGE);
            expect(actions[4].type).toBe(TEXT_SEARCH_NESTED_SERVICES_SELECTED);
            expect(actions[5].type).toBe(TEXT_SEARCH_TEXT_CHANGE);

            expect(actions[4].services[0]).toEqual({
                ...nestedService,
                options: {
                    item
                }
            });
            expect(actions[4].services[0].geometry).toExist();
            expect(actions[4].items).toEqual({
                placeholder: SEARCH_NESTED,
                placeholderMsgId: TEST_NESTED_PLACEHOLDER,
                text: TEXT
            });
            expect(actions[5].searchText).toBe(TEXT);
            expect(actions[5].type).toBe(TEXT_SEARCH_TEXT_CHANGE);

        }, 800);
    });
});
