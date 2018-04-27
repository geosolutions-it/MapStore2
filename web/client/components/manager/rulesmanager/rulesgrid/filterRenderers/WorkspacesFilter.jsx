/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PagedCombo = require('../../../../misc/combobox/PagedCombobox');
const autoComplete = require("../../enhancers/autoComplete");
const { compose, defaultProps, withHandlers} = require('recompose');
const {error} = require('../../../../../actions/notifications');
const localizedProps = require("../../../../misc/enhancers/localizedProps");
const {getWorkspaces} = require('../../../../../observables/rulesmanager');
const {connect} = require("react-redux");
const {createSelector} = require("reselect");
const {filterSelector} = require("../../../../../selectors/rulesmanager");

const selector = createSelector(filterSelector, (filter) => ({
    selected: filter.workspace
}));


module.exports = compose(
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
