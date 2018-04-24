/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const {compose, defaultProps} = require('recompose');
const resourceGrid = require('../../components/resources/enhancers/resourceGrid');
const Grid = compose(
    defaultProps({
        category: "DASHBOARD",

    }),
    resourceGrid
)(require('../../components/resources/ResourceGrid'));

module.exports = Grid;
