/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic } from './epicTestUtils';
import ajax from '../../libs/ajax';

import { configureMap, LOAD_MAP_CONFIG } from "../../actions/config";
import {
    loadContext,
    LOADING,
    SET_RESOURCE,
    SET_CURRENT_CONTEXT,
    LOAD_FINISHED

} from "../../actions/context";

import CONTEXT_SHORT_RESOURCE from '../../test-resources/geostore/resources/resource/context_1.json';
import CONTEXT_DATA from '../../test-resources/geostore/data/context_1.json';
import CONTEXT_ATTRIBUTES from '../../test-resources/geostore/resources/resource/context_1_attributes.json';

import { loadContextAndMap } from "../context";
import MockAdapter from 'axios-mock-adapter';


let mockAxios;

describe('context epics', () => {
    describe('loadContextAndMap', () => {
        beforeEach(done => {
            mockAxios = new MockAdapter(ajax);
            setTimeout(done);
        });

        afterEach(done => {
            mockAxios.restore();
            setTimeout(done);
        });
        it('test context and map load flow', done => {

            const mapId = 1;
            const contextId = 2;

            mockAxios.onGet(`/mapstore/rest/geostore/extjs/resource/${contextId}`).reply(() => {
                return [200, CONTEXT_SHORT_RESOURCE];
            });
            mockAxios.onGet(`/mapstore/rest/geostore/data/${contextId}`).reply(() => {
                return [200, CONTEXT_DATA];
            });
            mockAxios.onGet(`/mapstore/rest/geostore/resources/resource/${contextId}/attributes`).reply(() => {
                return [200, CONTEXT_ATTRIBUTES];
            });
            const act = [
                loadContext({ mapId, contextId }),
                configureMap() // THIS ACTION FAKES MAP LOAD FLOW END
            ];
            testEpic(loadContextAndMap, 6, act, ([loadingAction, loadMapAction, setResourceAction, setContextAction, loadFinishedAction, loadEndAction]) => {

                expect(loadingAction.type).toBe(LOADING);
                expect(loadingAction.value).toBe(true);
                expect(loadMapAction.type).toBe(LOAD_MAP_CONFIG);
                expect(setResourceAction.type).toBe(SET_RESOURCE);
                expect(setResourceAction.resource.canDelete).toBe(true); // check one random content of the resource
                expect(setContextAction.type).toBe(SET_CURRENT_CONTEXT);
                expect(setContextAction.context.plugins.desktop).toExist(); // check context content
                expect(loadFinishedAction.type).toBe(LOAD_FINISHED);
                expect(loadEndAction.type).toBe(LOADING);
                expect(loadEndAction.value).toBe(false);
                done();
            });

        });
    });

});

