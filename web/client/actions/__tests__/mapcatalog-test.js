/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    deleteMap, DELETE_MAP,
    saveMap, SAVE_MAP,
    triggerReload, TRIGGER_RELOAD
} from '../mapcatalog';

describe('mapcatalog actions', () => {
    it('deleteMap', () => {
        const retval = deleteMap('map');
        expect(retval.type).toBe(DELETE_MAP);
        expect(retval.resource).toBe('map');
    });
    it('saveMap', () => {
        const retval = saveMap('map');
        expect(retval.type).toBe(SAVE_MAP);
        expect(retval.resource).toBe('map');
    });
    it('triggerReload', () => {
        const retval = triggerReload();
        expect(retval.type).toBe(TRIGGER_RELOAD);
    });
});
