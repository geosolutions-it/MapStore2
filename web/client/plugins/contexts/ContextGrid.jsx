/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { compose, defaultProps, withHandlers } = require('recompose');
const { deleteContext, reloadContexts } = require('../../actions/contexts');
const { updateAttribute, setFeaturedMapsLatestResource } = require('../../actions/maps'); // TODO: externalize
const { userSelector } = require('../../selectors/security');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const resourceGrid = require('../../components/resources/enhancers/resourceGrid');
const Grid = compose(
    connect(createSelector(userSelector, user => ({ user })), {
        onDelete: deleteContext,
        reloadContexts,
        setFeaturedMapsLatestResource,
        onUpdateAttribute: updateAttribute
    }),
    withHandlers({
        onSaveSuccess: (props) => (resource) => {
            if (props.reloadContexts) {
                props.reloadContexts();
            }
            if (props.setFeaturedMapsLatestResource) {
                props.setFeaturedMapsLatestResource(resource);
            }
        }
    }),
    defaultProps({
        category: "CONTEXT"
    }),
    resourceGrid
)(require('../../components/resources/ResourceGrid'));

module.exports = Grid;
