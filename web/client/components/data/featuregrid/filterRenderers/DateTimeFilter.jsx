/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose, withHandlers, defaultProps } from 'recompose';
import BaseDateTimeFilter from './BaseDateTimeFilter';

export default compose(
    defaultProps({
        onValueChange: () => { },
        value: null
    }),
    withHandlers({
        onChange: props => ({ value, attribute, stringValue } = {}) => {
            const match = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?(.*)/.exec(stringValue);
            const operator = match[1];
            let enhancedOperator = match[1] || '=';
            // replace with standard operators
            if (operator === "!==" | operator === "!=") {
                enhancedOperator = "<>";
            } else if (operator === "===" | operator === "==") {
                enhancedOperator = "=";
            }
            props.onValueChange(value);
            props.onChange({
                value: { startDate: value, operator },
                operator: enhancedOperator,
                type: props.type,
                attribute
            });
        }
    }),
    defaultProps({
        placeholderMsgId: "featuregrid.filter.placeholders.date",
        tooltipMsgId: "featuregrid.filter.tooltips.date"
    })
)(BaseDateTimeFilter);
