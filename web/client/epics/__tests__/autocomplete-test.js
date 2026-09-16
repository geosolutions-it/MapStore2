/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';

import axios from '../../libs/ajax';
import {
    updateCrossLayerFilterField,
    updateFilterField
} from '../../actions/queryform';
import { fetchAutocompleteOptionsEpic } from '../autocomplete';
import { testEpic } from './epicTestUtils';

const ROW_ID = 1;
const FILTER_FIELD = {
    rowId: ROW_ID,
    attribute: 'name',
    operator: '=',
    value: '',
    type: 'string',
    fieldOptions: {
        currentPage: 1,
        valuesCount: 15
    }
};
const STATE = {
    query: {
        url: 'http://example.com/geoserver/wms',
        typeName: 'workspace:layer'
    },
    queryform: {
        autocompleteEnabled: true,
        maxFeaturesWPS: 5,
        filterFields: [FILTER_FIELD],
        crossLayerFilter: {
            collectGeometries: {
                queryCollection: {
                    typeName: 'workspace:cross-layer',
                    filterFields: [FILTER_FIELD]
                }
            }
        }
    }
};

describe('autocomplete Epics', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    const verifyStartIndex = (action, expectedStartIndex, done) => {
        let requestData;
        mockAxios.onPost().reply((config) => {
            requestData = config.data;
            return [200, { values: ['value'], size: 15 }];
        });

        testEpic(fetchAutocompleteOptionsEpic, 4, action, () => {
            expect(requestData).toExist();
            const startIndexMatch = requestData.match(
                /<ows:Identifier[^>]*>startIndex<\/ows:Identifier>[\s\S]*?<wps:LiteralData>([^<]+)<\/wps:LiteralData>/
            );
            expect(startIndexMatch).toExist();
            expect(startIndexMatch[1]).toBe(`${expectedStartIndex}`);
        }, STATE, done);
    };

    [
        { currentPage: 1, expectedStartIndex: 0 },
        { currentPage: 2, expectedStartIndex: 5 },
        { currentPage: 3, expectedStartIndex: 10 }
    ].forEach(({ currentPage, expectedStartIndex }) => {
        it(`computes startIndex for attribute filter page ${currentPage}`, (done) => {
            verifyStartIndex(
                updateFilterField(ROW_ID, 'value', '', 'string', { currentPage, delayDebounce: 0 }),
                expectedStartIndex,
                done
            );
        });
    });

    it('defaults the attribute filter to the first page', (done) => {
        verifyStartIndex(
            updateFilterField(ROW_ID, 'value', '', 'string', { delayDebounce: 0 }),
            0,
            done
        );
    });

    it('computes startIndex for a cross-layer filter page', (done) => {
        verifyStartIndex(
            updateCrossLayerFilterField(ROW_ID, 'value', '', 'string', { currentPage: 2, delayDebounce: 0 }),
            5,
            done
        );
    });
});
