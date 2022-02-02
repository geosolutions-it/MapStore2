/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {addTimeoutEpic, TEST_TIMEOUT, testEpic} from './epicTestUtils';
import ConfigUtils from '../../utils/ConfigUtils';

import {
    searchContextsOnMapSearch,
    searchContextsEpic,
    reloadOnContexts
} from '../contexts';

import { contextSaved } from '../../actions/contextcreator';
import { SEARCH_CONTEXTS, searchContexts, LOADING, CONTEXTS_LIST_LOADED } from '../../actions/contexts';
import { SHOW_NOTIFICATION } from '../../actions/notifications';
import { mapsLoading } from '../../actions/maps';
let getDefaults = ConfigUtils.getDefaults;
describe('contexts epics', () => {
    beforeEach( () => {
        getDefaults = ConfigUtils.getDefaults;
    });
    afterEach(() => {
        ConfigUtils.getDefaults = getDefaults;
    });
    it('searchContextsOnMapSearch - contexts are not available', (done) => {
        const startActions = [mapsLoading("Search Text")];
        testEpic(addTimeoutEpic(searchContextsOnMapSearch, 1), 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case TEST_TIMEOUT:
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {});
    });
    it('searchContextsOnMapSearch - contexts are available', (done) => {
        const startActions = [mapsLoading("Search Text")];
        testEpic(searchContextsOnMapSearch, 1, startActions, actions => {
            expect(actions.length).toBe(1);
            actions.map((action) => {
                switch (action.type) {
                case LOADING:

                    break;
                case SEARCH_CONTEXTS:
                    expect(action.searchText).toBe("Search Text");
                    done();
                    break;
                default:
                    done(new Error("Action not recognized"));
                }
            });
            done();
        }, {
            contexts: {
                available: true
            }
        });
    });
    it('searchContexts', (done) => {
        const baseUrl = "base/web/client/test-resources/geostore/extjs/search/search_1.json#";
        ConfigUtils.getDefaults = () => ({
            geoStoreUrl: baseUrl
        });

        const startActions = [searchContexts("Search Text")];
        testEpic(searchContextsEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe("loading");
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(CONTEXTS_LIST_LOADED);
            expect(actions[1].totalCount).toBe(1);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe("loading");
            expect(actions[2].value).toBe(false);
            done();
        }, {});
    });
    it('reload on contextSaved', (done) => {
        const startActions = [contextSaved("Search Text")];
        testEpic(reloadOnContexts, 1, startActions, ([a]) => {
            // eslint-disable-next-line no-console
            console.log(a);
            expect(a.type).toBe(SEARCH_CONTEXTS);
            expect(a.params.start).toBe(0);
            expect(a.params.limit).toBe(12);
            expect(a.searchText).toBe("test");
            done();
        }, {
            contexts: {
                searchText: "test",
                available: true,
                options: {
                    params: {
                        start: 0,
                        limit: 12
                    }
                }
            }
        });
    });
    it('searchContexts error', (done) => {
        const baseUrl = "base/web/client/test-resources/geostore/extjs/search/NODATA#";
        ConfigUtils.getDefaults = () => ({
            geoStoreUrl: baseUrl
        });

        const startActions = [searchContexts("Search Text")];
        testEpic(searchContextsEpic, 3, startActions, actions => {
            expect(actions.length).toBe(3);
            expect(actions[0].type).toBe(LOADING);
            expect(actions[0].name).toBe("loading");
            expect(actions[0].value).toBe(true);
            expect(actions[1].type).toBe(SHOW_NOTIFICATION);
            expect(actions[2].type).toBe(LOADING);
            expect(actions[2].name).toBe("loading");
            expect(actions[2].value).toBe(false);
            done();
        }, {});
    });
});
