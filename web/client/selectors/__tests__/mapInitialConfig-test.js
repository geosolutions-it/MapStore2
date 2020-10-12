/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import { hasMapAccessLoadingError } from '../mapInitialConfig';

let state = {
    mapInitialConfig: {
        loadingError: {}
    }
};

describe('Test mapInitialConfig selectors', () => {
    it('test hasMapAccessLoadingError', () => {
        const props = hasMapAccessLoadingError(state);
        expect(props).toEqual({});
    });
});
