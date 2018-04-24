import { withStateHandlers } from 'recompose';

/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { compose, withProps, branch, renderNothing } = require('recompose');
const { createSelector } = require('reselect');

const { userSelector } = require('../../selectors/security');
const { widgetsConfig } = require('../../selectors/widgets');
const { isShowSaveOpen, dashboardResource, isDashboardLoading, getDashboardSaveErrors } = require('../../selectors/dashboard');
const { saveDashboard, triggerSave } = require('../../actions/dashboard');
const handleResourceData = require('../../components/dashboard/modals/enhancers/handleResourceData');
const handlePermission = require('../../components/dashboard/modals/enhancers/handlePermission');

/**
 * Save dialog component enhanced for dashboard
 *
 */
module.exports = compose(
    connect(createSelector(
        isShowSaveOpen,
        dashboardResource,
        widgetsConfig,
        userSelector,
        isDashboardLoading,
        getDashboardSaveErrors,
        (show, resource, data, user, loading, errors ) => ({ show, resource, data, user, loading, errors })
    ), {
        onClose: () => triggerSave(false),
        onSave: saveDashboard
    }),
    branch(
        ({show}) => !show,
        renderNothing
    ),
    handleResourceData,
    handlePermission(),
    withStateHandlers(
        () => ({}),
        {
            onError: () => (formErrors) => ({ formErrors })
        }
    ),
    withProps(
        ({errors = [], formErrors = []}) => ({
            errors: [...errors, ...formErrors]
        })
    )

)(require('../../components/dashboard/modals/Save'));
