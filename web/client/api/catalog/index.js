
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as csw from './CSW';
import * as wms from './WMS';
import * as wmts from './WMTS';
import * as tms from './TMS';
import * as wfs from './WFS';
import * as geojson from './GeoJSON';
import * as backgrounds from './backgrounds';
import * as threeDTiles from './ThreeDTiles';
import * as cog from './COG';

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
 * - `getCatalogRecords` (data, options) => function that returns an array of catalogs records
 * - `getLayerFromRecord` (record, options, asPromise) => function that returns a promise/object that resolve with a mapstore layer configuration object given a catalog record
 * - `preprocess` return an Observable that performs actions on service object prior to its save
 * - `validate`: function that gets the service object and returns an Observable. The stream emit an exception if the service validation fails. Otherwise it emits the `service` object and complete.
 * - `testService` function that gets the service object and returns an Observable. The stream emit an exception if the service do not respond. Otherwise it emits the `service` object and complete.
 * @memberof api
 * @name catalog
 */
export default {
    // TODO: we should separate catalog specific API from OGC services API, to define better the real interfaces of each API.
    // TODO: validate could be converted in a simple function
    // TODO: testService could be converted in a simple Promise
    'csw': csw,
    'wfs': wfs,
    'wms': wms,
    'tms': tms,
    'wmts': wmts,
    'geojson': geojson,
    'backgrounds': backgrounds,
    '3dtiles': threeDTiles,
    'cog': cog
};
