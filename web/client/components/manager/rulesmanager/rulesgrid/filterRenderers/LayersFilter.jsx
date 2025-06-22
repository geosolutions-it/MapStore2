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
import { compose, defaultProps, withHandlers, withProps } from 'recompose';
import { loadLayers } from '../../../../../observables/rulesmanager';
import { error } from '../../../../../actions/notifications';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filterSelector, gsInstancesDDListSelector } from '../../../../../selectors/rulesmanager';
import Api from '../../../../../api/geoserver/GeoFence';

const workspaceSelector = createSelector(filterSelector, (filter) => filter.workspace);
const parentFiltersSel = createSelector(workspaceSelector, (workspace) => ({
    workspace
}));
const selector = createSelector([filterSelector, parentFiltersSel, gsInstancesDDListSelector], (filter, parentsFilter, gsInstancesList) => {
    const isStandAloneGeofence = Api.getRuleServiceType() === 'geofence';
    return {
        selected: filter.layer,
        parentsFilter,
        anyFieldVal: filter.layerAny,
        disabled: isStandAloneGeofence ? !filter.instance : false,
        gsInstanceObject: filter?.instance ? gsInstancesList?.find(gsIns => gsIns.name === filter?.instance) : undefined
    };
});

export default compose(
    connect(selector, {onError: error}),
    defaultProps({
        size: 5,
        textField: "name",
        valueField: "name",
        // loadData: loadLayers,
        parentsFilter: {},
        filter: false,
        placeholder: "rulesmanager.placeholders.filterAny",
        unCheckedAnyField: "rulesmanager.tooltip.filterRuleList",
        checkedAnyField: "rulesmanager.tooltip.showAllRules",
        loadingErrorMsg: {
            title: "rulesmanager.errorTitle",
            message: "rulesmanager.errorLoadingLayers"
        },
        anyFilterRuleMode: 'layerAny'
    }),
    withProps((ownProps) => ({
        loadData: (...args) => loadLayers(...args, ownProps?.gsInstanceObject?.url)
    })),
    withHandlers({
        onValueSelected: ({column = {}, onFilterChange = () => {}}) => filterTerm => {
            onFilterChange({column, filterTerm});
        }
    }),
    localizedProps(["placeholder", "loadingErroMsg", "checkedAnyField", "unCheckedAnyField"]),
    autoComplete
)(PagedCombo);
