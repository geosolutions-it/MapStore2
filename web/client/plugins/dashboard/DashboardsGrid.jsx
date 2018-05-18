/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { compose, defaultProps } = require('recompose');
const { deleteDashboard, reloadDashboards } = require('../../actions/dashboards');
const { updateAttribute } = require('../../actions/maps'); // TODO: externalize
const { userSelector } = require('../../selectors/security');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const resourceGrid = require('../../components/resources/enhancers/resourceGrid');
const Grid = compose(
    connect(createSelector(userSelector, user => ({ user })), {
        onDelete: deleteDashboard,
        onSaveSuccess: reloadDashboards,
        onUpdateAttribute: updateAttribute
    }),
    defaultProps({
        category: "DASHBOARD"

    }),
    resourceGrid
)(require('../../components/resources/ResourceGrid'));

module.exports = Grid;
