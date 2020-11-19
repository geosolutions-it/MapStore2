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
import { filterSelector, servicesSelector } from '../../../../../selectors/rulesmanager';

const selector = createSelector(filterSelector, servicesSelector, (filter, services) => ({
    selected: filter.service,
    services
}));

export default compose(
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
