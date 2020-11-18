/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { isNil } from 'lodash';
import React from 'react';

import NumberFormat from '../../../I18N/Number';

export const getFormatter = (desc) => {
    if (desc.localType === 'boolean') {
        return ({value} = {}) => !isNil(value) ? <span>{value.toString()}</span> : null;
    } else if (['int', 'number'].includes(desc.localType)) {
        return ({value} = {}) => !isNil(value) ? <NumberFormat value={value} numberParams={{maximumFractionDigits: 17}}/> : null;
    }
    return null;
};

export default {
    getFormatter
};
