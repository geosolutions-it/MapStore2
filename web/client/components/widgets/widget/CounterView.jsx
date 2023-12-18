/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose } from 'recompose';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { Textfit } from 'react-textfit';
import PropTypes from 'prop-types';
import {format} from 'd3-format';
import React from 'react';

import loadingStateFactory from '../../misc/enhancers/loadingState';
import errorChartState from '../enhancers/errorChartState';
import emptyChartState from '../enhancers/emptyChartState';

import { parseExpression } from '../../../utils/ExpressionUtils';
import { FONT } from '../../../utils/WidgetsUtils';

const loadingState = loadingStateFactory();
const processFormula = (v, formula = "") => {
    const value = v;
    try {
        return parseExpression(formula, {value});
    } catch {
        // if error (e.g. null values), return the value itself
        return v;
    }
};
const Counter = ({
    value = "",
    uom = "",
    formula = "",
    counterOpts = {
        tickPrefix: "",
        tickSuffix: ""
    },
    ...props
} = {}) =>{
    let val = value;
    if (formula) {
        val = processFormula(value, formula);
    }
    if (counterOpts?.format) {
        try {
            const formatter = format(counterOpts.format);
            val = formatter(val);
        } catch (e) {
            console.error(e);
        }
    }
    const layoutStyle = {
        fontFamily: counterOpts?.layout?.fontFamily || FONT.FAMILY,
        color: counterOpts?.layout?.color || FONT.COLOR
    };
    const prefixSuffixStyle = {
        fontSize: "75%",
        ...layoutStyle
    };
    return (<Textfit
        mode="single"
        forceSingleModeWidth={false}
        max={500}
        throttle={20}
        {...props}
    >
        <span style={prefixSuffixStyle}>
            {counterOpts?.tickPrefix ? counterOpts.tickPrefix : null}
        </span>
        <span className="value" style={layoutStyle}>
            {isNil(val) ? 0 : val}
        </span>
        <span style={prefixSuffixStyle}>
            {counterOpts?.tickSuffix || uom}
        </span>
    </Textfit>);
};
const enhanceCounter = compose(
    loadingState,
    errorChartState,
    emptyChartState
);

const CounterView = enhanceCounter(({
    series = [],
    data = [],
    options = {},
    style = {
        width: "100%",
        height: "100%",
        transform: "translate(-50%, -50%)",
        position: "absolute",
        display: "inline",
        padding: "1%",
        top: "50%",
        left: "50%"
    },
    counterOpts,
    formula
}) => {
    const renderCounter = ({ dataKey } = {}, i) => (<Counter
        key={dataKey}
        uom={get(options, `seriesOptions[${i}].uom`)}
        value={data[0][dataKey] || 0}
        counterOpts={counterOpts}
        formula={formula}
        style={{ textAlign: "center", ...style }}
    />);
    return (<div className="counter-widget-view">{series.map(renderCounter)}</div>);
});

Counter.propTypes = {
    uom: PropTypes.string,
    value: PropTypes.string,
    formula: PropTypes.string,
    counterOpts: PropTypes.object
};
export default CounterView;
