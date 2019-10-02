/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PagedCombo = require('../../../../misc/combobox/PagedCombobox');
const fixedOptions = require("../../enhancers/fixedOptions");
const localizedProps = require("../../../../misc/enhancers/localizedProps");
const { compose, defaultProps, withHandlers, withPropsOnChange} = require('recompose');

const {connect} = require("react-redux");
const {createSelector} = require("reselect");
const {filterSelector, servicesConfigSel} = require("../../../../../selectors/rulesmanager");
const serviceSelector = createSelector(filterSelector, (filter) => filter.service);
const parentFiltersSel = createSelector(serviceSelector, (service) => ({
    parentFilters: {service}
}));
const selector = createSelector([filterSelector, parentFiltersSel, servicesConfigSel], (filter, parentsFilter, services) => ({
    selected: filter.request,
    disabled: !filter.service,
    service: filter.service,
    parentsFilter,
    services
}));


module.exports = compose(
    connect(selector),
    defaultProps({
        size: 5,
        textField: "label",
        valueField: "value",
        parentsFilter: {},
        filter: "startsWith",
        placeholder: "rulesmanager.placeholders.filter",
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
        }
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
    localizedProps(["placeholder"]),
    fixedOptions
)(PagedCombo);
