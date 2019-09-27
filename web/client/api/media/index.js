/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as geostory from './geostory';

const registry = {
    "geostory": geostory
};


export default (sourceType) => registry[sourceType]; // TODO: support other kinds of media types and sources
