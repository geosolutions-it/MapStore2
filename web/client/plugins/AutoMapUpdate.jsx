/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const {connect} = require('react-redux');
const {manageAutoMapUpdate, updateMapInfoOnLogin} = require('../epics/automapupdate');
const {autoMapUpdateSelector} = require('../selectors/automapupdate');

/**
  * AutoMapUpdate Plugin. It sends a notification to update old maps (version < 2)
  * @class AutoMapUpdate
  * @memberof plugins
  * @static
  */

const AutoMapUpdatePlugin = connect(autoMapUpdateSelector)(require('../components/misc/progressbars/OverlayProgressBar/OverlayProgressBar'));

module.exports = {
    AutoMapUpdatePlugin,
    reducers: {},
    epics: {manageAutoMapUpdate, updateMapInfoOnLogin}
};
