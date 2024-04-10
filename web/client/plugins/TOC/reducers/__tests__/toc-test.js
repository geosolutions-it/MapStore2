/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import { updateTOCConfig } from '../../actions/toc';
import { configureMap } from '../../../../actions/config';

import toc from '../toc';

describe('toc reducer', () => {
    it('should init with configureMap', () => {
        const state = toc({}, configureMap());
        expect(state.config.init).toBe(true);
    });
    it('should update config with updateTOCConfig', () => {
        const state = toc({ config: { init: true }}, updateTOCConfig({ init: false }));
        expect(state.config.init).toBe(false);
    });
});
