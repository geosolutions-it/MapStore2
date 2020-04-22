/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {localizedLayerStylesNameSelector} = require('../localizedLayerStyles');

describe('Test localizedLayerStyles', () => {
    it('test localizedLayerStylesNameSelector default', () => {
        const localizedLayerStyles = localizedLayerStylesNameSelector({});

        expect(localizedLayerStyles).toBe('');
    });

    it('test localizedLayerStylesNameSelector', () => {
        const name = 'example';
        const localizedLayerStyles = localizedLayerStylesNameSelector({localConfig: {localizedLayerStyles: {name}}});

        expect(localizedLayerStyles).toBe(name);
    });
});
