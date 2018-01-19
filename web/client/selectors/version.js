/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const versionSelector = (state) => state.version && state.version.current || '';
const validateVersion = version => version && version.indexOf('${mapstore2.version}') === -1 && version.indexOf('no-version') === -1 ? true : false;

module.exports = {
    versionSelector,
    validateVersion
};
