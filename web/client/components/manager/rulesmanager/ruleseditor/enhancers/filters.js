/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {compose, withStateHandlers} = require("recompose");


module.exports = compose(
    withStateHandlers(() => ({
        panels: {}
    }),
    {
        onSwitch: ({panels}) => (panel, expanded) => ({
            panels: {...panels, [panel]: expanded}
        })

    })
);
