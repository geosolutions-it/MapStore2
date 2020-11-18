/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {readJson, readZip, checkShapePrj} from '../FileUtils';
import axios from '../../libs/ajax';

describe('FilterUtils', () => {
    it('Test read local json file', (done) => {
        const jsonFile = new File(["[]"], "file.json", {
            type: "application/json"
        });
        readJson(jsonFile).then((res) => {
            expect(res instanceof Array).toBe(true);
            done();
        });
    });

    it('checkShapePrj', (done) => {
        axios.get("base/web/client/test-resources/TestShape.zip", { responseType: "blob" }).then(({data}) => {
            readZip(data).then((buffer) => {
                checkShapePrj(buffer).then((warnings) => {
                    expect(warnings.length).toBe(1);
                    done();
                });
            });
        });
    });
});
