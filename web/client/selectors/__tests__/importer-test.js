/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const { isImporterConfigured } = require('../importer');
const {set} = require('lodash');

describe('Test importer selector', () => {
    it('test isImporterConfigured default', () => {
        expect(isImporterConfigured(set({}, 'localConfig.plugins.importer', {"some": "configuration"}))).toBe(true);
        expect(isImporterConfigured(set({}, 'localConfig.plugins', { "some": "configuration" }))).toBe(false);
    });
});
