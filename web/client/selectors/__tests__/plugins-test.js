/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const { isPageConfigured } = require('../plugins');
const {set} = require('lodash');

describe('Test page selector', () => {
    it('test isImporterConfigured default', () => {
        expect(isPageConfigured('importer')(set({}, 'localConfig.plugins.importer', {"some": "configuration"}))).toBe(true);
        expect(isPageConfigured('importer')(set({}, 'localConfig.plugins', { "some": "configuration" }))).toBe(false);
    });
});
