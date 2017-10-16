 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const {compose, defaultProps, withProps} = require('recompose');
const propsStreamFactory = require('../../../../misc/enhancers/propsStreamFactory');

const {get, find} = require('lodash');
const {describeFeatureType} = require('../../../../../observables/wfs');
const dataStreamFactory = ($props, {layer, url}) =>
    describeFeatureType({layer, url})
        .map((response = {}) => ({
              isLoading: false,
              featureTypeProperties: get(response, "data.featureTypes[0].properties") || []
        })
    ).startWith({isLoading: true});
const propsToOptions = props => props.filter(({type} = {}) => type.indexOf("gml:") !== 0)
.map( ({name} = {}) => ({label: name, value: name}));

const getAllowedAggregationOptions = (propertyName, featureTypeProperties = []) => {
    const prop = find(featureTypeProperties, {name: propertyName});
    if (prop && prop.localType === 'number') {
        return [
          {value: "Count", label: "COUNT"},
          {value: "Sum", label: "SUM"},
          {value: "Average", label: "AVG"},
          {value: "Min", label: "MIN"},
          {value: "Max", label: "MAX"}
      ];
    }
    return [{value: "Count", label: "COUNT"}];
};

module.exports = compose(
  defaultProps({
      dataStreamFactory
  }),
  propsStreamFactory,
  withProps(({featureTypeProperties = [], data = {}} = {}) => ({
      options: propsToOptions(featureTypeProperties),
      aggregationOptions: getAllowedAggregationOptions(data.aggregationAttribute, featureTypeProperties)
  })),

);
