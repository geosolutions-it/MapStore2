/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');

const {generateEnvString} = require('../LayerLocalizationUtils');

const envMock = [
    {
        name: 'name_one',
        value: 'value_one'
    },
    {
        name: 'name_two',
        value: 'value_two'
    }
];

describe('LayerLocalizationUtils', () => {
    it('generateEnvString returns expected string value', () => {
        expect(generateEnvString(envMock)).toBe('name_one:value_one;name_two:value_two');
    });
});
