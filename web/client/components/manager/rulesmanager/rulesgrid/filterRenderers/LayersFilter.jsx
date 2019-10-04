/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const PagedCombo = require('../../../../misc/combobox/PagedCombobox');
const autoComplete = require("../../enhancers/autoComplete");
const localizedProps = require("../../../../misc/enhancers/localizedProps");
const { compose, defaultProps, withHandlers} = require('recompose');
const {loadLayers} = require('../../../../../observables/rulesmanager');
const {error} = require('../../../../../actions/notifications');
const {connect} = require("react-redux");
const {createSelector} = require("reselect");
const {filterSelector} = require("../../../../../selectors/rulesmanager");
const workspaceSelector = createSelector(filterSelector, (filter) => filter.workspace);
const parentFiltersSel = createSelector(workspaceSelector, (workspace) => ({
    workspace
}));
const selector = createSelector([filterSelector, parentFiltersSel], (filter, parentsFilter) => ({
    selected: filter.layer,
    parentsFilter
}));

module.exports = compose(
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
