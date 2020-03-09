
/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import createStore from "../StandardStore";


describe('Test StandardStore', () => {
    it('storeOpts notify is true by default', () => {
        const store = createStore({}, {}, {}, {}, /* storeOpts */{});
        expect(store.addActionListener).toExist();
    });
    it('addActionListener is not available if storeOpts notify is false', () => {
        const store = createStore({}, {}, {}, {}, /* storeOpts */{ notify: false });
        expect(store.addActionListener).toNotExist();
    });
});
