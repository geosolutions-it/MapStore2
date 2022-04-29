/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {SET_LAST_ACTIVE_ITEM, setLastActiveItem} from "../sidebarmenu";

describe('Test correctness of the sidebar actions', () => {

    it('test setLastActiveItem', () => {
        const action = setLastActiveItem("annotations");
        expect(action.type).toBe(SET_LAST_ACTIVE_ITEM);
        expect(action.value).toBe("annotations");
    });
});
