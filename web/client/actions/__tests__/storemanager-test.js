/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';
import {REDUCERS_LOADED, reducersLoaded} from "../storemanager";

describe('Test correctness of the storemanager actions', () => {
    it('test reducersLoaded action creator', (done) => {
        const reducers = ['a', 'b'];
        const action = reducersLoaded(reducers);
        expect(action.reducers).toEqual(reducers);
        expect(action.type).toBe(REDUCERS_LOADED);
        done();
    });
});
