/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import expect from 'expect';
import { testEpic } from './epicTestUtils';
import ConfigUtils from '../../utils/ConfigUtils';

import {
    searchContextsEpic,
    reloadOnContexts,
    editContext as editContextEpic
} from '../contextmanager';

import { contextSaved, CLEAR_CONTEXT_CREATOR } from '../../actions/contextcreator';

import {
    SEARCH_CONTEXTS,
    searchContexts,
    editContext,
    LOADING,
    CONTEXTS_LIST_LOADED
} from '../../actions/contextmanager';

import {
    SHOW_NOTIFICATION
} from '../../actions/notifications';

let getDefaults = ConfigUtils.getDefaults;

const ROUTER_PUSH_ACTION = "@@router/CALL_HISTORY_METHOD";


describe('contextmanager epics', () => {
    beforeEach( () => {
        getDefaults = ConfigUtils.getDefaults;
    });
    afterEach(() => {
        ConfigUtils.getDefaults = getDefaults;
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
            expect(a.type).toBe(SEARCH_CONTEXTS);
            expect(a.options).toExist();
            expect(a.options.params).toExist();
            expect(a.options.params.start).toBe(0);
            expect(a.options.params.limit).toBe(12);
            expect(a.text).toBe("test");
            done();
        }, {
            contextmanager: {
                searchText: "test",
                searchOptions: {
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
    describe('editContext', () => {
        it('when resource is present, trigger router', done => {
            const startActions = [editContext({ test: "some resource", id: 1 })];
            testEpic(editContextEpic, 2, startActions, ([a1, a2]) => {
                expect(a1.type).toBe(CLEAR_CONTEXT_CREATOR);
                expect(a2.type).toBe(ROUTER_PUSH_ACTION);
                const { method, args } = a2.payload;
                const path = args[0];
                expect(method).toBe("push");
                expect(path).toBe("/context-creator/1");
                done();
            });
        });
    });
});
