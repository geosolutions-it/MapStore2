/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { createStateMocker } from '../../../../reducers/__tests__/reducersTestUtils';

import streetView from '../streetview';
import {
    streetViewProviderSelector,
    panoramaOptionsSelector,
    googleAPIKeySelector,
    apiLoadedSelectorCreator,
    currentProviderApiLoadedSelector,
    locationSelector,
    cyclomediaAPIKeySelector,
    povSelector
} from '../../selectors/streetView';
import { configure, streetViewAPILoaded, setLocation, setPov, resetViewerData } from '../../actions/streetView';

describe('StreetView reducer', () => {
    const stateMocker = createStateMocker({ streetView });

    it('configuration', () => {
        const API_KEY = "TEST_API_KEY";
        const state = stateMocker(configure({panoramaOptions: {imageDateControl: true}, apiKey: API_KEY}));
        expect(panoramaOptionsSelector(state)?.imageDateControl).toBeTruthy();
        expect(googleAPIKeySelector(state)).toEqual(API_KEY);
    });
    it('configuration for cyclomedia', () => {
        const state = stateMocker(configure({provider: 'cyclomedia', apiKey: 'TEST_API_KEY'}));
        expect(streetViewProviderSelector(state)).toEqual('cyclomedia');
        expect(cyclomediaAPIKeySelector(state)).toEqual('TEST_API_KEY');
    });
    it('pov', () => {
        const TEST_POV = {heading: 1, pitch: 2};
        const state = stateMocker(setPov(TEST_POV));
        expect(povSelector(state)).toEqual(TEST_POV);
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
        const state = stateMocker(streetViewAPILoaded('google'));
        expect(apiLoadedSelectorCreator('google')(state)).toBeTruthy();
        expect(currentProviderApiLoadedSelector(state)).toBeTruthy();
    });
    it('apiLoaded for cyclomedia', () => {
        const state = stateMocker(configure({provider: 'cyclomedia', apiKey: 'TEST_API_KEY'}), streetViewAPILoaded('cyclomedia'));
        expect(apiLoadedSelectorCreator('cyclomedia')(state)).toBeTruthy();
        expect(currentProviderApiLoadedSelector(state)).toBeTruthy();
    });
    it('reset data viewer', () => {
        const TEST_PANO = "TEST_PANO";
        const LOCATION = {
            pano: TEST_PANO,
            latLng: {
                lat: location?.latLng?.lat(),
                lng: location?.latLng?.lng()
            }
        };
        const TEST_POV = {heading: 1, pitch: 2};
        const state = stateMocker(setLocation(LOCATION), setPov(TEST_POV));
        expect(locationSelector(state)).toEqual(LOCATION);
        expect(povSelector(state)).toEqual(TEST_POV);
        const editedState = stateMocker(resetViewerData());
        expect(locationSelector(editedState)).toEqual(undefined);
        expect(povSelector(editedState)).toEqual(undefined);
    });
});
