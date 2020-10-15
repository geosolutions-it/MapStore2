/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { SET_STYLE_PARAMETER, setStyleParameter } from '../style';

describe('Test correctness of the style actions', () => {

    it('setStyleParameter', () => {
        const retVal = setStyleParameter('name', 'val');
        expect(retVal).toExist();
        expect(retVal.type).toBe(SET_STYLE_PARAMETER);
        expect(retVal.name).toBe('name');
        expect(retVal.value).toBe('val');
    });
});
