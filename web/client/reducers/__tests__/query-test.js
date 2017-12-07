/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const query = require('../query');

const { reset
 } = require('../../actions/queryform');

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
});
