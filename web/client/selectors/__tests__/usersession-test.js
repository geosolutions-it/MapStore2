/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect  from 'expect';
import { userSessionIdSelector, userSessionSelector } from "../usersession";

describe('Test usersession selector', () => {
    const session = {
        attribute: "value"
    };
    it('test userSessionIdSelector', () => {
        expect(userSessionIdSelector({ usersession: {id: 1, session} })).toBe(1);
    });
    it('test userSessionSelector', () => {
        expect(userSessionSelector({ usersession: { id: 1, session } }).attribute).toBe("value");
    });
});
