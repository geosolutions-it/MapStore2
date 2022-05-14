/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {
    mouseOutSelector
} from "../mousePosition";

describe('mousePosition selectors', () => {
    it('mouseOutSelector', () => {
        expect(
            mouseOutSelector()
        ).toEqual(undefined);
        expect(
            mouseOutSelector({
                mousePosition: {
                    mouseOut: true
                }
            })
        ).toEqual(true);
        expect(
            mouseOutSelector({
                mousePosition: {
                    mouseOut: false
                }
            })
        ).toEqual(false);
    });
});
