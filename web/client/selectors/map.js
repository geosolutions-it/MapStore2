/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

module.exports = {
    mapSelector: (state) => (state.map && state.map.present) || (state.map) || (state.config && state.config.map) || null
};
