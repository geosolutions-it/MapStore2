 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const AttributeFilter = require('./AttributeFilter');
const {compose, withHandlers, defaultProps} = require('recompose');

module.exports = compose(
    defaultProps({
        onValueChange: () => {}
    }),
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            let operator = "=";
            let newVal;
            if (value.indexOf('>') > -1) { // handle greater then
                newVal = parseFloat(value.split('>')[1], 10);
                operator = ">";
            } else if (value.indexOf('<') > -1) { // handle less then
                newVal = parseFloat(value.split('<')[1], 10);
                operator = "<";
            } else { // handle normal values
                newVal = parseFloat(value, 10);
            }
            props.onChange({
                value: isNaN(newVal) ? undefined : newVal,
                rawValue: value,
                operator,
                type: 'number',
                attribute
            });
        }
    }),
    defaultProps({
        placeholderMsgId: "featuregrid.filter.placeholders.number",
        tooltipMsgId: "featuregrid.filter.tooltips.number"
    })
)(AttributeFilter);
