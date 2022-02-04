/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { createStateMocker } from '../../../reducers/__tests__/reducersTestUtils';

import streetView from '../reducers/streetview';
import { panoramaOptionsSelector, googleAPIKeySelector, apiLoadedSelector, locationSelector } from '../selectors/streetView';
import { configure, gMapsAPILoaded, setLocation } from '../actions/streetView';

describe('street vie reducer', () => {
    const stateMocker = createStateMocker({ streetView });

    it('configuration', () => {
        const API_KEY = "TEST_API_KEY";
        const state = stateMocker(configure({panoramaOptions: {imageDateControl: true}, apiKey: API_KEY}));
        expect(panoramaOptionsSelector(state)?.imageDateControl).toBeTruthy();
        expect(googleAPIKeySelector(state)).toEqual(API_KEY);
    });
    it('location', () => {
        const TEST_PANO = "TEST_PANO";
        const LOCATION = {
            pano: TEST_PANO,
            latLng: {
                lat: location?.latLng?.lat(),
                lng: location?.latLng?.lng()
            }
        };
        const state = stateMocker(setLocation(LOCATION));
        expect(locationSelector(state)).toEqual(LOCATION);
    });
    it('apiLoaded', () => {
        const state = stateMocker(gMapsAPILoaded(true));
        expect(apiLoadedSelector(state)).toBeTruthy();
    });

});
