/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, branch, renderComponent, defaultProps } from 'recompose';
import { connect } from 'react-redux';
import { dashboardSetSelectedService, setDashboardCatalogMode, dashboardDeleteService,
    updateDashboardService } from '../../../actions/dashboard';
import { dashboardServicesSelector,
    selectedDashboardServiceSelector, dashboardCatalogModeSelector, dashboardIsNewServiceSelector } from '../../../selectors/dashboard';
import { error } from '../../../actions/notifications';
import CatalogServiceEditor from '../CatalogServiceEditor';

export const catalogEditorEnhancer = compose(
    defaultProps({id: 'dashboard-catalog-selector', buttonStyle: {
        marginBottom: "10px",
        marginRight: "5px"}}),
    connect((state) => ({
        mode: dashboardCatalogModeSelector(state),
        dashboardServices: dashboardServicesSelector(state),
        dashboardSelectedService: selectedDashboardServiceSelector(state),
        isNew: dashboardIsNewServiceSelector(state)
    }), {
        onChangeSelectedService: dashboardSetSelectedService,
        onChangeCatalogMode: setDashboardCatalogMode,
        onDeleteService: dashboardDeleteService,
        onAddService: updateDashboardService,
        error: error
    }),
    branch(
        ({mode} = {}) => mode === 'edit',
        renderComponent(CatalogServiceEditor)
    )
);
