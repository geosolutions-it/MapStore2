/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from "react-redux";
import find from 'lodash/find';
import { createSelector } from 'reselect';
import ContentToolbar from '../../components/geostory/contents/ContentToolbar';
import { resourcesSelector } from '../../selectors/geostory';

/* connect content toolbar to state to get additional properties from media resource */
const Toolbar = ({ resources, ...props }) => {
    if (props.resourceId) {
        const resource = find(resources, { id: props.resourceId }) || {};
        const data = resource.data || {};
        return (
            <ContentToolbar { ...data } { ...props }/>
        );
    }
    return (
        <ContentToolbar { ...props }/>
    );
};

const MediaContentToolbar = connect(
    createSelector(resourcesSelector, (resources) => ({ resources }))
)(Toolbar);

export default MediaContentToolbar;
