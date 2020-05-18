
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
import * as wfs from './WFS';
import backgrounds from '../mapBackground';
import { validate, testService } from './common';


/**
 * APIs collection for catalog.
 * Each entry must implement:
 * - `textSearch` (url, startPosition, maxRecords, text, info) => function that returns a promise. The Promise returned emits an object with this shape:
 * ```javascript
 * {
 *      numberOfRecordsMatched: 20
 *      numberOfRecordsReturned: 5
 *      records: [{}] // records
 *      service: {
 *          // some information about the service
 *      }
 * }
 * ```
 * Optionally implements validation functions:
 * - `validate`: function that gets the service object and returns an Observable. The stream emit an exception if the service validation fails. Otherwise it emits the `service` object and complete.
 * - `testService` function that gets the service object and returns an Observable. The stream emit an exception if the service do not respond. Otherwise it emits the `service` object and complete.
 * @memberof api
 * @name catalog
 */
export default {
    // TODO: we should separate catalog specific API from OGC services API, to define better the real interfaces of each API.
    // TODO: validate could be converted in a simple function
    // TODO: testService could be converted in a simple Promise
    csw: {
        validate,
        testService: testService(csw),
        ...csw
    },
    wfs: {
        validate,
        testService: testService(wfs),
        ...wfs
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
