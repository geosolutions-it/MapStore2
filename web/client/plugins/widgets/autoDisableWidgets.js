/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {createSelector} = require('reselect');
const {connect} = require('react-redux');

const {rightPanelOpenSelector, bottomPanelOpenSelector} = require('../../selectors/maplayout');
const {isCesium} = require('../../selectors/maptype');

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
module.exports = autoDisableWidgets;
