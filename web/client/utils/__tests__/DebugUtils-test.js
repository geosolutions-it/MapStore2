
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
/* eslint-disable no-console */
const originalConsoleError = console.error;


import { checkForMissingPlugins } from '../DebugUtils';

describe('Test the DebugUtils', () => {

    it('checkForMissingPlugins NO ERROR', function(done) {
        checkForMissingPlugins({});
        done();
    });
    it('checkForMissingPlugins EITH ERROR', function(done) {
        console.error = (txt) => {
            expect(txt).toBeTruthy();
            done();
        };
        checkForMissingPlugins({mapPlugin: {"default": "something"}});
        console.error = originalConsoleError;

    });

});
