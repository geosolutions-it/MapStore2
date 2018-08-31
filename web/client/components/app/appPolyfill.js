/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// issue #3147 Element.closest is not supported in ie11
require('element-closest');

// issue #3153  Embedded doesn't work on ie11
require('es6-object-assign').polyfill();
