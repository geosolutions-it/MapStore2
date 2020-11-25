/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import loadingStateFactory from '../../misc/enhancers/loadingState';

const loadingState = loadingStateFactory();
import errorChartState from '../enhancers/errorChartState';
import emptyChartState from '../enhancers/emptyChartState';
import FormatNumber from '../../I18N/Number';
import { compose } from 'recompose';
import { get } from 'lodash';
import { Textfit } from 'react-textfit';
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
import React from 'react';

export default enhanceCounter(({ series = [], data = [], options = {}, style = {
    width: "100%",
    height: "100%",
    transform: "translate(-50%, -50%)",
    position: "absolute",
    display: "inline",
    padding: "1%",
    top: "50%",
    left: "50%"
}} ) => {
    const renderCounter = ({ dataKey } = {}, i) => (<Counter
        key={dataKey}
        uom={get(options, `seriesOptions[${i}].uom`)}
        value={data[0][dataKey]}
        style={{ textAlign: "center", ...style }}
    />);
    return (<div className="counter-widget-view">{series.map(renderCounter)}</div>);
});
