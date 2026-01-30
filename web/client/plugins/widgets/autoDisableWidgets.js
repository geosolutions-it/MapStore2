/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';

import { connect } from 'react-redux';
import { rightPanelOpenSelector, bottomPanelOpenSelector } from '../../selectors/maplayout';
import { checkIfBottomContainerOpen } from '../../selectors/widgets';

/**
 * enhances the component disabling it (setting `enabled` property to `false`) when rightPanel or when bottomPanel are open
 */
const autoDisableWidgets = connect(
    createSelector(
        rightPanelOpenSelector,
        bottomPanelOpenSelector,
        checkIfBottomContainerOpen,
        (rightPanel, bottomPanel, bottomContainerOpen) => ({
            enabled: !rightPanel && !bottomPanel && !bottomContainerOpen
        })
    ), {}
);
export default autoDisableWidgets;
