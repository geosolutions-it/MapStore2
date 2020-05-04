/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';

import FeatureInfoUtils from './FeatureInfoUtils';

export const getFormatForResponse = (res, props) => {
    const {format, queryParams} = res;
    let infoFormat;
    if (queryParams && queryParams.hasOwnProperty('info_format')) {
        infoFormat = queryParams.info_format;
    }

    return infoFormat || format && FeatureInfoUtils.INFO_FORMATS[format] || props.format;
};

export const responseValidForEdit = (res) => !!get(res, 'layer.search.url');
