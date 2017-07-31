/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');


const assign = require('object-assign');
const globeswitcher = require('../reducers/globeswitcher');
const epics = require('../epics/globeswitcher');
const {toggle3d} = require('../actions/globeswitcher');
const {mapTypeSelector, isCesium} = require('../selectors/maptype');
const {createSelector} = require('reselect');
const GlobeViewSwitcherButton = require('../components/buttons/GlobeViewSwitcherButton');

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

module.exports = {
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
    reducers: {
        globeswitcher
    },
    epics
};
