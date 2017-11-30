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
const {parseString} = require('xml2js');
const {stripPrefix} = require('xml2js/lib/processors');

const {interceptOGCError} = require('../utils/ObservableUtils');
const {getCapabilitiesUrl} = require('../utils/LayersUtils');

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
const toLayerCapabilitiesURL = ({name, search = {}, url} = {}) => {
    const URL = getCapabilitiesUrl({name, url: search && search.url || url });
    const parsed = urlUtil.parse(URL, true);
    return urlUtil.format(
        {
        ...parsed,
        search: undefined, // this allows to merge parameters correctly
        query: {
            ...parsed.query,
            service: "WFS",
            version: "1.1.1",
            request: "GetCapabilities"
        }
    });
};

module.exports = {
    describeFeatureType: ({layer}) =>
        Rx.Observable.defer(() =>
            axios.get(toDescribeURL(layer))).let(interceptOGCError),
    getLayerWFSCapabilities: ({layer}) =>
            Rx.Observable.defer( () => axios.get(toLayerCapabilitiesURL(layer)))
            .let(interceptOGCError)
            .switchMap( response => Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
                 tagNameProcessors: [stripPrefix],
                 explicitArray: false,
                 mergeAttrs: true
            }, callback))(response.data)
        )

};
