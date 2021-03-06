/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { onTabSelected, ON_TAB_SELECTED } from '../contenttabs';

describe('Test contenttabs actions', () => {

    it('Test onTabSelected action creator', () => {
        const id = 'layer_001';
        const retval = onTabSelected(id);
        expect(retval).toExist();
        expect(retval.id).toBe(id);
        expect(retval.type).toBe(ON_TAB_SELECTED);
    });
});
