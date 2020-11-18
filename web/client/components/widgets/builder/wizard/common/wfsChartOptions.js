/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import {compose, withProps} from 'recompose';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import {find} from 'lodash';

const propsToOptions = props => props.filter(({type} = {}) => type.indexOf("gml:") !== 0)
    .map( ({name} = {}) => ({label: name, value: name}));

const getAllowedAggregationOptions = (propertyName, featureTypeProperties = []) => {
    const prop = find(featureTypeProperties, {name: propertyName});
    if (prop && (prop.localType === 'number' || prop.localType === 'int')) {
        return [
            {value: "Count", label: "widgets.operations.COUNT"},
            { value: "Sum", label: "widgets.operations.SUM"},
            { value: "Average", label: "widgets.operations.AVG"},
            { value: "StdDev", label: "widgets.operations.STDDEV"},
            { value: "Min", label: "widgets.operations.MIN"},
            { value: "Max", label: "widgets.operations.MAX"}
        ];
    }
    return [{ value: "Count", label: "widgets.operations.COUNT"}];
};

export default compose(
    withProps(({featureTypeProperties = [], data = {}} = {}) => ({
        options: propsToOptions(featureTypeProperties),
        aggregationOptions:
            (data?.widgetType !== "counter" ? [{ value: "None", label: "widgets.operations.NONE" }] : [])
                .concat(getAllowedAggregationOptions(data.options && data.options.aggregationAttribute, featureTypeProperties))
    })),
    localizedProps("aggregationOptions")

);
