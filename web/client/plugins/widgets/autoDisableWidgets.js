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
import { isCesium } from '../../selectors/maptype';

/**
 * enhances the component disabling it (setting `enabled` property to `false`) when rightPanel, bottomPanel are open or when the maptype is cesium.
 */
const autoDisableWidgets = connect(
    createSelector(
        rightPanelOpenSelector,
        bottomPanelOpenSelector,
        isCesium,
        (rightPanel, bottomPanel, cesium) => ({
            enabled: !rightPanel && !bottomPanel && !cesium
        })
    )
);
export default autoDisableWidgets;
