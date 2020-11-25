/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isString } from 'lodash';
import Rx from 'rxjs';
import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';

const xmlToJson = xml => {
    if (!isString(xml)) {
        return Rx.Observable.of(xml);
    }
    return Rx.Observable.bindNodeCallback((data, callback) => parseString(data, {
        tagNameProcessors: [stripPrefix],
        explicitArray: false,
        mergeAttrs: true
    }, callback))(xml);
};

// parses xml as a promise

export const toJSONPromise = xml => xmlToJson(xml).toPromise();

export default {
    toJSONPromise
};

