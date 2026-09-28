/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import expect from 'expect';

import {getByOutputFormat, NETCDF_FORMAT} from '../FileFormatUtils';


describe('FileFormatUtils', () => {
    it('getByOutputFormat custom format', () => {
        const result = getByOutputFormat("TEST-CSV");
        expect(result).toExist();
        expect(result.extension).toBe("csv");
        expect(result.outputFormat).toBe("TEST-CSV");
    });
    it('getByOutputFormat for NETCDF_FORMAT', () => {
        const result = getByOutputFormat(NETCDF_FORMAT);
        expect(result).toExist();
        expect(result.extension).toBe("nc");
        expect(result.outputFormat).toBe(NETCDF_FORMAT);
    });
});
