 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const url = require('url');
const {endsWith} = require('lodash');

module.exports = {
    getWPSURL: (urlToParse, options) => {
        if (urlToParse) {
            const parsed = url.parse(urlToParse, true);
            let newPathname = null;
            if (endsWith(parsed.pathname, "wfs") || endsWith(parsed.pathname, "wms") || endsWith(parsed.pathname, "ows")) {
                newPathname = parsed.pathname.replace(/(wms|ows|wfs|wps)$/, "wps");
                return url.format({
                    ...parsed,
                    search: null,
                    pathname: newPathname,
                    query: {
                        service: "WPS",
                        ...options,
                        ...parsed.query
                    }
                });
            }
        }
    }
};
