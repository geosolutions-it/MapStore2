/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { compose, defaultProps, withHandlers } from 'recompose';
import { deleteMap, reloadMaps, updateAttribute, invalidateFeaturedMaps, showDetailsSheet, hideDetailsSheet } from '../../actions/maps'; // TODO: externalize
import { userSelector } from '../../selectors/security';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import resourceGrid from '../../components/resources/enhancers/resourceGrid';
import withShareTool from '../../components/resources/enhancers/withShareTool';
import { success } from '../../actions/notifications';
import ResourceGrid from '../../components/resources/ResourceGrid';

export default compose(
    connect(createSelector(userSelector, user => ({ user })), {
        onDelete: deleteMap,
        reloadMaps,
        onShowSuccessNotification: () => success({ title: "success", message: "resources.successSaved" }),
        invalidateFeaturedMaps,
        onUpdateAttribute: updateAttribute,
        onShowDetailsSheet: showDetailsSheet,
        onHideDetailsSheet: hideDetailsSheet
    }),
    withHandlers({
        onSaveSuccess: (props) => () => {
            if (props.reloadMaps) {
                props.reloadMaps();
            }
            if (props.invalidateFeaturedMaps) {
                props.invalidateFeaturedMaps();
            }
            if (props.onShowSuccessNotification) {
                props.onShowSuccessNotification();
            }
        }
    }),
    resourceGrid,
    // add and configure share tool panel
    compose(
        defaultProps({ shareOptions: { embedPanel: false } }),
        withShareTool
    )
)(ResourceGrid);
