/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { compose, withState } = require('recompose');
const { createSelector } = require('reselect');
const { isShowSaveOpen, dashboardMetadata } = require('../../selectors/dashboard');
const { widgetsConfig } = require('../../selectors/widgets');
const { saveDashboard } = require('../../actions/dashboard');
const handleResourceData = require('../../components/dashboard/modals/enhancers/handleResourceData');
module.exports = compose(
    connect(createSelector(
        isShowSaveOpen,
        dashboardMetadata,
        widgetsConfig,
        (show, resource, data) => ({ show, resource, data })
    ), {
        onSave: saveDashboard
    }),
    handleResourceData,
    withState("errors", "onError", []),
)(require('../../components/dashboard/modals/Save'));
