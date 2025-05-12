/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import PagedCombo from '../../../../misc/combobox/PagedCombobox';

import autoComplete from '../../enhancers/autoComplete';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { compose, defaultProps, withHandlers } from 'recompose';
import { loadGSInstancesForDD } from '../../../../../observables/rulesmanager';
import { error } from '../../../../../actions/notifications';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector } from '../../../../../selectors/rulesmanager';
const selector = createSelector([filterSelector], (filter) => ({
    selected: filter.instance,
    anyFieldVal: filter.instanceAny
}));

export default compose(
    connect(selector, (dispatch) => ({onError: error, loadData: (...args) => loadGSInstancesForDD(dispatch, ...args)})),
    defaultProps({
        paginated: false,
        size: 5,
        textField: "name",
        valueField: "name",
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.filterAny",
        unCheckedAnyField: "rulesmanager.tooltip.filterRuleList",
        checkedAnyField: "rulesmanager.tooltip.showAllRules",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingLayers"
        },
        anyFilterRuleMode: 'instanceAny'
    }),
    withHandlers({
        onValueSelected: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["placeholder", "loadingErroMsg", "checkedAnyField", "unCheckedAnyField"]),
    autoComplete
)(PagedCombo);
