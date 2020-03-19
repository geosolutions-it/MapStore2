
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import csw from '../CSW';
import wms from '../WMS';
import wmts from '../WMTS';
import * as tms from './TMS';
import backgrounds from '../mapBackground';
import { validate, testService } from './common';


/**
 * API for catalog
 * Must implement:
 *
 */
export default {
    csw: {
        validate,
        testService: testService(csw),
        ...csw
    },
    wms: {
        validate,
        testService: testService(wms),
        ...wms
    },
    tms, // has it's own validation
    wmts: {
        validate,
        testService: testService(wmts),
        ...wmts
    },
    backgrounds: {
        validate,
        testService: testService(backgrounds),
        ...backgrounds
    }
};
