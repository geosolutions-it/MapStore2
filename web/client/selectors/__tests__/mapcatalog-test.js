/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    triggerReloadValueSelector,
    isActiveSelector
} from '../mapcatalog';

const testState = {
    mapcatalog: {
        triggerReloadValue: true
    }
};

describe('mapcatalog selectors', () => {
    it('triggerReloadValueSelector', () => {
        expect(triggerReloadValueSelector(testState)).toBe(true);
    });
    it('test isActiveSelector ', () => {
        const toolState = isActiveSelector({
            controls: {
                mapCatalog: {
                    enabled: true
                }
            }
        });
        expect(toolState).toBe(true);
    });
});
