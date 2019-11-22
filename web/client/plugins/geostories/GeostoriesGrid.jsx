/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { compose, defaultProps, withHandlers } = require('recompose');
const { deleteGeostory, reloadGeostories } = require('../../actions/geostories');
const { updateAttribute, setFeaturedMapsLatestResource } = require('../../actions/maps'); // TODO: externalize
const { userSelector } = require('../../selectors/security');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const resourceGrid = require('../../components/resources/enhancers/resourceGrid');
const withShareTool = require('../../components/resources/enhancers/withShareTool').default;
const Grid = compose(
    connect(createSelector(userSelector, user => ({ user })), {
        onDelete: deleteGeostory,
        reloadGeostories,
        setFeaturedMapsLatestResource,
        onUpdateAttribute: updateAttribute
    }),
    withHandlers({
        onSaveSuccess: (props) => (resource) => {
            if (props.reloadGeostories) {
                props.reloadGeostories();
            }
            if (props.setFeaturedMapsLatestResource) {
                props.setFeaturedMapsLatestResource(resource);
            }
        }
    }),
    defaultProps({
        category: "GEOSTORY"
    }),
    resourceGrid,
    withShareTool
)(require('../../components/resources/ResourceGrid'));

module.exports = Grid;
