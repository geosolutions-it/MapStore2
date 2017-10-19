 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */


const axios = require('../libs/ajax');
const urlUtil = require('url');
const Rx = require('rxjs');
const toDescribeURL = ({url, typeName}) => {
    const parsed = urlUtil.parse(url, true);
    return urlUtil.format(
        {
        ...parsed,
        query: {
            service: "WFS",
            version: "1.1.0",
            typeName: typeName,
            outputFormat: 'application/json',
            request: "DescribeFeatureType",
            ...parsed.query
        }
    });
};
module.exports = {
    describeFeatureType: ({url, layer}) =>
        Rx.Observable.defer(() =>
            axios.get(toDescribeURL({url, typeName: layer.name})))
};
