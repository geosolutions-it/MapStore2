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
const {interceptOGCError} = require('../utils/ObservableUtils');

const toDescribeURL = ({name, search = {}, url} = {}) => {
    const parsed = urlUtil.parse(search.url || url, true);
    return urlUtil.format(
        {
        ...parsed,
        search: undefined, // this allows to merge parameters correctly
        query: {
            ...parsed.query,

            service: "WFS",
            version: "1.1.0",
            typeName: name,
            outputFormat: 'application/json',
            request: "DescribeFeatureType"
        }
    });
};
module.exports = {
    describeFeatureType: ({layer}) =>
        Rx.Observable.defer(() =>
            axios.get(toDescribeURL(layer))).let(interceptOGCError)
};
