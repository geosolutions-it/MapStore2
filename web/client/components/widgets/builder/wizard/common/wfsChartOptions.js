/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import {compose, withProps} from 'recompose';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { applyDefaultToLocalizedString } from '../../../../I18N/LocalizedString';

import { getDefaultAggregationOperations } from '../../../../../utils/WidgetsUtils';
import {find} from 'lodash';

const propsToOptions = (props, fields = []) => props.filter(({type} = {}) => type.indexOf("gml:") !== 0)
    .map( ({name, localType} = {}) => ({label: applyDefaultToLocalizedString(find(fields, {name})?.alias, name), value: name, type: localType}));

const getAllowedAggregationOptions = (propertyName, featureTypeProperties = []) => {
    const prop = find(featureTypeProperties, {name: propertyName});
    if (prop && (prop.localType === 'number' || prop.localType === 'int')) {
        return getDefaultAggregationOperations();
    }
    return [{ value: "Count", label: "widgets.operations.COUNT"}];
};

export default compose(
    withProps(({featureTypeProperties = [], data = {}, layer} = {}) => ({
        options: propsToOptions(featureTypeProperties, layer?.fields),
        /** custom color-coded charts currently support string and number types only */
        aggregationOptions:
            (data?.widgetType !== "counter" ? [{ value: "None", label: "widgets.operations.NONE" }] : [])
                .concat(getAllowedAggregationOptions(data.options && data.options.aggregationAttribute, featureTypeProperties))
    })),
    localizedProps("options", "label", "object"),
    localizedProps("aggregationOptions")
);
