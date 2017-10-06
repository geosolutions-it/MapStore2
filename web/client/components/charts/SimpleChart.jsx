/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Tooltip, Legend} = require('recharts');

const {sameToneRangeColors} = require('../../utils/ColorUtils');
const charts = {
   line: require('./Line'),
   pie: require('./Pie'),
   bar: require('./Bar'),
   gauge: require('./Gauge')
};

const AUTOCOLOR_DEFAULTS = {
    base: 180,
    range: 360,
    s: 0.67,
    v: 0.67
};

const SimpleChart = ({type="line", tooltip = {}, legend = {}, autoColorOptions = AUTOCOLOR_DEFAULTS, ...props} = {}) => {
    const Component = charts[type];
    const {base, range, ...opts} = autoColorOptions;
    const defaultColorGenerator = (total) => {
        return (sameToneRangeColors(base, range, total + 1, opts) || []).slice(1);
    };
    return (<Component margin={{top: 5, right: 30, left: 20, bottom: 5}} colorGenerator={defaultColorGenerator} {...props}>
      {tooltip !== false ? <Tooltip {...tooltip}/> : null}
      {legend !== false ? <Legend {...legend}/> : null}
     </Component>
   );
};

module.exports = SimpleChart;
