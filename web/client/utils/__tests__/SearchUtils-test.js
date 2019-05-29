/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const expect = require('expect');
const {defaultIconStyle} = require('../SearchUtils');


describe('SearchUtils test', () => {
    it('defaultIconStyle', () => {
        expect(defaultIconStyle).toEqual({
            iconUrl: require('../../product/assets/img/marker-icon-red.png'),
            shadowUrl: require('../../product/assets/img/marker-shadow.png'),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    });
});
