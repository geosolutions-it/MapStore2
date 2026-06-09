/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { setConfiguration } from '../../actions/dynamiclegend';
import dynamiclegend from '../dynamiclegend';

describe('dynamiclegend reducer', () => {

    it('setConfiguration', () => {
        const action = setConfiguration({
            isFloating: true,
            flatLegend: true
        });
        expect(dynamiclegend({}, action)).toEqual({
            config: {
                isFloating: true,
                flatLegend: true
            }
        });
    });
});
