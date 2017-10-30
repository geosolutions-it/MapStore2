/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {
    queryPanelSelector,
    wfsDownloadAvailable
} = require("../controls");

const state = {
    controls: {
        queryPanel: {
            enabled: true
        },
        wfsdownload: {
            available: true
        }
    }
};

describe('Test controls selectors', () => {
    it('test queryPanelSelector', () => {
        const retVal = queryPanelSelector(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });
    it('test wfsDownloadAvailable', () => {
        const retVal = wfsDownloadAvailable(state);
        expect(retVal).toExist();
        expect(retVal).toBe(true);
    });

});
