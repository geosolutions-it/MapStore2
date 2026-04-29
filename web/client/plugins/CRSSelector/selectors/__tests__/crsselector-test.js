/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';
import { crsInputValueSelector, canEditProjectionSelector } from '../crsselector';

describe('Test crsselector selectors', () => {
    it('test crsInputValueSelector', () => {
        const props = crsInputValueSelector({crsselector: {value: 'EPSG:4326'}});

        expect(props).toExist();
        expect(props).toBe('EPSG:4326');
    });

    it('canEditProjectionSelector returns mapIsEditable when crsselector.canEdit is undefined', () => {
        const state = {
            crsselector: { canEdit: undefined },
            map: { present: { info: { canEdit: true } } }
        };
        expect(canEditProjectionSelector(state)).toBe(true);
    });

    it('canEditProjectionSelector returns crsselector.canEdit when defined', () => {
        expect(canEditProjectionSelector({ crsselector: { canEdit: true } })).toBe(true);
        expect(canEditProjectionSelector({ crsselector: { canEdit: false } })).toBe(false);
    });

    it('canEditProjectionSelector explicit canEdit:false overrides editable map', () => {
        // The explicit override takes precedence over the map's canEdit flag,
        // so admins can lock projection editing on a map they would otherwise own.
        const state = {
            crsselector: { canEdit: false },
            map: { present: { info: { canEdit: true } } }
        };
        expect(canEditProjectionSelector(state)).toBe(false);
    });
});
