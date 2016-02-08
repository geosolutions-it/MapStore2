/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const TOGGLE_GRATICULE = 'TOGGLE_GRATICULE';


function toggleGraticule() {
    return {
        type: TOGGLE_GRATICULE
    };
}
module.exports = {TOGGLE_GRATICULE, toggleGraticule};
