const { withPropsOnChange } = require("recompose");

/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


module.exports = withPropsOnChange(
    ['mapType', 'plugins'],
    ({mapType, plugins} = {}) => ({
        plugins: {...require('../plugins/' + mapType + '.js')(), ...plugins}
    })
);
