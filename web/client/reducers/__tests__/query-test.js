/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import query from '../query';
import { TOGGLE_LAYER_FILTER } from '../../actions/wfsquery';
import { reset } from '../../actions/queryform';

describe('Test the query reducer', () => {
    it('Test QUERY_FORM_RESET to skip query', () => {
        /**
         * We need to preserve the query state on QUERY_FORM_RESET,
         * a user has to perform a QUERY_FORM_SEARCH to update the
         * query state.
         */
        const initState = {
            isNew: true,
            result: [],
            filterObj: {},
            searchUrl: "test"
        };
        const state = query(initState, reset("query"));
        expect(state).toEqual(initState);
    });
    it('Test TOGGLE_LAYER_FILTER', () => {
        const initState = {
            isLayerFilter: false
        };
        const state = query(initState, {type: TOGGLE_LAYER_FILTER});
        expect(state.isLayerFilter).toBeTruthy();
    });
});
