/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import PagedCombo from '../../../../misc/combobox/PagedCombobox';

import fixedOptions from '../../enhancers/fixedOptions';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { compose, defaultProps, withHandlers, withPropsOnChange } from 'recompose';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector, servicesConfigSel } from '../../../../../selectors/rulesmanager';
const serviceSelector = createSelector(filterSelector, (filter) => filter.service);
const parentFiltersSel = createSelector(serviceSelector, (service) => ({
    parentFilters: {service}
}));
const selector = createSelector([filterSelector, parentFiltersSel, servicesConfigSel], (filter, parentsFilter, services) => ({
    selected: filter.request,
    disabled: !filter.service,
    service: filter.service,
    parentsFilter,
    services,
    anyFieldVal: filter.requestAny
}));


export default compose(
    connect(selector),
    defaultProps({
        size: 5,
        textField: "label",
        valueField: "value",
        parentsFilter: {},
        filter: "startsWith",
        placeholder: "rulesmanager.placeholders.filterAny",
        unCheckedAnyField: "rulesmanager.tooltip.filterRuleList",
        checkedAnyField: "rulesmanager.tooltip.showAllRules",
        services: {
            "WFS": [
                "DescribeFeatureType",
                "GetCapabilities",
                "GetFeature",
                "GetFeatureWithLock",
                "LockFeature",
                "Transaction"
            ],
            "WMS": [
                "DescribeLayer",
                "GetCapabilities",
                "GetFeatureInfo",
                "GetLegendGraphic",
                "GetMap",
                "GetStyles"
            ]
        },
        anyFilterRuleMode: 'requestAny'
    }),
    withPropsOnChange(["service", "services"], ({services = {}, service}) => {
        return {
            data: service && (services[service] || []).map(req => ({label: req, value: req.toUpperCase()}))
        };
    }),
    withHandlers({
        onValueSelected: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["placeholder", "checkedAnyField", "unCheckedAnyField"]),
    fixedOptions
)(PagedCombo);
