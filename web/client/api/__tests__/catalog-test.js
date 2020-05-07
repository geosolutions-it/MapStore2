/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import catalog from '../catalog';
import  { textSearch as TMSSearchText } from '../catalog/TMS';
import { validate } from '../catalog/common';

import { textSearch as WMSTextSearch } from '../WMS';
import expect from 'expect';


describe('Catalog API', () => {
    it('check handlers', () => {
        // some checks on services, not all. TODO: do real tests about these functionalities from catalog entry point
        expect(catalog.tms.textSearch).toBe(TMSSearchText);
        expect(catalog.wms.textSearch).toBe(WMSTextSearch);
        expect(catalog.wms.validate).toBe(validate);
        expect(catalog.wmts.validate).toBe(validate);
        expect(catalog.csw.validate).toBe(validate);
        expect(catalog.wfs.validate).toBe(validate);
    });
});
