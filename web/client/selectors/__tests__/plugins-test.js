/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import expect from 'expect';

import { isPageConfigured } from '../plugins';
import { set } from 'lodash';

describe('Test page selector', () => {
    it('test isImporterConfigured default', () => {
        expect(isPageConfigured('importer')(set({}, 'localConfig.plugins.importer', {"some": "configuration"}))).toBe(true);
        expect(isPageConfigured('importer')(set({}, 'localConfig.plugins', { "some": "configuration" }))).toBe(false);
    });
});
