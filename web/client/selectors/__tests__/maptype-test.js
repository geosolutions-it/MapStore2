/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const {mapTypeSelector, isCesium} = require('../maptype');

describe('Test maptype', () => {
    it('test mapTypeSelector', () => {
        const mapType = mapTypeSelector({maptype: {mapType: "cesium"}});

        expect(mapType).toExist();
        expect(mapType).toBe("cesium");
    });

    it('test isCesium', () => {
        const bool = isCesium({maptype: {mapType: "cesium"}});
        expect(bool).toExist();
        expect(bool).toBe(true);
        expect(isCesium({maptype: {mapType: "leaflet"}})).toBe(false);
    });
});
