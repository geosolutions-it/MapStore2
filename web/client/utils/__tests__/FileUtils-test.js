/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';

import {readJson, readZip, checkShapePrj, isFileSizeExceedMaxLimit} from '../FileUtils';
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
    it('isFileSizeExceedMaxLimit with large size exceed the max', () => {
        const maxLimitInMega = 1;
        const fileWithSizeExceedMaxLimit = 2 * 1024 * 1024;
        let isFileSizeValid = isFileSizeExceedMaxLimit({size: fileWithSizeExceedMaxLimit}, maxLimitInMega);
        expect(isFileSizeValid).toEqual(true);
    });
    it('isFileSizeExceedMaxLimit with small file size less than max', () => {
        const maxLimitInMega = 1;
        const fileWithSizeNotExceedMaxLimit = 0.5 * 1024 * 1024;
        let isFileSizeValid = isFileSizeExceedMaxLimit({size: fileWithSizeNotExceedMaxLimit}, maxLimitInMega);
        expect(isFileSizeValid).toEqual(false);
    });
});
