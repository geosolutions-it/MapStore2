/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { compose, defaultProps, withHandlers } = require('recompose');
const { deleteDashboard, reloadDashboards } = require('../../actions/dashboards');
const { updateAttribute, setFeaturedMapsLatestResource } = require('../../actions/maps'); // TODO: externalize
const { userSelector } = require('../../selectors/security');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const resourceGrid = require('../../components/resources/enhancers/resourceGrid');
const shareTool = require('../../components/resources/enhancers/shareTool').default;
const Grid = compose(
    connect(createSelector(userSelector, user => ({ user })), {
        onDelete: deleteDashboard,
        reloadDashboards,
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
        }
    }),
    defaultProps({
        category: "DASHBOARD"
    }),
    resourceGrid,
    shareTool
)(require('../../components/resources/ResourceGrid'));

module.exports = Grid;
