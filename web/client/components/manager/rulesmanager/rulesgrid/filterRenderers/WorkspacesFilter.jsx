/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import PagedCombo from '../../../../misc/combobox/PagedCombobox';

import autoComplete from '../../enhancers/autoComplete';
import { compose, defaultProps, withHandlers, withProps } from 'recompose';
import { error } from '../../../../../actions/notifications';
import localizedProps from '../../../../misc/enhancers/localizedProps';
import { getWorkspaces } from '../../../../../observables/rulesmanager';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector, gsInstancesDDListSelector } from '../../../../../selectors/rulesmanager';
import Api from '../../../../../api/geoserver/GeoFence';

const selector = createSelector(filterSelector, gsInstancesDDListSelector, (filter, gsInstancesList) => {
    const isStandAloneGeofence = Api.getRuleServiceType() === 'geofence';
    return {
        selected: filter.workspace,
        anyFieldVal: filter.workspaceAny,
        disabled: isStandAloneGeofence ? !filter.instance : false,
        gsInstanceObject: filter?.instance ? gsInstancesList?.find(gsIns => gsIns.name === filter?.instance) : undefined
    };
});


export default compose(
    connect(selector, {onError: error}),
    defaultProps({
        paginated: false,
        size: 5,
        textField: "name",
        valueField: "name",
        parentsFilter: {},
        filter: "startsWith",
        placeholder: "rulesmanager.placeholders.filterAny",
        unCheckedAnyField: "rulesmanager.tooltip.filterRuleList",
        checkedAnyField: "rulesmanager.tooltip.showAllRules",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingWorkspaces"
        },
        anyFilterRuleMode: 'workspaceAny'
    }),
    withProps((ownProps) => ({
        loadData: ({size}) => getWorkspaces({size, gsInstanceURL: ownProps?.gsInstanceObject?.url} )
    })),
    withHandlers({
        onValueSelected: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["placeholder", "loadingErroMsg", "checkedAnyField", "unCheckedAnyField"]),
    autoComplete
)(PagedCombo);
