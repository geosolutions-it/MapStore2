/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import workerRequest from './workerRequest';

const getFeatureWorker = new Worker(new URL('./modules/WFSGetFeature', import.meta.url));

export const getFeature = (url, typeName, params, config) => {
    return workerRequest(getFeatureWorker, { url, typeName, params, config });
};
