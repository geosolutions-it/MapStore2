/**
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    describeFeatureTypeLoaded, DESCRIBE_FEATURE_TYPE_LOADED,
    describeCoveragesLoaded, DESCRIBE_COVERAGES_LOADED
} from '../layerCapabilities';
describe('Test layerCapabilities related actions', () => {
    it('checkWPSAvailability', () => {
        const layerId = "layerId";
        const source = "source";
        const action = describeFeatureTypeLoaded(layerId, source);
        expect(action).toEqual({
            type: DESCRIBE_FEATURE_TYPE_LOADED,
            layerId,
            source
        });
    });
    it('checkWPSAvailability', () => {
        const layerId = "layerId";
        const source = "source";
        const action = describeCoveragesLoaded(layerId, source);
        expect(action).toEqual({
            type: DESCRIBE_COVERAGES_LOADED,
            layerId,
            source
        });
    });
});
