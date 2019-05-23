/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const { isString } = require('lodash');
const { parseString } = require('xml2js');
const { stripPrefix } = require('xml2js/lib/processors');
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

const toJSONPromise = xml => xmlToJson(xml).toPromise();

module.exports = {
    toJSONPromise
};

