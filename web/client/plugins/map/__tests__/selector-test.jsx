/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import { createStateMocker } from '../../../reducers/__tests__/reducersTestUtils';

import selector from '../selector';
import map from '../../../reducers/map';
import layers from '../../../reducers/layers';
import additionallayers from '../../../reducers/additionallayers';

import { registerEventListener } from '../../../actions/map';

const stateMocker = createStateMocker({ map, layers, additionallayers});
describe('Map plugin state to pros selector', () => {
    describe('elevationEnabled', () => {
        it('elevation is active when mouseposition is listening to map', () => {
            const elevationEnabledState = selector(stateMocker(registerEventListener('mousemove', 'mouseposition')));
            expect(elevationEnabledState.elevationEnabled).toBeTruthy();
        });
        it('elevation is not active when other is listening to map', () => {
            const elevationEnabledState = selector(stateMocker(registerEventListener('mousemove', 'otherTool')));
            expect(elevationEnabledState.elevationEnabled).toBeFalsy();
        });
    });
});
