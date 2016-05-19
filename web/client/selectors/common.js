/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Here common selectorCreators and reusable selectors */

const {createSelectorCreator, defaultMemoize } = require('reselect');
const createDefaultMemorizeSelector = createSelectorCreator(
   defaultMemoize
 );

module.exports = {createDefaultMemorizeSelector};
