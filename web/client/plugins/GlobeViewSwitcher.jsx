/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { connect } from 'react-redux';

import { changeVisualizationMode } from '../actions/maptype';
import { mapTypeSelector } from '../selectors/maptype';
import { createSelector } from 'reselect';
import GlobeViewSwitcherButton from '../components/buttons/GlobeViewSwitcherButton';
import { VisualizationModes, getVisualizationModeFromMapLibrary } from '../utils/MapTypeUtils';
import { createPlugin } from '../utils/PluginsUtils';

/**
  * GlobeViewSwitcher Plugin. A button that toggles to 3d mode
  * @class GlobeViewSwitcher
  * @memberof plugins
  * @static
  *
  * @prop {string} cfg.id identifier of the Plugin
  *
  */

const globeSelector = createSelector(
    [mapTypeSelector],
    (mapType) => ({
        active: getVisualizationModeFromMapLibrary(mapType) === VisualizationModes._3D
    })
);
const GlobeViewSwitcher = connect(globeSelector, {
    onClick: (pressed) => changeVisualizationMode(pressed ? VisualizationModes._3D : VisualizationModes._2D)
})(GlobeViewSwitcherButton);

export default createPlugin('GlobeViewSwitcher', {
    component: GlobeViewSwitcher,
    options: {
        disablePluginIf: "{state('featuregridmode') === 'EDIT'}"
    },
    containers: {
        Toolbar: {
            name: '3d',
            position: 10,
            alwaysVisible: true,
            tool: true,
            priority: 1
        }
    }
});
