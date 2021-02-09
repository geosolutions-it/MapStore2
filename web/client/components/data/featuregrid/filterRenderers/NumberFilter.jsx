/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import AttributeFilter from './AttributeFilter';

import { trim, identity } from 'lodash';
import { compose, withHandlers, withState, defaultProps } from 'recompose';
const COMMA_REGEX = /\,/;
import { getOperatorAndValue } from '../../../../utils/FeatureGridUtils';

export default compose(
    defaultProps({
        onValueChange: () => {}
    }),
    withState("valid", "setValid", true),
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            if (!COMMA_REGEX.exec(value)) {
                let {operator, newVal} = getOperatorAndValue(value, "number");
                if (isNaN(newVal) && trim(value) !== "") {
                    props.setValid(false);
                } else {
                    props.setValid(true);
                }
                props.onChange({
                    value: isNaN(newVal) ? undefined : newVal,
                    rawValue: value,
                    operator,
                    type: 'number',
                    attribute
                });
            } else {
                const multipleValues = value?.split(",").filter(identity) || [];
                const isValid = multipleValues.reduce((valid, v) => {
                    let {newVal} = getOperatorAndValue(v);
                    return valid && !(isNaN(newVal) && trim(v) !== "");
                }, true);
                props.setValid(isValid);
                props.onChange({
                    value: value,
                    rawValue: value,
                    operator: "=",
                    type: 'number',
                    attribute
                });
            }

        }
    }),
    defaultProps({
        placeholderMsgId: "featuregrid.filter.placeholders.number",
        tooltipMsgId: "featuregrid.filter.tooltips.number"
    })
)(AttributeFilter);
