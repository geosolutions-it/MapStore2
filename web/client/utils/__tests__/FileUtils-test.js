/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


var expect = require('expect');
var FileUtils = require('../FileUtils');
var axios = require('../../libs/ajax');

describe('FileUtils', () => {
    it('checkShapePrj', (done) => {
        axios.get("base/web/client/test-resources/TestShape.zip", { responseType: "blob" }).then(({data}) => {
            FileUtils.readZip(data).then((buffer) => {
                FileUtils.checkShapePrj(buffer).then((warnings) => {
                    expect(warnings.length).toBe(1);
                    done();
                });
            });
        });
    });
});
