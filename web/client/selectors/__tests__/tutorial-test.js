/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const expect = require('expect');
const {tutorialSelector} = require('../tutorial');

describe('Test tutorial selector', () => {
    it('test tutorialSelector', () => {
        const tutorial = tutorialSelector({tutorial: { tourAction: "next"}});

        expect(tutorial).toExist();
        expect(tutorial.tourAction).toBe("next");
    });
});
