/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');
var FileFormatUtils = require('../FileFormatUtils');


describe('FileFormatUtils', () => {
    it('getByOutputFormat custom format', () => {
        const result = FileFormatUtils.getByOutputFormat("TEST-CSV");
        expect(result).toExist();
        expect(result.extension).toBe("csv");
        expect(result.outputFormat).toBe("TEST-CSV");
    });
});
