/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { optionsToVendorParams } from './VendorParamsUtils';
import urlUtil from 'url';
import {get, head} from 'lodash';


export const needsReload = (oldOptions, newOptions) => {
    const oldParams = { ...(optionsToVendorParams(oldOptions) || {}), _v_: oldOptions._v_ };
    const newParams = { ...(optionsToVendorParams(newOptions) || {}), _v_: newOptions._v_ };
    return ["_v_", "CQL_FILTER", "VIEWPARAMS"].reduce((found, param) => {
        if (oldParams[param] !== newParams[param]) {
            return true;
        }
        return found;
    }, false);
};

export const toDescribeURL = ({ name, search = {}, url, describeFeatureTypeURL } = {}) => {
    const parsed = urlUtil.parse(describeFeatureTypeURL || search.url || url, true);
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

/**
 * Extract GeometryType from JSON DescribeFeatureType
 */
export const extractGeometryType = describeFeatureType => {
    const properties = get(describeFeatureType, "featureTypes[0].properties") || [];
    return properties && head(properties
        .filter(elem => elem.type.indexOf("gml:") === 0) // find fields of geometric type
        .map(elem => elem.type.split(":")[1]) // extract the geometry name. E.g. from gml:Point extract the "Point" string
    );
};
/**
 * Extract GeometryType from JSON DescribeFeatureType
 */
export const extractGeometryAttributeName = describeFeatureType => {
    const properties = get(describeFeatureType, "featureTypes[0].properties") || [];
    return properties && head(properties
        .filter(elem => elem.type.indexOf("gml:") === 0) // find fields of geometric type
        .map(elem => elem.name) // extract the geometry attribute name. E.g. from gml:Point extract the "Point" string
    );
};
