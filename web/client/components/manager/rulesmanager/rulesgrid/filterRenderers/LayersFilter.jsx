/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import PagedCombo from '../../../../misc/combobox/PagedCombobox';

import autoComplete from '../../enhancers/autoComplete';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { compose, defaultProps, withHandlers } from 'recompose';
import { loadLayers } from '../../../../../observables/rulesmanager';
import { error } from '../../../../../actions/notifications';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector } from '../../../../../selectors/rulesmanager';
const workspaceSelector = createSelector(filterSelector, (filter) => filter.workspace);
const parentFiltersSel = createSelector(workspaceSelector, (workspace) => ({
    workspace
}));
const selector = createSelector([filterSelector, parentFiltersSel], (filter, parentsFilter) => ({
    selected: filter.layer,
    parentsFilter
}));

export default compose(
    connect(selector, {onError: error}),
    defaultProps({
        size: 5,
        textField: "name",
        valueField: "name",
        loadData: loadLayers,
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.filter",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingLayers"
        }
    }),
    withHandlers({
        onValueSelected: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["placeholder"]),
    autoComplete
)(PagedCombo);
