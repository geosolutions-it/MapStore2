/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import {updatePages} from '../FeatureGridUtils';


describe('FeatureGridUtils', () => {
    it('Test updatePages when needPages * size is less then features', () => {
        const oldFeatures = Array(350);
        const features = Array(60);

        const result = {
            features
        };
        const requestOptions = {
            endPage: 99,
            startPage: 95
        };
        const oldData = {
            pages: [
                2330,
                2340,
                2350,
                2360,
                2370,
                3190,
                3200,
                3210,
                3220,
                1020,
                1030,
                1040,
                1050,
                1060
            ],
            features: oldFeatures
        };
        const paginationOptions = {
            size: 10,
            maxStoredPages: 10,
            startIndex: 960
        };
        const {pages, features: newFeatures } = updatePages(result, requestOptions, oldData, paginationOptions);
        expect(pages).toBeTruthy();
        expect(newFeatures).toBeTruthy();
        expect(newFeatures.length).toBe(120);
    });
});
