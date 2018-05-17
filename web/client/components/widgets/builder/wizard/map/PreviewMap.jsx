/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const previewMap = require('./enhancers/previewMap');
module.exports = previewMap(require('../../../widget/MapView'));
