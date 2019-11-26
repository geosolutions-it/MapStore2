/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { compose, defaultProps, withHandlers } = require('recompose');
const { deleteDashboard, reloadDashboards, showSuccessNotification } = require('../../actions/dashboards');
const { updateAttribute, setFeaturedMapsLatestResource } = require('../../actions/maps'); // TODO: externalize
const { userSelector } = require('../../selectors/security');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const resourceGrid = require('../../components/resources/enhancers/resourceGrid');
const withShareTool = require('../../components/resources/enhancers/withShareTool').default;
const Grid = compose(
    connect(createSelector(userSelector, user => ({ user })), {
        onDelete: deleteDashboard,
        reloadDashboards,
        onShowSuccessNotification: showSuccessNotification,
        setFeaturedMapsLatestResource,
        onUpdateAttribute: updateAttribute
    }),
    withHandlers({
        onSaveSuccess: (props) => (resource) => {
            if (props.reloadDashboards) {
                props.reloadDashboards();
            }
            if (props.setFeaturedMapsLatestResource) {
                props.setFeaturedMapsLatestResource(resource);
            }
            if (props.onShowSuccessNotification) {
                props.onShowSuccessNotification();
            }
        }
    }),
    defaultProps({
        category: "DASHBOARD"
    }),
    resourceGrid,
    withShareTool
)(require('../../components/resources/ResourceGrid'));

module.exports = Grid;
