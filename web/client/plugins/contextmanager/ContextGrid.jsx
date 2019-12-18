/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { compose, defaultProps, withHandlers } = require('recompose');
const resourceGrid = require('../../components/resources/enhancers/resourceGrid');
const withShareTool = require('../../components/resources/enhancers/withShareTool').default;
const Grid = compose(
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
    resourceGrid,
    // add and configure share tool panel
    compose(
        defaultProps({ shareOptions: {embedOptions: { showTOCToggle: false }, advancedSettingsVisibility: { bbox: true } }}),
        withShareTool
    )
)(require('../../components/resources/ResourceGrid'));

module.exports = Grid;
