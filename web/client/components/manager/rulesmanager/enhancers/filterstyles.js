/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {compose, withStateHandlers, defaultProps} = require("recompose");
const withLocal = require("../../../misc/enhancers/localizedProps");

module.exports = compose(
    defaultProps({
        filterPlaceholder: "rulesmanager.placeholders.filter"
    }),
    withStateHandlers(({}
    ) => ({}),
    {
        onFilter: () => (stylesFilter) => ({
            stylesFilter
        })

    }),
    withLocal("filterPlaceholder")
);
