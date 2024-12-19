/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from "../../utils/PluginsUtils";
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { userSelector } from '../../selectors/security';

function EditContext({
    user,
    resource,
    component
}) {
    const Component = component;
    // TODO: use resource.canEdit instead of user
    if (user && resource?.category?.name === 'CONTEXT') {
        return (
            <>
                <Component
                    glyph="add-map"
                    iconType="glyphicon"
                    labelId="resourcesCatalog.createMapFromContext"
                    square
                    href={`#/viewer/new/context/${resource.id}`}
                />
                <Component
                    glyph="pencil"
                    iconType="glyphicon"
                    labelId="contextManager.editContextTooltip"
                    square
                    href={`#/context-creator/${resource.id}`}
                />
            </>
        );
    }
    return null;
}

const editContextSelector = connect(
    createStructuredSelector({
        user: userSelector
    })
);

export default createPlugin('EditContext', {
    component: () => null,
    containers: {
        ResourcesGrid: {
            target: 'card-buttons',
            Component: editContextSelector(EditContext),
            position: 1
        }
    }
});
