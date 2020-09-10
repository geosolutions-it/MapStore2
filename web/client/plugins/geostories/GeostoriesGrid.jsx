/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { compose, defaultProps, withHandlers } = require('recompose');
const { deleteGeostory, reloadGeostories } = require('../../actions/geostories');
const { updateAttribute, invalidateFeaturedMaps } = require('../../actions/maps'); // TODO: externalize
const { userSelector } = require('../../selectors/security');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const resourceGrid = require('../../components/resources/enhancers/resourceGrid');
const withShareTool = require('../../components/resources/enhancers/withShareTool').default;
const { success } = require('../../actions/notifications');

const Grid = compose(
    connect(createSelector(userSelector, user => ({ user })), {
        onDelete: deleteGeostory,
        reloadGeostories,
        onShowSuccessNotification: () => success({ title: "success", message: "resources.successSaved" }),
        invalidateFeaturedMaps,
        onUpdateAttribute: updateAttribute
    }),
    withHandlers({
        onSaveSuccess: (props) => () => {
            if (props.reloadGeostories) {
                props.reloadGeostories();
            }
            if (props.invalidateFeaturedMaps) {
                props.invalidateFeaturedMaps();
            }
            if (props.onShowSuccessNotification) {
                props.onShowSuccessNotification();
            }
        }
    }),
    defaultProps({
        category: "GEOSTORY"
    }),
    resourceGrid,
    // add and configure share tool panel
    compose(
        defaultProps({ shareOptions: { embedPanel: false, advancedSettings: { homeButton: true } } }),
        withShareTool
    )
)(require('../../components/resources/ResourceGrid'));

module.exports = Grid;
