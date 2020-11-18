/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';

import axios from '../../libs/ajax';
import { interceptOGCError } from '../../utils/ObservableUtils';
import { getWPSURL } from './common';

export const describeProcess = (url, identifier) =>
    Observable.defer( () => axios.get(getWPSURL(url, {
        "version": "1.0.0",
        "REQUEST": "DescribeProcess",
        "IDENTIFIER": identifier }), {
        timeout: 5000,
        headers: {'Accept': 'application/json', 'Content-Type': 'application/xml'}
    })).let(interceptOGCError);


export default {
    describeProcess
};
