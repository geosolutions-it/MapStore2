/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {versionSelector, validateVersion} = require('../version');

describe('Test version selector', () => {
    it('test versionSelector default', () => {
        const version = versionSelector({version: null});
        expect(version).toBe("");
    });
    it('test versionSelector with key 18e36c9e2ce1cbf57648907ec177e02f0118764d', () => {
        const current = "18e36c9e2ce1cbf57648907ec177e02f0118764d";
        const version = versionSelector({version: { current}});
        expect(version).toExist();
        expect(version).toBe(current);
    });
    it('test validateVersion', () => {
        expect(validateVersion('18e36c9e2ce1cbf57648907ec177e02f0118764d')).toBe(true);
        expect(validateVersion('${mapstore2.version}')).toBe(false);
        expect(validateVersion('no-version')).toBe(false);
    });
});
