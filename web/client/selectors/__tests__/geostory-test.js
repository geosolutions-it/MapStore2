/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import geostory from "../../reducers/geostory";
import expect from 'expect';

import { createStateMocker } from '../../reducers/__tests__/reducersTestUtils';

import { modeSelector } from "../geostory";

describe('geostory selectors', () => {
    const createState = createStateMocker({geostory});
    it('modeSelector', () => {
        expect(modeSelector(createState({type: "UNKNOWN"}))).toExist(); // TODO: check default
    });
    // TODO: other selectors tests when load actions present
});
