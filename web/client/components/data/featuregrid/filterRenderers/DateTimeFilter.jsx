 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const {compose, withHandlers, defaultProps} = require('recompose');
const BaseDateTimeFilter = require('./BaseDateTimeFilter');
module.exports = compose(
    defaultProps({
        onValueChange: () => {},
        value: null
    }),
    withHandlers({
        onChange: props => ({value, attribute} = {}) => {
            props.onValueChange(value);
            props.onChange({
                value: {startDate: value},
                operator: "=",
                type: props.type,
                attribute
            });
        }
    }),
    defaultProps({
        placeholderMsgId: "featuregrid.filter.placeholders.date"
    })
)(BaseDateTimeFilter);
