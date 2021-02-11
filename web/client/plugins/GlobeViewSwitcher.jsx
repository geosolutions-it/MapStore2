/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { connect } from 'react-redux';

import assign from 'object-assign';
import epics from '../epics/globeswitcher';
import { toggle3d } from '../actions/globeswitcher';
import { mapTypeSelector, isCesium } from '../selectors/maptype';
import { createSelector } from 'reselect';
import GlobeViewSwitcherButton from '../components/buttons/GlobeViewSwitcherButton';

/**
  * GlobeViewSwitcher Plugin. A button that toggles to 3d mode
  * @class GlobeViewSwitcher
  * @memberof plugins
  * @static
  *
  * @prop {string} cfg.id identifier of the Plugin
  *
  */

let globeSelector = createSelector([mapTypeSelector, isCesium], (mapType = "leaflet", cesium) => ({
    active: cesium,
    options: {
        originalMapType: mapType
    }
}));
const GlobeViewSwitcher = connect(globeSelector, {
    onClick: (pressed, options) => toggle3d(pressed, options.originalMapType)
})(GlobeViewSwitcherButton);

export default {
    GlobeViewSwitcherPlugin: assign(GlobeViewSwitcher, {
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}",
        Toolbar: {
            name: '3d',
            position: 10,
            alwaysVisible: true,
            tool: true,
            priority: 1
        }
    }),
    epics
};
