/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import { onTabSelected } from '../../actions/contenttabs';
import contenttabs from '../contenttabs';

describe('Test contenttabs reducer', () => {

    it('select correct tab', () => {
        const id = 'dashboard';
        const state = contenttabs({selected: "maps"}, onTabSelected(id));
        expect(state).toEqual(
            {
                selected: id
            }
        );
    });

});
