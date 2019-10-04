/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const data = [
    {name: 'A', variable: 2, pv: 2, amt: 2},
    {name: 'B', variable: 0.5, pv: 0.5, amt: 0.5},
    {name: 'C', variable: 3, pv: 3, amt: 3},
    {name: 'D', variable: 1, pv: 1, amt: 2}
];
const series = [{dataKey: "variable", color: `#078aa3`}];
const xAxis = {dataKey: "name", show: false};

const {defaultProps} = require('recompose');
module.exports = defaultProps({
    data,
    series,
    xAxis
});
