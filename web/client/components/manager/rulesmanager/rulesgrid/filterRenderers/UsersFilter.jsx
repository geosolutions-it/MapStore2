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
const localizedProps = require("../../../../misc/enhancers/localizedProps");
const {getUsers} = require('../../../../../observables/rulesmanager');
const {connect} = require("react-redux");
const {createSelector} = require("reselect");
const {filterSelector} = require("../../../../../selectors/rulesmanager");
const {error} = require('../../../../../actions/notifications');
const selector = createSelector(filterSelector, (filter) => ({
    selected: filter.username
}));

module.exports = compose(
    connect(selector, {onError: error}),
    defaultProps({
        size: 5,
        textField: "userName",
        valueField: "userName",
        loadData: getUsers,
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.filter",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingUsers"
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
