/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const {compose, withProps} = require('recompose');

const {find} = require('lodash');

const propsToOptions = props => props.filter(({type} = {}) => type.indexOf("gml:") !== 0)
    .map( ({name} = {}) => ({label: name, value: name}));

const getAllowedAggregationOptions = (propertyName, featureTypeProperties = []) => {
    const prop = find(featureTypeProperties, {name: propertyName});
    if (prop && (prop.localType === 'number' || prop.localType === 'int')) {
        return [
            {value: "Count", label: "COUNT"},
            {value: "Sum", label: "SUM"},
            {value: "Average", label: "AVG"},
            {value: "StdDev", label: "STDDEV"},
            {value: "Min", label: "MIN"},
            {value: "Max", label: "MAX"}
        ];
    }
    return [{value: "Count", label: "COUNT"}];
};

module.exports = compose(
    withProps(({featureTypeProperties = [], data = {}} = {}) => ({
        options: propsToOptions(featureTypeProperties),
        aggregationOptions: getAllowedAggregationOptions(data.options && data.options.aggregationAttribute, featureTypeProperties)
    })),

);
