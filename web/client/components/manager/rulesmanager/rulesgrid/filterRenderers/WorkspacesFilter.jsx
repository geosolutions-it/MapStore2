/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import PagedCombo from '../../../../misc/combobox/PagedCombobox';

import autoComplete from '../../enhancers/autoComplete';
import { compose, defaultProps, withHandlers } from 'recompose';
import { error } from '../../../../../actions/notifications';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { getWorkspaces } from '../../../../../observables/rulesmanager';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector } from '../../../../../selectors/rulesmanager';

const selector = createSelector(filterSelector, (filter) => ({
    selected: filter.workspace
}));


export default compose(
    connect(selector, {onError: error}),
    defaultProps({
        paginated: false,
        size: 5,
        textField: "name",
        valueField: "name",
        loadData: getWorkspaces,
        parentsFilter: {},
        filter: "startsWith",
        placeholder: "rulesmanager.placeholders.filter",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingWorkspaces"
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
