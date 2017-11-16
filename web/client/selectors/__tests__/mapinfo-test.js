/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


const expect = require('expect');
const {
    generalInfoFormatSelector
} = require('../mapinfo');

describe('Test mapinfo', () => {
    it('test generalInfoFormatSelector default value', () => {
        const mapinfo = generalInfoFormatSelector({});
        expect(mapinfo).toBe("text/plain");
    });
    it('test generalInfoFormatSelector infoFormat: undefined', () => {
        const mapinfo = generalInfoFormatSelector({mapInfo: {infoFormat: undefined}});
        expect(mapinfo).toBe("text/plain");
    });
    it('test generalInfoFormatSelector ', () => {
        const mapinfo = generalInfoFormatSelector({mapInfo: {infoFormat: "text/html"}});

        expect(mapinfo).toExist();
        expect(mapinfo).toBe("text/html");
    });
});
