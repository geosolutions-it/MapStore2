/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {localizedLayerStylesNameSelector, localizedLayerStylesEnvSelector} = require('../localizedLayerStyles');
const {currentLocaleLanguageSelector} = require('../locale');

describe('Test localizedLayerStyles', () => {
    it('test localizedLayerStylesNameSelector default', () => {
        const localizedLayerStyles = localizedLayerStylesNameSelector({});

        expect(localizedLayerStyles).toBe('mapstore_language');
    });

    it('test localizedLayerStylesNameSelector', () => {
        const name = 'example';
        const localizedLayerStyles = localizedLayerStylesNameSelector({localConfig: {localizedLayerStyles: {name}}});

        expect(localizedLayerStyles).toBe(name);
    });

    it('test localizedLayerStylesEnvSelector default', () => {
        const env = localizedLayerStylesEnvSelector({});

        expect(env).toEqual([]);
    });

    it('test localizedLayerStylesEnvSelector', () => {
        const name = 'example';
        const store = {localConfig: {localizedLayerStyles: {name}}};
        const env = localizedLayerStylesEnvSelector(store);
        const language = currentLocaleLanguageSelector(store);

        expect(env).toEqual([ {name, value: language} ]);
    });
});
