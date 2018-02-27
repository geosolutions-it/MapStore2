/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var FileUtils = require('../FileUtils');

describe('FilterUtils', () => {
    it('Test read local json file', (done) => {
        const jsonFile = new File(["[]"], "file.json", {
          type: "application/json"
        });
        FileUtils.readJson(jsonFile).then((res) => {
            expect(res instanceof Array).toBe(true);
            done();
        });
    });
});
