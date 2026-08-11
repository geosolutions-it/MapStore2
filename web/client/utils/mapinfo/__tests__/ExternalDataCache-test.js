/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    clearExternalDataCacheForIdentifyRequests,
    createExternalDataCacheKey,
    deleteExternalDataCacheEntry,
    getExternalDataCacheEntry,
    setExternalDataCacheEntry
} from '../ExternalDataCache';

describe('ExternalDataCache', () => {
    const createKey = (identifyRequestId = 'request-1') => createExternalDataCacheKey({
        identifyRequestId,
        sourceFeatureId: 'feature-1',
        sourceFeatureIndex: 0,
        url: '/external/wfs',
        typeName: 'workspace:external',
        cqlFilter: "source_id = '1'"
    });

    afterEach(() => {
        clearExternalDataCacheForIdentifyRequests(['request-1', 'request-2']);
    });

    it('reuses a cached request and deletes it explicitly', () => {
        const key = createKey();
        const request = Promise.resolve({ features: [] });

        expect(setExternalDataCacheEntry(key, request, 'request-1')).toBe(request);
        expect(getExternalDataCacheEntry(key)).toBe(request);

        deleteExternalDataCacheEntry(key);
        expect(getExternalDataCacheEntry(key)).toNotExist();
    });

    it('clears only entries belonging to discarded identify requests', () => {
        const firstKey = createKey('request-1');
        const secondKey = createKey('request-2');
        setExternalDataCacheEntry(firstKey, Promise.resolve({}), 'request-1');
        setExternalDataCacheEntry(secondKey, Promise.resolve({}), 'request-2');

        clearExternalDataCacheForIdentifyRequests(['request-1']);

        expect(getExternalDataCacheEntry(firstKey)).toNotExist();
        expect(getExternalDataCacheEntry(secondKey)).toExist();
    });

    it('creates a different key when a request dependency changes', () => {
        const request = {
            identifyRequestId: 'request-1',
            sourceFeatureId: 'feature-1',
            sourceFeatureIndex: 0,
            url: '/external/wfs',
            typeName: 'workspace:external',
            cqlFilter: "source_id = '1'"
        };
        const key = createExternalDataCacheKey(request);

        expect(createExternalDataCacheKey({ ...request })).toBe(key);
        [
            { identifyRequestId: 'request-2' },
            { sourceFeatureId: 'feature-2' },
            { sourceFeatureIndex: 1 },
            { url: '/other/wfs' },
            { typeName: 'workspace:other' },
            { cqlFilter: "source_id = '2'" }
        ].forEach((change) => {
            expect(createExternalDataCacheKey({ ...request, ...change })).toNotBe(key);
        });
    });
});
