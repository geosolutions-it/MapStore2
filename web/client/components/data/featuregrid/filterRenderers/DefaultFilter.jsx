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
            props.onChange({
                value: value,
                operator: "=",
                type: props.type,
                attribute
            });
        }
    })
)(AttributeFilter);
