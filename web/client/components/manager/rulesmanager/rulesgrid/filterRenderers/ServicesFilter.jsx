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
const {filterSelector, servicesSelector} = require("../../../../../selectors/rulesmanager");

const selector = createSelector(filterSelector, servicesSelector, (filter, services) => ({
    selected: filter.service,
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
        data: [
            {value: "WMS", label: "WMS"},
            {value: "WFS", label: "WFS"},
            {value: "WCS", label: "WCS"}
        ]
    }),
    withPropsOnChange(["services"], ({services, data}) => ({data: services || data})),
    withHandlers({
        onValueSelected: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["placeholder"]),
    fixedOptions
)(PagedCombo);
