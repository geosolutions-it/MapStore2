/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import geostory from './geostory';


const registry = {
    "geostory": geostory
};


export default () => registry.geostory; // TODO: support other kinds of media types and sources
