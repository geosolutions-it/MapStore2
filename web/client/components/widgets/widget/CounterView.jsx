/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const loadingState = require('../../misc/enhancers/loadingState')();
const errorChartState = require('../enhancers/errorChartState');
const emptyChartState = require('../enhancers/emptyChartState');
const FormatNumber = require('../../I18N/Number');
const {compose} = require('recompose');
const {get} = require('lodash');
const {Textfit} = require('react-textfit');
const Counter = ({ value = "", uom = "", ...props } = {}) => (<Textfit
    mode="single"
    forceSingleModeWidth={false}
    max={500}
    throttle={20}
    {...props}>
    <FormatNumber value={value} /><span style={{fontSize: "75%"}}>{uom}</span>
</Textfit>);
const enhanceCounter = compose(
    loadingState,
    errorChartState,
    emptyChartState
);
const React = require('react');
module.exports = enhanceCounter(({ width = "100%", height="100%", series = [], data = [], options={}, style} = {}) => {
    const renderCounter = ({ dataKey } = {}, i) => (<Counter
        key={dataKey}
        uom={get(options, `seriesOptions[${i}].uom`)}
        value={data[0][dataKey]}
        style={{ width, height, textAlign: "center", ...style }}
    />);
    return series.length === 1 ? renderCounter(series[0], 0) : <div className="counter">{series.map(renderCounter)}</div>;
});
