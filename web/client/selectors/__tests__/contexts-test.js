/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    searchTextSelector,
    searchOptionsSelector,
    searchParamsSelector,
    resultsSelector,
    totalCountSelector,
    isLoadingSelector,
    isAvailableSelector
} from "../contexts";

const state = {
    contexts: {
        enabled: false,
        errors: [],
        searchText: '*',
        available: true,
        showModal: {},
        loading: false,
        results: [
            {
                canDelete: true,
                canEdit: true,
                canCopy: true,
                creation: '2021-12-23 22:11:48.697',
                lastUpdate: '2022-01-12 09:49:53.191',
                description: '',
                id: 5,
                name: 'CustomContext'
            },
            {
                canDelete: true,
                canEdit: true,
                canCopy: true,
                creation: '2022-01-12 09:51:21.001',
                lastUpdate: '2022-01-12 10:02:33.079',
                description: '',
                id: 8,
                name: 'SampleContext',
                featured: 'true'
            }
        ],
        success: true,
        totalCount: 2,
        options: {
            params: {
                start: 0,
                limit: 12
            }
        }
    }
};
describe('contexts selectors', () => { // TODO: check default
    it('test searchTextSelector', () => {
        expect(searchTextSelector(state)).toBe('*');
        expect(searchTextSelector()).toBe(undefined);
    });
    it('test searchOptionsSelector', () => {
        const retVal = searchOptionsSelector(state);
        expect(retVal).toExist();
        expect(retVal.params).toExist();
        expect(retVal.params.start).toBe(0);
        expect(retVal.params.limit).toBe(12);
    });
    it('test searchParamsSelector', () => {
        const retVal = searchParamsSelector(state);
        expect(retVal).toExist();
        expect(retVal.start).toBe(0);
        expect(retVal.limit).toBe(12);
    });
    it('test resultsSelector', () => {
        const retVal = resultsSelector(state);
        expect(retVal).toExist();
        expect(retVal.length).toBe(2);
        expect(retVal[1].name).toBe('SampleContext');
    });
    it('test totalCountSelector', () => {
        const retVal = totalCountSelector(state);
        expect(retVal).toBe(2);
    });
    it('test isLoadingSelector', () => {
        const retVal = isLoadingSelector(state);
        expect(retVal).toBe(false);
    });
    it('test isAvailableSelector', () => {
        const retVal = isAvailableSelector(state);
        expect(retVal).toBe(true);
    });
});
