/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describeProcess } from '../wps/describe';

/**
 * Try to get the gs:Aggregate process for the layer passed. Emit an exception if not
 * found.
 * @param {object} layer a layer oblect, has a `url` attribute
 */
export default function pingAggregateProcess(layer) {
    return describeProcess(layer.url, "gs:Aggregate");
}
