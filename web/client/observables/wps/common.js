/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import url from 'url';

import { endsWith } from 'lodash';

export const getWPSURL = (urlToParse, options) => {
    if (urlToParse) {
        const parsed = url.parse(urlToParse, true);
        let newPathname = parsed.pathname;
        if (endsWith(parsed.pathname, "wfs") || endsWith(parsed.pathname, "wms")) {
            newPathname = parsed.pathname.replace(/(wms|ows|wfs|wps)$/, "wps");
        }
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
    return urlToParse;
};

export default {
    getWPSURL
};
