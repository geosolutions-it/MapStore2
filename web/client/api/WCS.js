/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../libs/ajax';
import urlUtil from 'url';
import xml2js from 'xml2js';
import { getDefaultUrl } from '../utils/URLUtils';

export const describeCoverage = function(url, typeName) {
    const parsed = urlUtil.parse(getDefaultUrl(url), true);
    const describeLayerUrl = urlUtil.format(Object.assign({}, parsed, {
        query: Object.assign({
            service: "WCS",
            version: "1.1.0",
            identifiers: typeName,
            request: "DescribeCoverage"
        }, parsed.query)
    }));
    return axios.get(describeLayerUrl).then((response) => {
        let json;
        xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
            json = result;
        });
        return json;
    });
};

const Api = {
    describeCoverage
};

export default Api;
